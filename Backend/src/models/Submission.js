const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    attemptNumber: {
      type: Number,
      required: true
    },

    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question"
        },
        selectedOption: Number,
        isCorrect: Boolean,
        topicId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic"
        }
      }
    ],

    score: {
      type: Number,
      default: 0
    },

    timeTaken: {
      type: Number,
      required: true
    },

    violations: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

// Prevent double submission of same attempt
submissionSchema.index(
  { userId: 1, testId: 1, attemptNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("Submission", submissionSchema);
