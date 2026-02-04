import mongoose from "mongoose";

/* ---------------- SUBJECT STATS ---------------- */
const subjectStatsSchema = new mongoose.Schema({
  subjectName: String,
  score: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  wrong: { type: Number, default: 0 },
  unattempted: { type: Number, default: 0 }
}, { _id: false });

/* ---------------- TEST ATTEMPT SCHEMA ---------------- */
const testAttemptSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attemptNumber: { type: Number, default: 1 },
    assignedSet: { type: String, enum: ["A", "B", "C", "D"] },

    // ✅ FLATTENED ANSWERS: Cleanest way to calculate scores
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOption: { type: Number, default: -1 }, 
        isCorrect: { type: Boolean, default: false }, 
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        marksObtained: { type: Number, default: 0 } 
      },
    ],

    
    // ✅ BLOCK SNAPSHOT (Optional): 
    // Use this ONLY if you want to store the exact question order 
    // in case the teacher deletes questions later.
    // Otherwise, just use testId.blocks during display.
    // structureSnapshot: [blockSchema], 

    status: {
      type: String,
      enum: ["started", "completed"],
      default: "started"
    },
    
    // --- Overall Metrics ---
    score: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalWrong: { type: Number, default: 0 },
    totalUnattempted: { type: Number, default: 0 },

    // --- Subject-Wise Analytics (For the Dashboard) ---
    subjectWiseScore: {
      type: Map,
      of: subjectStatsSchema,
    },
    
    timeTaken: Number, 
    submittedAt: Date,
  },
  { timestamps: true }
);

testAttemptSchema.index({ testId: 1, studentId: 1, attemptNumber: 1 }, { unique: true });

export default mongoose.model("TestAttempt", testAttemptSchema);