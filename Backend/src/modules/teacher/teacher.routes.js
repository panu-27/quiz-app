import express from "express";
const router = express.Router();

// Local imports
import * as controller from "./teacher.controller.js";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";
import { uploadPDF } from "../../middlewares/upload.middleware.js";

/* ---------------- GET TEACHER BATCHES ---------------- */
router.get(
  "/my-batches",
  auth,
  role(["TEACHER"]),
  controller.getMyBatches
);

/* ---------------- PDF TEST (EXISTING, UNCHANGED) ---------------- */
router.post(
  "/create-test",
  auth,
  role(["TEACHER"]),
  controller.createTest
);

/* ---------------- CUSTOM TEST (NEW) ---------------- */
router.post(
  "/create-custom-test",
  auth,
  role(["TEACHER"]),
  controller.createCustomTest
);

/* ---------------- GENERATE CUSTOM TEST ---------------- */
router.post(
  "/tests/:id/generate",
  auth,
  role(["TEACHER"]),
  controller.generateCustomTest
);

router.get(
  "/my-batches",
  auth,
  role(["TEACHER"]),
  controller.getMyBatches
);

router.post(
  "/upload-material",
  auth,
  role(["TEACHER"]),
  uploadPDF.single("file"), 
  controller.deployMaterial
);

/* ---------------- GET ALL CREATED TESTS ---------------- */
router.get(
  "/my-tests",
  auth,
  role(["TEACHER"]),
  controller.getMyTests
);

/* ---------------- GET TEST ANALYTICS & LEADERBOARD ---------------- */
router.get(
  "/tests/:testId/analytics",
  auth,
  role(["TEACHER"]),
  controller.getTestAnalytics
);


export default router;
