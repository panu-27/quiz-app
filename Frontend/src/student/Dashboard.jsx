import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Student Dashboard</h1>
      <p>Welcome, {user.name}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
