import mongoose from "mongoose";

const testAttemptSchema = new mongoose.Schema(
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

    attemptNumber: {
      type: Number,
      default: 1,
    },

    assignedSet: {
      type: String,
      enum: ["A", "B", "C", "D"],
    },

    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: Number,
      },
    ],
    status: {
    type: String,
    enum: ["started", "completed"],
    default: "started"
  },

    score: Number,
    timeTaken: Number,
  },
  { timestamps: true }
);
testAttemptSchema.index({ testId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });
export default mongoose.model("TestAttempt", testAttemptSchema);
