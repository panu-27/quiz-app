import mongoose from 'mongoose';

const pyqProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PYQ', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    status: { type: String, enum: ['correct', 'incorrect', 'unattempted'], default: 'unattempted' },
    isBookmarked: { type: Boolean, default: false },
    attemptsCount: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }
}, { timestamps: true });

// Compound indexes for extremely fast lookup
pyqProgressSchema.index({ studentId: 1, questionId: 1 }, { unique: true });
pyqProgressSchema.index({ studentId: 1, chapterId: 1 });
pyqProgressSchema.index({ studentId: 1, isBookmarked: 1 });

export const PYQProgress = mongoose.model('PYQProgress', pyqProgressSchema);
