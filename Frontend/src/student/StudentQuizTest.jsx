import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import TestAttempt from './quiz/TestAttempt';

export default function StudentQuizTest() {
    const location = useLocation();
    const navigate = useNavigate();

    // Check location.state first, then fallback to sessionStorage
    let examData = location.state?.questions;
    let parentAttemptId = location.state?.parentAttemptId;

    if (examData) {
        try {
            sessionStorage.setItem('active_quiz_session', JSON.stringify({
                examData,
                parentAttemptId,
                from: location.state?.from || '/student/quiz'
            }));
        } catch (e) {}
    } else {
        try {
            const cached = sessionStorage.getItem('active_quiz_session');
            if (cached) {
                const parsed = JSON.parse(cached);
                examData = parsed.examData;
                parentAttemptId = parsed.parentAttemptId;
            }
        } catch (e) {}
    }

    useEffect(() => {
        if (!examData) {
            navigate('/student/quiz', { replace: true });
        }
    }, [examData, navigate]);

    if (!examData) return null;

    const handleFinish = () => {
        try {
            sessionStorage.removeItem('active_quiz_session');
        } catch (e) {}
        const returnPath = location.state?.from || '/student/quiz';
        navigate(returnPath, { replace: true });
    };

    return (
        <TestAttempt
            examData={examData}
            parentAttemptId={parentAttemptId}
            onFinish={handleFinish}
        />
    );
}