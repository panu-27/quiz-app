import mongoose from "mongoose";

const { Schema, model } = mongoose;

const instituteSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
      unique: true, // short code like ABC123
    },

    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User", // SUPER_ADMIN
      required: true,
    },
  },
  { timestamps: true }
);

const Institute = model("Institute", instituteSchema);

export default Institute;