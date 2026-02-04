import Batch from "../batch/batch.model.js";
import Test from "../test/test.model.js";
import fs from "fs";
import path from "path";
import Resource from "./Resource.js";
import Topic from "../questionBank/Topic.js";
import BankQuestion from "../questionBank/BankQuestion.js";

/* ---------------- GET TEACHER BATCHES ---------------- */

/* ---------------- CREATE PDF TEST (UNCHANGED) ---------------- */
/* ---------------- CREATE PDF TEST ---------------- */
export const createTest = async (
  teacher,
  { title, batchIds, examType, blocks, markingScheme, metadata, duration, startTime, endTime }
) => {
  // 1. Basic Validations
  if (!batchIds?.length) throw new Error("At least one batch must be selected");
  if (!examType) throw new Error("Exam type pattern (JEE/NEET/MHT-CET) is required");
  if (!blocks?.length) throw new Error("Blocks with questions are required for PDF tests");

  // 2. SECURITY CHECK
  const teacherBatches = await Batch.find({ teachers: teacher.id || teacher._id }).select("_id");
  const allowedBatchIds = teacherBatches.map((b) => b._id.toString());
  const invalidBatch = batchIds.find((id) => !allowedBatchIds.includes(id));

  if (invalidBatch) throw new Error("Operational Error: Unauthorized batch selection");

  // 3. Create the Record
  return Test.create({
    title,
    mode: "PDF",
    examType,
    markingScheme,
    instituteId: teacher.instituteId,
    teacherId: teacher.id || teacher._id,
    batches: batchIds,
    blocks, // Payload already contains sections with their respective questions
    metadata,
    duration, // Global test duration
    startTime,
    endTime,
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
  const test = await Test.findOne({ _id: testId, teacherId: teacher.id || teacher._id });
  if (!test) throw new Error("Test not found or unauthorized");
  if (test.mode === "PDF") return test;

  // Define how many questions of each type we WANT based on selection
  const distributionRatios = {
    "Easy": { easy: 0.70, medium: 0.20, hard: 0.10 },
    "Med":  { easy: 0.20, medium: 0.60, hard: 0.20 },
    "Hard": { easy: 0.10, medium: 0.20, hard: 0.70 }
  };

  for (let i = 0; i < test.blocks.length; i++) {
    for (let j = 0; j < test.blocks[i].sections.length; j++) {
      const section = test.blocks[i].sections[j];
      const TARGET_COUNT = section.numQuestions;
      const selectedRatio = distributionRatios[section.difficulty] || distributionRatios["Med"];

      // 1. Fetch all matching questions from selected topics
      const allQs = await BankQuestion.find({ topicId: { $in: section.topics } }).lean();
      
      if (allQs.length < TARGET_COUNT) {
        console.warn(`Insufficient questions in DB for ${section.subjectName}. Have ${allQs.length}, need ${TARGET_COUNT}`);
      }

      // 2. Separate them into difficulty buckets
      const buckets = {
        easy: shuffle(allQs.filter(q => q.difficulty === 'easy')),
        medium: shuffle(allQs.filter(q => q.difficulty === 'medium')),
        hard: shuffle(allQs.filter(q => q.difficulty === 'hard'))
      };

      let finalSelection = [];

      // 3. Try to fill based on ratio
      const targetEasy = Math.floor(TARGET_COUNT * selectedRatio.easy);
      const targetMed = Math.floor(TARGET_COUNT * selectedRatio.medium);
      const targetHard = Math.floor(TARGET_COUNT * selectedRatio.hard);

      finalSelection.push(...buckets.easy.splice(0, targetEasy));
      finalSelection.push(...buckets.medium.splice(0, targetMed));
      finalSelection.push(...buckets.hard.splice(0, targetHard));

      // 4. FILL THE GAP (The "Safety Valve")
      // If we are short (due to rounding or lack of specific difficulty), 
      // grab remaining questions from the combined leftover pool
      if (finalSelection.length < TARGET_COUNT) {
        const remainingPool = shuffle([...buckets.easy, ...buckets.medium, ...buckets.hard]);
        const gap = TARGET_COUNT - finalSelection.length;
        finalSelection.push(...remainingPool.splice(0, gap));
      }

      // 5. Map to Schema and Shuffle the final list so Easy/Hard are mixed
      test.blocks[i].sections[j].questions = shuffle(finalSelection).map((q, index) => ({
        questionId: q._id,
        order: index + 1,
        questionText: q.text,
        options: q.options,
        correctAnswer: q.options.indexOf(q.answer),
        subjectId: section.subject 
      }));
    }
  }

  test.markModified('blocks');
  await test.save();
  return test;
};
/* ---------------- HELPERS ---------------- */
// const mockGenerateQuestions = (configuration) => {
//   let questions = [];
//   let index = 1;

//   configuration.forEach((cfg) => {
//     for (let i = 0; i < cfg.questions; i++) {
//       questions.push({
//         questionText: `${cfg.subject} Question ${index}`,
//         options: ["Option A", "Option B", "Option C", "Option D"],
//         correctAnswer: Math.floor(Math.random() * 4),
//       });
//       index++;
//     }
//   });

//   return questions;
// };



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
