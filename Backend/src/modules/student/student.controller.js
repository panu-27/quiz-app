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
// @route   GET /api/student/test-analysis/:testId/attempt/:attemptNumber
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

    // 1. Get the correct block structure (Handling 4 Sets)
    const sourceBlocks = (test.metadata?.distribution === "4 Sets" && attempt.assignedSet) 
                          ? test.sets.get(attempt.assignedSet) 
                          : test.blocks;

    // 2. Flatten and Merge Questions with Student Answers
    const analysisData = [];
    
    sourceBlocks.forEach(block => {
      block.sections.forEach(section => {
        section.questions.forEach(q => {
          const qId = q.questionId || q._id;
          
          // Find student's specific answer entry
          const studentAns = attempt.answers.find(
            (a) => a.questionId.toString() === qId.toString()
          );

          analysisData.push({
            subjectName: section.subjectName,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            selectedOption: studentAns ? studentAns.selectedOption : -1,
            isCorrect: studentAns ? studentAns.isCorrect : false,
            marksObtained: studentAns ? studentAns.marksObtained : 0
          });
        });
      });
    });

    // 3. Rank Calculation
    let rank = null;
    const officialRecord = await Leaderboard.findOne({ testId, studentId: userId });
    if (officialRecord) {
      const higherScores = await Leaderboard.countDocuments({
        testId,
        $or: [
          { score: { $gt: officialRecord.score } },
          { score: officialRecord.score, timeTaken: { $lt: officialRecord.timeTaken } }
        ]
      });
      rank = higherScores + 1;
    }

    res.json({
      testTitle: test.title,
      examType: test.examType,
      overallScore: attempt.score,
      rank: rank,
      totalQuestions: analysisData.length,
      subjectWise: attempt.subjectWiseScore,
      analysis: analysisData // Flat list of questions for Review UI
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