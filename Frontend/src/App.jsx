import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";
import AdminDashboard from "./admin/Dashboard";
import StudentDashboard from "./student/Dashboard";
import CreateTest from "./admin/CreateTest/CreateTest";
import TestAttempt from "./student/TestAttempt";
import SubjectPage from "./student/SubjectPage";
import TestHistory from "./pages/TestHistory";
function RedirectAfterLogin() {
  const { user } = useAuth();
  if (!user) return <Login />;
  return user.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/student" />;
}

export default function App() {
  const [startupLoading, setStartupLoading] = useState(true);

  useEffect(() => {
    // Initial App Startup Branding - runs only once
    const timer = setTimeout(() => {
      setStartupLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (startupLoading) {
    return (
      <div className="h-screen w-screen bg-white flex flex-col items-center justify-center font-sans">
        <div className="relative flex items-center justify-center mb-6">
          <div className="w-24 h-24 border-4 border-indigo-600 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-16 h-16 border-2 border-indigo-400 rounded-full flex items-center justify-center">
              <span className="text-4xl transform translate-x-1 -translate-y-1">🎯</span>
            </div>
          </div>
          <div className="absolute -left-8 animate-bounce">
            <span className="text-2xl">🏹</span>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase mb-1">
            Target Coaching Classes
          </h1>
          <p className="text-indigo-600 font-bold tracking-[0.3em] text-xs uppercase">Manchar</p>
        </div>
        <div className="w-48 h-1 bg-zinc-100 rounded-full mt-12 overflow-hidden">
          <div className="h-full bg-indigo-600 animate-[loading_2s_ease-in-out]" style={{ width: '100%' }}></div>
        </div>
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes loading { 0% { width: 0%; } 100% { width: 100%; } }
        `}} />
      </div>
    );
  }

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RedirectAfterLogin />} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-test" element={<ProtectedRoute role="admin"><CreateTest /></ProtectedRoute>} />
        <Route path="/student/test/:testId" element={<ProtectedRoute role="student"><TestAttempt /></ProtectedRoute>} />
        <Route path="/student/subject/:subjectName" element={<ProtectedRoute><SubjectPage /></ProtectedRoute>} />
        <Route path="/student/history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  );
}