const Submission = require("../models/Submission");
const Test = require("../models/Test");

exports.getMyAttempts = async (req, res) => {
  try {
    const userId = req.user.id;

    const attempts = await Submission.find({ userId })
      .populate("testId", "title")
      .sort({ createdAt: -1 });

    const response = attempts.map(attempt => ({
      testId: attempt.testId._id,
      testTitle: attempt.testId.title,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.createdAt
    }));

    res.json(response);

  } catch (err) {
    console.error("Fetch attempts error:", err);
    res.status(500).json({ error: "Failed to load attempts" });
  }
};
