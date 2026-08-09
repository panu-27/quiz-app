import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Loader2 } from 'lucide-react';

import { FontLoader, StyleInjector } from './quiz/quizStyles';
import CreatePractice from './quiz/CreatePractice';
import { fetchQuizQuestions } from './quiz/quizApi';
import StudentHeader from './StudentHeader';

export { default as TestAttempt } from './quiz/TestAttempt';

export default function StudentQuizFlow() {
  const navigate = useNavigate();
  const [step, setStep] = useState('create-practice');
  const [questions, setQuestions] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => () => { window.__quizNav = null; }, []);

  // Ensure bottom nav is hidden across the flow
  useEffect(() => {
    document.body.setAttribute('data-hide-nav', 'true');
    return () => document.body.removeAttribute('data-hide-nav');
  }, []);

  useEffect(() => {
    if (step === 'test' && questions) {
      navigate('/student/quiztest', {
        state: { subjectIds: subjects, questions },
      });
    }
  }, [step, questions, subjects, navigate]);

  const handleStartPractice = async ({ subjectIds, chapterIds, totalTime, subjectSettings }) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    setSubjects(subjectIds);

    try {
      const subjectWiseCounts = {};
      let overallDifficulty = 'Medium';
      
      subjectIds.forEach(subjId => {
        const settings = subjectSettings[subjId] || { count: 25, difficulty: 'All' };
        subjectWiseCounts[subjId] = settings.count === 'Unlimited' ? 9999 : settings.count;
        // Use the first subject's difficulty if not 'All'
        if (settings.difficulty !== 'All' && overallDifficulty === 'Medium') {
            overallDifficulty = settings.difficulty;
        }
      });

      const examData = await fetchQuizQuestions({
        type: 'pyq',
        subjectIds,
        chapterIds,
        difficulty: overallDifficulty,
        yearRange: { min: 2004, max: 2025 },
        totalTime: totalTime === 9999 ? 9999 : totalTime,
        subjectWiseCounts,
        limit: 25,
      });

      setQuestions(examData);
      setStep('test');
    } catch (err) {
      console.error('[StudentQuizFlow] Error:', err);
      setError(err.message || 'Failed to fetch questions. Please try again.');
      setLoading(false);
    }
  };

  if (step === 'create-practice') {
    return (
      <>
        <FontLoader />
        <StyleInjector />
        {loading && (
          <div className="fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#0E131F]">
            <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-4" />
            <p className="text-[#8492A6] text-sm font-semibold">Preparing your practice session...</p>
          </div>
        )}
        {error && (
          <div className="fixed top-4 left-4 right-4 z-[1000] bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl text-center">
            {error}
          </div>
        )}
        <CreatePractice
          onStartPractice={handleStartPractice}
          onBackToApp={() => navigate('/student')}
        />
      </>
    );
  }

  // Fallback if test state takes a moment to navigate
  return (
    <div className="min-h-screen bg-[#0E131F] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
    </div>
  );
}
