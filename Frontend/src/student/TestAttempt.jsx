import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import QuestionDisplay from "./TestEnvironment/QuestionDisplay";
import ExamHeader from "./TestEnvironment/ExamHeader";
import QuestionSidebar from "./TestEnvironment/QuestionSidebar";
import ExamFooter from "./TestEnvironment/ExamFooter";
import ModalComponent from "./TestEnvironment/ModalComponent";
import ExamLobby from "./TestEnvironment/ExamLobby";
import ViolationModal from "./TestEnvironment/ViolationModal";
import { useViolations } from "./TestEnvironment/ViolationContext";
import { Menu, Lock } from "lucide-react";
import useBackButton from "../hooks/useBackButton";

/*
  BLOCK / SECTION LOCKING RULES
  • While block1 timer > 0  → block2 sections are LOCKED
  • Once activeBlock moves to 1 → block1 sections are LOCKED (no going back)
*/

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate   = useNavigate();
  const { getViolations, addViolation, clearViolations, MAX_VIOLATIONS } = useViolations();

  /* ── Core Data ── */
  const [blocks,        setBlocks]        = useState([]);
  const [activeBlock,   setActiveBlock]   = useState(0);
  const [activeSubject, setActiveSubject] = useState(null);
  const [qIndex,        setQIndex]        = useState(0);

  /* ── App State ── */
  const [examStarted,   setExamStarted]   = useState(false);
  const [isLoading,     setIsLoading]     = useState(false);   // loading after "I'm ready"
  const [hasSubmitted,  setHasSubmitted]  = useState(false);
  const [testTitle,     setTestTitle]     = useState("Assessment");
  const [startError,    setStartError]    = useState(null);
  const [modal,         setModal]         = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  /* ── Timers ── */
  const [timers,       setTimers]       = useState([0, 0]);
  const timersRef      = useRef([0, 0]);
  const initialTimers  = useRef([0, 0]);

  /* ── Per-question state ── */
  const [marked,  setMarked]  = useState({});
  const [visited, setVisited] = useState({});

  /* ── Violation state ── */
  const [violationModal,    setViolationModal]    = useState(null);
  const violationBlockedRef = useRef(false);
  const examActiveRef       = useRef(false);
  const hasSubmittedRef     = useRef(false);
  const submitLock          = useRef(false);

  /* refs that timer tick reads without stale closure */
  const activeBlockRef = useRef(activeBlock);
  const blocksRef      = useRef(blocks);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Detect if running inside Electron desktop app
  const isElectron = typeof window !== 'undefined' && !!window.electron?.isElectron;

  /* ── Hardware Back Button Interceptors ── */
  
  // 1. Base page guard: If exam is active, intercept back to show exit confirmation
  useBackButton(() => {
    if (!examStarted || hasSubmitted) return false;
    exitApp();
    return true;
  }, examStarted && !hasSubmitted);

  // 2. Sidebar overlay
  useBackButton(() => {
    setIsSidebarOpen(false);
    return true;
  }, isSidebarOpen);

  // 3. General Modal (acts as Cancel)
  useBackButton(() => {
    if (modal?.onCancel) modal.onCancel();
    else setModal(null);
    return true;
  }, !!modal);

  // 4. Violation Modal
  useBackButton(() => {
    dismissViolationModal();
    return true;
  }, !!violationModal);

  /* ── Fullscreen helpers (web only — Electron uses kiosk) ── */
  const enterFullscreen = useCallback(() => {
    if (isElectron) return; // Electron handles via kiosk
    const el = document.documentElement;
    try {
      if (el.requestFullscreen)            el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch (e) { console.error("Fullscreen error", e); }
  }, [isElectron]);

  const exitFullscreen = useCallback(() => {
    if (isElectron) return;
    try {
      if (document.fullscreenElement) {
        if (document.exitFullscreen)            document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      }
    } catch (e) { console.error("Fullscreen error", e); }
  }, [isElectron]);

  /* keep refs in sync */
  useEffect(() => { examActiveRef.current   = examStarted;  }, [examStarted]);
  useEffect(() => { hasSubmittedRef.current = hasSubmitted; }, [hasSubmitted]);
  useEffect(() => { activeBlockRef.current  = activeBlock;  }, [activeBlock]);
  useEffect(() => { blocksRef.current       = blocks;       }, [blocks]);

  /* ═══════════════════════════════════════════════════════════════
     1. DATA HYDRATION — only fires when user clicks "I am ready to begin"
        enterFullscreen() calls this
     ═══════════════════════════════════════════════════════════════ */
  const startExam = useCallback(async () => {
    setIsLoading(true);
    setStartError(null);
    try {
      const res = await api.post(`/student/attempt/start/${testId}`);
      const { blocks: incoming, testTitle: title, blockTimers } = res.data;

      setBlocks(incoming);
      setTestTitle(title || "Assessment");

      const t = incoming.map((b, i) => {
        const key = `block${i + 1}`;
        return blockTimers?.[key] ?? (b.duration || 0) * 60;
      });

      setTimers(t);
      timersRef.current    = [...t];
      initialTimers.current = [...t];

      // Resume in block2 if block1 already expired (page reload mid-exam)
      if (t[0] === 0 && (t[1] ?? 0) > 0 && incoming.length > 1) {
        setActiveBlock(1);
        const sub = incoming[1]?.sections?.[0]?.subjectName;
        if (sub) setActiveSubject(sub);
      } else {
        const sub = incoming[0]?.sections?.[0]?.subjectName;
        if (sub) setActiveSubject(sub);
      }

      setExamStarted(true);
      // Engage lock — Electron kiosk OR web fullscreen
      if (isElectron) window.electron.examStarted();
      else enterFullscreen();
    } catch (err) {
      const msg = err.response?.data?.message || "Unable to start test. Please try again.";
      setStartError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [testId, isElectron, enterFullscreen]);

  /* ═══════════════════════════════════════════════════════════════
     2. DERIVED STATE
     ═══════════════════════════════════════════════════════════════ */
  const currentSubjectQs = useMemo(() => {
    const block = blocks[activeBlock];
    if (!block || !activeSubject) return [];
    return block.sections.find(s => s.subjectName === activeSubject)?.questions ?? [];
  }, [blocks, activeBlock, activeSubject]);

  // Build answers map from questions that have a valid chosenOption
  const answers = useMemo(() => {
    const map = {};
    currentSubjectQs.forEach(q => {
      const c = q.chosenOption;
      if (c !== undefined && c !== null && c !== -1 && !isNaN(Number(c))) {
        map[q.questionId] = c;
      }
    });
    return map;
  }, [currentSubjectQs]);

  const currentQ = currentSubjectQs[qIndex] ?? null;

  const hasBlock2      = blocks.length > 1;
  const isBlock2Locked = hasBlock2 && (timers[0] ?? 0) > 0;
  const isBlock1Locked = activeBlock === 1;

  const block1Subjects = blocks[0]?.sections?.map(s => s.subjectName) ?? [];
  const block2Subjects = hasBlock2 ? (blocks[1]?.sections?.map(s => s.subjectName) ?? []) : [];

  /* ═══════════════════════════════════════════════════════════════
     3. VISITED TRACKING
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (currentQ?.questionId) {
      setVisited(prev => ({ ...prev, [currentQ.questionId]: true }));
    }
  }, [currentQ?.questionId]);

  /* ═══════════════════════════════════════════════════════════════
     4. DEEP STATE UPDATER
     ═══════════════════════════════════════════════════════════════ */
  const updateChosenOption = useCallback((questionId, optionIndex) => {
    setBlocks(prev =>
      prev.map(block => ({
        ...block,
        sections: block.sections.map(section => ({
          ...section,
          questions: section.questions.map(q =>
            q.questionId === questionId ? { ...q, chosenOption: optionIndex } : q
          ),
        })),
      }))
    );
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     5. MARK & CLEAR
     Fixed: mark toggles mark state only (no auto-advance for unmark)
            mark for review always advances to next question
            unmark stays on current question
     ═══════════════════════════════════════════════════════════════ */
  const handleMark = useCallback(() => {
    if (!currentQ?.questionId) return;
    const id = currentQ.questionId;
    const isCurrentlyMarked = !!marked[id];

    if (isCurrentlyMarked) {
      // Unmark — just toggle, stay on current question
      setMarked(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      // Mark for review — toggle and advance to next
      setMarked(prev => ({ ...prev, [id]: true }));
      setQIndex(prev => Math.min(currentSubjectQs.length - 1, prev + 1));
    }
  }, [currentQ, currentSubjectQs.length, marked]);

  const handleClear = useCallback(() => {
    if (!currentQ?.questionId) return;
    updateChosenOption(currentQ.questionId, -1);
  }, [currentQ, updateChosenOption]);

  /* ═══════════════════════════════════════════════════════════════
     6. NAVIGATION — with lock guards
     ═══════════════════════════════════════════════════════════════ */
  const navigateToSubject = useCallback((blockIndex, subjectName) => {
    if (blockIndex === 0 && isBlock1Locked) {
      setModal({
        type: "error",
        title: "Section 1 Locked",
        message: "You have already moved to Section 2. Section 1 is now locked.",
        onConfirm: () => setModal(null),
        onCancel:  () => setModal(null),
      });
      return;
    }
    if (blockIndex === 1 && isBlock2Locked) {
      setModal({
        type: "error",
        title: "Section 2 Locked",
        message: "Section 2 is locked until Section 1 time expires.",
        onConfirm: () => setModal(null),
        onCancel:  () => setModal(null),
      });
      return;
    }
    setActiveBlock(blockIndex);
    setActiveSubject(subjectName);
    setQIndex(0);
  }, [isBlock1Locked, isBlock2Locked]);

  const handleMoveToBlock2 = useCallback(() => {
    if (isBlock2Locked) {
      setModal({
        type: "error",
        title: "Section 2 Locked",
        message: "You cannot move to Section 2 until Section 1 time expires.",
        onConfirm: () => setModal(null),
        onCancel:  () => setModal(null),
      });
      return;
    }
    setModal({
      type: "confirm",
      title: "Move to Section 2?",
      message: "You will move to Section 2. You CANNOT return to Section 1 after this.",
      onConfirm: () => {
        setActiveBlock(1);
        const sub = blocks[1]?.sections?.[0]?.subjectName;
        if (sub) setActiveSubject(sub);
        setQIndex(0);
        setModal(null);
      },
      onCancel: () => setModal(null),
    });
  }, [blocks, isBlock2Locked]);

  /* ═══════════════════════════════════════════════════════════════
     7. BUILD ANSWERS PAYLOAD
     ═══════════════════════════════════════════════════════════════ */
  const buildPayload = useCallback((blocksData) => {
    const out = [];
    blocksData.forEach(b =>
      b.sections.forEach(s =>
        s.questions.forEach(q => {
          const c = q.chosenOption;
          out.push({
            questionId: q.questionId,
            selectedOption: (c === undefined || c === null || isNaN(Number(c)) || c === -1) ? -1 : c,
          });
        })
      )
    );
    return out;
  }, []);

  /* ═══════════════════════════════════════════════════════════════
     8. AUTOSAVE (every 30s)
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!examStarted || hasSubmitted) return;
    const id = setInterval(async () => {
      try {
        await api.post(`/student/submit/${testId}`, {
          answers: buildPayload(blocksRef.current),
          timeTaken: 0,
          isFinal: false,
        });
        console.log("[AUTOSAVE]", new Date().toLocaleTimeString());
      } catch (err) {
        console.error("[AUTOSAVE FAILED]", err.response?.data || err.message);
      }
    }, 300_000);
    return () => clearInterval(id);
  }, [examStarted, hasSubmitted, testId, buildPayload]);

  /* ═══════════════════════════════════════════════════════════════
     9. SUBMISSION
     ═══════════════════════════════════════════════════════════════ */
  const performSubmit = useCallback(async (silent = false) => {
    if (submitLock.current) return;
    submitLock.current = true;

    const allotted  = initialTimers.current.reduce((a, v) => a + v, 0);
    const remaining = timersRef.current.reduce((a, v) => a + v, 0);
    const timeTaken = Math.max(allotted - remaining, 0);

    try {
      await api.post(`/student/submit/${testId}`, {
        answers: buildPayload(blocksRef.current),
        timeTaken,
        isFinal: true,
      });
      setHasSubmitted(true);
      clearViolations(testId);
      // Release lock — Electron kiosk OR web fullscreen
      if (isElectron) window.electron.examFinished();
      else exitFullscreen();
      if (!silent) {
        setModal({
          type: "score",
          title: "Exam Completed",
          message: "Your responses have been secured.",
          onConfirm: () => navigate("/student"),
          onCancel:  () => navigate("/student"),
        });
      } else {
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
          onCancel:  () => setModal(null),
        });
      }
    }
  }, [testId, navigate, clearViolations, buildPayload, isElectron, exitFullscreen]);

  const handleSubmit = useCallback((isAuto = false) => {
    if (submitLock.current) return;
    if (isAuto) { performSubmit(true); return; }
    setModal({
      type: "confirm",
      title: "End Test?",
      message: "Are you sure you want to submit? You cannot change answers after submission.",
      onConfirm: () => performSubmit(false),
      onCancel:  () => setModal(null),
    });
  }, [performSubmit]);

  /* ═══════════════════════════════════════════════════════════════
     10. TIMER
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!examStarted || hasSubmitted) return;
    const id = setInterval(() => {
      setTimers(prev => {
        const cur = activeBlockRef.current;
        if ((prev[cur] ?? 0) <= 0) return prev;
        const next = [...prev];
        next[cur] = prev[cur] - 1;
        timersRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [examStarted, hasSubmitted]);

  /* React to a block timer hitting 0 */
  useEffect(() => {
    if (!examStarted || hasSubmitted) return;
    const t = timers[activeBlock];
    if (t !== 0) return;

    if (activeBlock === 0 && hasBlock2 && (timers[1] ?? 0) > 0) {
      console.log("[TIMER] Block1 expired → moving to Block2");
      setActiveBlock(1);
      const sub = blocksRef.current[1]?.sections?.[0]?.subjectName;
      if (sub) setActiveSubject(sub);
      setQIndex(0);
    } else if (activeBlock === 1 || !hasBlock2) {
      console.log("[TIMER] All blocks expired → auto-submit");
      handleSubmit(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timers, activeBlock]);

  /* ═══════════════════════════════════════════════════════════════
     11. VIOLATION DETECTION
     ═══════════════════════════════════════════════════════════════ */
  const handleViolation = useCallback((type = 'tab_switch') => {
    if (!examActiveRef.current)      return;
    if (hasSubmittedRef.current)     return;
    if (violationBlockedRef.current) return;
    if (submitLock.current)          return;

    violationBlockedRef.current = true;
    const currentCount = getViolations(testId).count;
    const newCount = currentCount + 1;
    addViolation(testId, type);
    console.log(`[VIOLATION] #${newCount} — ${type}`);

    if (newCount > MAX_VIOLATIONS) {
      console.log("[VIOLATION] MAX exceeded → auto-submit");
      handleSubmit(true);
      violationBlockedRef.current = false;
      return;
    }
    setViolationModal({ type, count: newCount });
  }, [testId, getViolations, addViolation, MAX_VIOLATIONS, handleSubmit]);

  /* ═══════════════════════════════════════════════════════════════
     11b. ELECTRON VIOLATION BRIDGE
     Subscribe to violations triggered by the Electron main process
     (window blur, close attempt) — these bypass web event listeners
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (!isElectron || !examStarted || hasSubmitted) return;
    const unsub = window.electron.onViolation((type) => {
      handleViolation(type);
    });
    return () => unsub?.();
  }, [isElectron, examStarted, hasSubmitted, handleViolation]);

  /* ═══════════════════════════════════════════════════════════════
     11c. FULLSCREEN LOCK (web only)
     • Block Escape and F11 keys during exam so student can't exit fullscreen
     • If fullscreenchange fires and we're no longer fullscreen, re-enter
     ═══════════════════════════════════════════════════════════════ */
  useEffect(() => {
    if (isElectron || !examStarted || hasSubmitted) return;

    const blockEscapeF11 = (e) => {
      if (e.key === 'Escape' || e.key === 'F11') {
        e.preventDefault();
        e.stopPropagation();
        // Re-enter fullscreen in case browser already exited
        enterFullscreen();
      }
    };

    const onFullscreenChange = () => {
      // If exam is active and fullscreen was exited by any means, force back in
      if (!document.fullscreenElement && !hasSubmittedRef.current && examActiveRef.current) {
        enterFullscreen();
      }
    };

    document.addEventListener('keydown', blockEscapeF11, true); // capture phase
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    return () => {
      document.removeEventListener('keydown', blockEscapeF11, true);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
  }, [isElectron, examStarted, hasSubmitted, enterFullscreen]);

  const dismissViolationModal = useCallback(() => {
    setViolationModal(null);
    setTimeout(() => { violationBlockedRef.current = false; }, 600);
  }, []);

  useEffect(() => {
    if (!examStarted || hasSubmitted) return;
    const onVis  = () => { if (document.visibilityState === 'hidden') handleViolation('visibility'); };
    // In Electron, window blur is handled via IPC (avoids double-counting)
    const onBlur = isElectron ? null : () => { setTimeout(() => { if (!document.hasFocus()) handleViolation('window_blur'); }, 200); };
    const onCtx  = (e) => { e.preventDefault(); handleViolation('right_click'); };
    const onCP   = (e) => { e.preventDefault(); handleViolation('copy_paste'); };
    const onKey  = (e) => {
      const banned = [
        e.key === 'PrintScreen',
        e.key === 'F12',
        (e.ctrlKey || e.metaKey) && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase()),
        (e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U',
        e.altKey && e.key === 'Tab',
      ];
      if (banned.some(Boolean)) { e.preventDefault(); handleViolation('devtools'); }
    };
    document.addEventListener('visibilitychange', onVis);
    if (onBlur) window.addEventListener('blur', onBlur);
    document.addEventListener('contextmenu', onCtx);
    ['copy','cut','paste'].forEach(ev => document.addEventListener(ev, onCP));
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      if (onBlur) window.removeEventListener('blur', onBlur);
      document.removeEventListener('contextmenu', onCtx);
      ['copy','cut','paste'].forEach(ev => document.removeEventListener(ev, onCP));
      document.removeEventListener('keydown', onKey);
    };
  }, [examStarted, hasSubmitted, handleViolation]);

  /* ═══════════════════════════════════════════════════════════════
     12. EXIT
     ═══════════════════════════════════════════════════════════════ */
  const exitApp = useCallback(() => {
    setModal({
      type: "confirm",
      title: "Exit Exam?",
      message: "Exiting will submit your current responses. Are you sure?",
      onConfirm: () => {
        setModal(null);
        performSubmit(true); // submit → releases fullscreen → navigates to /student
      },
      onCancel: () => setModal(null),
    });
  }, [performSubmit]);

  /* ─────────────────────────────────────────────────────────────────
     EARLY RETURNS
     ───────────────────────────────────────────────────────────────── */
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

  // Show lobby until user clicks "I am ready to begin"
  if (!examStarted) {
    return (
      <ExamLobby
        testTitle={testTitle}
        userName={user?.name}
        enterFullscreen={startExam}     // ← API fires HERE, not on mount
        isLoading={isLoading}
        exitApp={() => navigate("/student")}
      />
    );
  }

  // Loading spinner while API is in flight after clicking ready
  if (isLoading || blocks.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="w-8 h-8 border-4 border-[#337ab7] border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading your exam…</p>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 font-sans text-sm">
        Loading Questions…
      </div>
    );
  }

  /* ─────────────────────────────────────────────────────────────────
     SUBJECT TABS BAR
     ───────────────────────────────────────────────────────────────── */
  const currentViolationData = getViolations(testId);
  /* ─────────────────────────────────────────────────────────────────
     MAIN RENDER
     ───────────────────────────────────────────────────────────────── */
  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">

      {/* Violation modal */}
      {violationModal && (
        <ViolationModal
          violationCount={violationModal.count}
          maxViolations={MAX_VIOLATIONS}
          violationType={violationModal.type}
          onDismiss={dismissViolationModal}
        />
      )}

      {/* General modal */}
      {modal && <ModalComponent data={modal} />}

      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed top-0 right-0 h-full z-[200] transform transition-transform duration-300 lg:hidden
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <QuestionSidebar
          questions={currentSubjectQs}
          currentIndex={qIndex}
          answers={answers}
          marked={marked}
          visited={visited}
          setIndex={i => { setQIndex(i); setIsSidebarOpen(false); }}
          onFinish={() => { setIsSidebarOpen(false); handleSubmit(false); }}
          violationCount={currentViolationData.count}
          maxViolations={MAX_VIOLATIONS}
        />
      </div>

      {/* ── Header: dark bar with timer + subject tabs in ONE row ── */}
      <ExamHeader
        testId={testId}
        timer={timers[activeBlock]}
        onMoveToSection={handleMoveToBlock2}
        isBlock1={activeBlock === 0}
        hasBlock2={hasBlock2}
        isBlock2Locked={isBlock2Locked}
        exitApp={exitApp}
        // subject tab props for desktop single-row
        block1Subjects={block1Subjects}
        block2Subjects={block2Subjects}
        activeBlock={activeBlock}
        activeSubject={activeSubject}
        isBlock1Locked={isBlock1Locked}
        navigateToSubject={navigateToSubject}
        answeredCount={Object.keys(answers).length}
        totalCount={currentSubjectQs.length}
        violationCount={currentViolationData.count}
        maxViolations={MAX_VIOLATIONS}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        qIndex={qIndex}
        setQIndex={setQIndex}
        currentSubjectQsLength={currentSubjectQs.length}
      />

      {/* ── Main content ── */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col overflow-hidden">
          <QuestionDisplay
            question={currentQ}
            index={qIndex}
            currentAnswer={currentQ.chosenOption}
            setAnswer={val => updateChosenOption(currentQ.questionId, val)}
            activeSubject={activeSubject}
            totalQuestions={currentSubjectQs.length}
          />
          <ExamFooter
            onBack={() => setQIndex(prev => Math.max(0, prev - 1))}
            onNext={() => setQIndex(prev => Math.min(currentSubjectQs.length - 1, prev + 1))}
            onMark={handleMark}
            onClear={handleClear}
            isFirst={qIndex === 0}
            isMarked={!!(currentQ?.questionId && marked[currentQ.questionId])}
          />
        </main>

        {/* Desktop sidebar */}
        <aside className="hidden lg:flex lg:flex-col" style={{ width: 280, borderLeft: '1px solid #e5e7eb' }}>
          <QuestionSidebar
            questions={currentSubjectQs}
            currentIndex={qIndex}
            answers={answers}
            marked={marked}
            visited={visited}
            setIndex={setQIndex}
            onFinish={() => handleSubmit(false)}
            violationCount={currentViolationData.count}
            maxViolations={MAX_VIOLATIONS}
          />
        </aside>
      </div>
    </div>
  );
}