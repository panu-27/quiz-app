import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function TestAttempt() {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    api.post(`/attempt/start/${testId}`).then(res => {
      setQuestions(res.data);
    });
  }, [testId]);

  const handleSelect = (qId, optIndex) => {
    setAnswers(prev => ({ ...prev, [qId]: optIndex }));
  };

  const handleSubmit = async () => {
    const payload = {
      timeTaken: 0,
      answers: Object.entries(answers).map(([qId, opt]) => ({
        questionId: qId,
        selectedOption: opt
      }))
    };

    const res = await api.post(`/submit/${testId}`, payload);
    alert(`Test submitted! Score: ${res.data.score}`);
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Test</h2>

      {questions.map((q, i) => (
        <div key={q._id} style={{ marginBottom: 20 }}>
          <p>
            <b>{i + 1}. {q.questionText}</b>
          </p>

          {q.options.map((opt, idx) => (
            <div key={idx}>
              <input
                type="radio"
                name={q._id}
                onChange={() => handleSelect(q._id, idx)}
              />
              {opt.text}
            </div>
          ))}
        </div>
      ))}

      {questions.length > 0 && (
        <button onClick={handleSubmit}>Submit Test</button>
      )}
    </div>
  );
}
