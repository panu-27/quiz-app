import mongoose from "mongoose";

/* ---------------- SECTION CONFIG (WITH QUESTIONS) ---------------- */
const sectionSchema = new mongoose.Schema({
  subjectName:{
    type: String,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  numQuestions: { type: Number, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Med", "Hard"],
    default: "Med",
  },
  topics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  questions: [{
    // ✅ Add this to your schema so it's formally recognized
    questionId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    order: Number,
    questionText: String,
    options: [String],
    correctAnswer: Number,
    subjectId: mongoose.Schema.Types.ObjectId
  }]
}, { _id: false });

/* ---------------- BLOCK CONFIG (WITH TIMER) ---------------- */
const blockSchema = new mongoose.Schema({
  blockName: { type: String, required: true },
  // ✅ NEW: Duration specifically for this block (in minutes)
  duration: { type: Number, required: true },
  sections: [sectionSchema]
}, { _id: false });

/* ---------------- TEST SCHEMA ---------------- */
const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Total duration can now be a sum of block durations 
    // or a global limit for the whole session
    duration: { type: Number, required: true },

    mode: { type: String, enum: ["CUSTOM", "PDF"], required: true },
    examType: {
      type: String,
      enum: ["JEE", "NEET", "PCM" , "PCB" , "OTHER"],
      required: true
    },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: "Institute", required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true }],

    blocks: [blockSchema],

    markingScheme: {
      isNegativeMarking: { type: Boolean, default: false },
      subjectWise: [{
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        correctMarks: { type: Number, default: 1 },
        negativeMarks: { type: Number, default: 0 }
      }],
      defaultCorrect: { type: Number, default: 1 },
      defaultNegative: { type: Number, default: 0 }
    },

    metadata: {
      distribution: { type: String, enum: ["Single Set", "4 Sets"], default: "Single Set" },
    },

    sets: { type: Map, of: [blockSchema], default: undefined },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);