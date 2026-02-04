import mongoose from 'mongoose';

const BankQuestionSchema = new mongoose.Schema({
  topicId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Topic', 
    required: true 
  },
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  answer: { type: String, required: true },
  explanation: { type: String },
  difficulty: { 
    type: String, 
    enum: ['easy', 'medium' , 'hard'], 
    default: 'medium' 
  }
}, { timestamps: true });

export default mongoose.model('BankQuestion', BankQuestionSchema);