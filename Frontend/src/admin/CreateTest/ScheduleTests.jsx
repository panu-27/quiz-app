import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw, Calendar, Clock, Users,
  Loader2, CheckCircle2, X, AlertCircle, Search,
  FlaskConical, BookOpen, Zap, ToggleLeft, ToggleRight
} from "lucide-react";

export default function ScheduleTests() {
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  const today   = useMemo(() => new Date().toISOString().split("T")[0], []);

  const [tests,      setTests]      = useState([]);
  const [batches,    setBatches]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);

  const [form, setForm] = useState({
    batchIds:    [],
    scheduled:   false,   // toggle
    startDate:   "",
    startTime:   "",
    endDate:     "",
    endTime:     "",
  });

  /* ── fetch ── */
  useEffect(() => {
    const load = async () => {
      try {
        const token   = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [tRes, bRes] = await Promise.all([
          fetch(`${baseURL}/teacher/get-crafted`, { headers }),
          fetch(`${baseURL}/teacher/my-batches`,  { headers }),
        ]);
        const tData = await tRes.json();
        const bData = await bRes.json();
        setTests(Array.isArray(tData) ? tData : tData.tests || []);
        setBatches(Array.isArray(bData) ? bData : bData.batches || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [baseURL]);

  const filtered = tests.filter(t =>
    t.title?.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (test) => {
    setSelected(test);
    setForm({ batchIds: [], scheduled: false, startDate: "", startTime: "", endDate: "", endTime: "" });
    setSuccess(false);
    setError(null);
  };

  const toggleBatch = (id) =>
    setForm(f => ({
      ...f,
      batchIds: f.batchIds.includes(id) ? f.batchIds.filter(b => b !== id) : [...f.batchIds, id],
    }));

  const handleSchedule = async () => {
    if (!form.batchIds.length) return setError("Select at least one batch.");

    // Validate: if scheduled toggle ON, start date is required
    if (form.scheduled && !form.startDate) return setError("Start date is required when scheduling.");

    setError(null);
    setSubmitting(true);

    let startTime, endTime;

    if (form.scheduled) {
      // User picked a time
      startTime = new Date(`${form.startDate}T${form.startTime || "00:00"}`);
      endTime   = form.endDate
        ? new Date(`${form.endDate}T${form.endTime || "23:59"}`)
        : new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    } else {
      // Immediate: now → now + 4 hours
      startTime = new Date();
      endTime   = new Date(startTime.getTime() + 4 * 60 * 60 * 1000);
    }

    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${baseURL}/teacher/schedule`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          testId:    selected._id,
          batchIds:  form.batchIds,
          startTime: startTime.toISOString(),
          endTime:   endTime.toISOString(),
        }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { setSelected(null); setSuccess(false); }, 1800);
      } else {
        const e = await res.json();
        setError(e.message || "Failed to schedule.");
      }
    } catch { setError("Network error. Try again."); }
    finally { setSubmitting(false); }
  };

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—";

  const examBadge = (type = "") => {
    const map = {
      PCM:   "bg-violet-100 text-violet-700",
      PCB:   "bg-emerald-100 text-emerald-700",
      JEE:   "bg-blue-100 text-blue-700",
      NEET:  "bg-amber-100 text-amber-700",
      OTHER: "bg-slate-100 text-slate-600",
    };
    return map[type] || map.OTHER;
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] font-sans pb-20">

      {/* ══ HEADER ══ */}
      <div className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Teacher Dashboard</p>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Reinitialize a Test</h1>
          </div>
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[11px] font-bold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* ══ CONTENT ══ */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 pt-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 size={32} className="animate-spin text-violet-400" />
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fetching tests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <FlaskConical size={36} className="text-slate-200" />
            <p className="text-[13px] font-black text-slate-400 uppercase tracking-wide">
              {search ? `No tests match "${search}"` : "No crafted tests found"}
            </p>
            <p className="text-[11px] text-slate-300 font-semibold">Create a Craft Test first to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((test) => (
              <div key={test._id}
                className="bg-white rounded-[1.75rem] border border-slate-100 hover:border-violet-200 hover:shadow-lg transition-all overflow-hidden group flex flex-col">
                <div className="h-1 w-full bg-gradient-to-r from-violet-500 to-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-5 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${examBadge(test.examType)}`}>
                      {test.examType || "Custom"}
                    </span>
                    <BookOpen size={14} className="text-slate-200 group-hover:text-violet-300 transition-colors shrink-0" />
                  </div>
                  <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-tight leading-snug line-clamp-2">
                    {test.title}
                  </h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-auto">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock size={10} />
                      <span className="text-[9px] font-bold">{test.duration ?? "—"} min</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Calendar size={10} />
                      <span className="text-[9px] font-bold">{fmtDate(test.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-[8px] font-mono text-slate-300 truncate">ID: {test._id}</p>
                </div>
                <div className="px-5 pb-5">
                  <button
                    onClick={() => openModal(test)}
                    className="w-full py-2.5 flex items-center justify-center gap-2 bg-slate-900 hover:bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-sm"
                  >
                    <RefreshCw size={12} /> Reinitialize
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ MODAL ══ */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">

            {/* header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-black text-violet-500 uppercase tracking-widest mb-0.5">Reinitialize Test</p>
                <h2 className="text-[15px] font-black text-slate-900 uppercase tracking-tight leading-snug line-clamp-2">
                  {selected.title}
                </h2>
              </div>
              <button onClick={() => setSelected(null)} className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-xl transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">

              {/* Batches */}
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Users size={10} /> Select Batches
                </p>
                {batches.length === 0 ? (
                  <p className="text-[10px] text-slate-400">No batches found.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {batches.map(b => {
                      const sel = form.batchIds.includes(b._id);
                      return (
                        <button key={b._id} onClick={() => toggleBatch(b._id)}
                          className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all border
                            ${sel ? "bg-violet-600 text-white border-transparent shadow" : "bg-slate-50 text-slate-500 border-slate-100 hover:border-violet-200"}`}>
                          {b.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Schedule Toggle ── */}
              <div className={`rounded-2xl border-2 transition-all duration-300 overflow-hidden ${form.scheduled ? "border-orange-200 bg-orange-50/40" : "border-slate-100 bg-slate-50/50"}`}>
                
                {/* Toggle row */}
                <button
                  onClick={() => setForm(f => ({ ...f, scheduled: !f.scheduled, startDate: "", startTime: "", endDate: "", endTime: "" }))}
                  className="w-full flex items-center justify-between px-4 py-3.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Calendar size={14} className={form.scheduled ? "text-orange-500" : "text-slate-400"} />
                    <div className="text-left">
                      <p className={`text-[10px] font-black uppercase tracking-widest ${form.scheduled ? "text-orange-600" : "text-slate-600"}`}>
                        Schedule for Later
                      </p>
                      <p className="text-[8px] font-semibold text-slate-400 mt-0.5">
                        {form.scheduled ? "Set a custom start & end time" : "Will go live immediately (4 hr window)"}
                      </p>
                    </div>
                  </div>
                  {form.scheduled
                    ? <ToggleRight size={26} className="text-orange-500 shrink-0" />
                    : <ToggleLeft  size={26} className="text-slate-300 shrink-0" />
                  }
                </button>

                {/* Expandable date pickers */}
                {form.scheduled && (
                  <div className="px-4 pb-4 space-y-3 border-t border-orange-100">

                    {/* Start — compulsory */}
                    <div className="pt-3">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Start Time <span className="text-rose-400">*</span>
                      </p>
                      <div className="flex gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner">
                        <input
                          type="date"
                          min={today}
                          value={form.startDate}
                          onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                          className="flex-1 bg-transparent text-[10px] font-black outline-none cursor-pointer"
                        />
                        <div className="w-px bg-slate-100 self-stretch" />
                        <input
                          type="time"
                          value={form.startTime}
                          onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                          className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* End — optional */}
                    <div>
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse inline-block" /> End Time
                        <span className="text-slate-300 normal-case font-semibold tracking-normal">(optional)</span>
                      </p>
                      <div className="flex gap-2 bg-white p-2.5 rounded-xl border border-slate-200 shadow-inner">
                        <input
                          type="date"
                          min={form.startDate || today}
                          value={form.endDate}
                          onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                          className="flex-1 bg-transparent text-[10px] font-black outline-none cursor-pointer"
                        />
                        <div className="w-px bg-slate-100 self-stretch" />
                        <input
                          type="time"
                          value={form.endTime}
                          onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                          className="bg-transparent text-[10px] font-black outline-none cursor-pointer"
                        />
                      </div>
                      <p className="text-[8px] text-slate-400 font-semibold mt-1.5 ml-0.5">
                        If blank, end = start + 4 hours
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Immediate hint when toggle is OFF */}
              {!form.scheduled && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                  <Zap size={11} className="text-violet-400 shrink-0" />
                  <p className="text-[9px] font-bold text-slate-500">
                    Goes live <span className="text-violet-600">immediately</span> — window closes in 4 hours from now
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2.5">
                  <AlertCircle size={12} className="text-rose-500 shrink-0" />
                  <p className="text-[10px] font-bold text-rose-600">{error}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">Scheduled successfully!</p>
                </div>
              )}
            </div>

            {/* footer */}
            <div className="px-6 pb-6 pt-3 border-t border-slate-50">
              <button
                onClick={handleSchedule}
                disabled={submitting || success}
                className="w-full py-3.5 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-violet-100 disabled:opacity-50 active:scale-95 transition-all"
              >
                {submitting ? <Loader2 size={14} className="animate-spin" /> : success ? <CheckCircle2 size={14} /> : <Zap size={14} />}
                {submitting ? "Scheduling..." : success ? "Done!" : form.scheduled ? "Confirm & Schedule" : "Go Live Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
      `}} />
    </div>
  );
}