import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TestAttempt from './quiz/TestAttempt';

export default function StudentQuizTest() {
    const location = useLocation();
    const navigate = useNavigate();

    // The 'questions' here is actually the full exam object returned by fetchQuizQuestions
    const { questions: examData, parentAttemptId } = location.state || {};

    useEffect(() => {
        if (!examData) {
            navigate('/student/quiz', { replace: true });
        }
    }, [examData, navigate]);

    if (!examData) return null;

    return (
        <TestAttempt
            examData={examData}
            parentAttemptId={parentAttemptId}
            onFinish={() => navigate('/student', { replace: true })}
        />
    );
}