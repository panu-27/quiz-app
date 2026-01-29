// UserTest (or TestSession) 
const mongoose = require("mongoose")

const userTestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test" },
  lastAttemptNumber: { type: Number, default: 0 },
  status: { type: String, enum: ['idle', 'in-progress', 'completed'], default: 'idle' }
});

module.exports = mongoose.model("UserTest", userTestSchema);