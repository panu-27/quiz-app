import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.name}</p>

      <button onClick={logout}>Logout</button>
    </div>
  );
}
