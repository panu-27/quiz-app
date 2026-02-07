import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

import AdminDashboard from "./admin/Dashboard";
import StudentDashboard from "./student/Dashboard";
import CreateTest from "./admin/CreateTest/CreateTest";
import TestAttempt from "./student/TestAttempt";
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
import LoginPage from "./auth/LoginPage";
import Register from "./auth/Register";
import HelpCenter from "./auth/HelpCenter";
import CreateInstitutePage from "./CreateInstitutePage";
import CreateAdminPage from "./CreateAdminPage";
import ViewInstitutes from "./ViewInstitutes";
import ViewAdmins from "./ViewAdmins";
import PublicRoute from "./auth/PublicRoute";


export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Login */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login/>
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/help" element={<HelpCenter />} />

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
        {/* Parent Layout Wrapper */}
        <Route
          path="/super"
          element={
            <ProtectedRoute role="SUPER_ADMIN">
              <SuperAdmin />
            </ProtectedRoute>
          }
        >
          {/* Sub-routes that render inside SuperAdmin's <Outlet /> */}
          <Route index element={<ViewInstitutes />} /> {/* Default view at /super */}
          <Route path="institutes" element={<ViewInstitutes />} />
          <Route path="admins" element={<ViewAdmins />} />
        </Route>

        {/* Creation Pages (Keep these separate as they are full-page forms) */}
        <Route
          path="/system/create-institute"
          element={<ProtectedRoute role="SUPER_ADMIN"><CreateInstitutePage /></ProtectedRoute>}
        />
        <Route
          path="/system/create-admin"
          element={<ProtectedRoute role="SUPER_ADMIN"><CreateAdminPage /></ProtectedRoute>}
        />

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
