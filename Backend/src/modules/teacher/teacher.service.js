import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";
import fs from "fs";
import path from "path";
import Resource from "./Resource.js";

/* ---------------- GET TEACHER BATCHES ---------------- */

/* ---------------- CREATE PDF TEST (UNCHANGED) ---------------- */
export const createTest = async (
  teacher,
  { title, batchIds, configuration, questions, duration, startTime, endTime }
) => {
  // 1. Basic Validations
  if (!batchIds || batchIds.length === 0) {
    throw new Error("At least one batch must be selected");
  }

  // 2. SECURITY CHECK: Query 'teachers' array instead of 'teacherId'
  // This allows Mongoose to find the teacher's ID inside the Batch's teachers list
  const teacherBatches = await Batch.find({
    teachers: teacher.id || teacher._id,
  }).select("_id");

  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());

  // Check if any of the requested batchIds are NOT in the teacher's allowed list
  const invalidBatch = batchIds.find(
    (id) => !allowedBatchIds.includes(id)
  );

  if (invalidBatch) {
    throw new Error("Operational Error: You are not assigned to one or more selected batches");
  }

  // 3. Questions Validation
  if (!questions || questions.length === 0) {
    throw new Error("Intelligence Payload Error: Questions are required for PDF tests");
  }

  // 4. Create the Record
  return Test.create({
    title,
    mode: "PDF",
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    questions,
    configuration,
    duration,
    startTime,
    endTime,
  });
};
/* ---------------- CREATE CUSTOM TEST (CONFIG ONLY) ---------------- */
/* ---------------- CREATE CUSTOM TEST ---------------- */
export const createCustomTest = async (
  teacher,
  { title, batchIds, configuration, duration, metadata, startTime, endTime }
) => {
  // 1. Basic Validations
  if (!batchIds || batchIds.length === 0) throw new Error("At least one batch must be selected");
  if (!configuration || configuration.length === 0) throw new Error("Test configuration is required");
  if (!metadata?.distribution) throw new Error("Test metadata/distribution is required");

  // 2. SECURITY CHECK: Verify teacher belongs to the selected batches
  // FIX: We must query the 'teachers' array field defined in your Batch Schema
  const teacherBatches = await Batch.find({
    teachers: teacher.id || teacher._id, // Mongoose searches inside the array automatically
  }).select("_id");

  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());

  const invalidBatch = batchIds.find(
    (id) => !allowedBatchIds.includes(id)
  );

  if (invalidBatch) {
    throw new Error("Access Denied: You are not assigned to one or more selected batches");
  }

  // 3. Metadata Validation
  if (!["Single Set", "4 Sets"].includes(metadata.distribution)) {
    throw new Error("Distribution must be 'Single Set' or '4 Sets'");
  }

  // 4. Create Record
  return Test.create({
    title,
    mode: "CUSTOM",
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    configuration,
    metadata,
    duration,
    questions: [],
    startTime,
    endTime,
  });
};

/* ---------------- GENERATE CUSTOM TEST QUESTIONS ---------------- */
export const generateCustomTest = async (teacher, testId) => {
  const test = await Test.findOne({
    _id: testId,
    teacherId: teacher.id || teacher._id,
    mode: "CUSTOM",
  });

  if (!test) throw new Error("Custom test not found or unauthorized");

  // Prevent overwriting existing questions
  if (test.questions?.length > 0 || test.sets) {
    throw new Error("Intelligence already generated for this module");
  }

  // Generate Questions based on config
  const questions = await mockGenerateQuestions(test.configuration);

  // Apply Distribution Strategy
  if (test.metadata.distribution === "Single Set") {
    test.questions = questions;
  } else if (test.metadata.distribution === "4 Sets") {
    // Ensure you have a shuffle function imported or defined
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
  // Ensure we have a valid ID from the auth middleware
  const teacherId = teacher._id || teacher.id;

  if (!teacherId) {
    throw new Error("Unauthorized: Teacher identification missing");
  }

  // Find batches where the teacher's ID exists in the 'teachers' array
  const batches = await Batch.find({
    teachers: teacherId, 
  })
  .select("_id name") // Only return necessary fields for the frontend chips
  .lean(); // Faster execution by returning plain JSON objects

  return batches;
};

const shuffle = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};



export const deployMaterial = async (teacher, metadata, file) => {
  const teacherId = teacher._id || teacher.id;
  const { subjectId, category, batchIds } = metadata;

  const subjectMap = { phy: "Physics", che: "Chemistry", mat: "Maths", bio: "Biology" };

  // 1. Save File to Disk
  const uploadDir = path.join(process.cwd(), "uploads", "vault");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
  const filePath = path.join(uploadDir, uniqueName);
  fs.writeFileSync(filePath, file.buffer);

  // 2. Create Resource with Batch Access
  const newResource = await Resource.create({
    title: file.originalname,
    category,
    subject: subjectMap[subjectId] || subjectId,
    fileUrl: `/uploads/vault/${uniqueName}`,
    batchIds, // Only students in these batches will see this
    uploadedBy: teacherId,
    fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB"
  });

  return { success: true, resource: newResource };
};
