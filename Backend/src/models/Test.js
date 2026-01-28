const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  subjectIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject"
  }],

  chapterIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }],

  topicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic"
  }],

  totalQuestions: {
    type: Number,
    required: true
  },

  duration: {
    type: Number, // minutes
    required: true
  },

  compulsoryQuestionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }],

  useCetWeightage: {
    type: Boolean,
    default: true
  },

  difficultyDistribution: {
    easy: Number,
    medium: Number,
    hard: Number
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { timestamps: true });

module.exports = mongoose.model("Test", testSchema);
