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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const submitLock = useRef(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Candidate";
  const [testTitle, setTestTitle] = useState("Online Assessment");

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
        message: "You cannot submit the entire test until the final section ends.",
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

      const formattedAnswers = Object.entries(answers).map(([qId, optValue]) => ({
        questionId: qId,
        selectedOption: optValue
      }));

      try {
        const res = await api.post(`/student/submit/${testId}`, {
          answers: formattedAnswers,
          timeTaken: timeTaken
        });

        setHasSubmitted(true);
        setExamCompleted(true);
        setIsSecureMode(false);
        if (document.fullscreenElement) document.exitFullscreen().catch(() => { });

        setModal({
          type: "score",
          title: "Test Submitted",
          message: `Your score: ${res.data.score}`,
          onConfirm: () => navigate("/student")
        });
      } catch (err) {
        submitLock.current = false;
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
        handleSubmit(true);
      } else {
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

  /* ================= DATA FETCHING ================= */
  useEffect(() => {
    api.post(`/student/attempt/start/${testId}`)
      .then(res => {
        const { blocks, attemptNumber: attNum, testTitle: incomingTitle } = res.data;
        if (incomingTitle) setTestTitle(incomingTitle);

        const allQuestions = [];
        const times = { block1: 0, block2: 0 };

        blocks.forEach((block, bIdx) => {
          const blockKey = `block${bIdx + 1}`;
          times[blockKey] = (block.duration || 0) * 60;

          block.sections.forEach(section => {
            const subjectName = section.subjectName || "Subject";
            section.questions.forEach(q => {
              allQuestions.push({
                ...q,
                parentBlock: blockKey,
                subjectName: subjectName
              });
            });
          });
        });

        setQuestions(allQuestions);
        setTimers(times);
        setInitialTimes(times);
        setAttemptNumber(attNum);
        setSectionBlock("block1");
      })
      .catch((err) => {
        console.error("Session failed:", err);
        navigate("/student");
      });
  }, [testId, navigate]);

  /* ================= TIMERS LOGIC ================= */
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
      if (sectionBlock === "block1" && (timers.block2 > 0 || questions.some(q => q.parentBlock === "block2"))) {
        setSectionBlock("block2");
        setActiveSubject(null);
        setIndex(0);
      } else {
        handleSubmit(true);
      }
    }
  }, [timers, sectionBlock, hasSubmitted, handleSubmit, questions]);

  /* ================= LOGICAL GROUPING ================= */
  const sectionalData = useMemo(() => {
    if (!questions.length) return null;

    const group = (qs) => qs.reduce((acc, q) => {
      const sName = q.subjectName || "Subject";
      if (!acc[sName]) acc[sName] = [];
      acc[sName].push(q);
      return acc;
    }, {});

    const b1Qs = questions.filter(q => q.parentBlock === "block1");
    const b2Qs = questions.filter(q => q.parentBlock === "block2");

    return {
      block1: { questions: b1Qs, subjects: group(b1Qs) },
      block2: { questions: b2Qs, subjects: group(b2Qs) }
    };
  }, [questions]);

  // Sync Active Subject based on current Block
  useEffect(() => {
    if (sectionalData && sectionBlock) {
      const currentBlockSubjects = Object.keys(sectionalData[sectionBlock].subjects);
      if (currentBlockSubjects.length > 0) {
        // Only reset if activeSubject is not in the new block's list
        if (!activeSubject || !currentBlockSubjects.includes(activeSubject)) {
          setActiveSubject(currentBlockSubjects[0]);
          setIndex(0);
        }
      }
    }
  }, [sectionBlock, sectionalData, activeSubject]);

  const currentSubjectQs = useMemo(() => {
    if (!sectionalData || !sectionBlock || !activeSubject) return [];
    return sectionalData[sectionBlock].subjects[activeSubject] || [];
  }, [sectionalData, sectionBlock, activeSubject]);

  const q = currentSubjectQs[index];

  /* ================= SECURITY LISTENERS ================= */
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

  /* ================= RENDERING ================= */
  if (!isSecureMode && !examCompleted) {
    return <ExamLobby
      testTitle={testTitle}
      userName={userName}
      block1Minutes={Math.floor(initialTimes.block1 / 60)}
      block2Minutes={Math.floor(initialTimes.block2 / 60)}
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
        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden absolute right-0 top-0 bg-[#2d3436] p-2">
          <Menu size={24} className="text-white" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          <QuestionDisplay
            question={q}
            index={index} // This is the local index (0, 1, 2...) for the current subject
            activeSubject={activeSubject}
            totalQuestions={currentSubjectQs.length} // Add this to send the length of the specific subject
            currentAnswer={answers[q?.questionId]}
            setAnswer={(val) => {
              setAnswers(prev => ({ ...prev, [q.questionId]: val }));
              setVisited(prev => ({ ...prev, [q.questionId]: true }));
            }}
          />
          <ExamFooter
            onBack={() => index > 0 && setIndex(index - 1)}
            onNext={() => index < currentSubjectQs.length - 1 && setIndex(index + 1)}
            onMark={() => {
              setMarked(prev => ({ ...prev, [q.questionId]: !prev[q.questionId] }));
              if (index < currentSubjectQs.length - 1) setIndex(index + 1);
            }}
            isFirst={index === 0}
            isLast={index === currentSubjectQs.length - 1}
            isMarked={marked[q?.questionId]}
          />
        </main>

        <div className="hidden lg:block border-l">
          <QuestionSidebar
            questions={currentSubjectQs}
            currentIndex={index}
            answers={answers}
            marked={marked}
            visited={visited}
            totalQuestions={currentSubjectQs.length}
            setIndex={setIndex}
            onFinish={() => handleSubmit(false)}
          />
        </div>

        {/* Mobile Drawer */}
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 lg:hidden ${isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className={`absolute right-0 top-0 h-full w-[80%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${isSidebarOpen ? "translate-x-0" : "translate-x-full"}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-bold text-gray-800 uppercase text-xs tracking-widest">Navigator</span>
              <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
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