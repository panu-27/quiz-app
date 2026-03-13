/* ══════════════════════════════════════════════
   QUIZ API SERVICE — quizApi.js
   ──────────────────────────────────────────────
   All quiz-related API calls live here.
   Currently FAKE (console.log only) — swap the
   fetch calls in when the backend is ready.

   REQUEST / RESPONSE CONTRACT
   ───────────────────────────

   ── 1. Generate Questions ──────────────────────
   POST /api/quiz/generate

   Request body:
   {
     subjectIds:  ["physics", "chemistry"],          // selected subject IDs
     chapterIds:  ["p1", "p2", "c3"],               // selected chapter IDs
     topicKeys:   ["p1::Newton's 1st Law", "c3::Periodic Table"]  // selected topic keys
   }

   Response (array of question objects):
   [
     {
       id:      "uuid-or-db-id",   // backend's DB question id
       subj:    "physics",          // subject id
       chapId:  "p1",               // chapter id
       topic:   "Newton's 1st Law", // topic string
       q:       "Question text?",
       opts:    ["A", "B", "C", "D"],
       ans:     1                   // 0-based index of correct answer
     },
     ...
   ]

   ── 2. Submit Answers ──────────────────────────
   POST /api/quiz/submit

   Request body:
   {
     subjectIds:  ["physics", "chemistry"],
     chapterIds:  ["p1", "p2", "c3"],
     topicKeys:   ["p1::Newton's 1st Law"],
     answers: [
       { questionId: "uuid-or-db-id", selectedOption: 1 },  // 0-based
       { questionId: "uuid-or-db-id", selectedOption: null } // null = skipped
     ],
     timeTakenSeconds: 420,
     submittedAt: "2025-03-13T10:22:00.000Z"
   }

   Response:
   {
     attemptId:    "attempt-uuid",
     score:        75,             // percentage
     correct:      9,
     wrong:        2,
     unanswered:   1,
     total:        12,
     breakdown: [                  // per-question result
       { questionId: "...", correct: true, selectedOption: 1, correctOption: 1 },
       ...
     ]
   }
══════════════════════════════════════════════ */

const BASE_URL = '/apii/quiz'; // swap to full URL when backend is live

/* ── 1. Fetch questions from backend ── */
export async function fetchQuizQuestions({ subjectIds, chapterIds, topicKeys }) {
    const payload = { subjectIds, chapterIds, topicKeys };

    console.log('[quizApi] fetchQuizQuestions → REQUEST', JSON.stringify(payload, null, 2));

    /* ── FAKE RESPONSE — remove this block and uncomment fetch() when backend ready ── */
    const fakeQuestions = _buildFakeQuestions(subjectIds, chapterIds, topicKeys);
    console.log('[quizApi] fetchQuizQuestions ← FAKE RESPONSE', fakeQuestions);
    return fakeQuestions;

    /* ── REAL FETCH (uncomment when backend ready) ──
    const res = await fetch(`${BASE_URL}/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Quiz generate failed: ${res.status}`);
    return res.json(); // array of question objects
    */
}

/* ── 2. Submit answers to backend ── */
export async function submitQuizAttempt({
    subjectIds,
    chapterIds,
    topicKeys,
    answers,           // [{ questionId, selectedOption }]
    timeTakenSeconds,
}) {
    const payload = {
        subjectIds,
        chapterIds,
        topicKeys,
        answers,
        timeTakenSeconds,
        submittedAt: new Date().toISOString(),
    };

    console.log('[quizApi] submitQuizAttempt → REQUEST', JSON.stringify(payload, null, 2));

    /* ── FAKE RESPONSE ── */
    const total      = answers.length;
    const correct    = answers.filter(a => a.selectedOption === a._correctOption).length;
    const unanswered = answers.filter(a => a.selectedOption === null).length;
    const wrong      = total - correct - unanswered;
    const fakeResult = {
        attemptId:    `fake-attempt-${Date.now()}`,
        score:        Math.round((correct / total) * 100),
        correct,
        wrong,
        unanswered,
        total,
        breakdown:    answers.map(a => ({
            questionId:      a.questionId,
            correct:         a.selectedOption === a._correctOption,
            selectedOption:  a.selectedOption,
            correctOption:   a._correctOption,
        })),
    };
    console.log('[quizApi] submitQuizAttempt ← FAKE RESPONSE', fakeResult);
    return fakeResult;

    /* ── REAL FETCH ──
    const res = await fetch(`${BASE_URL}/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Quiz submit failed: ${res.status}`);
    return res.json();
    */
}

/* ══════════════════════════════════════════════
   FAKE DATA BUILDER
   Builds plausible fake questions from the local
   quizData constants so the UI works end-to-end
   without a backend. Delete this entire block
   once the real API is wired up.
══════════════════════════════════════════════ */
import { QUESTIONS } from './quizData';

function _buildFakeQuestions(subjectIds, chapterIds, topicKeys) {
    return subjectIds.flatMap(sid => {
        const subjectQs = (QUESTIONS[sid] || []).slice(0, 6);
        return subjectQs.map((q, i) => ({
            id:     `fake-${sid}-${q.id}`,
            subj:   sid,
            chapId: chapterIds.find(c => c.startsWith(sid[0])) || chapterIds[0] || null,
            topic:  topicKeys.find(k => k.startsWith(chapterIds[0])) || null,
            q:      q.q,
            opts:   q.opts,
            ans:    q.ans,           // 0-based correct answer index
        }));
    });
}