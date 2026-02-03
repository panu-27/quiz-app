import express from "express";
import auth from "../../middlewares/auth.middleware.js";
import role from "../../middlewares/role.middleware.js";
import * as controller from "./student.controller.js";

const router = express.Router();

router.get("/my-tests", auth, role(["STUDENT"]), controller.getMyTests);

router.post(
  "/attempt/start/:testId",
  auth,
  role(["STUDENT"]),
  controller.startAttempt
);


router.get("/profile", auth, controller.getProfile);

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
  "/test-analysis/:testId/attempt/:attemptNumber", 
  auth, 
  role(["STUDENT"]), 
  controller.getAttemptAnalysis
);


router.get("/my-library", auth, role(["STUDENT"]), controller.getMyLibrary);

export default router;
