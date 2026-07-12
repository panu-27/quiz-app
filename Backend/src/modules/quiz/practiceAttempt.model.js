import mongoose from "mongoose";

const practiceAttemptSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }, // Optional, useful for stats
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  isCorrect: { type: Boolean, required: true },
  timeTaken: { type: Number, default: 0 },
}, { timestamps: true });

export const PracticeAttempt = mongoose.model('PracticeAttempt', practiceAttemptSchema);
