/**
 * StudentQuizTest.jsx
 *
 * Full-screen quiz test page mounted at /student/quiztest.
 * Receives { subjectIds } via React Router location.state, set by
 * StudentQuizFlow when the user clicks "Start Test" on the overview screen.
 *
 * The bottom nav bar is hidden on this route — StudentLayout checks
 * `location.pathname === "/student/quiztest"` and sets showNavbar = true,
 * which suppresses the bottom bar render.
 *
 * If the user lands here with no state (e.g. direct URL), they are
 * redirected back to the quiz flow start (/student/quiz) which shows step 1.
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TestAttempt from './quiz/TestAttempt';

export default function StudentQuizTest() {
    const location = useLocation();
    const navigate  = useNavigate();

    const { subjectIds, chapterIds, topicKeys, questions } = location.state || {};

    useEffect(() => {
        if (!subjectIds || subjectIds.length === 0) {
            navigate('/student/quiz', { replace: true });
        }
    }, []);

    if (!subjectIds || subjectIds.length === 0) return null;

    return (
        <TestAttempt
            subjectIds={subjectIds}
            chapterIds={chapterIds  || []}
            topicKeys={topicKeys    || []}
            questions={questions    || []}   // API-fetched; falls back to [] (TestAttempt handles)
            onFinish={() => navigate('/student', { replace: true })}
        />
    );
}