import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";
import Leaderboard from "../test/leaderboard.model.js";
import mongoose from "mongoose";


/* ---------------- GET MY TESTS ---------------- */
export const getMyTests = async (jwtUser) => {
  // Use jwtUser.id or jwtUser._id depending on your token payload
  const student = await User.findById(jwtUser.id || jwtUser._id);

  // If student doesn't exist or has no batch, return empty list instead of throwing 400
  if (!student || !student.batchId) {
    console.warn(`Student ${jwtUser.id} has no batch assigned.`);
    return []; 
  }

  const now = new Date();

  return Test.find({
    batches: student.batchId, // Matches 'batches' array in Test model
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).select("_id title startTime endTime mode");
};






/* ---------------- START ATTEMPT SERVICE ---------------- */
export const startAttempt = async (student, testId) => {
    if (!mongoose.Types.ObjectId.isValid(testId)) throw new Error("Invalid test id");

    const test = await Test.findById(testId);
    if (!test) throw new Error("Test not found");

    // 1. Batch validation
    const studentBatchId = student.batchId?.toString();
    const allowed = test.batches.some(b => b.toString() === studentBatchId);
    if (!allowed) throw new Error("Not allowed to attempt this test.");

    const userId = student.id || student._id;

    // 2. Find an existing "started" attempt (Prevents creating new ones if one is open)
    let attempt = await TestAttempt.findOne({ 
        testId, 
        studentId: userId, 
        status: "started" 
    });

    // 3. If no ongoing attempt, create a new one safely
    if (!attempt) {
        // Get the highest current attempt number to determine next iteration
        const lastAttempt = await TestAttempt.findOne({ testId, studentId: userId })
            .sort({ attemptNumber: -1 })
            .select("attemptNumber");

        const nextAttemptNumber = lastAttempt ? lastAttempt.attemptNumber + 1 : 1;

        try {
            attempt = new TestAttempt({
                testId,
                studentId: userId,
                attemptNumber: nextAttemptNumber,
                status: "started"
            });

            // Handle Set Assignment for 4-Set tests
            if (test.mode === "CUSTOM" && test.metadata?.distribution === "4 Sets" && test.sets) {
                // Ensure we handle Mongoose Map keys
                const setKeys = Array.from(test.sets.keys());
                attempt.assignedSet = setKeys[Math.floor(Math.random() * setKeys.length)];
            }

            await attempt.save();
        } catch (err) {
            // 4. THE FIX: Handle Race Condition (Error 11000 = Duplicate Key)
            if (err.code === 11000) {
                // If another request created this attempt number first, just find and return it
                attempt = await TestAttempt.findOne({ 
                    testId, 
                    studentId: userId, 
                    attemptNumber: nextAttemptNumber 
                });
            } else {
                throw err;
            }
        }
    }

    // 5. Question Retrieval
    let rawQuestions = [];
    if (test.mode === "CUSTOM" && test.metadata?.distribution === "4 Sets" && test.sets) {
        rawQuestions = test.sets.get(attempt.assignedSet) || [];
    } else {
        rawQuestions = test.questions || [];
    }

    // 6. Map Subject Names from Configuration to Questions
    let cumulativeIndex = 0;
    const configMap = test.configuration.map(c => ({
        subject: c.subject,
        start: cumulativeIndex,
        end: (cumulativeIndex += c.questions)
    }));

    const safeQuestions = rawQuestions.map((q, idx) => {
        const config = configMap.find(c => idx >= c.start && idx < c.end);
        return {
            _id: q._id,
            questionText: q.questionText,
            options: q.options,
            subjectId: { name: config ? config.subject : "Other" } 
        };
    });

    // 7. Timing Logic
    const totalSeconds = (test.duration || 180) * 60;
    let b1s = 0, b2s = 0;
    const hasB1 = test.configuration.some(c => ["physics", "chemistry"].includes(c.subject.toLowerCase()));
    const hasB2 = test.configuration.some(c => !["physics", "chemistry"].includes(c.subject.toLowerCase()));

    if (hasB1 && hasB2) {
        b1s = Math.floor(totalSeconds / 2);
        b2s = totalSeconds - b1s;
    } else {
        b1s = hasB1 ? totalSeconds : 0;
        b2s = hasB2 ? totalSeconds : 0;
    }

    return {
        questions: safeQuestions,
        attemptNumber: attempt.attemptNumber,
        sectionTimes: { block1: b1s, block2: b2s }
    };
};

/* ---------------- SUBMIT TEST SERVICE ---------------- */
export const submitTest = async (student, testId, data) => {
    if (!data) throw new Error("No submission data received");
    const { answers = [], timeTaken = 0 } = data;
    const userId = student.id || student._id;

    const attempt = await TestAttempt.findOne({
        testId,
        studentId: userId,
        status: "started"
    }).populate("testId");

    if (!attempt) throw new Error("Active attempt session not found.");

    const test = attempt.testId;
    let questions = [];

    if (test.mode === "PDF") {
        questions = test.questions;
    } else {
        questions = (test.sets instanceof Map && attempt.assignedSet) 
            ? test.sets.get(attempt.assignedSet) 
            : test.questions;
    }

    if (!questions || !Array.isArray(questions)) throw new Error("Questions not found.");

    // Score Calculation
    let score = 0;
    questions.forEach(q => {
        if (!q?._id) return;
        const ans = answers.find(a => a?.questionId === q._id.toString());
        if (ans && String(ans.selectedOption) === String(q.correctAnswer)) {
            score++;
        }
    });

    // Update Attempt
    attempt.answers = answers;
    attempt.score = score;
    attempt.timeTaken = timeTaken;
    attempt.status = "completed"; 
    await attempt.save();

    // Leaderboard (Only Attempt 1)
    if (attempt.attemptNumber === 1) {
        try {
            await Leaderboard.findOneAndUpdate(
                { testId: test._id, studentId: userId },
                { score, timeTaken, batchId: student.batchId },
                { upsert: true, new: true }
            );
        } catch (err) {
            console.error("Leaderboard Sync Error:", err.message);
        }
    }

    return { score, attemptNumber: attempt.attemptNumber };
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