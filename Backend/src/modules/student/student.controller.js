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

    // 1. Fetch all attempts and populate the test metadata
    const attempts = await TestAttempt.find({ studentId })
      .populate("testId", "title totalMarks")
      .sort({ createdAt: -1 });

    // 2. Grouping logic
    const historyMap = attempts.reduce((acc, attempt) => {
      // Safety check: skip if the test no longer exists in the DB
      if (!attempt.testId) return acc;

      const tId = attempt.testId._id.toString();

      if (!acc[tId]) {
        acc[tId] = {
          _id: tId,
          testDetails: {
            _id: attempt.testId._id,
            title: attempt.testId.title?.trim() || "Untitled Test", // Trimming that extra space!
            totalMarks: attempt.testId.totalMarks
          },
          attempts: [],
        };
      }

      // Add the attempt to the grouped array
      acc[tId].attempts.push({
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        timeTaken: attempt.timeTaken,
        createdAt: attempt.createdAt
      });

      return acc;
    }, {});

    // 3. Log for debugging and send as a clean array
    const result = Object.values(historyMap);
    console.log("HISTORY_PAYLOAD_SIZE:", result.length);
    
    res.json(result);
  } catch (err) {
    console.error("GET_HISTORY_ERROR:", err);
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

    // 1. Fetch Test and the specific Attempt
    const test = await Test.findById(testId);
    const attempt = await TestAttempt.findOne({ 
      testId, 
      studentId: userId, 
      attemptNumber: parseInt(attemptNumber) 
    });

    if (!attempt) return res.status(404).json({ message: "Attempt not found" });

    // 2. Identify the correct set of questions
    let questions = [];
    if (test.mode === "PDF") {
      questions = test.questions;
    } else {
      // Logic for CUSTOM tests (Single Set vs 4 Sets)
      questions = (test.sets instanceof Map && attempt.assignedSet) 
        ? test.sets.get(attempt.assignedSet) 
        : test.questions;
    }

    // 3. Map Questions to Student Answers
    const analysisData = questions.map((q) => {
      const studentAns = attempt.answers.find(
        (a) => a.questionId.toString() === q._id.toString()
      );
      
      return {
        questionText: q.questionText,
        options: q.options, // Array of strings
        correctAnswer: q.correctAnswer, // Number index
        selectedOption: studentAns ? studentAns.selectedOption : null,
        isCorrect: studentAns ? studentAns.selectedOption === q.correctAnswer : false
      };
    });

    // 4. Rank Calculation (Only from Leaderboard - Attempt #1)
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

    // 5. Send Final Payload
    res.json({
      testTitle: test.title,
      score: attempt.score,
      rank: rank, 
      totalQuestions: questions.length,
      assignedSet: attempt.assignedSet || "Single",
      analysis: analysisData 
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