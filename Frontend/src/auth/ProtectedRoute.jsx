import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();

  // not logged in → login
  if (!user) return <Navigate to="/login" replace />;

  // logged in but wrong role → login (or unauthorized page later)
  if (role && user.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
