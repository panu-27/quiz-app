import Test from "../test/test.model.js";
import TestAttempt from "../test/testAttempt.model.js";
import User from "../user/user.model.js";

import mongoose from "mongoose";


/* ---------------- GET MY TESTS ---------------- */
export const getMyTests = async (jwtUser) => {
  const student = await User.findById(jwtUser.id);

  if (!student || !student.batchId) {
    throw new Error("Student not assigned to any batch");
  }

  const now = new Date();

  return Test.find({
    batches: student.batchId,
    startTime: { $lte: now },
    endTime: { $gte: now },
  }).select("_id title startTime endTime mode");
};


export const startAttempt = async (student, testId) => {
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    throw new Error("Invalid test id");
  }

  const test = await Test.findById(testId);
  if (!test) throw new Error("Test not found");

  // ✅ Batch validation
  const studentBatchId = student.batchId?.toString();
  const allowed = test.batches.some(b => b.toString() === studentBatchId);
  if (!allowed) throw new Error("Not allowed to attempt this test.");

  // ✅ Find or create attempt
  let attempt = await TestAttempt.findOne({ testId, studentId: student.id });

  let rawQuestions = [];

  // ✅ Handle CUSTOM (Sets or Single) vs PDF
  if (test.mode === "CUSTOM") {
    if (test.metadata?.distribution === "4 Sets" && test.sets) {
      if (!attempt) {
        const setKeys = Array.from(test.sets.keys());
        const randomSet = setKeys[Math.floor(Math.random() * setKeys.length)];
        attempt = await TestAttempt.create({
          testId,
          studentId: student.id,
          assignedSet: randomSet,
        });
      }
      rawQuestions = test.sets.get(attempt.assignedSet);
    } else {
      // Single Set Custom or Default
      if (!attempt) attempt = await TestAttempt.create({ testId, studentId: student.id });
      rawQuestions = test.questions;
    }
  } else {
    // PDF Mode
    if (!attempt) attempt = await TestAttempt.create({ testId, studentId: student.id });
    rawQuestions = test.questions;
  }

  // ✅ STEP 1: Map Subject Names from Configuration to Questions
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

  // ✅ STEP 2: Logic for splitting Duration into Block1 and Block2
  const totalSeconds = (test.duration || 180) * 60;
  let block1Seconds = 0;
  let block2Seconds = 0;

  // Check if we have subjects that belong to Block 1 (Physics/Chemistry)
  const hasBlock1Subjects = test.configuration.some(c => 
    ["physics", "chemistry"].includes(c.subject.toLowerCase())
  );
  const hasBlock2Subjects = test.configuration.some(c => 
    !["physics", "chemistry"].includes(c.subject.toLowerCase())
  );

  if (hasBlock1Subjects && hasBlock2Subjects) {
    // Split time equally if both sections have content
    block1Seconds = Math.floor(totalSeconds / 2);
    block2Seconds = totalSeconds - block1Seconds;
  } else if (hasBlock1Subjects) {
    // Only Physics/Chemistry exists
    block1Seconds = totalSeconds;
    block2Seconds = 0;
  } else {
    // Only other subjects exist
    block1Seconds = 0;
    block2Seconds = totalSeconds;
  }

  return {
    questions: safeQuestions,
    attemptNumber: attempt.attemptNumber || 1,
    sectionTimes: {
      block1: block1Seconds,
      block2: block2Seconds
    }
  };
};
/* ---------------- SUBMIT TEST ---------------- */
/* ---------------- SUBMIT TEST SERVICE ---------------- */
export const submitTest = async (student, testId, data) => {
  if (!data) throw new Error("No submission data received");
  const { answers = [], timeTaken = 0 } = data;

  const userId = student.id || student._id;

  const attempt = await TestAttempt.findOne({
    testId: testId,
    studentId: userId,
  }).populate("testId");

  if (!attempt) throw new Error("Attempt not found");

  const test = attempt.testId;
  let questions = [];

  // ✅ FIX: Use .get() because test.sets is a Mongoose Map
  if (test.mode === "PDF") {
    questions = test.questions;
  } else {
    // Check if sets exists and is a Map
    if (test.sets instanceof Map) {
      questions = test.sets.get(attempt.assignedSet);
    } else {
      // Fallback for single-set CUSTOM tests
      questions = test.questions;
    }
  }

  // ✅ SAFETY CHECK: If questions is still undefined, the loop will crash
  if (!questions || !Array.isArray(questions)) {
    console.error("Failed to retrieve questions. Assigned Set:", attempt.assignedSet);
    throw new Error("Internal Server Error: Questions not found for assigned set.");
  }

  let score = 0;
  questions.forEach(q => {
    if (!q || !q._id) return;
    
    const ans = answers.find(a => a && a.questionId === q._id.toString());
    
    // ✅ TYPE-SAFE COMPARISON: Ensure both are treated as numbers/strings
    if (ans && String(ans.selectedOption) === String(q.correctAnswer)) {
      score++;
    }
  });

  attempt.answers = answers;
  attempt.score = score;
  attempt.timeTaken = timeTaken;
  attempt.status = "completed"; 
  await attempt.save();

  return { score };
};