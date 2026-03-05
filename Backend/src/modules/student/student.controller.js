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
    const profile = await service.getProfile(req.user.id);
    res.json(profile);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const startAttempt = async (req, res) => {
  try {
    const { testId } = req.params;
    const attempt = await service.startAttempt(req.user, testId);
    const test = await Test.findById(testId).select("title").lean();

    // ── PER-BLOCK REMAINING TIME CALCULATION ──────────────────────────
    // Walk through blocks in order and consume elapsed time block by block.
    // Only the active block's time decreases — future blocks stay full.
    const now = Date.now();
    const startedAt = new Date(attempt.startedAt).getTime();
    let elapsedSeconds = Math.floor((now - startedAt) / 1000);

    const blockTimers = {};
    attempt.blocks.forEach((b, i) => {
      const key = `block${i + 1}`;
      const blockTotalSeconds = (b.duration || 0) * 60;

      if (elapsedSeconds <= 0) {
        // Block hasn't been touched yet — full time remaining
        blockTimers[key] = blockTotalSeconds;
      } else if (elapsedSeconds >= blockTotalSeconds) {
        // This block is fully consumed
        blockTimers[key] = 0;
        elapsedSeconds -= blockTotalSeconds;
      } else {
        // Elapsed time lands inside this block — partial remaining
        blockTimers[key] = blockTotalSeconds - elapsedSeconds;
        elapsedSeconds = 0;
      }
    });
    // ──────────────────────────────────────────────────────────────────

    res.json({
      blocks: attempt.blocks,           // saved chosenOptions intact
      testTitle: test?.title || "Assessment",
      blockTimers                        // e.g. { block1: 1200, block2: 3600 }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { answers, timeTaken, isFinal } = req.body;
    const result = await service.submitTest(req.user, testId, { answers, timeTaken, isFinal });
    res.json(result);
  } catch (err) {
    console.error("Submit Controller Error:", err.message);
    res.status(400).json({ message: err.message });
  }
};

// @desc    Get all tests given by student grouped by test ID
// @route   GET /api/student/my-history
export const getMyHistory = async (req, res) => {
  try {
    const studentId = req.user.id;

    const attempts = await TestAttempt.find({
      studentId,
      status: "completed"
    })
      .populate("testId", "title examType duration")
      .sort({ createdAt: -1 })
      .lean();

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
          attempts: []
        };
      }

      acc[tId].attempts.push({
        _id: attempt._id,
        attemptNumber: attempt.attemptNumber,
        score: attempt.totalScore,
        totalCorrect: attempt.totalCorrect,
        totalWrong: attempt.totalWrong,
        submittedAt: attempt.submittedAt || attempt.createdAt
      });

      return acc;
    }, {});

    res.json(Object.values(historyMap));
  } catch (err) {
    console.error("HISTORY_FETCH_ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

// @desc    Get detailed analysis of a specific attempt
// @route   GET /api/student/test-analysis/:testId/attempt/:attemptNumber
export const getAttemptAnalysis = async (req, res) => {
  try {
    const { testId, attemptNumber } = req.params;
    const userId = req.user.id;

    const attempt = await TestAttempt.findOne({
      testId,
      studentId: userId,
      attemptNumber: parseInt(attemptNumber),
      status: "completed"
    }).lean();

    if (!attempt) {
      return res.status(404).json({
        message: "Analysis is only available for completed attempts."
      });
    }

    const test = await Test.findById(testId)
      .select("title markingScheme")
      .lean();

    if (!test) return res.status(404).json({ message: "Test not found" });

    const higherCount = await Leaderboard.countDocuments({
      testId,
      $or: [
        { score: { $gt: attempt.totalScore } },
        { score: attempt.totalScore, timeTaken: { $lt: attempt.timeTaken } }
      ]
    });
    const rank = higherCount + 1;

    let totalMaxScore = 0;
    const groupedAnalysis = [];

    attempt.blocks.forEach(block => {
      block.sections.forEach(section => {
        const subjectRule = test.markingScheme.subjectWise?.find(
          s => s.subjectId?.toString() === section.subject?.toString()
        ) || {
          correctMarks: test.markingScheme.defaultCorrect || 1
        };

        const maxSubjectScore = section.numQuestions * subjectRule.correctMarks;
        totalMaxScore += maxSubjectScore;

        groupedAnalysis.push({
          subjectName: section.subjectName,
          score: section.score,
          maxScore: maxSubjectScore,
          correct: section.correct,
          wrong: section.wrong,
          unattempted: section.unattempted,
          questions: section.questions.map(q => ({
            questionText: q.questionText,
            options: q.options.map(opt =>
              typeof opt === "string" ? opt : (opt.text || "")
            ),
            correctAnswer: q.correctAnswer,
            selectedOption: q.chosenOption === -1 ? null : q.chosenOption,
            isCorrect: q.chosenOption !== -1 && q.chosenOption === q.correctAnswer,
            explanation: q.explanation || null
          }))
        });
      });
    });

    res.json({
      testTitle: test.title,
      overallScore: attempt.totalScore,
      totalMaxScore,
      rank,
      totalCorrect: attempt.totalCorrect,
      totalWrong: attempt.totalWrong,
      totalUnattempted: attempt.totalUnattempted,
      groupedAnalysis
    });

  } catch (err) {
    console.error("ANALYSIS_ERROR:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

export const getMyLibrary = async (req, res) => {
  try {
    const library = await service.getMyLibrary(req.user);
    res.json(library);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// ADD THIS TO student.controller.js
export const updateAvatar = async (req, res) => {
  try {
    // Check if the file was successfully uploaded to Cloudinary
    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "File upload to cloud failed" });
    }

    // Call the service with the new Cloudinary URL
    const updatedUser = await service.updateProfilePic(req.user.id, req.file.path);
    
    res.json({ 
      success: true,
      message: "Profile picture updated successfully", 
      profilePic: updatedUser.profilePic 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};