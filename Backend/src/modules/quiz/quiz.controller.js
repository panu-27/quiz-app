/**
 * ══════════════════════════════════════════════════════════════════════
 * QUIZ CONTROLLER — Final Production Version (Marking Scheme Updated)
 * ──────────────────────────────────────────────────────────────────────
 */

import Subject from '../questionBank/Subject.js';
import Chapter from '../questionBank/Chapter.js';
import Topic from '../questionBank/Topic.js';
import PYQ from '../questionBank/PYQ.js';
import TestAttempt from '../test/quizAttempt.model.js';
import QuestionReport from './report.model.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

/**
 * ══════════════════════════════════════════════════════════════════════
 * METADATA ENDPOINTS
 * ══════════════════════════════════════════════════════════════════════
 */

export const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({});
  const subjectsWithCounts = await Promise.all(
    subjects.map(async (subj) => ({
      _id: subj._id,
      name: subj.name,
      emoji: subj.emoji || '📚',
      chapters: await Chapter.countDocuments({ subjectId: subj._id }),
    }))
  );
  res.json({ success: true, data: subjectsWithCounts });
});

export const getChaptersBySubject = asyncHandler(async (req, res) => {
  const { subjectId } = req.params;
  const chapters = await Chapter.find({ subjectId });
  const chaptersWithTopics = await Promise.all(
    chapters.map(async (chap) => ({
      _id: chap._id,
      name: chap.name,
      weightage: chap.weightage || 0,
      topicCount: await Topic.countDocuments({ chapterId: chap._id }),
      questionCount: await PYQ.countDocuments({ chapterId: chap._id, isDeleted: false }),
    }))
  );
  res.json({ success: true, data: chaptersWithTopics });
});

export const getTopicsByChapter = asyncHandler(async (req, res) => {
  const { chapterId } = req.params;
  const topics = await Topic.find({ chapterId }).select('_id name');
  res.json({ success: true, data: topics });
});

export const getYearRange = asyncHandler(async (req, res) => {
  const years = await PYQ.distinct('year');
  if (!years || years.length === 0) {
    const currentYear = new Date().getFullYear();
    return res.json({
      success: true,
      data: { minYear: currentYear, maxYear: currentYear, yearsAvailable: [currentYear] },
    });
  }
  const sortedYears = years.filter((y) => y && typeof y === 'number').sort((a, b) => a - b);
  res.json({
    success: true,
    data: {
      minYear: Math.min(...sortedYears),
      maxYear: Math.max(...sortedYears),
      yearsAvailable: sortedYears,
    },
  });
});

/**
 * ══════════════════════════════════════════════════════════════════════
 * HELPERS
 * ══════════════════════════════════════════════════════════════════════
 */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatQuestion(q) {
  return {
    questionId: q._id.toString(),
    questionText: q.question,
    questionImage: q.questionImage || null,
    options: (q.options || []).map((opt, idx) => ({
      index: idx,
      text: opt.text || '',
      image: opt.image || null,
    })),
    correctAnswer: q.correctOption ?? 0,
    explanation: q.explanation || '',
    explanationImage: q.explanationImage || null,
    difficulty: q.difficulty || 'Medium',
    year: q.year || null,
    shift: q.shift || null,
  };
}

async function fetchQuestionsForSubject({
  subjectId,
  chapterIds,
  topicIds,
  difficulty,
  yearRange,
  type,
  totalLimit,
}) {
  const subjectChapters = await Chapter.find({
    subjectId,
    _id: { $in: chapterIds },
  }).select('_id');

  const subjectChapterIds = subjectChapters.map((c) => c._id);
  if (subjectChapterIds.length === 0) return [];

  const perChapter = Math.max(1, Math.ceil(totalLimit / subjectChapterIds.length));
  const allQuestions = [];

  for (const chapId of subjectChapterIds) {
    const query = { subjectId, chapterId: chapId };
    if (topicIds && topicIds.length > 0) query.topicId = { $in: topicIds };
    if (difficulty) query.difficulty = difficulty;
    if (type === 'pyq' && yearRange) {
      const min = yearRange.min || yearRange.minYear;
      const max = yearRange.max || yearRange.maxYear;
      if (min && max) query.year = { $gte: parseInt(min), $lte: parseInt(max) };
    }

    const questions = await PYQ.find(query).lean();
    const picked = shuffle(questions).slice(0, perChapter);
    allQuestions.push(...picked);
  }

  return shuffle(allQuestions).slice(0, totalLimit);
}

const fetchAndFillQuestions = async ({ 
  subjectId, 
  chapterIds, 
  topicIds, 
  difficulty, 
  yearRange, 
  type, 
  targetLimit 
}) => {
  const diffMap = {
    'Easy':   { primary: 'Easy',   ratios: { Easy: 0.6, Medium: 0.3, Hard: 0.1 } },
    'Medium': { primary: 'Medium', ratios: { Medium: 0.6, Easy: 0.2, Hard: 0.2 } },
    'Hard':   { primary: 'Hard',   ratios: { Hard: 0.6, Medium: 0.3, Easy: 0.1 } }
  };

  const config = diffMap[difficulty] || diffMap['Medium'];
  let questions = [];

  for (const [level, ratio] of Object.entries(config.ratios)) {
    const levelLimit = Math.round(targetLimit * ratio);
    if (levelLimit === 0) continue;

    const batch = await fetchQuestionsForSubject({
      subjectId,
      chapterIds,
      topicIds,
      difficulty: level,
      yearRange,
      type,
      totalLimit: levelLimit,
    });
    questions.push(...batch);
  }

  // Return strict question list without any filler dummy questions


  return shuffle(questions).slice(0, targetLimit);
};

function assignSubjectsToBlocks(subjectObjects) {
  const block1 = [];
  const block2 = [];
  for (const s of subjectObjects) {
    const name = (s.name || '').toLowerCase();
    if (name.includes('math') || name.includes('biol')) {
      block2.push(s);
    } else {
      block1.push(s);
    }
  }
  if (block1.length === 0 && block2.length > 0) return [block2, []];
  return [block1, block2];
}

/**
 * ══════════════════════════════════════════════════════════════════════
 * MAIN QUIZ LOGIC
 * ══════════════════════════════════════════════════════════════════════
 */

export const fetchQuizQuestions = asyncHandler(async (req, res) => {
  const {
    type = 'practice',
    subjectIds = [],
    chapterIds = [],
    topicIds = [],
    difficulty = 'Medium',
    yearRange = null,
    totalTime = 90,
    subjectWiseCounts = {},
    limit = 10,
  } = req.body;

  if (!subjectIds || subjectIds.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one subject required' });
  }

  const subjectObjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
  if (subjectObjects.length === 0) {
    return res.status(400).json({ success: false, message: 'No valid subjects found' });
  }

  const [block1Subjects, block2Subjects] = assignSubjectsToBlocks(subjectObjects);
  const durationMinutes = parseInt(totalTime) || 90;

  const buildSections = async (subjects) => {
    const sections = [];
    for (const subj of subjects) {
      const subjId = subj._id.toString();
      const targetLimit = subjectWiseCounts[subjId] || limit;

      const rawQuestions = await fetchAndFillQuestions({
        subjectId: subj._id, 
        chapterIds,
        topicIds,
        difficulty,
        yearRange,
        type,
        targetLimit,
      });

      if (rawQuestions.length === 0) continue;

      sections.push({
        subjectId: subjId,
        subjectName: subj.name,
        numQuestions: rawQuestions.length,
        questions: rawQuestions.map(formatQuestion),
      });
    }
    return sections;
  };

  const blocks = [];
  const block1Duration = block2Subjects.length === 0 ? durationMinutes : Math.floor(durationMinutes / 2);
  const block2Duration = durationMinutes - block1Duration;

  const block1Sections = await buildSections(block1Subjects);
  if (block1Sections.length > 0) {
    blocks.push({ blockName: 'Block 1', duration: block1Duration, sections: block1Sections });
  }

  if (block2Subjects.length > 0) {
    const block2Sections = await buildSections(block2Subjects);
    if (block2Sections.length > 0) {
      blocks.push({ blockName: 'Block 2', duration: block2Duration, sections: block2Sections });
    }
  }

  res.json({
    success: true,
    data: {
      title: type === 'pyq' ? 'PYQ Test' : 'Practice Test',
      duration: durationMinutes,
      blocks,
    },
  });
});

export const fetchPYQQuestions = asyncHandler(async (req, res) => {
  req.body = { ...req.body, type: 'pyq' };
  return fetchQuizQuestions(req, res);
});

/**
 * ══════════════════════════════════════════════════════════════════════
 * SUBMISSION & RESULTS — CUSTOM MARKING SCHEME
 * ══════════════════════════════════════════════════════════════════════
 */

export const submitQuizAttempt = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { blocks = [], timeTakenSeconds = 0 } = req.body;

  if (!blocks || blocks.length === 0) {
    return res.status(400).json({ success: false, message: 'No blocks provided' });
  }

  const processedBlocks = blocks.map((block) => {
    const isBlock2 = block.blockName.includes('2');

    const sections = (block.sections || []).map((section) => {
      const questions = section.questions || [];
      const subjectName = (section.subjectName || '').toLowerCase();
      
      let sectionMarks = 0;
      let correct = 0;
      let wrong = 0;
      let unattempted = 0;

      questions.forEach((q) => {
        const isCorrect = q.chosenOption === q.correctAnswer;
        const isUnattempted = q.chosenOption === -1;

        if (isUnattempted) {
          unattempted++;
        } else if (isCorrect) {
          correct++;
          // Apply Logic: Block 1 (+2), Block 2 (Math +2, Bio +1)
          if (!isBlock2) {
            sectionMarks += 2;
          } else {
            if (subjectName.includes('math')) {
              sectionMarks += 2;
            } else if (subjectName.includes('biol')) {
              sectionMarks += 1;
            } else {
              sectionMarks += 2; // Fallback for other subjects in Block 2
            }
          }
        } else {
          wrong++;
          // Wrong is always 0 as per requirement
          sectionMarks += 0;
        }
      });

      const totalAnswered = questions.length - unattempted;
      const accuracy = totalAnswered > 0 ? Math.round((correct / totalAnswered) * 100) : 0;

      return {
        subjectName: section.subjectName,
        subjectId: section.subjectId,
        numQuestions: questions.length,
        questions: questions.map((q) => ({
          questionId: q.questionId,
          questionText: q.questionText,
          questionImage: q.questionImage || null,
          options: q.options || [],
          correctAnswer: q.correctAnswer,
          chosenOption: q.chosenOption,
          explanation: q.explanation,
        })),
        score: sectionMarks, // This is now actual marks earned
        correct,
        wrong,
        unattempted,
        accuracy,
      };
    });

    const blockMarks = sections.reduce((sum, s) => sum + s.score, 0);

    return {
      blockName: block.blockName,
      duration: block.duration || 0,
      sections,
      score: blockMarks, // Sum of marks in block
    };
  });

  const totalMarksEarned = processedBlocks.reduce((sum, b) => sum + b.score, 0);
  const allSections = processedBlocks.flatMap((b) => b.sections);
  const totalCorrect = allSections.reduce((sum, s) => sum + s.correct, 0);
  const totalWrong = allSections.reduce((sum, s) => sum + s.wrong, 0);
  const totalUnattempted = allSections.reduce((sum, s) => sum + s.unattempted, 0);

  const attempt = new TestAttempt({
    studentId,
    blocks: processedBlocks,
    status: 'completed',
    totalScore: totalMarksEarned, // Storing raw marks
    totalCorrect,
    totalWrong,
    totalUnattempted,
    startedAt: new Date(Date.now() - timeTakenSeconds * 1000),
    submittedAt: new Date(),
    timeTaken: timeTakenSeconds,
  });

  await attempt.save();

  res.json({
    success: true,
    data: {
      attemptId: attempt._id,
      status: attempt.status,
      totalScore: totalMarksEarned,
      totalCorrect,
      totalWrong,
      totalUnattempted,
      timeTaken: attempt.timeTaken,
      blocks: processedBlocks,
    },
  });
});

export const listStudentAttempts = asyncHandler(async (req, res) => {
  const studentId = req.user._id;
  const { limit = 10, page = 1, sortBy = 'createdAt' } = req.query;
  const skip = (page - 1) * limit;

  const attempts = await TestAttempt.find({ studentId })
    .select('_id status totalScore totalCorrect totalWrong totalUnattempted timeTaken createdAt blocks')
    .sort({ [sortBy]: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await TestAttempt.countDocuments({ studentId });
  res.json({
    success: true,
    data: attempts,
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) },
  });
});

export const getAttemptDetails = asyncHandler(async (req, res) => {
  const { attemptId } = req.params;
  const studentId = req.user._id;
  const attempt = await TestAttempt.findOne({ _id: attemptId, studentId }).populate(
    'blocks.sections.subjectId',
    'name'
  );
  if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });
  res.json({ success: true, data: attempt });
});


export const reportQuestion = asyncHandler(async (req, res) => {
    const { questionId, reason } = req.body;
    const report = await QuestionReport.create({
        questionId,
        reason,
        studentId: req.user?._id
    });

    console.log("done");
    res.status(201).json({ success: true, message: "Report submitted" });
});


export const getChapterPYQs = async (req, res) => {
    try {
        const { chapterId } = req.params;
        const { difficulty, year } = req.query;

        // 1. Build the query object
        const query = {
            chapterId,
            isDeleted: false // Safety check for soft-deleted questions
        };

        // 2. Add optional filters if provided in URL
        if (difficulty && difficulty !== 'All') {
            query.difficulty = difficulty;
        }

        if (year && year !== 'All') {
            query.year = parseInt(year);
        }

        // 3. Execute query with indexing optimization
        // Sorting by year descending (newest first)
        const pyqs = await PYQ.find(query)
            .sort({ year: -1 })
            .lean(); // .lean() for faster read-only performance

        // 4. Send response
        return res.status(200).json({
            success: true,
            count: pyqs.length,
            data: pyqs
        });

    } catch (error) {
        console.error('Error fetching PYQs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        });
    }
};