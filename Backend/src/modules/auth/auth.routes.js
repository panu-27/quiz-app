import express from "express";
const router = express.Router();

// Local import with .js extension
import * as authController from "./auth.controller.js";

router.post("/register-student", authController.registerStudent);
router.post("/login", authController.login);

export default router;