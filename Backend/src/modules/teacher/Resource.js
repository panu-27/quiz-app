import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ["Notes", "PYQs", "Formulas"], 
    required: true 
  },
  subject: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileSize: { type: String },
  // New: Link this resource to specific batches
  batchIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Batch",
    required: true 
  }],
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, { timestamps: true });

export default mongoose.model("Resource", resourceSchema);