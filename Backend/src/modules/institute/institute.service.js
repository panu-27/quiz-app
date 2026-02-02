import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import Batch from "../batch/batch.model.js";

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
export const createBatch = (admin, { name }) => 
  Batch.create({ name, instituteId: admin.instituteId });

export const getBatches = (admin) => 
  Batch.find({ instituteId: admin.instituteId })
    .populate("teachers", "name email") // Populating the array
    .sort("-createdAt");

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

export const getBatchStudents = (admin, batchId) => 
  User.find({ batchId, instituteId: admin.instituteId }).select("-password");

export const removeStudentFromBatch = async (admin, { batchId, studentId }) => {
  await User.updateOne({ _id: studentId, instituteId: admin.instituteId }, { $unset: { batchId: "" } });
  return Batch.updateOne({ _id: batchId }, { $pull: { students: studentId } });
};