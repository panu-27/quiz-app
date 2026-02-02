import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./admin/Dashboard";
import StudentDashboard from "./student/Dashboard";
import CreateTest from "./admin/CreateTest/CreateTest";
import TestAttempt from "./student/TestAttempt";
import SubjectPage from "./student/SubjectPage";
import TestHistory from "./student/TestHistory";
import AttemptAnalytics from "./student/AttemptAnalysis";
import StudentLayout from "./student/Layout/StudentLayout";
import StudentPersonalAnalytics from "./student/StudentPersonalAnalytics";
import StudentLibrary from "./student/StudentLibrary";
import StudentProfile from "./student/StudentProfile";
import SuperAdmin from "./SuperAdmin";
import InstituteAdmin from "./InstituteAdmin";
import Performance from "./admin/Performance";
import SeeTests from "./admin/SeeTests";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* STUDENT */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="STUDENT">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="subject/:subjectName" element={<SubjectPage />} />
          <Route path="history" element={<TestHistory />} />
          <Route path="analytics/:testId/attempt/:attemptNumber" element={<AttemptAnalytics />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="library" element={<StudentLibrary />} />
          <Route path="personal" element={<StudentPersonalAnalytics />} />
          <Route path="test/:testId" element={<TestAttempt />} />
        </Route>
       

        {/* ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="TEACHER">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin/create-test"
          element={
            <ProtectedRoute role="TEACHER">
              <CreateTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/performance"
          element={
            <ProtectedRoute role="TEACHER">
              <Performance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tests"
          element={
            <ProtectedRoute role="TEACHER">
              <SeeTests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/institute-admin"
          element={
            <ProtectedRoute role="INSTITUTE_ADMIN">
              <InstituteAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/super"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SuperAdmin />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
