const Submission = require("../models/Submission");
const GeneratedTest = require("../models/GeneratedTest");
const Question = require("../models/Question");
const UserTest = require("../models/UserTest");

exports.submitTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const { answers, timeTaken, violations, attemptNumber } = req.body;

    // 1️⃣ Validate attempt number
    if (!attemptNumber) {
      return res.status(400).json({
        error: "Attempt number is required"
      });
    }

    // 2️⃣ Prevent duplicate submission (soft check)
    const existingSubmission = await Submission.findOne({
      testId,
      userId,
      attemptNumber
    });

    if (existingSubmission) {
      return res.status(409).json({
        error: `Attempt ${attemptNumber} already submitted`,
        score: existingSubmission.score
      });
    }

    // 3️⃣ Verify generated test exists (anti-tampering)
    const generated = await GeneratedTest.findOne({
      testId,
      userId,
      attemptNumber
    });

    if (!generated) {
      return res.status(404).json({
        error: "No active test session found for this attempt"
      });
    }

    // 4️⃣ Load exact questions for THIS attempt
    const questions = await Question.find({
      _id: { $in: generated.questionIds }
    });

    // 5️⃣ Evaluate answers
    let score = 0;

    const evaluatedAnswers = questions.map(q => {
      const submitted = answers.find(
        a => a.questionId === q._id.toString()
      );

      const isCorrect =
        submitted &&
        submitted.selectedOption === q.correctOption;

      if (isCorrect) {
        score += q.marks || 4;
      }

      return {
        questionId: q._id,
        selectedOption: submitted?.selectedOption ?? null,
        isCorrect,
        topicId: q.topicId
      };
    });

    // 6️⃣ Create submission (FINAL SOURCE OF TRUTH)
    const submission = await Submission.create({
      testId,
      userId,
      attemptNumber,
      answers: evaluatedAnswers,
      score,
      timeTaken,
      violations: violations || 0
    });

    // 7️⃣ Mark UserTest completed
    await UserTest.findOneAndUpdate(
      { userId, testId },
      { status: "completed" }
    );

    // 8️⃣ Clean up generated session (optional but recommended)
    await GeneratedTest.deleteOne({
      testId,
      userId,
      attemptNumber
    });

    return res.json({
      message: `Attempt ${attemptNumber} submitted successfully`,
      attemptNumber: submission.attemptNumber,
      score: submission.score
    });

  } catch (error) {
    console.error("Submission Error:", error);

    // Hard protection against race-condition / double click
    if (error.code === 11000) {
      return res.status(409).json({
        error: "Duplicate submission detected"
      });
    }

    return res.status(500).json({
      error: "Internal server error during submission"
    });
  }
};
