import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'PYQ', required: true },
    reason: { type: String, required: true }, // "image_blur", "wrong_question", etc.
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'pending' }
}, { timestamps: true });

export default mongoose.model('QuestionReport', reportSchema);