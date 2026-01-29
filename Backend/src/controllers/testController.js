const UserTest = require("../models/UserTest");
const Submission = require("../models/Submission");

exports.getMyTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get all tests the user is registered for
    const registeredTests = await UserTest.find({ userId })
      .populate("testId", "title description totalMarks subjectConfigs") // Add fields you want to show
      .lean();

    // 2. For each registered test, find all corresponding submissions (attempts)
    const history = await Promise.all(registeredTests.map(async (record) => {
      const attempts = await Submission.find({ 
        userId, 
        testId: record.testId._id 
      })
      .select("attemptNumber score timeTaken createdAt")
      .sort({ attemptNumber: 1 }); // Order by attempt 1, 2, 3...

      return {
        ...record,
        testDetails: record.testId, // The populated Test info
        attempts: attempts // All past scores
      };
    }));

    res.json(history);
  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Could not fetch test history" });
  }
};