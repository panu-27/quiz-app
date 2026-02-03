import mongoose from "mongoose";

const leaderboardSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    timeTaken: {
      type: Number, // Stored in seconds
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    }
  },
  { timestamps: true }
);

// CRITICAL: This index prevents multiple entries for the same student on one test
leaderboardSchema.index({ testId: 1, studentId: 1 }, { unique: true });

export default mongoose.model("Leaderboard", leaderboardSchema);