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

    profilePic: {
      type: String,
      default: null
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

    stats: {
      instRank: { type: String, default: "N/A" },
      classRank: { type: String, default: "N/A" },
      stateRank: { type: String, default: "N/A" },
      percentile: { type: String, default: "0.00" },
      accuracy: { type: Number, default: 0 },
      progress: { type: Number, default: 0 }
    }
  },
  { timestamps: true }
);

const User = model("User", userSchema);

export default User;