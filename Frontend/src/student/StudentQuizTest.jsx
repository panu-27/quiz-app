import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TestAttempt from './quiz/TestAttempt';

export default function StudentQuizTest() {
    const location = useLocation();
    const navigate = useNavigate();

    // The 'questions' here is actually the full exam object returned by fetchQuizQuestions
    const { subjectIds, questions: examData } = location.state || {};

    useEffect(() => {
        if (!subjectIds || subjectIds.length === 0 || !examData) {
            navigate('/student/quiz', { replace: true });
        }
    }, [subjectIds, examData, navigate]);

    if (!examData) return null;

    return (
        <TestAttempt
            examData={examData}
            onFinish={() => navigate('/student', { replace: true })}
        />
    );
}