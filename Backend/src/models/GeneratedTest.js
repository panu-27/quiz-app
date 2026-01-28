const mongoose = require("mongoose");

const generatedTestSchema = new mongoose.Schema({
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
  questionIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  }]
}, { timestamps: true });

module.exports = mongoose.model("GeneratedTest", generatedTestSchema);
