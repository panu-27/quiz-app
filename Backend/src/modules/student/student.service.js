import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";
import Leaderboard from "../test/leaderboard.model.js";
import mongoose from "mongoose";


/* ---------------- GET MY TESTS ---------------- */


export const getMyTests = async (jwtUser) => {
  const userId = jwtUser.id || jwtUser._id;
  
  // 1. Fetch student data
  const student = await User.findById(userId);

  if (!student || !student.batchId) {
    console.warn(`Student ${userId} has no batch assigned.`);
    return []; 
  }

  const now = new Date();

  // 2. The "Active Window" Query
  // - Batch matches student's assigned batch
  // - Current time is GREATER THAN OR EQUAL to Start Time
  // - Current time is LESS THAN OR EQUAL to End Time
  return Test.find({
    batches: student.batchId,
    startTime: { $lte: now }, // Test has already started
    endTime: { $gte: now }    // Test has not yet ended
  })
  .select("_id title startTime endTime mode duration")
  .sort({ endTime: 1 }); // Sort by what's ending soonest (Urgency)
};





/* ---------------- START ATTEMPT SERVICE ---------------- */
export const startAttempt = async (student, testId) => {
    // 1. Fetch Test and populate subject details just in case subjectName isn't stored
    const test = await Test.findById(testId).populate('blocks.sections.subject');
    if (!test) throw new Error("Test not found");

    // Authorization logic
    const studentBatchId = student.batchId?.toString();
    if (!test.batches.some(b => b.toString() === studentBatchId)) {
        throw new Error("Not allowed to attempt this test.");
    }

    const userId = student.id || student._id;

    // 2. Prevent/Resume Attempt logic
    let attempt = await TestAttempt.findOne({ testId, studentId: userId, status: "started" });

    if (!attempt) {
        const lastAttempt = await TestAttempt.findOne({ testId, studentId: userId }).sort({ attemptNumber: -1 });
        const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

        try {
            attempt = new TestAttempt({
                testId,
                studentId: userId,
                attemptNumber: nextAttemptNumber,
                status: "started"
            });

            if (test.metadata?.distribution === "4 Sets" && test.sets) {
                const setKeys = Array.from(test.sets.keys());
                attempt.assignedSet = setKeys[Math.floor(Math.random() * setKeys.length)];
            }
            await attempt.save();
        } catch (err) {
            if (err.code === 11000) {
                attempt = await TestAttempt.findOne({ testId, studentId: userId, attemptNumber: nextAttemptNumber });
            } else throw err;
        }
    }

    // 3. Retrieve Correct Source
    let sourceBlocks = (test.metadata?.distribution === "4 Sets" && attempt.assignedSet) 
                        ? test.sets.get(attempt.assignedSet) 
                        : test.blocks;

    // 4. Transform to "Safe" Structure with SUBJECT NAMES
    const safeBlocks = sourceBlocks.map(block => ({
        blockName: block.blockName,
        duration: block.duration, 
        sections: block.sections.map(section => ({
            // If subjectName exists in schema, use it. Otherwise, use populated subjectName
            subjectName: section.subjectName || section.subject?.subjectName || "Unknown Subject",
            subjectId: section.subject._id || section.subject,
            numQuestions: section.numQuestions,
            questions: section.questions.map(q => ({
                questionId: q.questionId,
                questionText: q.questionText,
                options: q.options,
                subjectId: q.subjectId,
                explanation : q.explanation,
            }))
        }))
    }));

    return {
        testTitle: test.title,
        blocks: safeBlocks,
        attemptNumber: attempt.attemptNumber,
        assignedSet: attempt.assignedSet,
        examType: test.examType,
        totalDuration: test.duration // Total test time for global countdown
    };
};

/* ---------------- SUBMIT TEST SERVICE ---------------- */
export const submitTest = async (student, testId, data) => {
    const { answers = [], timeTaken = 0 } = data;
    const userId = student.id || student._id;

    const attempt = await TestAttempt.findOne({ 
        testId, studentId: userId, status: "started" 
    }).populate("testId");

    if (!attempt) throw new Error("Active session not found.");

    const test = attempt.testId;
    const sourceBlocks = (test.metadata?.distribution === "4 Sets" && attempt.assignedSet) 
                          ? test.sets.get(attempt.assignedSet) 
                          : test.blocks;

    let totalScore = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    let totalUnattempted = 0;
    
    // Use Subject ID as the key for consistency
    const subjectStats = new Map(); 

    sourceBlocks.forEach(block => {
        block.sections.forEach(section => {
            const sId = section.subject.toString();
            const sName = section.subjectName || "Unknown Subject";

            if (!subjectStats.has(sId)) {
                subjectStats.set(sId, { subjectName: sName, score: 0, correct: 0, wrong: 0, unattempted: 0 });
            }

            const currentStats = subjectStats.get(sId);
            const rule = test.markingScheme.subjectWise.find(s => s.subjectId.toString() === sId) || {
                correctMarks: test.markingScheme.defaultCorrect,
                negativeMarks: test.markingScheme.defaultNegative
            };

            section.questions.forEach(q => {
                const currentQId = q.questionId || q._id;
                const studentAns = answers.find(a => a.questionId === currentQId.toString());
                const selected = studentAns ? studentAns.selectedOption : -1;
                
                let marksObtained = 0;
                let isCorrect = false;

                if (selected === -1) {
                    currentStats.unattempted++;
                    totalUnattempted++;
                } else if (Number(selected) === Number(q.correctAnswer)) {
                    isCorrect = true;
                    marksObtained = rule.correctMarks;
                    currentStats.correct++;
                    currentStats.score += marksObtained;
                    totalCorrect++;
                    totalScore += marksObtained;
                } else {
                    marksObtained = -Math.abs(rule.negativeMarks);
                    currentStats.wrong++;
                    currentStats.score += marksObtained;
                    totalWrong++;
                    totalScore += marksObtained;
                }

                attempt.answers.push({
                    questionId: currentQId,
                    selectedOption: selected,
                    isCorrect,
                    subjectId: section.subject,
                    marksObtained,
                    explanation: q.explanation
                });
            });
        });
    });

    attempt.score = totalScore;
    attempt.subjectWiseScore = subjectStats; 
    attempt.totalCorrect = totalCorrect;
    attempt.totalWrong = totalWrong;
    attempt.totalUnattempted = totalUnattempted;
    attempt.status = "completed";
    attempt.submittedAt = new Date();
    attempt.timeTaken = timeTaken;
    
    await attempt.save();

    if (attempt.attemptNumber === 1) {
        await Leaderboard.findOneAndUpdate(
            { testId: test._id, studentId: userId },
            { score: totalScore, timeTaken, batchId: student.batchId },
            { upsert: true }
        );
    }

    return { score: totalScore, totalCorrect, totalWrong };
};


// ... existing imports
import Resource from "../teacher/Resource.js"; 

/**
 * @desc    Fetch resources assigned to the student's batch
 * @param   {Object} jwtUser - The user object from the token
 */
export const getMyLibrary = async (jwtUser) => {
  // 1. Find the student to get their batch assignment
  const student = await User.findById(jwtUser.id);

  if (!student || !student.batchId) {
    throw new Error("Student not assigned to any batch. Access denied.");
  }

  // 2. Query Resources
  // We look for resources where the student's batchId exists in the batchIds array
  const resources = await Resource.find({
    batchIds: student.batchId
  })
  .select("title category subject fileUrl fileSize createdAt")
  .sort({ createdAt: -1 }); // Newest first

  // 3. Optional: Grouping logic (If you want the frontend to receive categorized data)
  const categorized = resources.reduce((acc, res) => {
    const cat = res.category; // "Notes", "PYQs", "Formulas"
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(res);
    return acc;
  }, {});

  // Returning categorized object makes building the UI tabs much easier
  return categorized;
};




export const getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password") 
    .populate({
      path: "batchId",
      select: "name teachers", 
      populate: {
        path: "teachers",
        select: "name" // Only grab teacher names
      }
    })
    .populate("instituteId", "name");

  if (!user) throw new Error("Record not found");
  
  return user;
};