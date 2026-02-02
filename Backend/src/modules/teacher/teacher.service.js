import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";

/* ---------------- GET TEACHER BATCHES ---------------- */

/* ---------------- CREATE PDF TEST (UNCHANGED) ---------------- */
export const createTest = async (
  teacher,
  { title, batchIds,configuration ,  questions, duration , startTime, endTime }
) => {
  if (!batchIds || batchIds.length === 0) {
    throw new Error("At least one batch must be selected");
  }

  const teacherBatches = await Batch.find({
    teacherId: teacher.id,
  }).select("_id");

  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());

  const invalidBatch = batchIds.find(
    (id) => !allowedBatchIds.includes(id)
  );

  if (invalidBatch) {
    throw new Error("You are not assigned to one or more batches");
  }

  if (!questions || questions.length === 0) {
    throw new Error("Questions are required for PDF tests");
  }

  return Test.create({
    title,
    mode: "PDF",
    instituteId: teacher.instituteId,
    teacherId: teacher.id,
    batches: batchIds,
    questions,
    configuration,
    duration,
    startTime,
    endTime,
  });
};

/* ---------------- CREATE CUSTOM TEST (CONFIG ONLY) ---------------- */
export const createCustomTest = async (
  teacher,
  { title, batchIds, configuration, duration, metadata, startTime, endTime }
) => {
  if (!batchIds || batchIds.length === 0) {
    throw new Error("At least one batch must be selected");
  }

  if (!configuration || configuration.length === 0) {
    throw new Error("Custom test configuration is required");
  }

  if (!metadata || !metadata.distribution) {
    throw new Error("Test metadata is required");
  }

  const teacherBatches = await Batch.find({
    teacherId: teacher.id,
  }).select("_id");

  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());

  const invalidBatch = batchIds.find(
    (id) => !allowedBatchIds.includes(id)
  );

  if (invalidBatch) {
    throw new Error("You are not assigned to one or more batches");
  }

  if (!["Single Set", "4 Sets"].includes(metadata.distribution)) {
    throw new Error("Only Single Set and 4 Sets are supported");
  }

  return Test.create({
    title,
    mode: "CUSTOM",
    instituteId: teacher.instituteId,
    teacherId: teacher.id,
    batches: batchIds,
    configuration,
    metadata,
    duration ,
    questions: [],
    startTime,
    endTime,
  });
};

/* ---------------- GENERATE CUSTOM TEST QUESTIONS ---------------- */
export const generateCustomTest = async (teacher, testId) => {
  const test = await Test.findOne({
    _id: testId,
    teacherId: teacher.id,
    mode: "CUSTOM",
  });

  if (!test) {
    throw new Error("Custom test not found");
  }

  if (test.questions.length > 0 || test.sets) {
    throw new Error("Test already generated");
  }

  const questions = mockGenerateQuestions(test.configuration);

  if (test.metadata.distribution === "Single Set") {
    test.questions = questions;
  }

  if (test.metadata.distribution === "4 Sets") {
    test.sets = {
      A: shuffle([...questions]),
      B: shuffle([...questions]),
      C: shuffle([...questions]),
      D: shuffle([...questions]),
    };
  }

  await test.save();
  return test;
};

/* ---------------- HELPERS ---------------- */
const mockGenerateQuestions = (configuration) => {
  let questions = [];
  let index = 1;

  configuration.forEach((cfg) => {
    for (let i = 0; i < cfg.questions; i++) {
      questions.push({
        questionText: `${cfg.subject} Question ${index}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: Math.floor(Math.random() * 4),
      });
      index++;
    }
  });

  return questions;
};



/* ---------------- GET TEACHER BATCHES ---------------- */
export const getMyBatches = async (teacher) => {
  if (!teacher?.id) {
    throw new Error("Unauthorized");
  }

  const batches = await Batch.find({
    teacherId: teacher.id,
  }).select("_id name");

  return batches;
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};


