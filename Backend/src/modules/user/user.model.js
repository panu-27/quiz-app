import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "SUPER_ADMIN",
        "INSTITUTE_ADMIN",
        "ADMIN",
        "TEACHER",
        "STUDENT",
      ],
      required: true,
    },

    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      default: null,
    },

    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      default: null, // only for students
    },

    approved: {
      type: Boolean,
      default: false, // students need approval
    },
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;