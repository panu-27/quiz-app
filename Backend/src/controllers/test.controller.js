const Test = require("../models/Test");
const Question = require("../models/Question");

exports.createTest = async (req, res) => {
  try {
    const { title, isPyqOnly, subjectConfigs, chapterIds, topicIds, customQuestions } = req.body;

    // --- STEP 1: VALIDATE ---
    if (!title || !subjectConfigs || subjectConfigs.length === 0) {
      return res.status(400).json({ error: "Title and Subject Configurations are required." });
    }

    // --- STEP 2: PROCESS CUSTOM QUESTIONS ---
    const customIdMap = {};

    if (customQuestions && Object.keys(customQuestions).length > 0) {
      for (const [subId, qs] of Object.entries(customQuestions)) {
        if (!qs || qs.length === 0) continue;

        // Map your frontend custom questions to the DB Schema
        const docs = qs.map(q => ({
          subjectId: subId,
          chapterId: chapterIds[0], // Associate with first chapter as fallback
          topicId: topicIds[0] || null,
          questionText: q.question,
          options: q.options.map(opt => ({ text: opt })),
          correctOption: q.correctOption,
          difficulty: "medium", // Default for custom
          isCustom: true
        }));

        const inserted = await Question.insertMany(docs);
        customIdMap[subId] = inserted.map(d => d._id);
      }
    }

    // --- STEP 3: CREATE TEST ---
    const test = await Test.create({
      title,
      isPyqOnly,
      subjectConfigs, // difficulty: {easy, medium, hard} is now stored here
      chapterIds,
      topicIds,
      customQuestions: customIdMap, // Store the IDs of the saved questions
      createdBy: req.user.id
    });

    res.status(201).json(test);
  } catch (err) {
    console.error("MONGOOSE ERROR:", err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAllTests = async (req, res) => {
  const tests = await Test.find().sort({ createdAt: -1 });
  res.json(tests);
};
