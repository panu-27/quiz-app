import express from "express";
import cors from "cors";
import path from "path"
// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import superRoutes from "./modules/super/super.routes.js";
import instituteRoutes from "./modules/institute/institute.routes.js";
import teacherRoutes from "./modules/teacher/teacher.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import pdfRoutes from "./modules/pdf/pdf.routes.js";
import bankQuestionRoutes from "./modules/questionBank/bankQuestions.routes.js";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.route.js";
import bcrypt from "bcryptjs";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/super", superRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/leaderboard" , leaderboardRoutes);
app.use("/api/pdf", pdfRoutes);
app.use("/api/bankQuestion" , bankQuestionRoutes )
const password = "password123";
const hashedPassword = await bcrypt.hash(password, 10);
console.log("Hashed Password:", hashedPassword); // Log the hashed password for debugging

// Global error handler (always last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
