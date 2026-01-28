const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    required: true
  },
  name: {
    type: String,
    required: true
  },
}, { timestamps: true });

module.exports = mongoose.model("Topic", topicSchema);
