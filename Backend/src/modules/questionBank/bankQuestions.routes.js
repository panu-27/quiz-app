import express from 'express';
const router = express.Router();

// You MUST include .js extensions for local files in ES Modules
import Subject from './Subject.js';
import Chapter from './Chapter.js';
import Topic from './Topic.js';
import BankQuestion from './BankQuestion.js';

// --- BULK CREATE ROUTES ---
// --- TEACHER UI HIERARCHY ---
// Returns: [{ name: "Physics", chapters: [{ name: "Thermodynamics", topics: [{ name: "Laws of Thermo" }] }] }]
router.get('/config-tree', async (req, res) => {
  try {
    const tree = await Subject.aggregate([
      {
        $lookup: {
          from: 'chapters', // collection name in MongoDB
          localField: '_id',
          foreignField: 'subjectId',
          as: 'chapters',
        },
      },
      { $unwind: { path: '$chapters', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'topics', // collection name in MongoDB
          localField: 'chapters._id',
          foreignField: 'chapterId',
          as: 'chapters.topics',
        },
      },
      {
        $group: {
          _id: '$_id',
          subjectName: { $first: '$name' },
          chapters: { 
            $push: {
              chapterId: '$chapters._id',
              chapterName: '$chapters.name',
              weightage: '$chapters.weightage',
              topics: '$chapters.topics'
            } 
          },
        },
      },
      { $sort: { subjectName: 1 } }
    ]);

    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Bulk Create Subjects
router.post('/bulk/subjects', async (req, res) => {
  try {
    const data = await Subject.insertMany(req.body);
    res.status(201).json({ message: "Subjects created", count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Bulk Create Chapters
router.post('/bulk/chapters', async (req, res) => {
  try {
    const data = await Chapter.insertMany(req.body);
    res.status(201).json({ message: "Chapters created", count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Bulk Create Topics
router.post('/bulk/topics', async (req, res) => {
  try {
    const data = await Topic.insertMany(req.body);
    res.status(201).json({ message: "Topics created", count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Bulk Create Bank Questions
router.post('/bulk/questions', async (req, res) => {
  try {
    const data = await BankQuestion.insertMany(req.body);
    res.status(201).json({ message: "Questions created", count: data.length, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- FETCH ROUTES ---

router.get('/all-data', async (req, res) => {
  try {
    const subjects = await Subject.find();
    const chapters = await Chapter.find().populate('subjectId');
    res.json({ subjects, chapters });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;