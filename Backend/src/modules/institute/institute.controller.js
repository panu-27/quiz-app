import * as service from "./institute.service.js";

const execute = async (req, res, action, ...args) => {
  try {
    const data = await action(req.user, ...args);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTeachers = (req, res) => execute(req, res, service.getTeachers);
export const getBatches = (req, res) => execute(req, res, service.getBatches);
export const getPendingRequests = (req, res) => execute(req, res, service.getPendingRequests);
export const getBatchStudents = (req, res) => execute(req, res, service.getBatchStudents, req.params.batchId);

export const createTeacher = (req, res) => execute(req, res, service.createTeacher, req.body);
export const createBatch = (req, res) => execute(req, res, service.createBatch, req.body);
export const deleteBatch = (req, res) => execute(req, res, service.deleteBatch, req.params.id);
export const deleteTeacher = (req, res) => execute(req, res, service.deleteTeacher, req.params.id);

export const approveAndAssign = (req, res) => execute(req, res, service.approveAndAssign, req.body);
export const approveMultipleStudents = (req, res) => execute(req, res, service.approveMultipleStudents, req.body);
export const assignTeacherToBatch = (req, res) => execute(req, res, service.assignTeacherToBatch, req.body);
export const removeStudentFromBatch = (req, res) => execute(req, res, service.removeStudentFromBatch, req.body);
export const removeTeacherFromBatch = (req, res) => execute(req, res, service.removeTeacherFromBatch, req.body);