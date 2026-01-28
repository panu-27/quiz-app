const Submission = require("../models/Submission");
const GeneratedTest = require("../models/GeneratedTest");
const Question = require("../models/Question");

exports.submitTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;
  const { answers, timeTaken } = req.body;

  // 1. Prevent multiple submissions
  const alreadySubmitted = await Submission.findOne({ testId, userId });
  if (alreadySubmitted) {
    return res.status(400).json({ error: "Test already submitted" });
  }

  // 2. Load generated paper
  const generated = await GeneratedTest.findOne({ testId, userId });
  if (!generated) {
    return res.status(400).json({ error: "Test not started" });
  }

  const questions = await Question.find({
    _id: { $in: generated.questionIds }
  });

  let score = 0;
  let answerSheet = [];

  // 3. Evaluate answers
  for (const q of questions) {
    const submitted = answers.find(
      a => a.questionId === q._id.toString()
    );

    const isCorrect =
      submitted && submitted.selectedOption === q.correctOption;

    if (isCorrect) score += q.marks;

    answerSheet.push({
      questionId: q._id,
      selectedOption: submitted?.selectedOption ?? null,
      isCorrect,
      topicId: q.topicId
    });
  }

  // 4. Save submission
  const submission = await Submission.create({
    testId,
    userId,
    answers: answerSheet,
    score,
    timeTaken
  });

  res.json({
    message: "Test submitted successfully",
    score
  });
};
