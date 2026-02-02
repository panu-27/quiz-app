import express from "express";
import * as controller from "./institute.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";

const router = express.Router();

// --- GET ROUTES ---
router.get("/teachers", auth, role(["INSTITUTE_ADMIN"]), controller.getTeachers);
router.get("/batches", auth, role(["INSTITUTE_ADMIN"]), controller.getBatches);
router.get("/pending-requests", auth, role(["INSTITUTE_ADMIN"]), controller.getPendingRequests);
router.get("/batch/:batchId/students", auth, role(["INSTITUTE_ADMIN"]), controller.getBatchStudents);

// --- POST ROUTES ---
router.post("/create-teacher", auth, role(["INSTITUTE_ADMIN"]), controller.createTeacher);
router.post("/create-batch", auth, role(["INSTITUTE_ADMIN"]), controller.createBatch);
router.post("/approve-assign", auth, role(["INSTITUTE_ADMIN"]), controller.approveAndAssign); 
router.post("/approve-bulk", auth, role(["INSTITUTE_ADMIN"]), controller.approveMultipleStudents);
router.post("/assign-teacher", auth, role(["INSTITUTE_ADMIN"]), controller.assignTeacherToBatch);

// --- REMOVAL & DELETE ROUTES ---
router.post("/remove-student-batch", auth, role(["INSTITUTE_ADMIN"]), controller.removeStudentFromBatch);
router.post("/remove-teacher-batch", auth, role(["INSTITUTE_ADMIN"]), controller.removeTeacherFromBatch);
router.delete("/batch/:id", auth, role(["INSTITUTE_ADMIN"]), controller.deleteBatch);
router.delete("/teacher/:id", auth, role(["INSTITUTE_ADMIN"]), controller.deleteTeacher);

export default router;