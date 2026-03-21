import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./auth/Login";
import ProtectedRoute from "./auth/ProtectedRoute";

/* ── student ── */
import StudentDashboard from "./student/Dashboard";
import TestAttempt from "./student/TestAttempt";
import TestHistory from "./student/TestHistory";
import AttemptAnalytics from "./student/AttemptAnalysis";
import StudentLayout from "./student/Layout/StudentLayout";
import StudentPersonalAnalytics from "./student/StudentPersonalAnalytics";
import StudentLibrary from "./student/StudentLibrary";
import StudentProfile from "./student/StudentProfile";
import LeaderboardPage from "./student/LeaderboardPage";
import StudentQuizFlow from "./student/StudentQuizFlow";
import StudentQuizTest from "./student/StudentQuizTest";
import PYQExplorer from "./student/PYQExplorer";   // ← NEW

/* ── super / institute admin ── */
import SuperAdmin from "./SuperAdmin";
import InstituteAdmin from "./InstituteAdmin";
import CreateInstitutePage from "./CreateInstitutePage";
import CreateAdminPage from "./CreateAdminPage";
import ViewInstitutes from "./ViewInstitutes";
import ViewAdmins from "./ViewAdmins";

/* ── auth / misc ── */
import LoginPage from "./auth/LoginPage";
import Register from "./auth/Register";
import HelpCenter from "./auth/HelpCenter";
import PublicRoute from "./auth/PublicRoute";
import { ViolationProvider } from "./student/TestEnvironment/ViolationContext";

/* ── admin pages ── */
import AdminDashboard from "./admin/Dashboard";
import SeeTests from "./admin/SeeTests";
import PDFPage from "./admin/PDFPage";
import BankPage from "./admin/BankPage";
import CraftPage from "./admin/CraftPage";
import SchedulePage from "./admin/SchedulePage";
import Performance from "./admin/Performance";
import StudyMaterialPage from "./admin/StudyMaterialPage";
import PYQBook from "./admin/PYQBook";
import Rankings from "./admin/Rankings";

const isPWA =
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;

// ✅ Replace userAgent with screen.width — desktop mode can't spoof this
const isMobile = window.screen.width < 768;

const isMobilePWA = isPWA && isMobile;

function LegacyCreateTestRedirect() {
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get("mode");
  const map = { pdf: "/admin/pdf", dynamic: "/admin/bank", craft: "/admin/craft", schedule: "/admin/schedule" };
  return <Navigate to={map[mode] || "/admin"} replace />;
}

export default function App() {
  return (
      <div
    style={
      isMobilePWA
        ? {
            maxWidth: "480px",
            margin: "0 auto",
            minHeight: "100vh",
            overflowX: "hidden",
            background: "#fff",
          }
        : {}
    }
  >
    <ViolationProvider>
      <AuthProvider>
        <Routes>

          {/* ── Public ── */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/help" element={<HelpCenter />} />

          {/* ── Student ── */}
          <Route
            path="/student"
            element={<ProtectedRoute role="STUDENT"><StudentLayout /></ProtectedRoute>}
          >
            <Route index element={<StudentDashboard />} />
            <Route path="history" element={<TestHistory />} />
            <Route path="analytics/:testId/attempt/:attemptNumber" element={<AttemptAnalytics />} />
            <Route path="leaderboard/:testId" element={<LeaderboardPage />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="personal" element={<StudentPersonalAnalytics />} />
            <Route path="test/:testId" element={<TestAttempt />} />
            <Route path="quiz/*" element={<StudentQuizFlow />} />
            <Route path="quiztest" element={<StudentQuizTest />} />
            <Route path="pyq/:subjectId" element={<PYQExplorer />} />  {/* ← NEW */}
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin" element={<ProtectedRoute role="TEACHER"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/tests" element={<ProtectedRoute role="TEACHER"><SeeTests /></ProtectedRoute>} />
          <Route path="/admin/pdf" element={<ProtectedRoute role="TEACHER"><PDFPage /></ProtectedRoute>} />
          <Route path="/admin/bank" element={<ProtectedRoute role="TEACHER"><BankPage /></ProtectedRoute>} />
          <Route path="/admin/craft" element={<ProtectedRoute role="TEACHER"><CraftPage /></ProtectedRoute>} />
          <Route path="/admin/schedule" element={<ProtectedRoute role="TEACHER"><SchedulePage /></ProtectedRoute>} />
          <Route path="/admin/study-material" element={<ProtectedRoute role="TEACHER"><StudyMaterialPage /></ProtectedRoute>} />
          <Route path="/admin/performance" element={<ProtectedRoute role="TEACHER"><Performance /></ProtectedRoute>} />
          <Route path="/admin/pyq/:subject" element={<ProtectedRoute role="TEACHER"><PYQBook /></ProtectedRoute>} />
          <Route path="/admin/rankings" element={<ProtectedRoute role="TEACHER"><Rankings /></ProtectedRoute>} />
          <Route path="/admin/create-test" element={<ProtectedRoute role="TEACHER"><LegacyCreateTestRedirect /></ProtectedRoute>} />

          {/* ── Institute Admin ── */}
          <Route path="/institute-admin" element={<ProtectedRoute role="INSTITUTE_ADMIN"><InstituteAdmin /></ProtectedRoute>} />

          {/* ── Super Admin ── */}
          <Route path="/super" element={<ProtectedRoute role="SUPER_ADMIN"><SuperAdmin /></ProtectedRoute>}>
            <Route index element={<ViewInstitutes />} />
            <Route path="institutes" element={<ViewInstitutes />} />
            <Route path="admins" element={<ViewAdmins />} />
          </Route>
          <Route path="/system/create-institute" element={<ProtectedRoute role="SUPER_ADMIN"><CreateInstitutePage /></ProtectedRoute>} />
          <Route path="/system/create-admin" element={<ProtectedRoute role="SUPER_ADMIN"><CreateAdminPage /></ProtectedRoute>} />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </AuthProvider>
    </ViolationProvider>
  </div>
  );
}