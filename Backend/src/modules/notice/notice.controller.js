import asyncHandler from "express-async-handler";
import Notice from "./notice.model.js";
import { getIo } from "../../socket.js";

// @desc    Create a new notice
// @route   POST /api/notices
// @access  Private (Teacher/Admin)
export const createNotice = asyncHandler(async (req, res) => {
  const { title, content, batchId } = req.body;
  const teacherId = req.user.id;

  if (!title || !content || !batchId) {
    return res.status(400).json({ success: false, message: "Please provide title, content, and batchId" });
  }

  const attachmentUrl = req.files && req.files['attachment'] ? req.files['attachment'][0].path : null;
  const imageUrl = req.files && req.files['image'] ? req.files['image'][0].path : null;

  const notice = await Notice.create({
    title,
    content,
    teacherId,
    batchId,
    attachmentUrl,
    imageUrl,
  });

  // Emit to socket room for this batch
  const io = getIo();
  if (io) {
    io.to(`batch_${batchId}`).emit("new_notice", notice);
  }

  res.status(201).json({ success: true, data: notice });
});

// @desc    Get notices for a student's batch or a teacher's sent notices
// @route   GET /api/notices
// @access  Private
export const getNotices = asyncHandler(async (req, res) => {
  const { role, id, batchId } = req.user;
  let filter = {};

  if (role === "STUDENT") {
    if (!batchId) {
       return res.status(200).json({ success: true, data: [] });
    }
    filter = { batchId };
  } else if (role === "TEACHER" || role === "ADMIN") {
    // If batchId is passed in query, filter by it. Otherwise, show all created by this teacher
    if (req.query.batchId) {
      filter = { batchId: req.query.batchId, teacherId: id };
    } else {
      filter = { teacherId: id };
    }
  }

  const notices = await Notice.find(filter).sort({ createdAt: -1 }).populate('teacherId', 'name profilePic').lean();
  res.status(200).json({ success: true, data: notices });
});

// @desc    Delete a notice
// @route   DELETE /api/notices/:id
// @access  Private (Teacher)
export const deleteNotice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const notice = await Notice.findById(id);

  if (!notice) {
    return res.status(404).json({ success: false, message: "Notice not found" });
  }

  // Check authorization
  if (req.user.role !== 'ADMIN' && req.user.id !== notice.teacherId.toString()) {
    return res.status(403).json({ success: false, message: "Not authorized to delete this notice" });
  }

  const batchId = notice.batchId;
  await notice.deleteOne();

  // Emit delete event
  const io = getIo();
  if (io) {
    io.to(`batch_${batchId}`).emit("delete_notice", id);
  }

  res.status(200).json({ success: true, message: "Notice deleted successfully" });
});
