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

    score: Number,
    timeTaken: Number,
  },
  { timestamps: true }
);

export default mongoose.model("TestAttempt", testAttemptSchema);
