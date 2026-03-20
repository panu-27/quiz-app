/**
 * ══════════════════════════════════════════════════════════════════════
 * QUIZ ROUTES — API endpoints for quiz system
 * Fixed: Proper routing, authentication, year range handling
 * ══════════════════════════════════════════════════════════════════════
 */

import express from 'express';
import {
  // Metadata endpoints
  getAllSubjects,
  getChaptersBySubject,
  getTopicsByChapter,
  getYearRange,

  // Question fetching
  fetchQuizQuestions,
  fetchPYQQuestions,

  // Attempt submission
  submitQuizAttempt,
  getAttemptDetails,
  listStudentAttempts,
  reportQuestion,
  getChapterPYQs,

} from './quiz.controller.js';

import auth from '../../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * ══════════════════════════════════════════════════════════════════════
 * METADATA ENDPOINTS — For dropdown population on frontend
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * GET /api/quiz/subjects
 * Returns all subjects with chapter count
 * No auth required for metadata
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     { _id: "...", name: "Physics", emoji: "⚛️", chapters: 12 },
 *     { _id: "...", name: "Chemistry", emoji: "🧪", chapters: 10 }
 *   ]
 * }
 */
router.get('/subjects', getAllSubjects);

/**
 * GET /api/quiz/subjects/:subjectId/chapters
 * Returns chapters for a specific subject
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     { _id: "...", name: "Laws of Motion", weightage: 5, topicCount: 4 },
 *     { _id: "...", name: "Kinematics", weightage: 3, topicCount: 3 }
 *   ]
 * }
 */
router.get('/subjects/:subjectId/chapters', getChaptersBySubject);

/**
 * GET /api/quiz/chapters/:chapterId/topics
 * Returns topics for a specific chapter
 * 
 * Response:
 * {
 *   success: true,
 *   data: [
 *     { _id: "...", name: "Newton's First Law" },
 *     { _id: "...", name: "Newton's Second Law" }
 *   ]
 * }
 */
router.get('/chapters/:chapterId/topics', getTopicsByChapter);

/**
 * GET /api/quiz/year-range
 * Returns available year range for PYQ filtering
 * ✅ FIXED: Properly queries distinct years from PYQ collection
 * 
 * Response:
 * {
 *   success: true,
 *   data: {
 *     minYear: 2015,
 *     maxYear: 2024,
 *     yearsAvailable: [2015, 2016, 2017, ..., 2024]
 *   }
 * }
 */
router.get('/year-range', getYearRange);

/**
 * ══════════════════════════════════════════════════════════════════════
 * QUESTION FETCHING ENDPOINTS
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * POST /api/quiz/fetch-questions
 * Generic question fetching (practice or PYQ)
 * ✅ FIXED: Proper year range filtering, correct data structure
 * 
 * Request Body:
 * {
 *   type: "practice" | "pyq",
 *   subjectIds: ["66a1b2c3d4e5f6g7h8i9j0k1", ...],
 *   chapterIds: ["66a1b2c3d4e5f6g7h8i9j0k2", ...],
 *   topicIds?: ["66a1b2c3d4e5f6g7h8i9j0k3", ...],
 *   difficulty: "Easy" | "Medium" | "Hard",
 *   yearRange?: { min: 2020, max: 2024 },  // Only used when type === 'pyq'
 *   limit: 10
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     title: "PYQ Test" | "Practice Test",
 *     duration: 45,
 *     blocks: [{
 *       blockName: "Session 1",
 *       duration: 45,
 *       sections: [{
 *         subjectId: "66a1b2c3d4e5f6g7h8i9j0k1",
 *         subjectName: "Physics",
 *         chapterId: "66a1b2c3d4e5f6g7h8i9j0k2",
 *         topicId: "66a1b2c3d4e5f6g7h8i9j0k3",
 *         numQuestions: 10,
 *         questions: [{
 *           questionId: "66a1b2c3d4e5f6g7h8i9j0k4",
 *           questionText: "What is...",
 *           questionImage: null,
 *           options: [
 *             { index: 0, text: "Option A", image: null },
 *             { index: 1, text: "Option B", image: null },
 *             ...
 *           ],
 *           correctAnswer: 2,
 *           explanation: "The answer is...",
 *           explanationImage: null,
 *           difficulty: "Medium",
 *           year: 2023,
 *           shift: "Jan S1"
 *         }, ...]
 *       }]
 *     }]
 *   }
 * }
 */
router.post('/fetch-questions', auth, fetchQuizQuestions);

/**
 * POST /api/quiz/fetch-pyq
 * Specialized PYQ fetching (alias for /fetch-questions with type='pyq')
 * Same request/response as /fetch-questions
 */
router.post('/fetch-pyq', auth, fetchPYQQuestions);

/**
 * ══════════════════════════════════════════════════════════════════════
 * ATTEMPT SUBMISSION ENDPOINTS
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * POST /api/quiz/submit-attempt
 * Submit completed quiz/test attempt
 * ✅ FIXED: Proper score calculation, correct data structure
 * 
 * Request Body:
 * {
 *   blocks: [{
 *     blockName: "Session 1",
 *     duration: 45,
 *     sections: [{
 *       subjectName: "Physics",
 *       subjectId: "66a1b2c3d4e5f6g7h8i9j0k1",
 *       numQuestions: 10,
 *       questions: [{
 *         questionId: "66a1b2c3d4e5f6g7h8i9j0k4",
 *         questionText: "...",
 *         questionImage: null,
 *         options: [...],
 *         correctAnswer: 2,
 *         chosenOption: 1,  // -1 if unanswered
 *         explanation: "..."
 *       }, ...]
 *     }]
 *   }],
 *   timeTakenSeconds: 1800
 * }
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     attemptId: "66a1b2c3d4e5f6g7h8i9j0k5",
 *     status: "completed",
 *     totalScore: 75,
 *     totalCorrect: 15,
 *     totalWrong: 3,
 *     totalUnattempted: 2,
 *     timeTaken: 1800,
 *     blocks: [{
 *       blockName: "Session 1",
 *       score: 75,
 *       sections: [{
 *         subjectName: "Physics",
 *         score: 75,
 *         correct: 15,
 *         wrong: 3,
 *         unattempted: 2,
 *         accuracy: 83
 *       }]
 *     }]
 *   }
 * }
 */
router.post('/submit-attempt', auth, submitQuizAttempt);

/**
 * ══════════════════════════════════════════════════════════════════════
 * RESULT & HISTORY ENDPOINTS
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * GET /api/quiz/attempts
 * Get all attempts by current student
 * Query params: ?limit=10&page=1&sortBy=createdAt
 *
 * Response:
 * {
 *   success: true,
 *   data: [
 *     {
 *       _id: "66a1b2c3d4e5f6g7h8i9j0k5",
 *       status: "completed",
 *       totalScore: 75,
 *       totalCorrect: 15,
 *       totalWrong: 3,
 *       totalUnattempted: 2,
 *       timeTaken: 1800,
 *       createdAt: "2024-12-19T10:30:00Z"
 *     }, ...
 *   ],
 *   pagination: {
 *     total: 25,
 *     page: 1,
 *     pages: 3
 *   }
 * }
 */
router.get('/attempts', auth, listStudentAttempts);

/**
 * GET /api/quiz/attempts/:attemptId
 * Get detailed result of a specific attempt
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     _id: "66a1b2c3d4e5f6g7h8i9j0k5",
 *     studentId: "...",
 *     blocks: [{
 *       blockName: "Session 1",
 *       score: 75,
 *       sections: [{
 *         subjectName: "Physics",
 *         subjectId: { _id: "...", name: "Physics" },
 *         correct: 15,
 *         wrong: 3,
 *         unattempted: 2,
 *         accuracy: 83,
 *         questions: [...]
 *       }]
 *     }],
 *     status: "completed",
 *     totalScore: 75,
 *     totalCorrect: 15,
 *     totalWrong: 3,
 *     totalUnattempted: 2,
 *     timeTaken: 1800,
 *     createdAt: "2024-12-19T10:30:00Z",
 *     submittedAt: "2024-12-19T10:40:00Z"
 *   }
 * }
 */
router.get('/attempts/:attemptId', auth, getAttemptDetails);


router.post('/question-report', reportQuestion);

router.get('/pyq/:chapterId', getChapterPYQs);

export default router;