import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    api.get("/tests").then(res => setTests(res.data));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>Student Dashboard</h1>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>

      <hr />

      <h2>Available Tests</h2>

      {tests.length === 0 && <p>No tests available</p>}

      <ul>
        {tests.map(t => (
          <li key={t._id}>
            {t.title}{" "}
            <button
              onClick={() =>
                (window.location.href = `/student/test/${t._id}`)
              }
            >
              Start Test
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
