const Test = require("../models/Test");
const Question = require("../models/Question");
const GeneratedTest = require("../models/GeneratedTest");
const mongoose = require("mongoose");

exports.startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Load test FIRST
    const test = await Test.findById(testId)
      .populate("subjectConfigs.subjectId", "name");

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // 2️⃣ Check existing generated test
    const existing = await GeneratedTest.findOne({ testId, userId });
    if (existing) {
      const questions = await Question.find({
        _id: { $in: existing.questionIds }
      }).populate("subjectId", "name");

      return res.json({
        questions,
        sectionTimes: existing.sectionTimes
      });
    }

    // 3️⃣ Calculate section times
    let block1Time = 0;
    let block2Time = 0;
    let block1Set = false;

    for (const config of test.subjectConfigs) {
      const subjectName = config.subjectId.name.toLowerCase();

      // BLOCK 1 → Physics / Chemistry (take once)
      if (["physics", "chemistry"].includes(subjectName)) {
        if (!block1Set) {
          block1Time = config.time * 60;
          block1Set = true;
        }
      }
      // BLOCK 2 → others (sum)
      else {
        block2Time += config.time * 60;
      }
    }

    // 4️⃣ Generate questions
    let finalSelection = [];

    for (const config of test.subjectConfigs) {
      const { subjectId, questions: totalCount, difficulty } = config;
      const subIdStr = subjectId._id.toString();

      let subjectPool = [];

      // Custom questions
      const customIds = test.customQuestions?.[subIdStr] || [];
      subjectPool.push(...customIds);

      const remainingSlots = Math.max(0, totalCount - subjectPool.length);

      if (remainingSlots > 0) {
        const tiers = ["easy", "medium", "hard"];

        for (const tier of tiers) {
          const tierPercent = difficulty[tier] || 0;
          const tierTarget = Math.round((tierPercent / 100) * totalCount);
          const pickCount = Math.min(
            tierTarget,
            remainingSlots - (subjectPool.length - customIds.length)
          );

          if (pickCount <= 0) continue;

          const randomQs = await Question.aggregate([
            {
              $match: {
                subjectId: subjectId._id,
                difficulty: tier,
                chapterId: { $in: test.chapterIds },
                _id: { $nin: subjectPool }
              }
            },
            { $sample: { size: pickCount } }
          ]);

          subjectPool.push(...randomQs.map(q => q._id));
        }
      }

      finalSelection.push(...subjectPool);
    }

    // 5️⃣ Save generated test WITH TIMERS
    const generated = await GeneratedTest.create({
      testId,
      userId,
      questionIds: finalSelection,
      sectionTimes: {
        block1: block1Time,
        block2: block2Time
      }
    });

    const questions = await Question.find({
      _id: { $in: finalSelection }
    }).populate("subjectId", "name");

    res.json({
      questions,
      sectionTimes: generated.sectionTimes
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
};
