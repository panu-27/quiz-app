const Test = require("../models/Test");
const Question = require("../models/Question");
const GeneratedTest = require("../models/GeneratedTest");
const UserTest = require("../models/UserTest");

exports.startTest = async (req, res) => {
  console.log("hit");

  try {
    const { testId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Load test
    const test = await Test.findById(testId).populate(
      "subjectConfigs.subjectId",
      "name"
    );

    if (!test) {
      return res.status(404).json({ error: "Test not found" });
    }

    // 2️⃣ Ensure UserTest exists (atomic)
    let userTest = await UserTest.findOneAndUpdate(
      { userId, testId },
      {
        $setOnInsert: {
          lastAttemptNumber: 0,
          status: "idle"
        }
      },
      { upsert: true, new: true }
    );

    // 3️⃣ Decide attempt number (ATOMIC increment)
    let attemptNumber;

    if (userTest.status === "in-progress") {
      attemptNumber = userTest.lastAttemptNumber;
    } else {
      userTest = await UserTest.findOneAndUpdate(
        { userId, testId },
        {
          $inc: { lastAttemptNumber: 1 },
          $set: { status: "in-progress" }
        },
        { new: true }
      );

      attemptNumber = userTest.lastAttemptNumber;
    }

    console.log("attemptNumber decided:", attemptNumber);

    // 4️⃣ Calculate section times
    let block1Time = 0;
    let block2Time = 0;
    let block1Set = false;

    for (const config of test.subjectConfigs) {
      const subjectName = config.subjectId.name.toLowerCase();

      if (["physics", "chemistry"].includes(subjectName)) {
        if (!block1Set) {
          block1Time = config.time * 60;
          block1Set = true;
        }
      } else {
        block2Time += config.time * 60;
      }
    }

    // 5️⃣ Generate questions ONLY if needed
    let finalSelection = [];

    for (const config of test.subjectConfigs) {
      const { subjectId, questions: totalCount, difficulty } = config;
      const subjectKey = subjectId._id.toString();

      let subjectPool = [
        ...(test.customQuestions?.[subjectKey] || [])
      ];

      const remainingSlots = Math.max(0, totalCount - subjectPool.length);

      if (remainingSlots > 0) {
        const tiers = ["easy", "medium", "hard"];

        for (const tier of tiers) {
          const percent = difficulty[tier] || 0;
          const target = Math.round((percent / 100) * totalCount);

          const pickCount = Math.min(
            target,
            remainingSlots -
              (subjectPool.length -
                (test.customQuestions?.[subjectKey]?.length || 0))
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

    // 6️⃣ Create OR resume GeneratedTest (ATOMIC)
    const generated = await GeneratedTest.findOneAndUpdate(
      { testId, userId, attemptNumber },
      {
        $setOnInsert: {
          questionIds: finalSelection,
          sectionTimes: {
            block1: block1Time,
            block2: block2Time
          },
          startedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    console.log("generated session:", generated._id);

    const questions = await Question.find({
      _id: { $in: generated.questionIds }
    }).populate("subjectId", "name");

    return res.json({
      questions,
      sectionTimes: generated.sectionTimes,
      attemptNumber
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to start test" });
  }
};

