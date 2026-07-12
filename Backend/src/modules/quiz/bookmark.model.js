import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PYQ', // Assuming PYQ is the main model, though it could also be Question
    required: true
  }
}, { timestamps: true });

bookmarkSchema.index({ studentId: 1, questionId: 1 }, { unique: true });

export default mongoose.model('Bookmark', bookmarkSchema);
