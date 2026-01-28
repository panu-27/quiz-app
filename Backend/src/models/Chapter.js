const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: true
  },
  name: {
    type: String,
    required: true
  },
  cetWeightage: {
    type: Number,
    default: 1   // default CET importance
  },
  order: {
    type: Number
  }
}, { timestamps: true });

module.exports = mongoose.model("Chapter", chapterSchema);
