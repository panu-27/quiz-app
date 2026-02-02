import { useState, useEffect, useMemo } from "react";
import api from "./api/axios";
import { 
  AcademicCapIcon, CheckBadgeIcon, TicketIcon, 
  TrashIcon, XMarkIcon, PlusIcon, MagnifyingGlassIcon,
  UserMinusIcon, ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

export default function InstituteAdmin() {
  const [activeTab, setActiveTab] = useState("BATCHES");
  const [data, setData] = useState({ batches: [], teachers: [], pendingStudents: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & Drawer States
  const [viewingBatch, setViewingBatch] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState("");
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);

  // --- NEW: THEMED CONFIRMATION STATE ---
  const [confirmConfig, setConfirmConfig] = useState({ 
    show: false, 
    title: "", 
    message: "", 
    onConfirm: null 
  });

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [b, t, s] = await Promise.all([
        api.get("/institute/batches"),
        api.get("/institute/teachers"),
        api.get("/institute/pending-requests")
      ]);
      setData({ batches: b.data, teachers: t.data, pendingStudents: s.data });
    } catch (err) { console.error("SYNC_ERROR", err); }
    finally { setLoading(false); }
  };

  // --- SEARCH LOGIC ---
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "BATCHES") return data.batches.filter(b => b.name.toLowerCase().includes(q));
    if (activeTab === "TEACHERS") return data.teachers.filter(t => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q));
    if (activeTab === "APPROVALS") return data.pendingStudents.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    return [];
  }, [searchQuery, data, activeTab]);

  const filteredRoster = useMemo(() => {
    return roster.filter(s => 
      s.name.toLowerCase().includes(rosterSearch.toLowerCase()) || 
      s.email.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  }, [roster, rosterSearch]);

  // --- WRAPPER FOR POPUP ---
  const triggerDeleteConfirm = (type, id) => {
    setConfirmConfig({
      show: true,
      title: `Delete ${type}`,
      message: `This action is permanent. Are you sure you want to remove this ${type}?`,
      onConfirm: () => handleDelete(type, id)
    });
  };

  const triggerRemoveStudentConfirm = (studentId, studentName) => {
    setConfirmConfig({
      show: true,
      title: "Remove Student",
      message: `Are you sure you want to remove ${studentName} from this batch?`,
      onConfirm: () => handleRemoveStudent(studentId)
    });
  };

  // --- ACTION HANDLERS ---
  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/institute/${type}/${id}`);
      setConfirmConfig({ ...confirmConfig, show: false });
      fetchDashboardData();
    } catch (err) { alert("DELETE_FAILED"); }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await api.post("/institute/remove-student-batch", { batchId: viewingBatch._id, studentId });
      setRoster(prev => prev.filter(s => s._id !== studentId));
      setConfirmConfig({ ...confirmConfig, show: false });
      fetchDashboardData(); 
    } catch (err) { alert("REMOVAL_FAILED"); }
  };

  const handleCreateTeacher = async (e) => {
    e.preventDefault();
    try {
      await api.post("/institute/create-teacher", {
        name: e.target.name.value,
        email: e.target.email.value,
        password: e.target.password.value
      });
      setShowCreateTeacher(false);
      fetchDashboardData();
    } catch (err) { alert("TEACHER_CREATION_FAILED"); }
  };

  const handleOpenRoster = async (batch) => {
    setViewingBatch(batch);
    setRosterSearch("");
    try {
      const res = await api.get(`/institute/batch/${batch._id}/students`);
      setRoster(res.data);
    } catch (err) { alert("COULD_NOT_LOAD_ROSTER"); }
  };

  const handleTeacherToggle = async (teacherId, batchId, isAssigned) => {
    const endpoint = isAssigned ? "/institute/remove-teacher-batch" : "/institute/assign-teacher";
    try {
      await api.post(endpoint, { batchId, teacherId });
      fetchDashboardData();
    } catch (err) { alert("ASSIGNMENT_ERROR"); }
  };

  const handleApprove = async (studentId) => {
    const batchId = document.getElementById(`batch-select-${studentId}`).value;
    if (!batchId) return alert("Select a batch first!");
    try {
      await api.post("/institute/approve-assign", { studentId, batchId });
      fetchDashboardData();
    } catch (err) { alert("APPROVAL_FAILED"); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-24 md:pb-0">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-blue-600 italic tracking-tighter">NEXUS_SYSTEM</h1>
            <div className="flex gap-2 md:hidden">
              <button onClick={() => setShowCreateBatch(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TicketIcon className="w-5 h-5"/></button>
              <button onClick={() => setShowCreateTeacher(true)} className="p-2 bg-blue-600 text-white rounded-lg"><PlusIcon className="w-5 h-5"/></button>
            </div>
          </div>
          <div className="flex flex-1 max-w-xl relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder={`Search ${activeTab}...`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
          </div>
          <div className="hidden md:flex gap-3">
             <button onClick={() => setShowCreateBatch(true)} className="px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all">+ New Batch</button>
             <button onClick={() => setShowCreateTeacher(true)} className="px-4 py-2 text-sm font-bold bg-blue-600 text-white shadow-lg shadow-blue-200 rounded-xl hover:bg-blue-700 transition-all">+ Add Faculty</button>
          </div>
        </div>
      </header>

      {/* TABS */}
      <nav className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto bg-white md:bg-transparent border-t md:border-none border-slate-200 p-2 z-50">
        <div className="max-w-xs md:max-w-7xl mx-auto flex justify-around md:justify-start md:gap-8">
          {["BATCHES", "TEACHERS", "APPROVALS"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col md:flex-row items-center gap-1 md:gap-2 py-2 px-4 rounded-xl transition-all ${activeTab === tab ? "text-blue-600 bg-blue-50 md:bg-white md:shadow-sm" : "text-slate-400"}`}>
              {tab === "BATCHES" && <TicketIcon className="w-5 h-5"/>}
              {tab === "TEACHERS" && <AcademicCapIcon className="w-5 h-5"/>}
              {tab === "APPROVALS" && <CheckBadgeIcon className="w-5 h-5"/>}
              <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">{tab}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT GRID */}
      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {loading ? <div className="text-center py-20 animate-pulse text-blue-600 font-bold">SYNCHRONIZING...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "BATCHES" && filteredData.map(batch => (
              <div key={batch._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-bold truncate">{batch.name}</h3>
                  <button onClick={() => triggerDeleteConfirm("batch", batch._id)} className="text-slate-300 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                </div>
                <div className="flex flex-wrap gap-1 mb-6">
                  {batch.teachers?.length > 0 ? batch.teachers.map(t => (
                    <span key={t._id} className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-lg font-bold uppercase">{t.name}</span>
                  )) : <span className="text-[10px] text-slate-300 italic">No Faculty Assigned</span>}
                </div>
                <button onClick={() => handleOpenRoster(batch)} className="w-full bg-slate-900 text-white py-3 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Manage Roster</button>
              </div>
            ))}

            {activeTab === "TEACHERS" && filteredData.map(teacher => (
              <div key={teacher._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{teacher.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{teacher.email}</p>
                  </div>
                  <button onClick={() => triggerDeleteConfirm("teacher", teacher._id)} className="text-slate-200 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Batch Allocation</p>
                  <div className="flex flex-wrap gap-2">
                    {data.batches.map(b => {
                      const isMe = b.teachers?.some(t => t._id === teacher._id);
                      return (
                        <button key={b._id} onClick={() => handleTeacherToggle(teacher._id, b._id, isMe)} className={`text-[10px] px-3 py-1.5 rounded-lg font-bold transition-all border ${isMe ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:border-blue-200"}`}>
                          {b.name} {isMe && "✓"}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}

            {activeTab === "APPROVALS" && filteredData.map(student => (
              <div key={student._id} className="bg-white p-5 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col gap-4">
                <div>
                  <p className="font-bold text-slate-800">{student.name}</p>
                  <p className="text-xs text-slate-400">{student.email}</p>
                </div>
                <div className="flex gap-2">
                  <select id={`batch-select-${student._id}`} className="flex-1 bg-slate-100 border-none rounded-xl text-xs font-bold p-2 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select Batch</option>
                    {data.batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                  <button onClick={() => handleApprove(student._id)} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tighter">Authorize</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ROSTER DRAWER */}
      {viewingBatch && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingBatch(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 bg-blue-600 text-white">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold uppercase tracking-tighter">{viewingBatch.name}</h2>
                <XMarkIcon className="w-6 h-6 cursor-pointer" onClick={() => setViewingBatch(null)} />
              </div>
              <input type="text" placeholder="Filter roster..." value={rosterSearch} onChange={(e) => setRosterSearch(e.target.value)} className="w-full bg-blue-700/50 border-none rounded-xl px-4 py-2 text-sm text-white placeholder:text-blue-300 outline-none" />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {filteredRoster.map(s => (
                <div key={s._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-blue-100">
                  <div><p className="text-sm font-bold">{s.name}</p><p className="text-[10px] text-slate-400">{s.email}</p></div>
                  <button onClick={() => triggerRemoveStudentConfirm(s._id, s.name)} className="p-2 text-slate-300 hover:text-red-500"><UserMinusIcon className="w-5 h-5" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: SYSTEM-WIDE CONFIRMATION POPUP --- */}
      {confirmConfig.show && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">{confirmConfig.title}</h2>
            <p className="text-sm text-slate-500 leading-relaxed mb-8">{confirmConfig.message}</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setConfirmConfig({ ...confirmConfig, show: false })}
                className="py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                Go Back
              </button>
              <button 
                onClick={confirmConfig.onConfirm}
                className="bg-red-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-red-100 hover:bg-red-600 transition-all"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TEACHER MODAL */}
      {showCreateTeacher && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTeacher} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <h2 className="text-xl font-bold mb-6">Register Faculty</h2>
            <div className="space-y-4 mb-6">
              <input name="name" placeholder="Full Name" required className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="email" type="email" placeholder="Email" required className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
              <input name="password" type="password" placeholder="Password" required className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg">Initialize Account</button>
            <button type="button" onClick={() => setShowCreateTeacher(false)} className="w-full mt-4 text-xs font-bold text-slate-400 uppercase">Cancel</button>
          </form>
        </div>
      )}

      {/* CREATE BATCH MODAL */}
      {showCreateBatch && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={async (e) => { e.preventDefault(); await api.post("/institute/create-batch", { name: e.target.name.value }); setShowCreateBatch(false); fetchDashboardData(); }} className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl">
            <h2 className="text-xl font-bold mb-6">Create New Batch</h2>
            <input name="name" placeholder="Batch Name" required className="w-full bg-slate-100 border-none rounded-2xl p-4 text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500" />
            <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Generate Batch</button>
            <button type="button" onClick={() => setShowCreateBatch(false)} className="w-full mt-4 text-xs font-bold text-slate-400 uppercase">Cancel</button>
          </form>
        </div>
      )}

    </div>
  );
}