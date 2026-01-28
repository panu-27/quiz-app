const Submission = require("../models/Submission");
const Topic = require("../models/Topic");

exports.studentTopicAnalysis = async (req, res) => {
  const { testId, studentId } = req.params;

  const submission = await Submission.findOne({
    testId,
    userId: studentId
  });

  if (!submission) {
    return res.status(404).json({ error: "Submission not found" });
  }

  const topicStats = {};

  submission.answers.forEach(ans => {
    const tId = ans.topicId.toString();
    if (!topicStats[tId]) {
      topicStats[tId] = { total: 0, correct: 0 };
    }
    topicStats[tId].total++;
    if (ans.isCorrect) topicStats[tId].correct++;
  });

  const topicIds = Object.keys(topicStats);
  const topics = await Topic.find({ _id: { $in: topicIds } });

  const result = topics.map(t => ({
    topicId: t._id,
    topicName: t.name,
    accuracy: Math.round(
      (topicStats[t._id].correct / topicStats[t._id].total) * 100
    )
  }));

  res.json(result);
};


exports.classTopicAnalysis = async (req, res) => {
  const { testId } = req.params;

  const submissions = await Submission.find({ testId });

  const topicStats = {};

  submissions.forEach(sub => {
    sub.answers.forEach(ans => {
      const tId = ans.topicId.toString();
      if (!topicStats[tId]) {
        topicStats[tId] = { total: 0, correct: 0 };
      }
      topicStats[tId].total++;
      if (ans.isCorrect) topicStats[tId].correct++;
    });
  });

  const topicIds = Object.keys(topicStats);
  const topics = await Topic.find({ _id: { $in: topicIds } });

  const result = topics.map(t => ({
    topicId: t._id,
    topicName: t.name,
    classAverage: Math.round(
      (topicStats[t._id].correct / topicStats[t._id].total) * 100
    )
  }));

  res.json(result);
};


exports.testRanking = async (req, res) => {
  const { testId } = req.params;

  const submissions = await Submission.find({ testId })
    .populate("userId", "name")
    .sort({ score: -1, timeTaken: 1 });

  const ranking = submissions.map((s, i) => ({
    rank: i + 1,
    studentName: s.userId.name,
    score: s.score
  }));

  res.json(ranking);
};
