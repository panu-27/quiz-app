import express from "express";
import auth from "../../middlewares/auth.middleware.js";
import { 
  getTestLeaderboard, 
  getWeeklyLeaderboard, 
  getTopRank, 
  generateWeeklyStats,
  getMyStats 
} from "./leaderboard.controller.js";

const router = express.Router();

// 1. Logged-in user's personal ranks (For Profile Page)
router.get("/my-stats", auth, getMyStats);

// 2. Dashboard Top Student
router.get("/stats/top-one", auth, getTopRank);

// 3. Full Weekly Leaderboard Page
router.get("/stats/all", auth, getWeeklyLeaderboard);

// 4. Individual Test Leaderboard
router.get("/:testId", auth, getTestLeaderboard);

// 5. Cron Trigger
router.post("/internal/update-rankings", generateWeeklyStats);

export default router;