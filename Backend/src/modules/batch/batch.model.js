import mongoose from "mongoose";

const { Schema, model } = mongoose;

const batchSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    className: {
      type: String,
      required: true,
      default: "General Class",
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

    allocatedSubjects: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

const Batch = model("Batch", batchSchema);

export default Batch;