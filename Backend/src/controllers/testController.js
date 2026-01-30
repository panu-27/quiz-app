const UserTest = require("../models/UserTest");
const Submission = require("../models/Submission");
const Test = require("../models/Test");
const GeneratedTest = require("../models/GeneratedTest");
const Question = require("../models/Question");

exports.getMyTestHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ All tests user has interacted with
    const userTests = await UserTest.find({ userId })
      .populate("testId", "title description totalMarks")
      .lean();

    // 2️⃣ Fetch all submissions in ONE query
    const submissions = await Submission.find({ userId })
      .sort({ attemptNumber: -1 })
      .lean();

    // 3️⃣ Group submissions by testId
    const submissionMap = {};
    submissions.forEach(sub => {
      const key = sub.testId.toString();
      if (!submissionMap[key]) submissionMap[key] = [];
      submissionMap[key].push(sub);
    });

    // 4️⃣ Final response formatting (frontend-aligned)
    const response = userTests.map(ut => ({
      _id: ut._id,
      status: ut.status,
      testDetails: ut.testId,
      attempts: submissionMap[ut.testId._id.toString()] || []
    }));

    res.json(response);

  } catch (err) {
    console.error("History Error:", err);
    res.status(500).json({ error: "Failed to fetch test history" });
  }
};




/**
 * GET /api/tests/analytics/:testId/attempt/:attemptNumber
 */
exports.getAttemptAnalytics = async (req, res) => {
  try {
    const { testId, attemptNumber } = req.params;
    const userId = req.user.id;

    const submission = await Submission.findOne({
      testId,
      userId,
      attemptNumber: Number(attemptNumber)
    })
    .populate({
      path: "answers.questionId",
      select: "questionText options correctOption chapterId",
      populate: {
        path: "chapterId",
        select: "name subjectId",
        populate: {
          path: "subjectId",
          select: "name"
        }
      }
    })
    .lean();

    if (!submission) return res.status(404).json({ error: "Record not found" });

    const test = await Test.findById(testId).select("title").lean();

    const subjectWiseAnalytics = {};

    submission.answers.forEach(ans => {
      const question = ans.questionId;
      // Following your schema: Question -> Chapter -> Subject
      const subjectData = question?.chapterId?.subjectId;
      
      if (!subjectData) return;

      const subjectId = subjectData._id.toString();
      const subjectName = subjectData.name;

      if (!subjectWiseAnalytics[subjectId]) {
        subjectWiseAnalytics[subjectId] = {
          subjectName,
          totalQuestions: 0,
          correct: 0,
          wrong: 0,
          score: 0,
          questions: []
        };
      }

      const sub = subjectWiseAnalytics[subjectId];
      sub.totalQuestions++;

      if (ans.selectedOption !== null && ans.selectedOption !== undefined) {
        if (ans.isCorrect) {
          sub.correct++;
          sub.score++;
        } else {
          sub.wrong++;
        }
      }

      sub.questions.push({
        questionText: question.questionText,
        options: question.options,
        selectedOption: ans.selectedOption,
        correctOption: question.correctOption,
        isCorrect: ans.isCorrect,
        chapterName: question.chapterId?.name
      });
    });

    return res.json({
      testTitle: test?.title || "Examination Report",
      attemptNumber: submission.attemptNumber,
      score: submission.score,
      timeTaken: submission.timeTaken,
      violations: submission.violations || 0,
      subjectWiseAnalytics
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis Generation Failed" });
  }
};
