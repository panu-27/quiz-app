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

  answers: [{
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
  }],

  score: {
    type: Number,
    default: 0
  },

  timeTaken: Number
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
