import mongoose from "mongoose";
import PYQ from "../questionBank/PYQ.js";
import Chapter from "../questionBank/Chapter.js";
import Topic from "../questionBank/Topic.js";

const toObjId = (id) => new mongoose.Types.ObjectId(id);

/* ─────────────────────────────────────────────
   GET /teacher/pyq/:subjectId/chapters
───────────────────────────────────────────── */
export const getPYQChapters = async (req, res) => {
  try {
    const { subjectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({ message: "Invalid subjectId" });
    }

    const chapters = await Chapter.find({
      subjectId: subjectId
    })
      .select("_id name weightage")
      .sort({ name: 1 })
      .lean();

    res.json(chapters);

  } catch (err) {
    console.error("getPYQChapters error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ─────────────────────────────────────────────
   GET /teacher/pyq/:subjectId/chapters/:chapterId/topics
───────────────────────────────────────────── */
export const getPYQTopics = async (req, res) => {
  try {
    const { subjectId, chapterId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(chapterId)
    ) {
      return res.status(400).json({ message: "Invalid subjectId or chapterId" });
    }

    const topics = await Topic.find({ chapterId })
      .select("_id name")
      .sort({ name: 1 })
      .lean();

    res.json(topics);
  } catch (err) {
    console.error("getPYQTopics error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/* ─────────────────────────────────────────────
   GET /teacher/pyq/:subjectId/chapters/:chapterId/topics/:topicId/questions
───────────────────────────────────────────── */
export const getPYQQuestions = async (req, res) => {
  try {
    const { subjectId, chapterId, topicId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(subjectId) ||
      !mongoose.Types.ObjectId.isValid(chapterId) ||
      !mongoose.Types.ObjectId.isValid(topicId)
    ) {
      return res.status(400).json({ message: "Invalid id param(s)" });
    }

    const filter = {
      subjectId,
      chapterId,
      topicId,
      isDeleted: false
    };

    const { yearFrom, yearTo } = req.query;

    if (yearFrom || yearTo) {
      filter.year = {};
      if (yearFrom) filter.year.$gte = Number(yearFrom);
      if (yearTo) filter.year.$lte = Number(yearTo);
    }

    const questions = await PYQ.find(filter)
      .select(
        "_id year shift question questionImage options correctOption explanation explanationImage difficulty"
      )
      .sort({ year: -1, shift: 1 })
      .lean();

    res.json(questions);

  } catch (err) {
    console.error("getPYQQuestions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};