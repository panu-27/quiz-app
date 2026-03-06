import express from "express";
import cors from "cors";
import path from "path";

import authRoutes from "./modules/auth/auth.routes.js";
import superRoutes from "./modules/super/super.routes.js";
import instituteRoutes from "./modules/institute/institute.routes.js";
import teacherRoutes from "./modules/teacher/teacher.routes.js";
import studentRoutes from "./modules/student/student.routes.js";
import pdfRoutes from "./modules/pdf/pdf.routes.js";
import bankQuestionRoutes from "./modules/questionBank/bankQuestions.routes.js";
import leaderboardRoutes from "./modules/leaderboard/leaderboard.route.js";

const app = express();

const ALLOWED_ORIGINS = [
  "http://localhost:5174",   // Vite dev server
  "http://localhost:4173",   // Vite preview
  "http://localhost:3000",   // fallback dev
  "http://localhost:5000",   // ← Electron interceptor sets Origin to this (the backend URL itself)
  "https://nexus-brave.vercel.app",  // ← add this line
  "https://quiz-app-oabs.onrender.com", // Electron interceptor spoofs this origin
  "https://api.pranavzinjad.in", // added our main deployed backend URL to allowed origins

  // Production: add your deployed frontend URL here
  // "https://your-frontend.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // No origin = Electron file:// or same-origin request → allow
    if (!origin || origin === "null") return callback(null, true);
    // Known origins → allow
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // Everything else → block
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get("/", (req, res) => res.send("API running 🚀"));

app.use("/api/auth",         authRoutes);
app.use("/api/super",        superRoutes);
app.use("/api/institute",    instituteRoutes);
app.use("/api/teacher",      teacherRoutes);
app.use("/api/student",      studentRoutes);
app.use("/api/leaderboard",  leaderboardRoutes);
app.use("/api/pdf",          pdfRoutes);
app.use("/api/bankQuestion", bankQuestionRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

export default app;