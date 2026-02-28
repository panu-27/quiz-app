import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import QuestionDisplay from "./TestEnvironment/QuestionDisplay";
import ExamHeader from "./TestEnvironment/ExamHeader";
import QuestionSidebar from "./TestEnvironment/QuestionSidebar";
import ExamFooter from "./TestEnvironment/ExamFooter";
import ModalComponent from "./TestEnvironment/ModalComponent";
import ExamLobby from "./TestEnvironment/ExamLobby";
import { Menu } from "lucide-react";

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();

  /* ================= NESTED STATE (The Snapshot) ================= */
  const [blocks, setBlocks] = useState([]);
  const [sectionBlock, setSectionBlock] = useState("block1");
  const [activeSubject, setActiveSubject] = useState(null);
  const [index, setIndex] = useState(0);

  /* ================= APP STATE ================= */
  const [examStarted, setExamStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timers, setTimers] = useState({ block1: 0, block2: 0 });
  const [initialTimes, setInitialTimes] = useState({ block1: 0, block2: 0 });
  const [testTitle, setTestTitle] = useState("Assessment");
  const [modal, setModal] = useState(null);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [startError, setStartError] = useState(null);

  // ── per-question mark & visited maps ──────────────────────────────
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});

  const submitLock = useRef(false);
  const timersRef = useRef({ block1: 0, block2: 0 });

  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= 1. DATA HYDRATION ================= */
  useEffect(() => {
    api.post(`/student/attempt/start/${testId}`)
      .then(res => {
        const { blocks: incomingBlocks, testTitle: title, blockTimers } = res.data;
        setBlocks(incomingBlocks);
        setTestTitle(title || "Assessment");

        // ✅ Use server-calculated per-block timers — correct even after refresh
        const times = {};
        incomingBlocks.forEach((b, i) => {
          const key = `block${i + 1}`;
          times[key] = blockTimers?.[key] ?? (b.duration || 0) * 60;
        });

        setTimers(times);
        timersRef.current = times;
        setInitialTimes(times);

        // ✅ Restore active block on refresh
        // If block1 is already 0 and block2 has time remaining → jump straight to block2
        if ((blockTimers?.block1 ?? 1) === 0 && (blockTimers?.block2 ?? 0) > 0) {
          setSectionBlock("block2");
          const block2 = incomingBlocks[1];
          if (block2?.sections?.length > 0) {
            setActiveSubject(block2.sections[0].subjectName);
          }
        }
      })
      .catch(err => {
        const message = err.response?.data?.message || "Unable to start test. Please try again.";
        setStartError(message);
      });
  }, [testId]);

  /* ================= 2. CALCULATED POINTERS ================= */
  const currentSubjectQs = useMemo(() => {
    if (!blocks.length || !activeSubject) return [];
    const blockIndex = sectionBlock === "block1" ? 0 : 1;
    const currentBlock = blocks[blockIndex];
    if (!currentBlock) return [];
    const section = currentBlock.sections.find(s => s.subjectName === activeSubject);
    return section ? section.questions : [];
  }, [blocks, sectionBlock, activeSubject]);

  const q = currentSubjectQs[index];

  const answers = useMemo(() => {
    const map = {};
    currentSubjectQs.forEach(question => {
      const c = question.chosenOption;
      if (c !== undefined && c !== null && c !== -1 && !isNaN(c)) {
        map[question.questionId] = c;
      }
    });
    return map;
  }, [currentSubjectQs]);

  /* ================= 3. STATE UPDATER (Deep Update) ================= */
  const updateChosenOption = useCallback((questionId, optionIndex) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block => ({
        ...block,
        sections: block.sections.map(section => ({
          ...section,
          questions: section.questions.map(question =>
            question.questionId === questionId
              ? { ...question, chosenOption: optionIndex }
              : question
          )
        }))
      }))
    );
  }, []);

  useEffect(() => {
    if (q?.questionId) {
      setVisited(prev => ({ ...prev, [q.questionId]: true }));
    }
  }, [q?.questionId]);

  /* ================= MARK & CLEAR HANDLERS ================= */
  const handleMark = useCallback(() => {
    if (!q?.questionId) return;
    setMarked(prev => ({ ...prev, [q.questionId]: !prev[q.questionId] }));
    setIndex(prev => Math.min(currentSubjectQs.length - 1, prev + 1));
  }, [q, currentSubjectQs.length]);

  const handleClear = useCallback(() => {
    if (!q?.questionId) return;
    updateChosenOption(q.questionId, -1);
  }, [q, updateChosenOption]);

  /* ================= 4. AUTOSAVE HEARTBEAT (Every 30s) ================= */
  useEffect(() => {
    if (!examStarted || hasSubmitted) return;

    const interval = setInterval(async () => {
      const answersForAPI = [];
      blocks.forEach(b =>
        b.sections.forEach(s =>
          s.questions.forEach(question => {
            const chosen = question.chosenOption;
            answersForAPI.push({
              questionId: question.questionId,
              selectedOption:
                chosen === undefined || chosen === null || isNaN(chosen) ? -1 : chosen,
            });
          })
        )
      );

      try {
        await api.post(`/student/submit/${testId}`, {
          answers: answersForAPI,
          timeTaken: 0,
          isFinal: false
        });
        console.log("[AUTOSAVE] Progress saved at", new Date().toLocaleTimeString());
      } catch (err) {
        console.error("[AUTOSAVE FAILED]", err.response?.data || err.message);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [examStarted, hasSubmitted, testId, blocks]);

  /* ================= 5. SUBMISSION LOGIC ================= */
  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitLock.current) return;

    const performSubmit = async (silent = false) => {
      submitLock.current = true;

      const totalAllotted = (initialTimes.block1 || 0) + (initialTimes.block2 || 0);
      const totalRemaining = (timersRef.current.block1 || 0) + (timersRef.current.block2 || 0);
      const timeTaken = Math.max(totalAllotted - totalRemaining, 0);

      const answersForAPI = [];
      blocks.forEach(b =>
        b.sections.forEach(s =>
          s.questions.forEach(question => {
            const chosen = question.chosenOption;
            answersForAPI.push({
              questionId: question.questionId,
              selectedOption:
                chosen === undefined || chosen === null || isNaN(chosen) ? -1 : chosen,
            });
          })
        )
      );

      console.log("[SUBMIT] Sending", answersForAPI.length, "answers | timeTaken:", timeTaken);

      try {
        await api.post(`/student/submit/${testId}`, {
          answers: answersForAPI,
          timeTaken,
          isFinal: true
        });
        setHasSubmitted(true);
        console.log("[SUBMIT SUCCESS] timeTaken:", timeTaken);

        if (!silent) {
          setModal({
            type: "score",
            title: "Exam Completed",
            message: "Your responses have been secured.",
            onConfirm: () => navigate("/student"),
            onCancel: () => navigate("/student"),
          });
        } else {
          console.log("[AUTO-SUBMIT] Silent submission complete. Redirecting...");
          navigate("/student");
        }
      } catch (err) {
        submitLock.current = false;
        console.error("[SUBMIT ERROR]", err.response?.data || err.message);
        if (!silent) {
          setModal({
            type: "error",
            title: "Submission Error",
            message: "Failed to submit. Please check your connection.",
            onConfirm: () => setModal(null),
            onCancel: () => setModal(null),
          });
        }
      }
    };

    if (isAuto) {
      console.log("[AUTO-SUBMIT] Timer expired — submitting silently...");
      performSubmit(true);
      return;
    }

    setModal({
      type: "confirm",
      title: "End Test?",
      message: "Are you sure you want to submit the test? You cannot change answers after submission.",
      onConfirm: () => performSubmit(false),
      onCancel: () => setModal(null),
    });
  }, [blocks, initialTimes, testId, navigate]);

  /* ================= 6. INITIAL SUBJECT SETUP ================= */
  useEffect(() => {
    if (blocks.length > 0 && !activeSubject) {
      const blockIndex = sectionBlock === "block1" ? 0 : 1;
      const currentBlock = blocks[blockIndex];
      if (currentBlock?.sections?.length > 0) {
        setActiveSubject(currentBlock.sections[0].subjectName);
      }
    }
  }, [blocks, activeSubject, sectionBlock]);

  /* ================= 7. TIMER, AUTO-SUBMIT & BLOCK TRANSITION ================= */
  useEffect(() => {
    if (!examStarted || hasSubmitted) return;

    const timerId = setInterval(() => {
      setTimers(prev => {
        const newVal = Math.max(prev[sectionBlock] - 1, 0);
        const updated = { ...prev, [sectionBlock]: newVal };

        timersRef.current = updated;

        // ── Block1 expired → auto-transition to block2 ────────────────
        if (newVal === 0 && sectionBlock === "block1" && (updated.block2 ?? 0) > 0) {
          setSectionBlock("block2");
          const block2 = blocks[1];
          if (block2?.sections?.length > 0) {
            setActiveSubject(block2.sections[0].subjectName);
            setIndex(0);
          }
        }

        // ── All time expired → auto-submit ────────────────────────────
        if (newVal === 0 && (sectionBlock === "block2" || (updated.block2 ?? 0) === 0)) {
          clearInterval(timerId);
          handleSubmit(true);
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [examStarted, sectionBlock, hasSubmitted, blocks, handleSubmit]);

  /* ================= DERIVED VALUES ================= */
  const isBlock1 = sectionBlock === "block1";
  const hasBlock2 = blocks.length > 1;

  // ✅ Block2 is locked as long as block1 timer is still running
  const isBlock2Locked = hasBlock2 && timers.block1 > 0;

  /* ================= BLOCK TRANSITION LOGIC (Manual) ================= */
  const handleMoveToSection = useCallback(() => {
    // ✅ Hard guard — block2 cannot be entered while block1 is running
    if (isBlock2Locked) {
      setModal({
        type: "error",
        title: "Section Locked",
        message: "You cannot move to the next section until the current section's time expires.",
        onConfirm: () => setModal(null),
        onCancel: () => setModal(null),
      });
      return;
    }

    setModal({
      type: "confirm",
      title: "Move to Next Section?",
      message: "You will move to the next section. You cannot return to this section.",
      onConfirm: () => {
        setSectionBlock("block2");
        const block2 = blocks[1];
        if (block2?.sections?.length > 0) {
          setActiveSubject(block2.sections[0].subjectName);
          setIndex(0);
        }
        setModal(null);
      },
      onCancel: () => setModal(null),
    });
  }, [blocks, isBlock2Locked]);

  const exitApp = useCallback(() => {
    setModal({
      type: "confirm",
      title: "Exit Exam?",
      message: "Your progress will be saved. Are you sure you want to exit?",
      onConfirm: () => navigate("/student"),
      onCancel: () => setModal(null),
    });
  }, [navigate]);

  /* ================= RENDERING ================= */

  if (startError) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-sans">
        <div className="text-center max-w-md w-full mx-4 p-8 border border-gray-200 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 text-xl font-bold">!</span>
          </div>
          <p className="text-gray-900 font-bold text-base mb-2">Cannot Start Test</p>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{startError}</p>
          <button
            onClick={() => navigate("/student")}
            className="bg-[#337ab7] border border-[#2e6da4] text-white px-8 py-2 text-sm font-bold hover:bg-[#286090] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <ExamLobby
        testTitle={testTitle}
        userName={user?.name}
        enterFullscreen={() => {
          setExamStarted(true);
          setIsSecureMode(true);
        }}
        exitApp={() => navigate("/student")}
      />
    );
  }

  if (!q) return <div className="p-20 text-center text-gray-500">Loading Questions...</div>;

  // Only subjects from the currently active block
  const currentSubjects = blocks[isBlock1 ? 0 : 1]?.sections.map(s => s.subjectName) || [];

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {modal && <ModalComponent data={modal} />}

      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full z-50 transform transition-transform duration-300 lg:hidden ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <QuestionSidebar
          questions={currentSubjectQs}
          currentIndex={index}
          answers={answers}
          marked={marked}
          visited={visited}
          setIndex={i => {
            setIndex(i);
            setIsSidebarOpen(false);
          }}
          onFinish={() => {
            setIsSidebarOpen(false);
            handleSubmit(false);
          }}
        />
      </div>

      <ExamHeader
        testId={testId}
        timer={timers[sectionBlock]}
        activeSubject={activeSubject}
        subjects={currentSubjects}
        onSubjectChange={s => {
          setActiveSubject(s);
          setIndex(0);
        }}
        onMoveToSection={handleMoveToSection}
        isBlock1={isBlock1}
        hasBlock2={hasBlock2}
        isBlock2Locked={isBlock2Locked}   // ✅ header uses this to show lock icon / disable button
        exitApp={exitApp}
      />

      <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
        <span className="text-[11px] text-gray-500 font-semibold">
          Q{index + 1} of {currentSubjectQs.length} &nbsp;·&nbsp; {activeSubject}
        </span>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-1 text-[11px] font-bold text-[#337ab7] border border-[#337ab7] px-2 py-1"
        >
          <Menu className="w-3.5 h-3.5" />
          Questions
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <QuestionDisplay
            question={q}
            index={index}
            currentAnswer={q.chosenOption}
            setAnswer={val => updateChosenOption(q.questionId, val)}
            activeSubject={activeSubject}
            totalQuestions={currentSubjectQs.length}
          />

          <ExamFooter
            onBack={() => setIndex(Math.max(0, index - 1))}
            onNext={() => setIndex(Math.min(currentSubjectQs.length - 1, index + 1))}
            onMark={handleMark}
            onClear={handleClear}
            isFirst={index === 0}
            isMarked={!!(q?.questionId && marked[q.questionId])}
          />
        </main>

        <aside className="w-80 border-l hidden lg:flex lg:flex-col">
          <QuestionSidebar
            questions={currentSubjectQs}
            currentIndex={index}
            answers={answers}
            marked={marked}
            visited={visited}
            setIndex={setIndex}
            onFinish={() => handleSubmit(false)}
          />
        </aside>
      </div>
    </div>
  );
}