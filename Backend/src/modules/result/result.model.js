import mongoose from "mongoose";

const { Schema, model } = mongoose;

const resultSchema = new Schema(
  {
    testId: {
      type: Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },

    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    answers: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        selectedOption: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const Result = model("Result", resultSchema);

export default Result;