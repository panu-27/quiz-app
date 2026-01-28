const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  examType: {
    type: String,
    default: "CET"
  }
}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);
