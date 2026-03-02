import mongoose from "mongoose";

const weeklyLeaderboardSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  totalScore: { type: Number, default: 0 },
  averageTime: { type: Number, default: 0 },
  testsAttempted: { type: Number, default: 0 },
  rank: { type: Number },
  weekEnding: { type: Date, required: true },
}, { timestamps: true });

// Indexing for high-speed sorting on the Leaderboard page
weeklyLeaderboardSchema.index({ rank: 1 });

const WeeklyLeaderboard = mongoose.model("WeeklyLeaderboard", weeklyLeaderboardSchema);
export default WeeklyLeaderboard;