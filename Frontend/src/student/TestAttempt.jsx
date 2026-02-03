import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import QuestionDisplay from "./TestEnvironment/QuestionDisplay";
import ExamHeader from "./TestEnvironment/ExamHeader";
import QuestionSidebar from "./TestEnvironment/QuestionSidebar";
import ExamFooter from "./TestEnvironment/ExamFooter";
import ModalComponent from "./TestEnvironment/ModalComponent";
import ExamLobby from "./TestEnvironment/ExamLobby";
import { Menu, X } from "lucide-react";

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [sectionBlock, setSectionBlock] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [attemptNumber, setAttemptNumber] = useState(null);
  const [index, setIndex] = useState(0);
  const [timers, setTimers] = useState({ block1: 0, block2: 0 });
  const [initialTimes, setInitialTimes] = useState({ block1: 0, block2: 0 });
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [examStarted, setExamStarted] = useState(false);
  const [violations, setViolations] = useState(0);

  // MOBILE DRAWER STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const submitLock = useRef(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Candidate";
  const testTitle = "Online Assessment Test";

  /* ================= CORE FUNCTIONS ================= */
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen().catch(e => console.error(e));
    setIsSecureMode(true);
    setExamStarted(true);
  };

  const exitApp = () => {
    if (window.electron?.forceExit) window.electron.forceExit();
    else alert("Exit works only in desktop app");
  };

const handleSubmit = useCallback(async (isAuto = false) => {
  if (!isAuto && sectionBlock === "block1" && timers.block2 > 0) {
    setModal({
      type: "warning",
      title: "Action Restricted",
      message: "You cannot submit until Section 1 ends.",
      onConfirm: () => setModal(null)
    });
    return;
  }

  const performSubmit = async () => {
    if (submitLock.current) return;
    submitLock.current = true;
    
    const totalAllotted = (initialTimes.block1 || 0) + (initialTimes.block2 || 0);
    const totalRemaining = (timers.block1 || 0) + (timers.block2 || 0);
    const timeTaken = Math.max(totalAllotted - totalRemaining, 0);

    // Matches your service: ans.questionId === q._id.toString()
    const formattedAnswers = Object.entries(answers).map(([qId, optValue]) => ({
      questionId: qId, 
      selectedOption: optValue
    }));

    try {
      // POST to /student/submit/:testId with the payload
      const res = await api.post(`/student/submit/${testId}`, {
        answers: formattedAnswers,
        timeTaken: timeTaken
      });
      
      setHasSubmitted(true);
      setExamCompleted(true);
      setIsSecureMode(false);
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => { });
      }

      setModal({ 
        type: "score", 
        title: "Test Submitted", 
        message: `Your score: ${res.data.score}`, 
        onConfirm: () => navigate("/student") 
      });
    } catch (err) {
      submitLock.current = false;
      console.error("Submission error:", err);
      setModal({ 
        type: "error", 
        title: "Submission Failed", 
        message: err.response?.data?.message || "Could not connect to server." 
      });
    }
  };

  if (isAuto) performSubmit();
  else setModal({ 
    type: "confirm", 
    title: "Submit Test?", 
    message: "Are you sure you want to end your test?", 
    onConfirm: performSubmit 
  });
}, [answers, testId, navigate, sectionBlock, timers, initialTimes]);

const registerViolation = useCallback((reason) => {
  if (hasSubmitted || submitLock.current) return;
  
  setViolations(prev => {
    const next = prev + 1;
    
    if (next >= 3) {
      // 1. NO MODAL HERE. 
      // 2. We trigger the submission process immediately.
      console.warn("CRITICAL: Maximum violations reached. Forced submission in progress.");
      handleSubmit(true); 
    } else {
      // Keep the modal for warning 1 and 2 so they know they are being watched
      setModal({
        type: "warning",
        title: `Violation ${next} / 3`,
        message: reason,
        onConfirm: () => setModal(null)
      });
    }
    return next;
  });
}, [handleSubmit, hasSubmitted]);

  /* ================= DATA & TIMERS ================= */
  useEffect(() => {
    api.post(`/student/attempt/start/${testId}`)
      .then(res => {
        const { questions: rawQs, sectionTimes, attemptNumber: attNum } = res.data;
        
        setQuestions(rawQs);
        const times = { 
          block1: sectionTimes?.block1 || 0, 
          block2: sectionTimes?.block2 || 0 
        };
        setTimers(times);
        setInitialTimes(times);
        setAttemptNumber(attNum);
        
        const hasB1 = rawQs.some(q => 
          ["physics", "chemistry"].includes(q.subjectId?.name?.toLowerCase())
        );
        setSectionBlock(hasB1 ? "block1" : "block2");
      })
      .catch((err) => {
        console.error("Session failed:", err);
        if (err.response?.status === 401) navigate("/login");
        else navigate("/student");
      });
  }, [testId, navigate]);

  useEffect(() => {
    if (!sectionBlock || !examStarted || hasSubmitted) return;
    const interval = setInterval(() => {
      setTimers(prev => {
        if (prev[sectionBlock] <= 0) return prev;
        return { ...prev, [sectionBlock]: prev[sectionBlock] - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sectionBlock, examStarted, hasSubmitted]);

  useEffect(() => {
    if (!sectionBlock || hasSubmitted) return;
    if (timers[sectionBlock] === 0) {
      if (sectionBlock === "block1" && timers.block2 > 0) {
        setSectionBlock("block2");
        setActiveSubject(null);
        setIndex(0);
      } else if (timers[sectionBlock] === 0) {
        handleSubmit(true);
      }
    }
  }, [timers, sectionBlock, hasSubmitted, handleSubmit]);

  const sectionalData = useMemo(() => {
    if (!questions.length) return null;
    
    const group = (qs) => qs.reduce((acc, q) => {
      const sName = q.subjectId?.name || "Subject";
      if (!acc[sName]) acc[sName] = [];
      acc[sName].push(q);
      return acc;
    }, {});

    const b1Qs = questions.filter(q => ["physics", "chemistry"].includes(q.subjectId?.name?.toLowerCase()));
    const b2Qs = questions.filter(q => !["physics", "chemistry"].includes(q.subjectId?.name?.toLowerCase()));
    
    return {
      block1: { name: "Section 1", questions: b1Qs, subjects: group(b1Qs) },
      block2: { name: "Section 2", questions: b2Qs, subjects: group(b2Qs) }
    };
  }, [questions]);

  useEffect(() => {
    if (sectionalData && sectionBlock) {
      const availableSubjects = Object.keys(sectionalData[sectionBlock].subjects);
      if (availableSubjects.length > 0 && (!activeSubject || !availableSubjects.includes(activeSubject))) {
        setActiveSubject(availableSubjects[0]);
        setIndex(0);
      }
    }
  }, [sectionBlock, sectionalData, activeSubject]);

  const currentSubjectQs = useMemo(() => {
    if (!sectionalData || !sectionBlock || !activeSubject) return [];
    return sectionalData[sectionBlock].subjects[activeSubject] || [];
  }, [sectionalData, sectionBlock, activeSubject]);

  const q = currentSubjectQs[index];

  useEffect(() => {
    if (!isSecureMode || examCompleted) return;
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) registerViolation("Fullscreen mode exited.");
    };
    const handleBlur = () => registerViolation("Exam window blurred.");
    const blockKeys = (e) => {
      const blocked = e.key === "Escape" || e.key === "F11" || e.altKey || e.ctrlKey || e.metaKey;
      if (blocked) { e.preventDefault(); registerViolation("Restricted key used."); }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keydown", blockKeys, true);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keydown", blockKeys, true);
    };
  }, [isSecureMode, examCompleted, registerViolation]);

  /* ================= RENDER ================= */
  if (!isSecureMode && !examCompleted) {
    return <ExamLobby 
      testTitle={testTitle} 
      userName={userName} 
      block1Minutes={Math.floor(timers.block1 / 60)} 
      block2Minutes={Math.floor(timers.block2 / 60)} 
      enterFullscreen={enterFullscreen} 
      exitApp={exitApp} 
    />;
  }

  if (!sectionalData || !activeSubject || !q) {
    return <div className="h-screen flex items-center justify-center bg-white font-mono uppercase tracking-widest animate-pulse">Initializing Exam Session...</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white select-none relative">
      {modal && <ModalComponent data={modal} />}

      <div className="flex shrink-0 items-center bg-white border-b relative">
        <div className="flex-1">
          <ExamHeader
            testId={testId}
            timer={timers[sectionBlock]}
            activeSubject={activeSubject}
            subjects={Object.keys(sectionalData[sectionBlock].subjects)}
            onSubjectChange={(sub) => { setActiveSubject(sub); setIndex(0); }}
            onFinish={() => handleSubmit(false)}
            exitApp={exitApp}
            isBlock1={sectionBlock === "block1"}
          />
        </div>

        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden absolute right-0 top-0 bg-[#2d3436] p-2 hover:bg-gray-800 transition-colors"
        >
          <Menu size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <QuestionDisplay
            question={q}
            index={index}
            activeSubject={activeSubject}
            currentAnswer={answers[q?._id]}
            setAnswer={(val) => {
                setAnswers(prev => ({ ...prev, [q._id]: val }));
                setVisited(prev => ({ ...prev, [q._id]: true }));
            }}
          />
          <ExamFooter
            onBack={() => index > 0 && setIndex(index - 1)}
            onNext={() => index < currentSubjectQs.length - 1 && setIndex(index + 1)}
            onMark={() => {
              setMarked(prev => ({ ...prev, [q._id]: !prev[q._id] }));
              if (index < currentSubjectQs.length - 1) setIndex(index + 1);
            }}
            isFirst={index === 0}
            isMarked={marked[q?._id]}
          />
        </main>

        <div className="hidden lg:block border-l">
          <QuestionSidebar
            questions={currentSubjectQs}
            currentIndex={index}
            answers={answers}
            marked={marked}
            visited={visited}
            setIndex={setIndex}
            onFinish={() => handleSubmit(false)}
          />
        </div>

        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-gray-800 uppercase text-xs tracking-widest">Navigator</span>
              <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>
            <div className="h-[calc(100%-60px)] overflow-y-auto">
              <QuestionSidebar
                questions={currentSubjectQs}
                currentIndex={index}
                answers={answers}
                marked={marked}
                visited={visited}
                setIndex={(idx) => { setIndex(idx); setIsSidebarOpen(false); }}
                onFinish={() => handleSubmit(false)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}