const Submission = require("../models/Submission");
const GeneratedTest = require("../models/GeneratedTest");
const Question = require("../models/Question");

exports.submitTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const { answers, timeTaken, violations } = req.body; // Added violations since your frontend sends it

  try {
    // 1. Strict Check: If submission exists, return it immediately
    // No need to run evaluation logic again if they already finished
    const existingSubmission = await Submission.findOne({ testId, userId });
    if (existingSubmission) {
      return res.status(200).json({ 
        message: "Test already submitted", 
        score: existingSubmission.score,
        alreadyExists: true 
      });
    }

    // 2. Load generated paper to verify questions
    const generated = await GeneratedTest.findOne({ testId, userId });
    if (!generated) {
      return res.status(404).json({ error: "Test instance not found or session expired" });
    }

    const questions = await Question.find({
      _id: { $in: generated.questionIds }
    });

    let score = 0;
    const answerSheet = questions.map(q => {
      const submitted = answers.find(
        a => a.questionId === q._id.toString()
      );

      const isCorrect = submitted && submitted.selectedOption === q.correctOption;
      
      if (isCorrect) {
        score += q.marks || 4; // Default to 4 marks if not specified
      } else if (submitted && submitted.selectedOption !== null) {
        // Optional: Add negative marking logic here if needed
        // score -= 1; 
      }

      return {
        questionId: q._id,
        selectedOption: submitted?.selectedOption ?? null,
        isCorrect,
        topicId: q.topicId
      };
    });

    // 3. Create Submission
    // We use a try-catch and specific check to handle race conditions
    const submission = await Submission.create({
      testId,
      userId,
      answers: answerSheet,
      score,
      timeTaken,
      violations: violations || 0
    });

    return res.json({
      message: "Test submitted successfully",
      score: submission.score
    });

  } catch (error) {
    console.error("Submission Error:", error);
    // Handle MongoDB Duplicate Key Error (Unique index on testId + userId)
    if (error.code === 11000) {
      return res.status(400).json({ error: "Submission already in progress or completed." });
    }
    return res.status(500).json({ error: "Internal server error during submission." });
  }
};
