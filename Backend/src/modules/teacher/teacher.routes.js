import express from "express";
const router = express.Router();

import * as controller from "./teacher.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";
import { uploadPDF } from "../../middlewares/upload.middleware.js";

/* ── Batches ── */
router.get("/my-batches",          auth, role(["TEACHER"]), controller.getMyBatches);
router.get("/my-batches2",          auth, role(["TEACHER"]), controller.getMyBatches2);
router.get("/syllabus/:className",  auth, role(["TEACHER"]), controller.getSyllabusByClass);

/* ── Tests ── */
router.post("/create-test",        auth, role(["TEACHER"]), controller.createTest);
router.post("/craft-test",         auth, role(["TEACHER"]), controller.craftTest);
router.post("/create-custom-test", auth, role(["TEACHER"]), controller.createCustomTest);
router.post("/tests/:id/generate", auth, role(["TEACHER"]), controller.generateCustomTest);
router.get("/my-tests",            auth, role(["TEACHER"]), controller.getMyTests);
router.get("/get-crafted",         auth, role(["TEACHER"]), controller.getCraftedTests);
router.get("/tests/:testId/analytics", auth, role(["TEACHER"]), controller.getTestAnalytics);
router.post("/schedule",           auth, role(["TEACHER"]), controller.scheduleTest);

/* ── Performance ── */
router.get("/performance-overview", auth, role(["TEACHER"]), controller.getPerformanceOverview);

/* ── Study Material ── */
router.post("/upload-material",    auth, role(["TEACHER"]), uploadPDF.single("file"), controller.deployMaterialCtrl);
router.get("/study-materials",     auth, role(["TEACHER"]), controller.getStudyMaterials);
router.get("/study-material/:id",  auth, role(["TEACHER"]), controller.getStudyMaterialById);
router.put("/study-material/:id/toggle-free", auth, role(["TEACHER"]), controller.toggleResourceFreeStatusCtrl);
router.delete("/study-material/:id", auth, role(["TEACHER"]), controller.deleteStudyMaterial);

export default router;