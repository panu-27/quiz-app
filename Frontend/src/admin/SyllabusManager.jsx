import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { PlusIcon, TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BookOpen } from "lucide-react";

export default function SyllabusManager({ classes }) {
  const [syllabuses, setSyllabuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("");
  const [editingSyllabus, setEditingSyllabus] = useState(null);

  // Form states
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchSyllabuses();
  }, []);

  const fetchSyllabuses = async () => {
    setLoading(true);
    try {
      const res = await api.get("/institute/syllabus");
      setSyllabuses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectClass = (cName) => {
    setSelectedClass(cName);
    const existing = syllabuses.find(s => s.className === cName);
    if (existing) {
      setEditingSyllabus(existing);
      setSubjects(existing.subjects || []);
    } else {
      setEditingSyllabus(null);
      setSubjects([]);
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", chapters: [] }]);
  };

  const updateSubjectName = (index, name) => {
    const newSubjects = [...subjects];
    newSubjects[index].name = name;
    setSubjects(newSubjects);
  };

  const deleteSubject = (index) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const addChapter = (subjectIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters.push({ name: "" });
    setSubjects(newSubjects);
  };

  const updateChapterName = (subjectIndex, chapterIndex, name) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters[chapterIndex].name = name;
    setSubjects(newSubjects);
  };

  const deleteChapter = (subjectIndex, chapterIndex) => {
    const newSubjects = [...subjects];
    newSubjects[subjectIndex].chapters.splice(chapterIndex, 1);
    setSubjects(newSubjects);
  };

  const saveSyllabus = async () => {
    if (!selectedClass) return alert("Select a class");
    try {
      await api.post("/institute/syllabus", {
        className: selectedClass,
        subjects
      });
      alert("Syllabus saved successfully");
      fetchSyllabuses();
    } catch (err) {
      alert("Failed to save syllabus");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Syllabus Management</h2>
          <p className="text-xs text-slate-500">Configure subjects and chapters for each class</p>
        </div>
        <button
          onClick={saveSyllabus}
          disabled={!selectedClass}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 transition disabled:opacity-50"
        >
          <CheckIcon className="w-5 h-5" />
          Save Syllabus
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Class Selector */}
        <div className="md:col-span-1 border-r border-slate-100 pr-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Select Class</h3>
          <div className="space-y-2">
            {classes.length === 0 ? (
              <p className="text-sm text-slate-400">No classes found from batches.</p>
            ) : (
              classes.map(cName => (
                <button
                  key={cName}
                  onClick={() => handleSelectClass(cName)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedClass === cName 
                      ? "bg-blue-50 text-blue-700 border border-blue-200" 
                      : "text-slate-600 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  {cName}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Syllabus Editor */}
        <div className="md:col-span-3">
          {!selectedClass ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400">
              <BookOpen className="w-10 h-10 mb-2 opacity-50" />
              <p>Select a class to manage its syllabus</p>
            </div>
          ) : (
            <div className="space-y-6">
              {subjects.map((subject, sIdx) => (
                <div key={sIdx} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-50 px-4 py-3 flex gap-4 items-center border-b border-slate-200">
                    <input
                      type="text"
                      placeholder="Subject Name (e.g. Physics)"
                      value={subject.name}
                      onChange={(e) => updateSubjectName(sIdx, e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                    <button onClick={() => deleteSubject(sIdx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-md">
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="p-4 bg-white">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Chapters</h4>
                    <div className="space-y-2 mb-4">
                      {subject.chapters.map((chapter, cIdx) => (
                        <div key={cIdx} className="flex gap-2 items-center">
                          <span className="text-xs text-slate-400 font-mono">{cIdx + 1}.</span>
                          <input
                            type="text"
                            placeholder="Chapter Name"
                            value={chapter.name}
                            onChange={(e) => updateChapterName(sIdx, cIdx, e.target.value)}
                            className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
                          />
                          <button onClick={() => deleteChapter(sIdx, cIdx)} className="text-slate-400 hover:text-red-500">
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => addChapter(sIdx)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" /> Add Chapter
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={addSubject}
                className="w-full py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" /> Add Subject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
