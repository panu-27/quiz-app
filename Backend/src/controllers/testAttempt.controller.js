const Test = require("../models/Test")
const Question = require("../models/Question");
const GeneratedTest = require("../models/GeneratedTest");
const Submission = require("../models/Submission");
const UserTest = require("../models/UserTest");
const mongoose = require("mongoose");

exports.startTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    // 1️⃣ Load test configuration
    const test = await Test.findById(testId).populate("subjectConfigs.subjectId", "name");
    if (!test) return res.status(404).json({ error: "Test not found" });

    // 2️⃣ CALCULATE ATTEMPT NUMBER 
    // We check how many submissions already exist to determine the next attempt number
    const previousSubmissions = await Submission.countDocuments({ testId, userId });
    const currentAttemptNumber = previousSubmissions + 1;

    // 3️⃣ Check for an "Active" session (In-progress)
    // If they haven't submitted the latest attempt yet, resume it.
    let existing = await GeneratedTest.findOne({ testId, userId, attemptNumber: currentAttemptNumber });
    
    if (existing) {
      const questions = await Question.find({
        _id: { $in: existing.questionIds }
      }).populate("subjectId", "name");

      return res.json({
        questions,
        sectionTimes: existing.sectionTimes,
        attemptNumber: existing.attemptNumber // Pass this to frontend
      });
    }

    // 4️⃣ Calculate section times (Your existing logic)
    let block1Time = 0, block2Time = 0, block1Set = false;
    for (const config of test.subjectConfigs) {
      const subjectName = config.subjectId.name.toLowerCase();
      if (["physics", "chemistry"].includes(subjectName)) {
        if (!block1Set) { block1Time = config.time * 60; block1Set = true; }
      } else {
        block2Time += config.time * 60;
      }
    }

    // 5️⃣ Generate questions (Your existing logic)
    let finalSelection = [];
    for (const config of test.subjectConfigs) {
      const { subjectId, questions: totalCount, difficulty } = config;
      const subIdStr = subjectId._id.toString();
      let subjectPool = [...(test.customQuestions?.[subIdStr] || [])];
      
      const remainingSlots = Math.max(0, totalCount - subjectPool.length);
      if (remainingSlots > 0) {
        const tiers = ["easy", "medium", "hard"];
        for (const tier of tiers) {
          const tierPercent = difficulty[tier] || 0;
          const tierTarget = Math.round((tierPercent / 100) * totalCount);
          const pickCount = Math.min(tierTarget, remainingSlots - (subjectPool.length - (test.customQuestions?.[subIdStr]?.length || 0)));

          if (pickCount <= 0) continue;

          const randomQs = await Question.aggregate([
            { $match: { 
                subjectId: subjectId._id, 
                difficulty: tier, 
                chapterId: { $in: test.chapterIds }, 
                _id: { $nin: subjectPool } 
            }},
            { $sample: { size: pickCount } }
          ]);
          subjectPool.push(...randomQs.map(q => q._id));
        }
      }
      finalSelection.push(...subjectPool);
    }

    // 6️⃣ Save generated test WITH ATTEMPT NUMBER
    const generated = await GeneratedTest.create({
      testId,
      userId,
      attemptNumber: currentAttemptNumber, // <--- Key Change
      questionIds: finalSelection,
      sectionTimes: { block1: block1Time, block2: block2Time }
    });

    const questions = await Question.find({ _id: { $in: finalSelection } }).populate("subjectId", "name");

    res.json({
      questions,
      sectionTimes: generated.sectionTimes,
      attemptNumber: currentAttemptNumber // <--- Send to frontend
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Generation failed" });
  }
};
