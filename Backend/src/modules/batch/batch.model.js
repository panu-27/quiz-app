import mongoose from "mongoose";

const { Schema, model } = mongoose;

const batchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    teachers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    students: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Batch = model("Batch", batchSchema);

export default Batch;