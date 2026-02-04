import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema({
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true },
  name: { type: String, required: true }
});

export default mongoose.model('Topic', TopicSchema);