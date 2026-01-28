const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: {
    type: String
  },
  imageUrl: {
    type: String
  }
}, { _id: false });

const questionSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true
  },
  topicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Topic",
    required: true
  },

  questionText: {
    type: String
  },

  questionImageUrl: {
    type: String
  },

  options: {
    type: [optionSchema],
    required: true
  },

  correctOption: {
    type: Number, // index (0,1,2,3)
    required: true
  },

  explanation: {
    type: String
  },

  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },

  marks: {
    type: Number,
    default: 1
  }
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);
