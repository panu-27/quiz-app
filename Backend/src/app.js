import express from "express";
import cors from "cors";

// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import superRoutes from "./modules/super/super.routes.js";
import instituteRoutes from "./modules/institute/institute.routes.js";
import teacherRoutes from "./modules/teacher/teacher.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import pdfRoutes from "./modules/pdf/pdf.routes.js";


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import bcrypt from "bcryptjs";
bcrypt.hash("password123", 10).then(console.log);

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
app.use("/api/pdf", pdfRoutes);

// Global error handler (always last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
  });
});

export default app;
