import mongoose from "mongoose";

const { Schema, model } = mongoose;

const syllabusSchema = new Schema(
  {
    instituteId: {
      type: Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },
    className: {
      type: String,
      required: true,
    },
    subjects: [
      {
        name: { type: String, required: true },
        color: { type: String, default: "#7c3aed" },
        chapters: [
          {
            name: { type: String, required: true },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Ensure a single syllabus per class per institute
syllabusSchema.index({ instituteId: 1, className: 1 }, { unique: true });

const Syllabus = model("Syllabus", syllabusSchema);

export default Syllabus;
