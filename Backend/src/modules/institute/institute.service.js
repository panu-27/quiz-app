import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import Batch from "../batch/batch.model.js";
import Syllabus from "./syllabus.model.js";

// --- TEACHERS ---
export const createTeacher = async (admin, { name, email, password }) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email already registered");
  const hashed = await bcrypt.hash(password, 10);
  return User.create({
    name, email,
    password: hashed,
    role: "TEACHER",
    instituteId: admin.instituteId,
    approved: true
  });
};

export const getTeachers = (admin) =>
  User.find({ instituteId: admin.instituteId, role: "TEACHER" }).select("-password");

export const deleteTeacher = async (admin, teacherId) => {
  const teacher = await User.findOneAndDelete({ _id: teacherId, instituteId: admin.instituteId });
  // Remove this specific teacher from ALL batches they were part of
  if (teacher) await Batch.updateMany({}, { $pull: { teachers: teacherId } });
  return teacher;
};

// --- BATCHES ---
export const createBatch = (admin, { name, className }) =>
  Batch.create({ name, className, instituteId: admin.instituteId });

export const getBatches = async (admin) => {
  // Find all distinct classes in use by this institute (from Syllabus and existing batches)
  const syllabuses = await Syllabus.find({ instituteId: admin.instituteId }).select("className").lean();
  const existingBatches = await Batch.find({ instituteId: admin.instituteId }).select("className").lean();
  
  const activeClasses = [...new Set([
    ...syllabuses.map(s => s.className),
    ...existingBatches.map(b => b.className).filter(Boolean)
  ])];

  // If no classes exist yet, fallback to at least MHT_CET
  if (activeClasses.length === 0) activeClasses.push("MHT_CET");

  const teachers = await User.find({ 
    instituteId: admin.instituteId, 
    role: { $in: ["TEACHER", "INSTITUTE_ADMIN", "ADMIN"] } 
  }).select("_id");

  const teacherIds = teachers.map(t => t._id);

  // Ensure FREE batch exists for each active class
  for (const className of activeClasses) {
    let freeBatch = await Batch.findOne({ instituteId: admin.instituteId, className, name: "FREE" });
    if (!freeBatch) {
      await Batch.create({
        name: "FREE",
        className,
        instituteId: admin.instituteId,
        teachers: teacherIds
      });
    }
  }

  return Batch.find({ instituteId: admin.instituteId })
    .populate("teachers", "name email") // Populating the array
    .sort("-createdAt");
};

export const deleteBatch = async (admin, batchId) => {
  const batch = await Batch.findOneAndDelete({ _id: batchId, instituteId: admin.instituteId });
  if (batch) await User.updateMany({ batchId }, { $unset: { batchId: "" } });
  return batch;
};

// --- STUDENT APPROVAL ---
export const getPendingRequests = (admin) =>
  User.find({ instituteId: admin.instituteId, role: "STUDENT", approved: false }).select("-password");

export const approveAndAssign = async (admin, { studentId, batchId }) => {
  const updateData = { approved: true };
  if (batchId) updateData.batchId = batchId;

  const student = await User.findOneAndUpdate(
    { _id: studentId, instituteId: admin.instituteId },
    updateData,
    { new: true }
  );
  if (!student) throw new Error("Student not found");

  if (batchId) {
    await Batch.updateOne({ _id: batchId }, { $addToSet: { students: studentId } });
  }
  return student;
};

// --- MULTI-TEACHER LOGIC (MANY-TO-MANY) ---
export const assignTeacherToBatch = async (admin, { batchId, teacherId }) => {
  return Batch.findOneAndUpdate(
    { _id: batchId, instituteId: admin.instituteId },
    { $addToSet: { teachers: teacherId } }, // Adds teacher to the list
    { new: true }
  );
};

export const removeTeacherFromBatch = async (admin, { batchId, teacherId }) => {
  return Batch.findOneAndUpdate(
    { _id: batchId, instituteId: admin.instituteId },
    { $pull: { teachers: teacherId } }, // Removes specific teacher from list
    { new: true }
  );
};

export const allocateSubjectsToBatch = async (admin, { batchId, allocatedSubjects }) => {
  return Batch.findOneAndUpdate(
    { _id: batchId, instituteId: admin.instituteId },
    { $set: { allocatedSubjects } },
    { new: true }
  );
};

export const getBatchStudents = (admin, batchId) =>
  User.find({ batchId, instituteId: admin.instituteId }).select("-password");

export const rejectAndDelete = async (admin, { studentId }) => {
  if (!studentId) throw new Error("studentId is required");

  const student = await User.findOneAndDelete({
    _id: studentId,
    instituteId: admin.instituteId,
    role: "STUDENT",
    approved: false, 
  });

  if (!student) throw new Error("Pending student not found or already approved");

  return { message: "Student rejected and removed", studentId };
};

export const removeStudentFromBatch = async (admin, { batchId, studentId }) => {

  // 1️⃣ Remove batchId and set approved to false
  await User.updateOne(
    { _id: studentId, instituteId: admin.instituteId },
    {
      $unset: { batchId: "" },
      $set: { approved: false }
    }
  );

  // 2️⃣ Remove student from batch array
  return Batch.updateOne(
    { _id: batchId },
    { $pull: { students: studentId } }
  );
};

// --- SYLLABUS ---
export const getSyllabuses = (admin) =>
  Syllabus.find({ instituteId: admin.instituteId });

export const upsertSyllabus = async (admin, { className, subjects }) => {
  if (!className) throw new Error("className is required");
  return Syllabus.findOneAndUpdate(
    { instituteId: admin.instituteId, className },
    { subjects },
    { new: true, upsert: true }
  );
};