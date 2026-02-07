import * as service from "./student.service.js";
import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import Leaderboard from "../test/leaderboard.model.js";

export const getMyTests = async (req, res) => {
  try {
    const tests = await service.getMyTests(req.user);
    res.json(tests);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getProfile = async (req, res) => {
  try {
    // req.user.id comes from your 'auth' middleware
    const profile = await service.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


export const startAttempt = async (req, res) => {
  try {
    const { testId } = req.params;

    const data = await service.startAttempt(
      req.user,
      testId
    );

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, timeTaken } = req.body;

    // Passing 1: student, 2: testId, 3: data object
    const result = await service.submitTest(req.user, testId, { answers, timeTaken });

    res.json(result);
  } catch (err) {
    console.error("Submit Controller Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};



// @desc    Get all tests given by student grouped by test ID
// @route   GET /api/tests/my-history
export const getMyHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    // 1. Only fetch attempts that are 'completed'
    const attempts = await TestAttempt.find({ 
      studentId, 
      status: "completed" // 👈 Exclude "started" attempts
    })
      .populate("testId", "title duration blocks examType")
      .sort({ createdAt: -1 });

    const historyMap = attempts.reduce((acc, attempt) => {
      // If the associated test was deleted, skip it
      if (!attempt.testId) return acc;

      const tId = attempt.testId._id.toString();

      if (!acc[tId]) {
        acc[tId] = {
          _id: tId,
          testDetails: {
            title: attempt.testId.title?.trim() || "Untitled Test",
            examType: attempt.testId.examType,
            duration: attempt.testId.duration
          },
          attempts: [],
        };
      }

      acc[tId].attempts.push({
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        totalCorrect: attempt.totalCorrect,
        totalWrong: attempt.totalWrong,
        // Since subjectWiseScore is a Map, Mongoose will automatically 
        // convert it to a plain object when sending as JSON.
        subjectWise: attempt.subjectWiseScore, 
        submittedAt: attempt.submittedAt || attempt.createdAt
      });

      return acc;
    }, {});

    // Convert the object map back to an array for the frontend
    res.json(Object.values(historyMap));
  } catch (err) {
    console.error("HISTORY_FETCH_ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
// @desc    Get detailed analysis of a specific attempt
// @desc    Get detailed analysis of a specific attempt
export const getAttemptAnalysis = async (req, res) => {
  try {
    const { testId, attemptNumber } = req.params;
    const userId = req.user.id;

    // 1. Fetch the test with populated questions
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: "Test not found" });

    // 2. ONLY find completed attempts
    const attempt = await TestAttempt.findOne({ 
      testId, 
      studentId: userId, 
      attemptNumber: parseInt(attemptNumber),
      status: "completed" // 👈 Filtering incomplete attempts
    });

    if (!attempt) {
      return res.status(404).json({ 
        message: "Analysis is only available for completed attempts." 
      });
    }

    // 3. Rank Logic
    const higherCount = await Leaderboard.countDocuments({
        testId: testId,
        $or: [
            { score: { $gt: attempt.score } },
            { score: attempt.score, timeTaken: { $lt: attempt.timeTaken } }
        ]
    }) || 0;
    const rank = higherCount + 1;

    // 4. Determine Source Blocks (Sets vs Blocks)
    let sourceBlocks = test.blocks;
    if (test.metadata?.distribution === "4 Sets" && attempt.assignedSet) {
       // Mongoose Maps use .get()
       sourceBlocks = test.sets instanceof Map 
         ? test.sets.get(attempt.assignedSet) 
         : test.sets[attempt.assignedSet];
    }

    if (!sourceBlocks) {
        return res.status(500).json({ message: "Test structure configuration error." });
    }

    const subjectGroups = [];
    let totalMaxScore = 0;

    sourceBlocks.forEach(block => {
      block.sections.forEach(section => {
        // Ensure sId is a string for Map lookup
        const sId = section.subject?.toString();
        
        // Lookup in the Map
        const subjectStats = attempt.subjectWiseScore.get(sId) || { 
          subjectName: section.subjectName, 
          score: 0, correct: 0, wrong: 0, unattempted: 0 
        };

        // Calculate Max Score
        const subjectScheme = test.markingScheme?.subjectWise?.find(
          sw => sw.subjectId?.toString() === sId
        );
        
        const correctWeight = subjectScheme ? subjectScheme.correctMarks : (test.markingScheme?.defaultCorrect || 4);
        const maxSubjectScore = (section.numQuestions || 0) * correctWeight;
        totalMaxScore += maxSubjectScore;

        const groupedQuestions = (section.questions || []).map(q => {
          // IMPORTANT: If your test.blocks contains ObjectIds, you must populate them 
          // or this mapping will return empty texts.
          const qId = q.questionId || q._id;
          const studentAns = attempt.answers?.find(
            (a) => a.questionId?.toString() === qId?.toString()
          );

          return {
            questionText: q.questionText || "Question data not available",
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            selectedOption: studentAns ? studentAns.selectedOption : -1,
            isCorrect: studentAns ? studentAns.isCorrect : false,
            explanation: studentAns?.explanation || q.explanation || "No solution provided."
          };
        });

        subjectGroups.push({
          subjectName: subjectStats.subjectName || section.subjectName,
          score: subjectStats.score,
          maxScore: maxSubjectScore,
          correct: subjectStats.correct,
          wrong: subjectStats.wrong,
          unattempted: subjectStats.unattempted,
          questions: groupedQuestions
        });
      });
    });

    res.json({
      testTitle: test.title,
      overallScore: attempt.score,
      totalMaxScore: totalMaxScore,
      rank: rank, 
      groupedAnalysis: subjectGroups
    });
  } catch (err) {
    console.error("ANALYSIS_ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

import Resource from "../teacher/Resource.js"; // Adjust path as per your folder structure

export const getMyLibrary = async (req, res) => {
  try {
    // req.user is populated by your auth middleware
    const library = await service.getMyLibrary(req.user);
    res.json(library);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};