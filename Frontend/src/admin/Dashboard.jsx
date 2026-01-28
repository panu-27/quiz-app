import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

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
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
      <button onClick={() => window.location.href = "/admin/create-test"}>
        Create Test
      </button>

      <hr />

      <h2>Subjects</h2>
      <ul>
        {subjects.map(s => (
          <li key={s._id}>
            <button onClick={() => fetchChapters(s._id)}>
              {s.name}
            </button>
          </li>
        ))}
      </ul>

      {chapters.length > 0 && (
        <>
          <h2>Chapters</h2>
          <ul>
            {chapters.map(c => (
              <li key={c._id}>
                <button onClick={() => fetchTopics(c._id)}>
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {topics.length > 0 && (
        <>
          <h2>Topics</h2>
          <ul>
            {topics.map(t => (
              <li key={t._id}>{t.name}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
