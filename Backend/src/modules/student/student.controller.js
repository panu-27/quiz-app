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

    const attempts = await TestAttempt.find({ studentId })
      .populate("testId", "title duration blocks examType")
      .sort({ createdAt: -1 });

    const historyMap = attempts.reduce((acc, attempt) => {
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
        subjectWise: attempt.subjectWiseScore, // Now sends the detailed object Map
        submittedAt: attempt.submittedAt || attempt.createdAt
      });

      return acc;
    }, {});

    res.json(Object.values(historyMap));
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};
// @desc    Get detailed analysis of a specific attempt
// @desc    Get detailed analysis of a specific attempt
export const getAttemptAnalysis = async (req, res) => {
  try {
    const { testId, attemptNumber } = req.params;
    const userId = req.user.id;

    const test = await Test.findById(testId);
    const attempt = await TestAttempt.findOne({ 
      testId, 
      studentId: userId, 
      attemptNumber: parseInt(attemptNumber) 
    });

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    const higherCount = await Leaderboard.countDocuments({
        testId: testId,
        $or: [
            { score: { $gt: attempt.score } },
            { score: attempt.score, timeTaken: { $lt: attempt.timeTaken } }
        ]
    });
    const rank = higherCount + 1;

    const sourceBlocks = (test.metadata?.distribution === "4 Sets" && attempt.assignedSet) 
                          ? (test.sets instanceof Map ? test.sets.get(attempt.assignedSet) : test.sets[attempt.assignedSet])
                          : test.blocks;

    const subjectGroups = [];
    let totalMaxScore = 0; // Track total possible marks

    sourceBlocks.forEach(block => {
      block.sections.forEach(section => {
        const sId = section.subject.toString();
        const subjectStats = attempt.subjectWiseScore.get(sId) || { 
            subjectName: section.subjectName, score: 0, correct: 0, wrong: 0, unattempted: 0 
        };

        // --- CALCULATE MAX SCORE FOR THIS SUBJECT ---
        const subjectScheme = test.markingScheme.subjectWise.find(
          sw => sw.subjectId.toString() === sId
        );
        const correctWeight = subjectScheme ? subjectScheme.correctMarks : test.markingScheme.defaultCorrect;
        const maxSubjectScore = section.numQuestions * correctWeight;
        totalMaxScore += maxSubjectScore;

        const groupedQuestions = section.questions.map(q => {
          const qId = q.questionId || q._id;
          const studentAns = attempt.answers.find(
            (a) => a.questionId?.toString() === qId?.toString()
          );

          return {
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            selectedOption: studentAns ? studentAns.selectedOption : -1,
            isCorrect: studentAns ? studentAns.isCorrect : false,
            explanation: studentAns?.explanation || q.explanation || "No solution provided."
          };
        });

        subjectGroups.push({
          subjectName: subjectStats.subjectName,
          score: subjectStats.score,
          maxScore: maxSubjectScore, // Sending this to frontend
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
      totalMaxScore: totalMaxScore, // Overall max (e.g., 300)
      rank: rank, 
      groupedAnalysis: subjectGroups
    });
  } catch (err) {
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