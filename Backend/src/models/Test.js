const mongoose = require("mongoose");

const subjectConfigSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  questions: {
    type: Number,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  difficulty: {
    easy: { type: Number, default: 100 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  }
}, { _id: false });

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  isPyqOnly: {
    type: Boolean,
    default: false
  },

  subjectConfigs: [subjectConfigSchema],

  chapterIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter"
  }],

  topicIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic"
  }],

  // custom questions grouped by subject
  customQuestions: {
    type: Object,
    default: {}
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

}, { timestamps: true });

module.exports = mongoose.model("Test", testSchema);
