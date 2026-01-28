const Question = require("../models/Question");

exports.createQuestion = async (req, res) => {
  try {
    const {
      subjectId,
      chapterId,
      topicId,
      questionText,
      questionImageUrl,
      options,
      correctOption,
      explanation,
      difficulty,
      marks
    } = req.body;

    // Validation
    if (!questionText && !questionImageUrl) {
      return res.status(400).json({ error: "Question must have text or image" });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({ error: "At least 2 options required" });
    }

    const question = await Question.create({
      subjectId,
      chapterId,
      topicId,
      questionText,
      questionImageUrl,
      options,
      correctOption,
      explanation,
      difficulty,
      marks
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getQuestionsByTopic = async (req, res) => {
  try {
    const questions = await Question.find({ topicId: req.params.topicId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.createQuestionsBulk = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: "Questions array required" });
    }

    const created = await Question.insertMany(questions);

    res.status(201).json({
      message: "Questions added successfully",
      count: created.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

