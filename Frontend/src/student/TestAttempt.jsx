import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  ClockIcon, LockClosedIcon, SunIcon, ShieldCheckIcon, ExclamationTriangleIcon, FlagIcon,
  Bars3BottomRightIcon, XMarkIcon, ChevronLeftIcon, ChevronRightIcon
} from "@heroicons/react/24/solid";

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [marked, setMarked] = useState({});
  const [sectionBlock, setSectionBlock] = useState(null);
  const [activeSubject, setActiveSubject] = useState(null);
  const [examCompleted, setExamCompleted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [index, setIndex] = useState(0);
  const [timers, setTimers] = useState({ block1: 0, block2: 0 });
  const [violationCount, setViolationCount] = useState(0);
  const [isSecureMode, setIsSecureMode] = useState(false);
  const [modal, setModal] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // For Mobile Drawer

  const user = JSON.parse(localStorage.getItem("user"));
  const userName = user?.name || "Candidate";
  const testTitle = "Online Assessment Test";

  const block1Minutes = Math.floor(timers.block1 / 60);
  const block2Minutes = Math.floor(timers.block2 / 60);
  const totalDuration = block1Minutes + block2Minutes;
  const [examStarted, setExamStarted] = useState(false);

  /* ================= THE SECURITY ENGINE ================= */
  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
    setIsSecureMode(true);
    setExamStarted(true);
  };

  const handleViolation = useCallback((msg) => {
    setViolationCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 3) {
        setModal({
          type: "critical",
          title: "System Lock",
          message: "Maximum security violations reached. Auto-submitting test.",
          onConfirm: () => handleSubmit(true)
        });
      } else {
        setModal({
          type: "warning",
          title: `Security Violation ${newCount}/3`,
          message: msg,
          onConfirm: () => setModal(null)
        });
      }
      return newCount;
    });
  }, []);

  useEffect(() => {
    if (!isSecureMode) return;
    const blockKeys = (e) => {
      if (e.keyCode >= 112 && e.keyCode <= 123 || e.altKey || e.metaKey || (e.ctrlKey && (e.key === "t" || e.key === "n" || e.key === "w" || e.key === "u"))) {
        e.preventDefault();
        handleViolation("System shortcut blocked.");
      }
    };
    const handleFocusLoss = () => { if (!modal) handleViolation("Window focus lost (Alt+Tab or Switch)."); };
    const handleRightClick = (e) => e.preventDefault();
    const handleFSChange = () => { if (!document.fullscreenElement) setIsSecureMode(false); };
    window.addEventListener("keydown", blockKeys, true);
    window.addEventListener("blur", handleFocusLoss);
    document.addEventListener("contextmenu", handleRightClick);
    document.addEventListener("fullscreenchange", handleFSChange);
    return () => {
      window.removeEventListener("keydown", blockKeys, true);
      window.removeEventListener("blur", handleFocusLoss);
      document.removeEventListener("contextmenu", handleRightClick);
      document.removeEventListener("fullscreenchange", handleFSChange);
    };
  }, [isSecureMode, handleViolation, modal]);

  /* ================= DATA CATEGORIZATION ================= */
  const sectionalData = useMemo(() => {
    if (!questions.length) return null;
    const group = (qs) => qs.reduce((acc, q) => {
      const sName = q.subjectId?.name || "Other";
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
      if (availableSubjects.length > 0) {
        if (!activeSubject || !availableSubjects.includes(activeSubject)) {
          setActiveSubject(availableSubjects[0]);
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

  const handleNext = () => {
    if (!currentSubjectQs.length) return;
    setIndex(prev => (prev + 1) % currentSubjectQs.length);
  };

  const handleBack = () => {
    if (index > 0) setIndex(prev => prev - 1);
  };

  const handleMarkAndNext = () => {
    if (q) {
      setMarked(prev => ({ ...prev, [q._id]: !prev[q._id] }));
      handleNext();
    }
  };

  const moveToNextSection = () => {
    setModal({
      type: "confirm",
      title: "Section Switch",
      message: "Switch to Section 2? You cannot return to Section 1.",
      onConfirm: () => {
        setSectionBlock("block2");
        setActiveSubject(null);
        setIndex(0);
        setModal(null);
      },
    });
  };

  /* ================= API CALLS ================= */
  useEffect(() => {
    api.post(`/attempt/start/${testId}`)
      .then(res => {
        const { questions, sectionTimes } = res.data;
        setQuestions(questions);
        setTimers({ block1: sectionTimes.block1, block2: sectionTimes.block2 });
        setSectionBlock("block1");
      })
      .catch(() => {
        setModal({
          type: "error",
          title: "Load Error",
          message: "Failed to load test.",
          onConfirm: () => navigate("/student")
        });
      });
  }, [testId, navigate]);

  useEffect(() => {
    if (!sectionBlock || !examStarted) return;
    const interval = setInterval(() => {
      setTimers(prev => {
        if (prev[sectionBlock] <= 0) return prev;
        return { ...prev, [sectionBlock]: prev[sectionBlock] - 1 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [sectionBlock, examStarted]);

  useEffect(() => {
    if (!sectionBlock || hasSubmitted) return;
    if (timers[sectionBlock] === 0) {
      if (sectionBlock === "block1" && sectionalData?.block2?.questions?.length > 0) {
        setSectionBlock("block2");
        setActiveSubject(null);
        setIndex(0);
        return;
      }
      setHasSubmitted(true);
      handleSubmit(true);
    }
  }, [timers, sectionBlock, sectionalData, hasSubmitted]);

  const handleSubmit = async (isAuto = false) => {
    if (hasSubmitted && !isAuto) return;
    const performSubmit = async () => {
      const payload = {
        answers: Object.entries(answers).map(([qId, opt]) => ({ questionId: qId, selectedOption: opt })),
        violations: violationCount
      };
      try {
        const res = await api.post(`/submit/${testId}`, payload);
        setExamCompleted(true);
        setIsSecureMode(false);
        if (document.exitFullscreen) document.exitFullscreen();
        setModal({
          type: "score",
          title: "Exam Completed",
          message: `Your Score: ${res.data.score}`,
          onConfirm: () => {
            setIsSecureMode(false);
            if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
            if (window.electron?.forceExit) { window.electron.forceExit(); return; }
            navigate("/student");
          }
        });
      } catch { setModal({ type: "error", title: "Sync Error", message: "Submission failed." }); }
    };
    if (isAuto) performSubmit();
    else setModal({ type: "confirm", title: "Final Submission", message: "Submit test?", onConfirm: performSubmit });
  };

  /* ================= RENDER GUARDS ================= */
  if (!isSecureMode && !examCompleted) return (
    <div className="min-h-screen w-full bg-[#f9fafb] text-gray-900 font-sans flex flex-col">
      <header className="bg-white border-b px-6 md:px-10 py-4 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-gray-400">Examination</p>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">{testTitle}</h1>
        </div>
        <div className="md:text-right">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400">Candidate</p>
          <p className="text-base md:text-lg font-semibold">{userName}</p>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 md:px-10 py-6 md:py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-14">
        <section>
          <h2 className="text-lg font-bold mb-4 md:mb-6 border-b pb-2">Instructions</h2>
          <ul className="space-y-3 text-sm leading-relaxed text-gray-700 list-decimal list-inside">
            <li>Secure <b>full-screen mode</b> is mandatory.</li>
            <li>Switching apps is <b>strictly prohibited</b>.</li>
            <li>Once a section ends, it <b>auto-submits</b>.</li>
            <li>Security violations lead to <b>auto-submission</b>.</li>
          </ul>
          <div className="mt-6 md:mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
            ⚠️ <b>Warning:</b> Do not refresh or exit.
          </div>
        </section>

        <section className="hidden md:block">
          <h2 className="text-lg font-bold mb-6 border-b pb-2">Structure</h2>
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 border">Section</th>
                <th className="text-right px-4 py-2 border">Duration</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="px-4 py-3 border">Section 1</td><td className="px-4 py-3 border text-right">{block1Minutes}m</td></tr>
              <tr><td className="px-4 py-3 border">Section 2</td><td className="px-4 py-3 border text-right">{block2Minutes}m</td></tr>
            </tbody>
          </table>
        </section>
      </main>

      <footer className="border-t bg-white py-6 md:py-8 flex flex-col items-center gap-3">
        <button onClick={enterFullscreen} className="w-[80%] md:w-auto px-16 py-4 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition">
          Start Examination
        </button>
        <p className="text-[10px] text-gray-400 uppercase tracking-widest text-center px-4">Secure environment will be initialized</p>
      </footer>
    </div>
  );

  if (!sectionalData || !activeSubject || !q) return <div className="h-screen flex items-center justify-center bg-white text-zinc-400 font-mono">LOADING_SESSION...</div>;

  return (
    <div className="h-screen flex flex-col overflow-hidden font-sans select-none bg-white text-slate-900 relative">
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl text-center">
            <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${modal.type === 'warning' || modal.type === 'critical' ? 'text-red-600' : 'text-indigo-600'}`}>{modal.title}</h2>
            <p className="text-sm font-bold text-zinc-600 mb-8">{modal.message}</p>
            <div className="flex gap-3">
              {modal.type === 'confirm' && <button onClick={() => setModal(null)} className="flex-1 py-3 text-[10px] font-black uppercase border rounded-xl">Cancel</button>}
              <button onClick={modal.onConfirm} className="flex-1 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase rounded-xl">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="h-14 md:h-16 border-b flex items-center justify-between px-4 md:px-8 bg-white z-10">
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col">
            <span className="text-[8px] md:text-[10px] font-black uppercase text-indigo-500">ID</span>
            <span className="text-[10px] md:text-xs font-bold font-mono tracking-tighter uppercase">{testId.slice(-6)}</span>
          </div>
          <div className="hidden md:block h-8 w-px bg-zinc-100 mx-2"></div>
          <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest opacity-40">{sectionalData[sectionBlock].name}</span>
        </div>

        <div className="flex items-center gap-2 md:gap-8">
          {sectionBlock === "block1" && sectionalData.block2.questions.length > 0 && (
      <button 
        onClick={moveToNextSection} 
        className="px-6 py-2 border-2 border-dashed border-indigo-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:bg-indigo-50"
      >
        Switch Section
      </button>
    )}
          <div className="flex items-center gap-2 font-mono text-base md:text-xl font-black text-indigo-600 bg-indigo-50 md:bg-transparent px-3 py-1 rounded-lg">
            <ClockIcon className="w-4 h-4 md:w-5 md:h-5" />
            {Math.floor(timers[sectionBlock] / 60)}:{(timers[sectionBlock] % 60).toString().padStart(2, '0')}
          </div>
          
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-zinc-100 rounded-lg">
             <Bars3BottomRightIcon className="w-5 h-5 text-zinc-600" />
          </button>

          <button onClick={() => { if (!hasSubmitted) { setHasSubmitted(true); handleSubmit(); }}} className="hidden md:block bg-red-600 text-white px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest">Finish</button>
        </div>
      </header>

      {/* Subject Tabs */}
      <nav className="h-10 md:h-12 border-b flex px-2 md:px-8 bg-white overflow-x-auto no-scrollbar">
        {Object.keys(sectionalData[sectionBlock].subjects).map(sub => (
          <button key={sub} onClick={() => { setActiveSubject(sub); setIndex(0); }} className={`px-4 md:px-8 whitespace-nowrap text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeSubject === sub ? 'border-indigo-600 text-indigo-600' : 'border-transparent opacity-30'}`}>{sub}</button>
        ))}
      </nav>

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Question Content */}
          <div className="px-6 md:px-16 py-6 md:py-12 flex-1 overflow-y-auto w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-4 mb-6 md:mb-12">
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Question {index + 1}</span>
              <div className="h-[1px] flex-1 bg-zinc-100"></div>
            </div>
            
            <p className="text-lg md:text-2xl font-medium leading-relaxed mb-8 md:text-zinc-800">{q?.questionText}</p>
            
            <div className="grid gap-3 md:gap-4 pb-20 md:pb-0">
              {q?.options?.map((opt, i) => (
                <button key={i} onClick={() => setAnswers(prev => ({ ...prev, [q._id]: i }))} className={`flex items-center p-3 md:p-2 border cursor-pointer rounded-xl md:rounded-2xl transition-all text-left ${answers[q._id] === i ? 'border-indigo-600 bg-indigo-50/50' : 'border-zinc-100'}`}>
                  <div className={`w-5 h-5 md:w-6 md:h-6 flex items-center justify-center mr-4 md:mr-6 text-xs font-black rounded-lg ${answers[q._id] === i ? 'bg-indigo-600 text-white' : 'bg-zinc-100 text-zinc-400'}`}>{String.fromCharCode(64 + (i + 1))}</div>
                  <span className={`text-sm md:text-lg font-bold ${answers[q._id] === i ? 'text-indigo-600' : 'text-zinc-600'}`}>{opt.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions - Responsive */}
          <footer className="h-16 md:h-20 border-t flex items-center justify-between px-4 md:px-12 bg-white fixed bottom-0 left-0 right-0 md:relative">
            <button onClick={handleBack} disabled={index === 0} className="p-3 md:px-8 md:py-4 rounded-xl border border-zinc-100 disabled:opacity-0">
              <ChevronLeftIcon className="w-5 h-5 md:hidden" />
              <span className="hidden md:inline font-black text-[10px] uppercase">Previous</span>
            </button>
            
            <div className="flex gap-2 md:gap-4">
              <button onClick={handleMarkAndNext} className={`px-4 md:px-8 py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase border ${marked[q._id] ? 'bg-amber-500 text-white' : 'text-zinc-400 border-zinc-100'}`}>
                {marked[q._id] ? (window.innerWidth < 768 ? 'Unmark' : 'Unmark & Next') : (window.innerWidth < 768 ? 'Mark' : 'Mark & Next')}
              </button>
              <button onClick={handleNext} className="bg-indigo-600 text-white px-6 md:px-14 py-3 md:py-4 rounded-xl font-black text-[9px] md:text-[10px] uppercase">
                {window.innerWidth < 768 ? 'Next' : 'Save & Next'}
              </button>
            </div>
          </footer>
        </main>

        {/* Mobile Overlay */}
        {isSidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

        {/* Right Sidebar / Mobile Drawer */}
        <aside className={`
          fixed inset-y-0 right-0 w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-auto md:w-80 md:flex md:flex-col md:p-8 md:border-l md:bg-zinc-50/30
          ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
        `}>
          <div className="p-6 md:p-0 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h3 className="text-[10px] font-black uppercase text-zinc-400">Navigation</h3>
              <button onClick={() => setIsSidebarOpen(false)}><XMarkIcon className="w-6 h-6 text-zinc-400" /></button>
            </div>

            <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
              <h3 className="hidden md:block text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest">Navigator</h3>
              <div className="grid grid-cols-4 md:grid-cols-5 gap-2">
                {currentSubjectQs.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => { setIndex(i); setIsSidebarOpen(false); }}
                    className={`h-11 rounded-xl font-bold text-xs transition-all ${index === i
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : (marked[item._id] ? 'bg-amber-500 text-white' : (answers[item._id] !== undefined ? 'bg-indigo-100 text-indigo-600' : 'bg-white border border-zinc-100 text-zinc-400'))
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto space-y-3 pt-6 border-t md:border-0">
               <div className={`p-4 rounded-2xl border transition-all ${violationCount > 0 ? 'bg-red-50 border-red-100 text-red-600' : 'bg-white border-zinc-100 text-zinc-400'}`}>
                 <p className="text-[8px] font-black uppercase tracking-widest mb-1">Status</p>
                 <p className="text-xs font-bold font-mono">Violations: {violationCount} / 3</p>
               </div>
               
               <button onClick={() => { if (!hasSubmitted) { setHasSubmitted(true); handleSubmit(); }}} className="md:hidden w-full py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest">Submit Exam</button>
               
               <div className="hidden md:block text-[9px] font-mono opacity-20 text-zinc-500 uppercase leading-loose">
                 PROCTORING: ENABLED<br />LOCK: SECURE<br />SOURCE: ELECTRON_CORE
               </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}