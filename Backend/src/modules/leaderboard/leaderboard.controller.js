import mongoose from "mongoose";
import Leaderboard from "../test/leaderboard.model.js";
import WeeklyLeaderboard from "./weeklyLeaderboard.model.js";
import User from "../user/user.model.js";

const LOOKBACK_DAYS = 7;
const TOTAL_STATE_CANDIDATES = 500000;

// ── 1. GET LOGGED-IN USER'S STATS (For Profile Page) ──
export const getMyStats = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id;
    // We fetch the user and specifically pick the stats field
    const user = await User.findById(userId).select("stats");
    
    if (!user) return res.status(404).json({ message: "User not found" });
    
    res.json(user.stats || {});
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// ── 2. CRON JOB TO GENERATE WEEKLY LEADERBOARD ──
export const generateWeeklyStats = async (req, res) => {
  try {
    const cronSecret = req.headers['x-cron-secret'];
    if (process.env.CRON_SECRET && cronSecret !== process.env.CRON_SECRET) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const startTime = new Date();
    startTime.setDate(startTime.getDate() - LOOKBACK_DAYS);

    const stats = await Leaderboard.aggregate([
      { $match: { createdAt: { $gte: startTime } } },
      {
        $group: {
          _id: "$studentId",
          totalScore: { $sum: "$score" },
          avgTime: { $avg: "$timeTaken" },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalScore: -1, avgTime: 1 } }
    ]);

    if (!stats.length) {
      return res.status(200).json({ message: "No data" });
    }

    const totalStudents = stats.length;
    const weeklyDocs = [];

    const bulkOps = stats.map((stat, index) => {

      const rank = index + 1;

      // 🎯 Raw percentile (platform based)
      let percentile = ((totalStudents - rank) / totalStudents) * 100;

      // 🧠 MHT-CET style compression
      // Top scorers get sharper percentile boost
      if (percentile > 95) {
        percentile = 95 + (percentile - 95) * 0.3;
      } else if (percentile > 80) {
        percentile = 80 + (percentile - 80) * 0.6;
      }

      percentile = Math.min(99.99, percentile);

      // 🏆 Predicted State Rank (real exam simulation)
      const predictedStateRank = Math.max(
        1,
        Math.floor((100 - percentile) / 100 * TOTAL_STATE_CANDIDATES)
      );

      // 🏫 Class rank same as inst rank (as you wanted)
      const classRank = rank;

      weeklyDocs.push({
        studentId: stat._id,
        totalScore: stat.totalScore,
        rank,
        weekEnding: new Date()
      });

      return {
        updateOne: {
          filter: { _id: stat._id },
          update: {
            $set: {
              "stats.instRank": classRank.toString(),
              "stats.classRank": classRank.toString(),
              "stats.stateRank": predictedStateRank.toLocaleString(),
              "stats.percentile": percentile.toFixed(2),
              "stats.accuracy": Math.min(100, Math.round((stat.totalScore / (stat.count * 200)) * 100) || 0),
              "stats.progress": Math.min(100, stat.count * 15)
            }
          }
        }
      };
    });

    await User.bulkWrite(bulkOps);
    await WeeklyLeaderboard.deleteMany({});
    await WeeklyLeaderboard.insertMany(weeklyDocs);

    res.status(200).json({ message: "MHT-CET style weekly sync complete" });

  } catch (err) {
    console.error("Sync failed:", err);
    res.status(500).json({ message: "Sync failed" });
  }
};

// ── 3. OTHER GETTERS (Top-one, All, Test-specific) ──
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const loggedUserId = req.user?.id || req.user?._id;
    const rankings = await WeeklyLeaderboard.find().populate("studentId", "name profilePic").sort({ rank: 1 });
    res.json(rankings.map(entry => ({
      rank: entry.rank,
      name: entry.studentId?.name || "Unknown",
      points: entry.totalScore.toString(),
      avatar: entry.studentId?.profilePic || null,
      current: entry.studentId?._id?.toString() === loggedUserId?.toString(),
    })));
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

export const getTopRank = async (req, res) => {
  try {
    const top = await WeeklyLeaderboard.findOne({ rank: 1 }).populate("studentId", "name profilePic");
    res.json(top ? { name: top.studentId.name, avatar: top.studentId.profilePic, points: top.totalScore } : null);
  } catch (err) { res.status(500).json({ message: "Error" }); }
};

export const getTestLeaderboard = async (req, res) => {
  try {
    const { testId } = req.params;
    const loggedUserId = req.user?.id || req.user?._id;
    const leaderboard = await Leaderboard.find({ testId: new mongoose.Types.ObjectId(testId) }).populate("studentId", "name profilePic").sort({ score: -1, timeTaken: 1 });
    res.json(leaderboard.map((entry, index) => ({
      rank: index + 1,
      name: entry.studentId?.name || "Unknown",
      points: entry.score.toString(),
      avatar: entry.studentId?.profilePic || null,
      current: entry.studentId?._id?.toString() === loggedUserId?.toString(),
    })));
  } catch (err) { res.status(500).json({ message: "Error" }); }
};