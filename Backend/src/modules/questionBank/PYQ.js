import mongoose from 'mongoose';

const pyqSchema = new mongoose.Schema(
  {
    // ── Hierarchy ──────────────────────────────────────────────────────────
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },

    // ── Source Metadata ────────────────────────────────────────────────────
    year:  { type: Number, required: true },   // e.g. 2024
    shift: { type: String },                   // e.g. 'Jan S1'

    // ── Content ────────────────────────────────────────────────────────────
    question:      { type: String, required: true },
    questionImage: { type: String },           // URL for diagrams

    options: [
      {
        text:  { type: String },
        image: { type: String },               // for image-based options
      },
    ],

    // ── Answer & Explanation ───────────────────────────────────────────────
    correctOption:    { type: Number, required: true }, // 0 | 1 | 2 | 3
    explanation:      { type: String },
    explanationImage: { type: String },

    // ── Analytics Metadata ─────────────────────────────────────────────────
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },

    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index — covers the primary query pattern used in the PYQ UI
pyqSchema.index({ subjectId: 1, chapterId: 1, topicId: 1, year: -1 });

export default mongoose.model('PYQ', pyqSchema);
