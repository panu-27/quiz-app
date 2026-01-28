const Test = require("../models/Test");
const Question = require("../models/Question");
const Chapter = require("../models/Chapter");
const GeneratedTest = require("../models/GeneratedTest");

exports.startTest = async (req, res) => {
  const { testId } = req.params;
  const userId = req.user.id;

  // 1. Check if already generated
  const existing = await GeneratedTest.findOne({ testId, userId });
  if (existing) {
    const questions = await Question.find({ _id: { $in: existing.questionIds } });
    return res.json(questions);
  }

  // 2. Load test
  const test = await Test.findById(testId);
  if (!test) return res.status(404).json({ error: "Test not found" });

  let selectedQuestions = [];

  // 3. Compulsory questions
  if (test.compulsoryQuestionIds?.length) {
    const compulsory = await Question.find({
      _id: { $in: test.compulsoryQuestionIds }
    });
    selectedQuestions.push(...compulsory);
  }

  let remainingCount = test.totalQuestions - selectedQuestions.length;

  // 4. CET chapter weightage
  if (test.useCetWeightage) {
    const chapters = await Chapter.find({
      _id: { $in: test.chapterIds }
    });

    const totalWeight = chapters.reduce((sum, c) => sum + c.cetWeightage, 0);

    for (const chapter of chapters) {
      const chapterQuestionCount = Math.round(
        (chapter.cetWeightage / totalWeight) * remainingCount
      );

      const questions = await Question.aggregate([
        {
          $match: {
            chapterId: chapter._id,
            topicId: { $in: test.topicIds },
            _id: { $nin: selectedQuestions.map(q => q._id) }
          }
        },
        { $sample: { size: chapterQuestionCount } }
      ]);

      selectedQuestions.push(...questions);
    }
  }

  // 5. Final trim (safety)
  selectedQuestions = selectedQuestions.slice(0, test.totalQuestions);

  // 6. Save generated paper
  await GeneratedTest.create({
    testId,
    userId,
    questionIds: selectedQuestions.map(q => q._id)
  });

  res.json(selectedQuestions);
};
