import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    api.get("/subjects").then(res => setSubjects(res.data));
  }, []);

  const fetchChapters = async (subjectId) => {
    setSelectedSubject(subjectId);
    setSelectedChapter(null);
    setTopics([]);

    const res = await api.get(`/chapters/subject/${subjectId}`);
    setChapters(res.data);
  };

  const fetchTopics = async (chapterId) => {
    setSelectedChapter(chapterId);
    const res = await api.get(`/topics/chapter/${chapterId}`);
    setTopics(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome, {user.name}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/admin/create-test")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Test
          </button>
          <button
            onClick={logout}
            className="border px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Subjects */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Subjects</h2>
          <div className="space-y-2">
            {subjects.map(s => (
              <button
                key={s._id}
                onClick={() => fetchChapters(s._id)}
                className={`w-full text-left px-3 py-2 rounded-lg border
                  ${selectedSubject === s._id
                    ? "bg-blue-50 border-blue-400"
                    : "hover:bg-gray-50"
                  }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chapters */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Chapters</h2>

          {chapters.length === 0 && (
            <p className="text-sm text-gray-400">
              Select a subject to view chapters
            </p>
          )}

          <div className="space-y-2">
            {chapters.map(c => (
              <button
                key={c._id}
                onClick={() => fetchTopics(c._id)}
                className={`w-full text-left px-3 py-2 rounded-lg border
                  ${selectedChapter === c._id
                    ? "bg-green-50 border-green-400"
                    : "hover:bg-gray-50"
                  }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Topics */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="font-semibold mb-3">Topics</h2>

          {topics.length === 0 && (
            <p className="text-sm text-gray-400">
              Select a chapter to view topics
            </p>
          )}

          <ul className="space-y-1">
            {topics.map(t => (
              <li
                key={t._id}
                className="px-3 py-2 rounded-lg bg-gray-50 border"
              >
                {t.name}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
