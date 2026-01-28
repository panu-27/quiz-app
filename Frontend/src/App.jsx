import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./admin/Dashboard";
import StudentDashboard from "./student/Dashboard";

function RedirectAfterLogin() {
  const { user } = useAuth();

  if (!user) return <Login />;

  return user.role === "admin"
    ? <Navigate to="/admin" />
    : <Navigate to="/student" />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RedirectAfterLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
