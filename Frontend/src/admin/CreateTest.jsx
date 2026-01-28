import { useEffect, useState } from "react";
import api from "../api/axios";

export default function CreateTest() {
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [topics, setTopics] = useState([]);

  const [subjectId, setSubjectId] = useState("");
  const [chapterIds, setChapterIds] = useState([]);
  const [topicIds, setTopicIds] = useState([]);

  const [title, setTitle] = useState("");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [duration, setDuration] = useState(30);

  useEffect(() => {
    api.get("/subjects").then(res => setSubjects(res.data));
  }, []);

  const handleSubjectChange = async (id) => {
    setSubjectId(id);
    setChapterIds([]);
    setTopicIds([]);
    setTopics([]);

    const res = await api.get(`/chapters/subject/${id}`);
    setChapters(res.data);
  };

  const handleChapterToggle = async (id) => {
    let updated;
    if (chapterIds.includes(id)) {
      updated = chapterIds.filter(c => c !== id);
    } else {
      updated = [...chapterIds, id];
    }
    setChapterIds(updated);

    const topicRes = await api.get(`/topics/chapter/${id}`);
    setTopics(prev => [...prev, ...topicRes.data]);
  };

  const handleTopicToggle = (id) => {
    setTopicIds(prev =>
      prev.includes(id)
        ? prev.filter(t => t !== id)
        : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    await api.post("/tests", {
      title,
      subjectIds: [subjectId],
      chapterIds,
      topicIds,
      totalQuestions,
      duration,
      useCetWeightage: true
    });

    alert("Test created successfully");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Create Test</h2>

      <input
        placeholder="Test Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      <h3>Subject</h3>
      <select onChange={e => handleSubjectChange(e.target.value)}>
        <option value="">Select subject</option>
        {subjects.map(s => (
          <option key={s._id} value={s._id}>{s.name}</option>
        ))}
      </select>

      <h3>Chapters</h3>
      {chapters.map(c => (
        <div key={c._id}>
          <input
            type="checkbox"
            onChange={() => handleChapterToggle(c._id)}
          />
          {c.name}
        </div>
      ))}

      <h3>Topics</h3>
      {topics.map(t => (
        <div key={t._id}>
          <input
            type="checkbox"
            onChange={() => handleTopicToggle(t._id)}
          />
          {t.name}
        </div>
      ))}

      <h3>Settings</h3>
      <input
        type="number"
        placeholder="Total Questions"
        value={totalQuestions}
        onChange={e => setTotalQuestions(Number(e.target.value))}
      />
      <input
        type="number"
        placeholder="Duration (minutes)"
        value={duration}
        onChange={e => setDuration(Number(e.target.value))}
      />

      <br /><br />
      <button onClick={handleSubmit}>Create Test</button>
    </div>
  );
}
