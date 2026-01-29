const Submission = require("../models/Submission");
const GeneratedTest = require("../models/GeneratedTest");
const Question = require("../models/Question");
const UserTest = require("../models/UserTest");

exports.submitTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  
  // 1️⃣ Receive attemptNumber and other data from frontend
  const { answers, timeTaken, violations, attemptNumber } = req.body;

  try {
    // 2️⃣ Validation: Ensure attemptNumber is present
    if (!attemptNumber) {
      return res.status(400).json({ error: "Attempt number is required from the frontend." });
    }

    // 3️⃣ Double-Submission Check: Prevent re-submitting the SAME attempt number
    const existingSubmission = await Submission.findOne({ testId, userId, attemptNumber });
    if (existingSubmission) {
      return res.status(400).json({ 
        error: `Attempt ${attemptNumber} has already been submitted.`,
        score: existingSubmission.score 
      });
    }

    // 4️⃣ Verify against the Generated Session
    // We make sure the questions match the ones specifically picked for THIS attempt
    const generated = await GeneratedTest.findOne({ testId, userId, attemptNumber });
    if (!generated) {
      return res.status(404).json({ error: "No active test session found for this attempt number." });
    }

    const questions = await Question.find({
      _id: { $in: generated.questionIds }
    });

    // 5️⃣ Evaluation Logic
    let score = 0;
    const answerSheet = questions.map(q => {
      const submitted = answers.find(
        a => a.questionId === q._id.toString()
      );

      const isCorrect = submitted && submitted.selectedOption === q.correctOption;
      
      if (isCorrect) {
        score += q.marks || 4; // Using your default scoring logic
      }

      return {
        questionId: q._id,
        selectedOption: submitted?.selectedOption ?? null,
        isCorrect,
        topicId: q.topicId
      };
    });

    // 6️⃣ Create the Submission Record
    const submission = await Submission.create({
      testId,
      userId,
      attemptNumber, 
      answers: answerSheet,
      score,
      timeTaken,
      violations: violations || 0
    });

    // 7️⃣ Update the UserTest status to 'completed'
    await UserTest.findOneAndUpdate(
      { userId, testId },
      { status: 'completed' }
    );

    return res.json({
      message: `Attempt ${attemptNumber} submitted successfully`,
      attemptNumber: submission.attemptNumber,
      score: submission.score
    });

  } catch (error) {
    console.error("Submission Error:", error);
    
    // Handle MongoDB Unique Index collisions (Double clicks)
    if (error.code === 11000) {
      return res.status(409).json({ error: "Duplicate submission detected at database level." });
    }
    
    return res.status(500).json({ error: "Internal server error during submission." });
  }
};