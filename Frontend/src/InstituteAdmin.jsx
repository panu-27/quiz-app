import { useState, useEffect, useMemo } from "react";
import api from "./api/axios";
import {
  AcademicCapIcon, CheckBadgeIcon, TicketIcon,
  TrashIcon, XMarkIcon, PlusIcon, MagnifyingGlassIcon,
  UserMinusIcon, ExclamationTriangleIcon, ArrowRightOnRectangleIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function InstituteAdmin() {
  const [activeTab, setActiveTab] = useState("BATCHES");
  const [data, setData] = useState({ batches: [], teachers: [], pendingStudents: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Modal & Drawer States
  const [viewingBatch, setViewingBatch] = useState(null);
  const [roster, setRoster] = useState([]);
  const [rosterSearch, setRosterSearch] = useState("");
  const [showCreateTeacher, setShowCreateTeacher] = useState(false);
  const [showCreateBatch, setShowCreateBatch] = useState(false);
  const [batchStatus, setBatchStatus] = useState("idle");
  const [teacherStatus, setTeacherStatus] = useState("idle");
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [expandedTeacherId, setExpandedTeacherId] = useState(null);


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
    } catch (err) {
      console.error("SYNC_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  // CALCULATE TOTAL STUDENTS ACROSS ALL BATCHES
  const totalStudentsCount = useMemo(() => {
    return data.batches.reduce((acc, batch) => acc + (batch.students?.length || 0), 0);
  }, [data.batches]);

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (activeTab === "BATCHES") return data.batches.filter(b => b.name?.toLowerCase().includes(q));
    if (activeTab === "TEACHERS") return data.teachers.filter(t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q));
    if (activeTab === "APPROVALS") return data.pendingStudents.filter(s => s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q));
    return [];
  }, [searchQuery, data, activeTab]);

  const filteredRoster = useMemo(() => {
    return roster.filter(s =>
      s.name.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(rosterSearch.toLowerCase())
    );
  }, [roster, rosterSearch]);

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

  const handleDelete = async (type, id) => {
    try {
      await api.delete(`/institute/${type}/${id}`);
      setConfirmConfig(prev => ({ ...prev, show: false }));
      fetchDashboardData();
    } catch (err) { alert("DELETE_FAILED"); }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      await api.post("/institute/remove-student-batch", { batchId: viewingBatch._id, studentId });
      setRoster(prev => prev.filter(s => s._id !== studentId));
      setConfirmConfig(prev => ({ ...prev, show: false }));
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
      setTeacherStatus("success");
      fetchDashboardData();
      setTimeout(() => {
        setShowCreateTeacher(false);
        setTeacherStatus("idle");
      }, 2000);
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
    const selectEl = document.getElementById(`batch-select-${studentId}`);
    if (!selectEl || !selectEl.value) return alert("Select a batch first!");

    const batchId = selectEl.value;
    try {
      await api.post("/institute/approve-assign", { studentId, batchId });
      setData(prev => ({
        ...prev,
        pendingStudents: prev.pendingStudents.filter(s => s._id !== studentId)
      }));
      fetchDashboardData();
    } catch (err) { alert("APPROVAL_FAILED"); }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navIcons = [
    {
      key: "BATCHES",
      label: "Batches",
      icon: "/nav/batch.svg",
      bg: "bg-blue-100 text-blue-700"
    },
    {
      key: "TEACHERS",
      label: "Teachers",
      icon: "/nav/teacher.svg",
      bg: "bg-violet-100 text-violet-700"
    },
    {
      key: "APPROVALS",
      label: "Approvals",
      icon: "/nav/approval.svg",
      bg: "bg-emerald-100 text-emerald-700"
    }
  ];


  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24 md:pb-0">

      {/* HEADER */}
      <header className="sticky top-0 h-14 sm:h-18 bg-slate-50  flex items-center justify-between px-3 sm:px-10 md:px-4 xl:px-48 z-[100]">
        <a href="/" className="flex items-center">
          <img src="/icon-512.png" alt="Nexus" className="h-14 w-auto object-contain" />
        </a>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex sm:hidden gap-2">
            <button onClick={() => setShowCreateBatch(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"><TicketIcon className="w-5 h-5 text-slate-700" /></button>
            <button onClick={() => setShowCreateTeacher(true)} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100"><PlusIcon className="w-5 h-5 text-slate-700" /></button>
            <button onClick={handleLogout} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50"><ArrowRightOnRectangleIcon className="w-5 h-5 text-red-600" /></button>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <button onClick={() => setShowCreateBatch(true)} className="h-[40px] px-4 border border-slate-900 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition">+ New Batch</button>
            <button onClick={() => setShowCreateTeacher(true)} className="h-[40px] px-4 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900 transition">+ Add Faculty</button>
            <button onClick={handleLogout} className="h-[40px] px-4 border border-red-500 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition">Log out</button>
          </div>
        </div>
      </header>

      {/* TABS / NAV */}
      <nav
        className="
    fixed bottom-0 left-0 right-0 z-50
    bg-white border-t border-slate-100
    px-2 py-2
    sm:flex sm:justify-center
    md:relative md:bg-transparent md:border-none
    sm:px-18 xl:px-48 2xl:px-52
  "
      >
        <div
          className="
      max-w-7xl mx-auto
      flex items-center
      justify-between
      md:justify-start md:gap-8
      w-full
    "
        >
          {/* MAIN NAV LINKS */}
          <div
            className="
        flex w-full
        justify-between
        md:w-auto md:justify-start md:gap-2
      "
          >
            {navIcons.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
            relative
            flex flex-col md:flex-row
            items-center
            gap-1 md:gap-3
            py-2 md:py-3
            px-3 md:px-5
            rounded-2xl
            transition-all
            flex-1 md:flex-none
            ${activeTab === tab.key
                    ? `text-black ${tab.bg}`
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                  }
          `}
              >
                <img
                  src={tab.icon}
                  alt={tab.label}
                  className="w-6 h-6 bg-white rounded-full object-contain"
                />

                <span className="text-[10px] md:text-[13px] font-black uppercase tracking-widest">
                  {tab.label}
                </span>

                {/* APPROVAL BADGE */}
                {tab.key === "APPROVALS" && data.pendingStudents.length > 0 && (
                  <span
                    className="sm:hidden
                absolute -top-1 -right-1
                md:top-2 md:right-2
                h-5 w-5
                flex items-center justify-center
                rounded-full
                bg-red-500 text-white
                text-[10px] font-bold
                shadow-sm animate-pulse
              "
                  >
                    {data.pendingStudents.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* DESKTOP STATS (UNCHANGED) */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
            {/* TOTAL STUDENTS */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-14 h-14 bg-green-300 rounded-full flex items-center justify-center border border-slate-100 hover:bg-green-200 transition">
                <img src="/nav/batch.svg" className="w-7 h-7 opacity-70" alt="Students" />
                <div className="absolute -top-1 -right-1 bg-black border-2 border-white text-blue-600 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-sm">
                  {totalStudentsCount}
                </div>
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Learners
              </span>
            </div>

            {/* REQUESTS */}
            <button
              onClick={() => setActiveTab("APPROVALS")}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all ${data.pendingStudents.length > 0
                  ? "bg-yellow-400 border-2 border-red-100 animate-pulse"
                  : "bg-red-300 border border-slate-100"
                  }`}
              >
                <img src="/nav/approval.svg" className="w-7 h-7" alt="Approvals" />
                <div
                  className={`absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shadow-md border-2 ${data.pendingStudents.length > 0
                    ? "bg-red-600 text-white border-white"
                    : "bg-white text-slate-400 border-slate-50"
                    }`}
                >
                  {data.pendingStudents.length}
                </div>
              </div>
              <span
                className={`text-[9px] font-black uppercase tracking-[0.15em] ${data.pendingStudents.length > 0
                  ? "text-red-500"
                  : "text-slate-400"
                  }`}
              >
                Requests
              </span>
            </button>
          </div>
        </div>
      </nav>


      {/* SEARCH */}
      <div className="max-w-7xl mx-auto px-4 sm:px-18 xl:px-48 2xl:px-18 mt-6">
        <div className="relative group">
          {/* Clean, minimalist magnifying glass */}
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />

          <input
            type="text"
            placeholder={`Search ${activeTab.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-12 py-3 border border-slate-300 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all bg-white"
          />
        </div>
      </div>

      {/* MAIN LIST */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 sm:px-18 md:px-16 xl:px-48 2xl:px-18">
        {loading ? (
          <div className="text-center py-20 font-bold text-slate-300 animate-pulse tracking-widest text-xs md:text-sm">SYNCHRONIZING...</div>
        ) : (
          <div className="bg-transparent  sm:bg-white sm:border sm:border-slate-200 rounded-xl overflow-hidden sm:shadow-sm">
            <div className="hidden md:grid grid-cols-12 bg-slate-50 border-b border-slate-200 px-6 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="col-span-4 text-red-600 italic">INDEXING</div>
              <div className="col-span-5 text-green-500 italic">ALLOCATION</div>
              <div className="col-span-3 text-right text-pink-400 italic">ACTIONS</div>
            </div>

            <div className="divide-y divide-slate-100">
              {activeTab === "BATCHES" &&
                filteredData.map((batch) => (
                  <div
                    key={batch._id}
                    className="
        group
        rounded-2xl
        border border-slate-200
        bg-white
        p-4
        space-y-3
        hover:shadow-sm
        transition
        mb-2
        md:mb-0
        md:rounded-none
        md:border-0
        md:bg-transparent
        md:shadow-none
        md:p-0
        md:space-y-0
        md:grid md:grid-cols-12
        md:px-6 md:py-4
        md:items-center
        md:hover:bg-green-50/30
      "
                  >
                    {/* LEFT : NAME */}
                    <div className="md:col-span-4">
                      <p className="font-bold text-slate-800 text-base md:text-sm tracking-tight">
                        {batch.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
                        ID: {batch._id.slice(-8)}
                      </p>
                    </div>

                    {/* MIDDLE : TEACHERS */}
                    <div className="md:col-span-5 flex flex-wrap gap-1">
                      {batch.teachers?.length > 0 ? (
                        batch.teachers.map((t) => (
                          <span
                            key={t._id}
                            className="
                bg-slate-100
                text-slate-600
                text-[10px]
                px-2 py-1
                rounded-lg
                border border-slate-200
                font-bold uppercase
              "
                          >
                            {t.name}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-900 italic">
                          No faculty assigned
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div
                      className="
          flex items-center justify-between
          pt-3 mt-2
          border-t border-slate-100

          md:col-span-3
          md:mt-0 md:pt-0
          md:border-none
          md:justify-end
          md:gap-4
        "
                    >
                      <button
                        onClick={() => handleOpenRoster(batch)}
                        className="
            flex items-center gap-1.5
            text-[11px]
            font-bold
            uppercase tracking-tight
            text-emerald-700
            hover:text-emerald-800
            transition
          "
                      >
                        Manage
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => triggerDeleteConfirm("batch", batch._id)}
                        className="
            p-2
            rounded-lg
            text-slate-300
            hover:text-red-500
            hover:bg-red-50
            transition
          "
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}


              {activeTab === "TEACHERS" &&
                filteredData.map((teacher) => {
                  const isExpanded = expandedTeacherId === teacher._id;

                  return (
                    <div
                      key={teacher._id}
                      className="
          rounded-2xl border border-slate-200 bg-white p-4
          space-y-3 transition
          mb-2
          md:mb-0
          md:rounded-none md:border-0 md:bg-transparent
          md:p-0 md:space-y-0
          md:grid md:grid-cols-12 md:px-6 md:py-4
          md:items-center md:hover:bg-slate-50
        "
                    >
                      {/* LEFT : TEACHER INFO */}
                      <div className="md:col-span-4">
                        <p className="font-bold text-slate-800 text-base md:text-sm">
                          {teacher.name}
                        </p>
                        <p className="text-[11px] text-slate-400 break-all">
                          {teacher.email}
                        </p>
                      </div>

                      {/* DESKTOP : BATCH TOGGLES (UNCHANGED) */}
                      <div className="hidden md:flex md:col-span-5 flex-wrap gap-1.5">
                        {data.batches.map((b) => {
                          const isMe = b.teachers?.some(
                            (t) => t._id === teacher._id
                          );
                          return (
                            <button
                              key={b._id}
                              onClick={() =>
                                handleTeacherToggle(teacher._id, b._id, isMe)
                              }
                              className={`text-[9px] px-2.5 py-1 rounded-lg font-bold border transition-all
                  ${isMe
                                  ? "bg-green-600 border-green-600 text-white"
                                  : "bg-white text-slate-400 border-slate-200"
                                }`}
                            >
                              {b.name}
                            </button>
                          );
                        })}
                      </div>

                      {/* ACTIONS */}
                      <div className="md:col-span-3 flex justify-between md:justify-end items-center">
                        {/* MOBILE : MANAGE BUTTON */}
                        <button
                          onClick={() =>
                            setExpandedTeacherId(
                              isExpanded ? null : teacher._id
                            )
                          }
                          className="
              md:hidden
              text-xs font-bold uppercase tracking-widest
              text-blue-600
            "
                        >
                          {isExpanded ? "Hide Batches" : "Manage Batches"}
                        </button>

                        <button
                          onClick={() =>
                            triggerDeleteConfirm("teacher", teacher._id)
                          }
                          className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition"
                        >
                          <TrashIcon className="w-5 h-5 md:w-4 md:h-4" />
                        </button>
                      </div>

                      {/* MOBILE : EXPANDED BATCH TOGGLES */}
                      {isExpanded && (
                        <div className="md:hidden pt-3 border-t border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">
                            Assign Batches
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {data.batches.map((b) => {
                              const isMe = b.teachers?.some(
                                (t) => t._id === teacher._id
                              );
                              return (
                                <button
                                  key={b._id}
                                  onClick={() =>
                                    handleTeacherToggle(
                                      teacher._id,
                                      b._id,
                                      isMe
                                    )
                                  }
                                  className={`text-[10px] px-3 py-1.5 rounded-lg font-bold border transition-all
                      ${isMe
                                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                      : "bg-white text-slate-400 border-slate-200"
                                    }`}
                                >
                                  {b.name}
                                  {isMe && " ✓"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}


              {activeTab === "APPROVALS" &&
                filteredData.map((student) => (
                  <div
                    key={student._id}
                    className="
        bg-white border border-slate-200 rounded-2xl p-4
        space-y-4 transition
        mb-2 md:mb-0
        md:space-y-0 md:rounded-none md:border-0 md:bg-transparent
        md:grid md:grid-cols-12 md:px-8 md:py-5
        md:hover:bg-emerald-50/30
      "
                  >
                    {/* STUDENT INFO */}
                    <div className="md:col-span-4">
                      <p className="font-bold text-slate-900 text-base md:text-sm">
                        {student.name}
                      </p>
                      <p className="text-[11px] text-emerald-600 font-medium break-all">
                        {student.email}
                      </p>
                    </div>

                    {/* BATCH SELECT */}
                    <div className="md:col-span-5">
                      <label className="md:hidden block text-[10px] font-bold text-slate-400 uppercase mb-1">
                        Assign Batch
                      </label>

                      <select
                        id={`batch-select-${student._id}`}
                        className="
            w-full
            bg-slate-50 border border-slate-200
            rounded-xl
            px-3 py-3 md:py-2
            text-xs font-bold
            outline-none
            focus:ring-2 focus:ring-emerald-400
            md:max-w-[200px]
          "
                      >
                        <option value="">Choose Batch...</option>
                        {data.batches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ACTION */}
                    <div className="md:col-span-3 flex md:justify-end">
                      <button
                        onClick={() => handleApprove(student._id)}
                        className="
            w-full md:w-auto
            bg-emerald-500 text-white
            px-6 py-3 md:py-2.5
            rounded-xl
            text-[11px] font-black uppercase tracking-widest
            shadow-md shadow-emerald-100
            hover:bg-slate-900 transition-all
          "
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                ))}

            </div>
          </div>
        )}
      </main>

      {/* --- CONFIRMATION MODAL --- */}
      {confirmConfig.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setConfirmConfig({ ...confirmConfig, show: false })} />
          <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{confirmConfig.title}</h3>
            <p className="text-sm text-slate-500 mt-2">{confirmConfig.message}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmConfig({ ...confirmConfig, show: false })} className="flex-1 py-2.5 rounded-xl text-slate-500 font-bold text-xs uppercase bg-slate-100 hover:bg-slate-200 transition-colors">Cancel</button>
              <button onClick={confirmConfig.onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-700 transition-colors">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE BATCH MODAL --- */}
      {showCreateBatch && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowCreateBatch(false)}
          />

          {/* Modal */}
          <div
            className="
        relative
        bg-gradient-to-br from-sky-50 via-blue-50 to-white
        rounded-t-3xl md:rounded-2xl
        max-w-sm w-full
        shadow-2xl
        max-h-[90vh]
        overflow-y-auto
        p-6 pb-24 md:p-8
      "
          >
            {batchStatus === "success" ? (
              /* SUCCESS STATE */
              <div className="py-12 flex flex-col items-center text-center">
                <div
                  className="
              w-20 h-20 rounded-full
              flex items-center justify-center mb-5
              bg-gradient-to-br from-sky-400 via-blue-400 to-indigo-400
              shadow-lg shadow-blue-200
            "
                >
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">
                  Batch Added
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Ready to enroll students
                </p>
              </div>
            ) : (
              /* FORM */
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    await api.post("/institute/create-batch", {
                      name: e.target.batchName.value,
                    });
                    setBatchStatus("success");
                    fetchDashboardData();
                    setTimeout(() => {
                      setShowCreateBatch(false);
                      setBatchStatus("idle");
                    }, 2000);
                  } catch {
                    alert("FAILED");
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
                    <img src="/nav/batch.svg" className="w-6 h-6" alt="Batch" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Initialize Batch
                  </h3>
                </div>

                {/* Input */}
                <input
                  name="batchName"
                  required
                  placeholder="Batch Name"
                  className="
              w-full bg-white
              border border-slate-200
              rounded-xl px-4 py-4
              text-sm
              outline-none
              focus:ring-2 focus:ring-blue-500
            "
                />

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-10">
                  <button
                    type="button"
                    onClick={() => setShowCreateBatch(false)}
                    className="
                py-4
                text-slate-900
                text-xs font-bold uppercase
                hover:text-slate-600
                bg-blue-300 rounded-xl
                transition
              "
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="
                py-4
                bg-slate-900 text-white
                rounded-xl
                text-xs font-bold uppercase
                hover:bg-slate-800
                transition
              "
                  >
                    Create
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* --- ADD FACULTY MODAL --- */}
      {showCreateTeacher && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowCreateTeacher(false)}
          />

          {/* Modal */}
          <div
            className="
        relative
        bg-gradient-to-br from-amber-50 via-orange-50 to-white
        rounded-t-3xl md:rounded-2xl
        max-w-md w-full
        shadow-2xl
        max-h-[90vh]
        overflow-y-auto
        p-6 pb-24 md:p-8
      "
          >
            {teacherStatus === "success" ? (
              /* SUCCESS STATE */
              <div className="py-12 flex flex-col items-center text-center">
                <div
                  className="
              w-20 h-20 rounded-full
              flex items-center justify-center mb-5
              bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400
              shadow-lg shadow-emerald-200
            "
                >
                  <CheckIcon className="w-10 h-10 text-white" />
                </div>

                <h3 className="text-xl font-black uppercase tracking-wider text-slate-800">
                  Faculty Added
                </h3>

                <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Account Ready
                </p>
              </div>
            ) : (
              /* FORM */
              <form onSubmit={handleCreateTeacher}>
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <img src="/nav/teacher.svg" className="w-6 h-6" alt="Teacher" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Register Faculty
                  </h3>
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <input
                    name="name"
                    required
                    placeholder="Professor Name"
                    className="
                w-full bg-white
                border border-slate-200
                rounded-xl px-4 py-4
                text-sm
                outline-none
                focus:ring-2 focus:ring-slate-900
              "
                  />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email Address"
                    className="
                w-full bg-white
                border border-slate-200
                rounded-xl px-4 py-4
                text-sm
                outline-none
                focus:ring-2 focus:ring-slate-900
              "
                  />

                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Password"
                    className="
                w-full bg-white
                border border-slate-200
                rounded-xl px-4 py-4
                text-sm
                outline-none
                focus:ring-2 focus:ring-slate-900
              "
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mt-10">
                  <button
                    type="button"
                    onClick={() => setShowCreateTeacher(false)}
                    className="
                py-4
                text-slate-900
                text-xs font-bold uppercase
                hover:text-slate-600
                bg-amber-300 rounded-xl
                transition
              "
                  >
                    Discard
                  </button>

                  <button
                    type="submit"
                    className="
                py-4
                bg-slate-900 text-white
                rounded-xl
                text-xs font-bold uppercase
                hover:bg-slate-800
                transition
              "
                  >
                    Add Faculty
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}



      {/* --- ROSTER DRAWER --- */}
      {viewingBatch && (
        <div className="fixed inset-0 z-[180] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setViewingBatch(null)}
          />

          {/* Drawer */}
          <div
            className="
        relative w-full max-w-md h-full
        bg-white shadow-xl
        flex flex-col
        animate-in slide-in-from-right duration-300
      "
          >
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    {viewingBatch.name}
                    <span
                      className="
                  bg-blue-50 text-blue-600
                  text-[10px] px-2 py-0.5
                  rounded-full font-semibold
                "
                    >
                      {roster.length} Students
                    </span>
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Batch student List
                  </p>
                </div>

                <button
                  onClick={() => setViewingBatch(null)}
                  className="
              p-2 rounded-full
              hover:bg-slate-100
              transition
            "
                >
                  <XMarkIcon className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <div className="px-6 py-4">
              <div className="relative">
                <MagnifyingGlassIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2
                       w-4 h-4 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search students"
                  value={rosterSearch}
                  onChange={(e) => setRosterSearch(e.target.value)}
                  className="
              w-full rounded-xl
              bg-slate-100
              py-2.5 pl-10 pr-4
              text-sm text-slate-700
              placeholder:text-slate-400
              outline-none
              focus:ring-2 focus:ring-blue-500/30
            "
                />
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
              {filteredRoster.map((student) => (
                <div
                  key={student._id}
                  className="
              flex items-center justify-between
              p-4 rounded-xl
              bg-white
              border border-slate-100
              hover:bg-slate-50
              transition
            "
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {student.email}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      triggerRemoveStudentConfirm(student._id, student.name)
                    }
                    className="
                p-2 rounded-lg
                text-slate-300
                hover:text-red-500
                hover:bg-red-50
                transition
              "
                    title="Remove student"
                  >
                    <UserMinusIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* EMPTY STATES */}
              {filteredRoster.length === 0 && (
                <div className="py-12 text-center">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {roster.length === 0
                      ? "No students in this batch yet"
                      : "No matching students"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {showMobileStats && (
        <div className="fixed inset-0 z-[200] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setShowMobileStats(false)}
          />

          {/* Bottom Sheet */}
          <div
            className="
        absolute bottom-0 left-0 right-0
        bg-white
        rounded-t-[32px]
        px-6 pt-6 pb-8
        shadow-2xl
        animate-in slide-in-from-bottom duration-300
      "
          >
            {/* Drag Handle */}
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-800 text-center mb-8">
              Nexus Overview
            </h3>

            {/* STATS GRID */}
            <div className="grid grid-cols-2 gap-4">

              {/* TOTAL STUDENTS */}
              <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <img src="/nav/batch.svg" className="w-6 h-6" alt="Students" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-blue-600 leading-none">
                    {totalStudentsCount}
                  </p>
                </div>
              </div>

              {/* ACTIVE FACULTY */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <img src="/nav/teacher.svg" className="w-6 h-6" alt="Faculty" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Active Faculty
                  </p>
                  <p className="text-3xl font-bold text-slate-800 leading-none">
                    {data.teachers.length}
                  </p>
                </div>
              </div>

              {/* APPROVALS CARD */}
              <div
                onClick={() => {
                  setActiveTab("APPROVALS");
                  setShowMobileStats(false);
                }}
                className={`
            col-span-2
            p-6 rounded-[28px]
            border
            flex items-center justify-between
            transition-all active:scale-95
            ${data.pendingStudents.length > 0
                    ? "bg-red-50 border-red-100 ring-4 ring-red-50/50"
                    : "bg-slate-50 border-slate-100"}
          `}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`
                w-12 h-12 rounded-2xl
                flex items-center justify-center
                shadow-sm
                ${data.pendingStudents.length > 0 ? "bg-white" : "bg-slate-100"}
              `}
                  >
                    <img src="/nav/approval.svg" className="w-7 h-7" alt="Approvals" />
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                      Requests
                    </p>
                    <p
                      className={`text-2xl font-bold leading-none ${data.pendingStudents.length > 0
                        ? "text-red-600"
                        : "text-slate-400"
                        }`}
                    >
                      {data.pendingStudents.length}{" "}
                      <span className="text-[10px] font-semibold uppercase">
                        Pending
                      </span>
                    </p>
                  </div>
                </div>

                <div
                  className={`p-2 rounded-full ${data.pendingStudents.length > 0
                    ? "text-red-500 animate-pulse"
                    : "text-slate-300"
                    }`}
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* DISMISS */}
            <button
              onClick={() => setShowMobileStats(false)}
              className="
          w-full mt-10 py-4
          bg-slate-800 text-white
          rounded-2xl
          text-xs font-semibold uppercase tracking-widest
          hover:bg-slate-900
          transition
        "
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

    </div>
  );
}