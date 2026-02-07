// auth/PublicRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { user } = useAuth();

  // If already logged in → redirect to home
  if (user) {
    if (user.role === "SUPER_ADMIN") return <Navigate to="/super" replace />;
    if (user.role === "INSTITUTE_ADMIN") return <Navigate to="/institute-admin" replace />;
    if (user.role === "TEACHER") return <Navigate to="/admin" replace />;
    if (user.role === "STUDENT") return <Navigate to="/student" replace />;
  }

  return children;
}
