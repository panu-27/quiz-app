// models/Resource.js
import mongoose from "mongoose";

/**
 * Category values match the CATEGORIES[].id in libraryConfig.js on the frontend.
 * Subject/Chapter values match SUBJECTS[].id and CHAPTERS[][].id.
 * This lets the frontend send IDs and the DB filter by them directly.
 */
const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    // ── NEW: use short slug IDs that match the frontend config ──
    subjectId: {
      type: String,
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "notes",      // Notes
        "pyqs",       // PYQ's
        "boards",     // Board Papers
        "formulas",   // Formulas
        "lectures",   // Video Lectures (link/embed)
        "mindmaps",   // Mind Maps
        "revision",   // Revision sheets
        "synopsis",   // Synopsis
        "practice",   // Practice Sheets
      ],
    },
    isFree: { type: Boolean, default: false },

    // ── Keep legacy fields for desktop (they still use subject name + old category) ──
    // Remove these once desktop is also migrated to the new drill-down system.
    subject: { type: String },          // "Physics", "Chemistry", etc.  (legacy)
    legacyCategory: { type: String },   // "Notes", "PYQs", "Formulas"  (legacy)

    fileUrl:  { type: String, required: true },
    fileSize: { type: String },

    // ── Which batches can see this resource ──
    batchIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
      },
    ],

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for the primary query pattern
resourceSchema.index({ batchIds: 1, subjectId: 1, chapterId: 1, category: 1 });

export default mongoose.model("Resource", resourceSchema);