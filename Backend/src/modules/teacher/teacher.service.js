import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";
import fs from "fs";
import path from "path";
import Resource from "./Resource.js";
import BankQuestion from "../questionBank/BankQuestion.js";
import mongoose from "mongoose";
import User from "../user/user.model.js";
import Syllabus from "../institute/syllabus.model.js";
import { log } from "console";

/* ---------------- GET TEACHER BATCHES ---------------- */

/* ---------------- CREATE PDF TEST ---------------- */
export const createTest = async (
  teacher,
  { title, batchIds, examType, blocks, markingScheme, metadata, duration, startTime, endTime }
) => {
  // 1. Basic Validations
  if (!batchIds?.length) throw new Error("At least one batch must be selected");
  if (!examType) throw new Error("Exam type pattern (JEE/NEET/PCM/PCB) is required");
  if (!blocks?.length) throw new Error("Blocks with questions are required");

  // 2. SECURITY CHECK
  const teacherBatches = await Batch.find({ teachers: teacher.id || teacher._id }).select("_id");
  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());
  const invalidBatch = batchIds.find((id) => !allowedBatchIds.includes(id));

  if (invalidBatch) throw new Error("Operational Error: Unauthorized batch selection");

  // 3. APPLY MARKING SCHEME LOGIC (Consistent with Custom Test)
  let finalMarkingScheme = {
    isNegativeMarking: false,
    defaultCorrect: 2,
    defaultNegative: 0,
    subjectWise: []
  };

  if (examType === "JEE" || examType === "NEET") {
    finalMarkingScheme.isNegativeMarking = true;
    finalMarkingScheme.defaultCorrect = 4;
    finalMarkingScheme.defaultNegative = 1;
  }
  else if (examType === "PCM") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1;

    blocks.forEach(block => {
      block.sections.forEach(section => {
        const sName = section.subjectName?.toLowerCase() || "";
        // Logic: Math = 2, Physics/Chem = 1
        const marks = sName.includes("math") ? 2 : 1;

        finalMarkingScheme.subjectWise.push({
          subjectId: section.subject,
          correctMarks: marks,
          negativeMarks: 0
        });
      });
    });
  }
  else if (examType === "PCB") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1;
    finalMarkingScheme.defaultNegative = 0;
  }
  else {
    finalMarkingScheme.defaultCorrect = 2;
    finalMarkingScheme.defaultNegative = 0;
  }

  // 4. Create the Record
  return Test.create({
    title,
    mode: "PDF",
    examType,
    markingScheme: finalMarkingScheme, // Using the engine-generated scheme
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    blocks,
    metadata,
    duration,
    startTime,
    endTime,
  });
};

export const craftTest = async (
  teacher,
  { title, batchIds, examType, blocks, markingScheme, metadata, duration, startTime, endTime }
) => {
  // 1. Basic Validations
  if (!batchIds?.length) throw new Error("At least one batch must be selected");
  if (!examType) throw new Error("Exam type pattern (JEE/NEET/PCM/PCB) is required");
  if (!blocks?.length) throw new Error("Blocks with questions are required");

  // 2. SECURITY CHECK
  const teacherBatches = await Batch.find({ teachers: teacher.id || teacher._id }).select("_id");
  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());
  const invalidBatch = batchIds.find((id) => !allowedBatchIds.includes(id));

  if (invalidBatch) throw new Error("Operational Error: Unauthorized batch selection");

  // 3. APPLY MARKING SCHEME LOGIC (Consistent with Custom Test)
  let finalMarkingScheme = {
    isNegativeMarking: false,
    defaultCorrect: 2,
    defaultNegative: 0,
    subjectWise: []
  };

  if (examType === "JEE" || examType === "NEET") {
    finalMarkingScheme.isNegativeMarking = true;
    finalMarkingScheme.defaultCorrect = 4;
    finalMarkingScheme.defaultNegative = 1;
  }
  else if (examType === "PCM") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1;

    blocks.forEach(block => {
      block.sections.forEach(section => {
        const sName = section.subjectName?.toLowerCase() || "";
        // Logic: Math = 2, Physics/Chem = 1
        const marks = sName.includes("math") ? 2 : 1;

        finalMarkingScheme.subjectWise.push({
          subjectId: section.subject,
          correctMarks: marks,
          negativeMarks: 0
        });
      });
    });
  }
  else if (examType === "PCB") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1;
    finalMarkingScheme.defaultNegative = 0;
  }
  else {
    finalMarkingScheme.defaultCorrect = 2;
    finalMarkingScheme.defaultNegative = 0;
  }

  const now = new Date();
  const pastStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const pastEnd = new Date(now.getTime() - 23 * 60 * 60 * 1000); // 23 hours ago

  // 4. Create the Record
  return Test.create({
    title,
    mode: "CRAFTED",
    examType,
    markingScheme: finalMarkingScheme, // Using the engine-generated scheme
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    blocks,
    metadata,
    duration,
    startTime: pastStart,
    endTime: pastEnd,
  });
};
/* ---------------- CREATE CUSTOM TEST ---------------- */
export const createCustomTest = async (teacher, payload) => {
  const { title, batchIds, blocks, duration, metadata, examType, startTime, endTime } = payload;

  if (!blocks?.length) throw new Error("Block configuration is required");

  // 1. Security: Verify teacher's access to batches
  const teacherBatches = await Batch.find({ teachers: teacher.id || teacher._id }).select("_id");
  const allowedIds = teacherBatches.map(b => b._id.toString());
  if (batchIds.some(id => !allowedIds.includes(id))) {
    throw new Error("Access Denied: Unauthorized batch selection");
  }

  // 2. BACKEND MARKING SCHEME ENGINE
  let finalMarkingScheme = {
    isNegativeMarking: false,
    defaultCorrect: 2,
    defaultNegative: 0,
    subjectWise: []
  };

  if (examType === "JEE" || examType === "NEET") {
    finalMarkingScheme.isNegativeMarking = true;
    finalMarkingScheme.defaultCorrect = 4;
    finalMarkingScheme.defaultNegative = 1;
  }
  else if (examType === "PCM") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1; // Fallback default

    blocks.forEach(block => {
      block.sections.forEach(section => {
        const sName = section.subjectName?.toLowerCase() || "";
        // Logic: Math = 2, Physics/Chem = 1
        const marks = sName.includes("math") ? 2 : 1;

        finalMarkingScheme.subjectWise.push({
          subjectId: section.subject,
          correctMarks: marks,
          negativeMarks: 0
        });
      });
    });
  }
  else if (examType === "PCB") {
    finalMarkingScheme.isNegativeMarking = false;
    finalMarkingScheme.defaultCorrect = 1; // All P, C, and B are 1 mark
    finalMarkingScheme.defaultNegative = 0;
  }
  else {
    // OTHER / SINGLE: 2 Marks, No Negative
    finalMarkingScheme.defaultCorrect = 2;
    finalMarkingScheme.defaultNegative = 0;
  }

  // 3. Create the Record
  return Test.create({
    title,
    mode: "CUSTOM",
    examType,
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    blocks,
    markingScheme: finalMarkingScheme,
    metadata,
    duration,
    startTime,
    endTime
  });
};

export const generateCustomTest = async (teacher, testId) => {
  try {


    const teacherId = teacher.id || teacher._id;

    // STEP 1: Fetch test
    const test = await Test.findOne({ _id: testId, teacherId });

    if (!test) {
      throw new Error("Test not found or unauthorized");
    }

    if (test.mode === "PDF") {
      return test;
    }

    // STEP 2: Distribution ratios
    const distributionRatios = {
      Easy: { easy: 0.60, medium: 0.30, hard: 0.10 },
      Med: { easy: 0.20, medium: 0.60, hard: 0.20 },
      Hard: { easy: 0.10, medium: 0.40, hard: 0.50 }
    };

    // STEP 3: Loop blocks
    for (let i = 0; i < test.blocks.length; i++) {

      const block = test.blocks[i];

      if (!block.sections?.length) continue;

      for (let j = 0; j < block.sections.length; j++) {

        const section = block.sections[j];

        const TARGET_COUNT = section.numQuestions;

        const selectedRatio =
          distributionRatios[section.difficulty] || distributionRatios["Med"];

        // STEP 4: Fetch questions from bank
        const allQs = await BankQuestion.find({
          topicId: { $in: section.topics }
        }).lean();

        if (!allQs.length) {
          throw new Error("No questions found for topics");
        }

        // STEP 5: Create difficulty buckets
        const buckets = {
          easy: shuffle(allQs.filter(q => q.difficulty === "easy")),
          medium: shuffle(allQs.filter(q => q.difficulty === "medium")),
          hard: shuffle(allQs.filter(q => q.difficulty === "hard"))
        };

        let finalSelection = [];

        // STEP 6: Calculate targets
        const targetEasy = Math.floor(TARGET_COUNT * selectedRatio.easy);
        const targetMed = Math.floor(TARGET_COUNT * selectedRatio.medium);
        const targetHard = Math.floor(TARGET_COUNT * selectedRatio.hard);

        finalSelection.push(...buckets.easy.splice(0, targetEasy));
        finalSelection.push(...buckets.medium.splice(0, targetMed));
        finalSelection.push(...buckets.hard.splice(0, targetHard));

        // STEP 7: Fill remaining gap
        if (finalSelection.length < TARGET_COUNT) {

          const gap = TARGET_COUNT - finalSelection.length;

          const remainingPool = shuffle([
            ...buckets.easy,
            ...buckets.medium,
            ...buckets.hard
          ]);

          finalSelection.push(...remainingPool.splice(0, gap));
        }

        // STEP 8: Map to Test schema format
        test.blocks[i].sections[j].questions =
          shuffle(finalSelection).map((q) => {

            let questionOptions = q.options;

            // Parse if string
            if (typeof questionOptions === "string") {
              try {
                questionOptions = JSON.parse(questionOptions);
              } catch {
                questionOptions = [];
              }
            }

            // Convert to required schema format
            const formattedOptions = questionOptions.map(opt => {

              if (typeof opt === "string") {
                return {
                  text: opt,
                  image: null,
                  isImageOption: false
                };
              }

              return {
                text: opt.text || "",
                image: opt.image || null,
                isImageOption: opt.isImageOption || false
              };
            });

            return {
              questionId: q._id,
              questionText: q.text,
              questionImage: q.image || null,
              options: formattedOptions,
              correctAnswer: parseInt(q.answer, 10), // ✅ USE INDEX DIRECTLY
              explanation: q.explanation || ""
            };

          });

      }
    }

    // STEP 9: Save test
    test.markModified("blocks");

    await test.save();


    return test;

  } catch (err) {

    console.error("❌ ERROR in generateCustomTest:", err);

    throw err;

  }
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
    .select("_id name className allocatedSubjects") // Only return necessary fields for the frontend chips
    .lean(); // Faster execution by returning plain JSON objects

  return batches;
};

export const getMyBatches2 = async (teacher) => {
  // Ensure we have a valid ID from the auth middleware
  const teacherId = teacher._id || teacher.id;

  if (!teacherId) {
    throw new Error("Unauthorized: Teacher identification missing");
  }

  // Find batches where the teacher's ID exists in the 'teachers' array
  const batches = await Batch.find({
    teachers: teacherId,
  })
    .select("_id name className students allocatedSubjects") // Only return necessary fields for the frontend chips
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


const SUBJECT_MAP = {
  phy: "Physics",
  che: "Chemistry",
  mat: "Maths",
  bio: "Biology",
};


export const deployMaterial = async (teacher, metadata, file) => {
  const teacherId = teacher._id || teacher.id;
  const { subjectId, chapterId, category, batchIds, isFree } = metadata;
 
  // Validate required fields
  if (!subjectId) throw new Error("subjectId is required");
  if (!chapterId) throw new Error("chapterId is required");
  if (!category)  throw new Error("category is required");
  if (!batchIds || !batchIds.length) throw new Error("At least one batch required");
 
  // Save file to disk
  const uploadDir = path.join(process.cwd(), "uploads", "vault");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
 
  const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
  const filePath   = path.join(uploadDir, uniqueName);
  fs.writeFileSync(filePath, file.buffer);
 
  // Create Resource document
  const newResource = await Resource.create({
    title:      file.originalname,
    subjectId,                                    // "phy"
    chapterId,                                    // "phy-01"
    category,                                     // "notes"
    subject:    SUBJECT_MAP[subjectId] || subjectId, // legacy display name
    fileUrl:    `/uploads/vault/${uniqueName}`,
    fileSize:   (file.size / 1024 / 1024).toFixed(2) + " MB",
    batchIds,
    uploadedBy: teacherId,
    isFree:     isFree || false,
  });
 
  return { success: true, resource: newResource };
};



export const toggleFreeStatus = async (teacher, resourceId) => {
  const teacherId = teacher._id || teacher.id;
  const resource = await Resource.findOne({ _id: resourceId, uploadedBy: teacherId });
  
  if (!resource) {
    throw new Error("Resource not found or unauthorized");
  }

  resource.isFree = !resource.isFree;
  await resource.save();
  
  return { success: true, resource };
};

// Add these two functions to teacher.service.js

/* ---------------- GET CRAFTED TESTS ---------------- */
export const getCraftedTests = async (teacher) => {
  const teacherId = teacher._id || teacher.id;

  const teacherDoc = await User.findById(teacherId)
    .select("instituteId name email")
    .lean();


  const instituteId = teacherDoc?.instituteId;
  log("🏫 Teacher instituteId:");

  const query = {
    mode: "CRAFTED",
    $or: [
      { teacherId },
      ...(instituteId ? [{ instituteId }] : [])
    ]
  };


  const tests = await Test.find(query)
    .select("_id title examType duration createdAt teacherId instituteId")
    .populate("teacherId", "name")
    .sort({ createdAt: -1 })
    .lean();


  return tests;
};

/* ---------------- RESCHEDULE / REINITIALIZE TEST ---------------- */
export const scheduleTest = async (teacher, { testId, batchIds, startTime, endTime }) => {
  const teacherId = teacher._id || teacher.id;

  if (!mongoose.Types.ObjectId.isValid(testId)) throw new Error("Invalid test ID");
  if (!batchIds?.length) throw new Error("At least one batch must be selected");
  if (!startTime) throw new Error("Start time is required");

  // Fetch instituteId fresh from DB
  const teacherDoc = await User.findById(teacherId).select("instituteId").lean();
  const instituteId = teacherDoc?.instituteId;

  // 1. Ownership check — own test OR same institute colleague's test
  const test = await Test.findOne({
    _id: testId,
    $or: [
      { teacherId },
      ...(instituteId ? [{ instituteId }] : []),
    ],
  });
  if (!test) throw new Error("Test not found or unauthorized");

  // 2. Security: verify teacher owns all selected batches
  const teacherBatches = await Batch.find({ teachers: teacherId }).select("_id");
  const allowedIds = teacherBatches.map((b) => b._id.toString());
  const invalidBatch = batchIds.find((id) => !allowedIds.includes(id));
  if (invalidBatch) throw new Error("Unauthorized batch selection");

  // 3. Update scheduling fields — blocks/questions stay untouched
  test.batches = batchIds;
  test.startTime = new Date(startTime);
  test.endTime = new Date(endTime);

  await test.save();

  return test;
};

/* ---------------- SYLLABUS ---------------- */
export const getSyllabusByClass = async (teacher, className) => {
  if (!className) throw new Error("className is required");
  const syllabus = await Syllabus.findOne({ instituteId: teacher.instituteId, className });
  return syllabus;
};