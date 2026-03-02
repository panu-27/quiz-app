import express from "express";
const router = express.Router();
import authMiddleware from "../../middlewares/auth.middleware.js";
// Local import with .js extension
import * as authController from "./auth.controller.js";

router.post("/register-student", authController.registerStudent);
router.post("/login", authController.login);
router.put(
  "/update-password",
  authMiddleware,
  authController.updatePassword
);
export default router;