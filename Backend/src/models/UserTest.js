const mongoose = require("mongoose");

const userTestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true
    },

    lastAttemptNumber: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["idle", "in-progress", "completed"],
      default: "idle"
    }
  },
  { timestamps: true }
);

// One row per user per test
userTestSchema.index({ userId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model("UserTest", userTestSchema);
