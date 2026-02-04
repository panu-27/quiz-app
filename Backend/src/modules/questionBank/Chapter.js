import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  name: { type: String, required: true },
  weightage: { type: Number, default: 0 }
});

export default mongoose.model('Chapter', ChapterSchema);