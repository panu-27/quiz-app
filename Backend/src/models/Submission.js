const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
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
  // ADD THIS: To track which attempt this is for the specific user/test
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  answers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question" },
    selectedOption: Number,
    isCorrect: Boolean,
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" }
  }],
  score: { type: Number, default: 0 },
  timeTaken: Number // stored in seconds or milliseconds
}, { timestamps: true });

// Optional: Ensure a user can't have the same attempt number twice for the same test
submissionSchema.index({ userId: 1, testId: 1, attemptNumber: 1 }, { unique: true });
// Replace module.exports = mongoose.model("Submission", submissionSchema);
module.exports = mongoose.model("Submission", submissionSchema);