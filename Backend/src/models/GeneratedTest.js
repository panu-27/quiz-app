const mongoose = require("mongoose");

const generatedTestSchema = new mongoose.Schema(
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

    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
      }
    ],

    sectionTimes: {
      type: Map,
      of: Number
    },

    startedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

generatedTestSchema.index(
  { testId: 1, userId: 1, attemptNumber: 1 },
  { unique: true }
);

module.exports = mongoose.model("GeneratedTest", generatedTestSchema);
