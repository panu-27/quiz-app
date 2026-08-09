import express from "express";
import multer from "multer";
import { storage } from "../../config/cloudinary.js";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";
import * as controller from "./student.controller.js";

const router = express.Router();
const upload = multer({ storage: storage });

router.get("/my-tests", auth, role(["STUDENT"]), controller.getMyTests);

router.post(
  "/attempt/start/:testId",
  auth,
  role(["STUDENT"]),
  controller.startAttempt
);


router.get("/profile", auth, controller.getProfile);
router.get("/active-classes", auth, role(["STUDENT"]), controller.getActiveClasses);

router.post("/change-class", auth, role(["STUDENT"]), controller.changeClass);

router.post(
  "/submit/:testId",
  auth,
  role(["STUDENT"]),
  controller.submitTest
);

router.get(
  "/my-history", 
  auth, 
  role(["STUDENT"]), 
  controller.getMyHistory
);

router.get(
  "/all-tests-with-attempts",
  auth,
  role(["STUDENT"]),
  controller.getAllTestsWithAttempts
);

router.get(
  "/test-analysis/:testId/attempt/:attemptNumber", 
  auth, 
  role(["STUDENT"]), 
  controller.getAttemptAnalysis
);

router.post(
  "/updateavatar", 
  auth, 
  role(["STUDENT"]), 
  upload.single("avatar"), 
  controller.updateAvatar
);

router.get("/my-library", auth, role(["STUDENT"]), controller.getMyLibrary);
router.get("/my-syllabus", auth, role(["STUDENT"]), controller.getMySyllabus);

export default router;
