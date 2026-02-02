import mongoose from "mongoose";

/* ---------------- QUESTION (PDF + CUSTOM) ---------------- */
const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
  },

  options: {
    type: [String],
    required: true,
  },

  correctAnswer: {
    type: Number,
    required: true,
  },
});

/* ---------------- CUSTOM CONFIG ---------------- */
const configSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },

    questions: {
      type: Number,
      required: true,
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Med", "Hard"],
      default: "Med",
    },

    chapters: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

/* ---------------- TEST ---------------- */
const testSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration:{
      type:Number ,
      required:true,
    },
    mode: {
      type: String,
      enum: ["CUSTOM", "PDF"],
      required: true,
    },

    instituteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institute",
      required: true,
    },

    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    batches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
    ],

    /* ✅ USED BY PDF EXAMS & CUSTOM SINGLE SET */
    questions: {
      type: [questionSchema],
      default: [],
    },

    /* ✅ USED BY CUSTOM CONFIG */
    configuration: {
      type: [configSchema],
      default: [],
    },

    /* ✅ NEW: custom exam metadata */
    metadata: {
      pattern: String,
      distribution: {
        type: String,
        enum: ["Single Set", "4 Sets"],
        default: "Single Set",
      },
    },

    /* ✅ NEW: used ONLY when distribution = 4 Sets */
    sets: {
      type: Map,
      of: [questionSchema],
      default: undefined,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Test = mongoose.model("Test", testSchema);
export default Test;
