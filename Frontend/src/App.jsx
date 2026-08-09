import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AuthLanding from "./auth/AuthLanding";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useEffect, useRef } from "react";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { executeBackAction } from "./hooks/useBackButton";

/* ── student ── */
import StudentDashboard from "./student/Dashboard";
import TestAttempt from "./student/TestAttempt";
import TestHistory from "./student/TestHistory";
import AttemptAnalytics from "./student/AttemptAnalysis";
import AnswerSheet from "./student/AnswerSheet";
import StudentLayout from "./student/Layout/StudentLayout";
import StudentPersonalAnalytics from "./student/StudentPersonalAnalytics";
import StudentLibrary from "./student/StudentLibrary";
import StudentProfile from "./student/StudentProfile";
import LeaderboardPage from "./student/LeaderboardPage";
import StudentQuizFlow from "./student/StudentQuizFlow";
import StudentQuizTest from "./student/StudentQuizTest";
import PYQExplorer from "./student/PYQExplorer";
import PYQProgress from "./student/PYQProgress";
import PYQBookmarks from "./student/PYQBookmarks";
import PYQPapers from "./student/PYQPapers";
import QBank from "./student/QBank";
import FeedbackPage from "./student/FeedbackPage";
import StudentVersionGate from "./student/Studentversiongate"; // ← NEW
import StudentSubscription from "./student/StudentSubscription";
import NoticeBoard from "./student/NoticeBoard";
import Prime from "./student/Prime";
import PrimeCourse from "./student/PrimeCourse";
import PrimeVideo from "./student/PrimeVideo";
import ListedAttempts from "./student/ListedAttempts";
import PdfViewerPage from "./student/PdfViewerPage";
import SettingsPage from "./student/SettingsPage";
import StudentDownloads from "./student/StudentDownloads";

import StudentFAQs from "./student/StudentFAQs";
import DeleteAccountPage from "./student/DeleteAccountPage";
import ChangePasswordPage from "./student/ChangePasswordPage";
import PrivacyPolicyPage from "./student/PrivacyPolicyPage";
import CookiePolicyPage from "./student/CookiePolicyPage";
import RefundPolicyPage from "./student/RefundPolicyPage";
import GoalSelectionPage from "./student/GoalSelectionPage";

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
import Login from "./auth/Login";
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
import TeacherNotices from "./admin/TeacherNotices";

function LegacyCreateTestRedirect() {
  const location = useLocation();
  const mode = new URLSearchParams(location.search).get("mode");
  const map = { pdf: "/admin/pdf", dynamic: "/admin/bank", craft: "/admin/craft", schedule: "/admin/schedule" };
  return <Navigate to={map[mode] || "/admin"} replace />;
}


if (Capacitor.isNativePlatform()) {
  ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => { });
}

if (Capacitor.isNativePlatform()) {
  CapApp.addListener('resume', () => {
    ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => { });
  });
  CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) {
      ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => { });
    }
  });
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location);

  useEffect(() => {
    locationRef.current = location;
  }, [location]);

let lastBackPressTime = 0;

function showExitToast() {
  const toast = document.createElement('div');
  toast.innerText = "Press back again to exit";
  toast.style.position = 'fixed';
  toast.style.bottom = '100px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.backgroundColor = 'rgba(0,0,0,0.8)';
  toast.style.color = 'white';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '20px';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.zIndex = '9999';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 0.3s ease-in-out';
  toast.style.pointerEvents = 'none';
  toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  document.body.appendChild(toast);
  
  // Fade in
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
  });
  
  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 2000);
}

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const sub = CapApp.addListener("backButton", ({ canGoBack }) => {
      // 0. Check if any component intercepts the back button (e.g., Modals, Search Overlays)
      if (executeBackAction()) {
        return;
      }

      const currentPath = locationRef.current.pathname;
      const currentSearch = locationRef.current.search;
      
      const rootPaths = ["/", "/login", "/student", "/admin", "/institute-admin", "/super"];

      // 1. If we are exactly on a root page, ask for double press to exit
      if (rootPaths.includes(currentPath) && !currentSearch) {
        if (Date.now() - lastBackPressTime < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressTime = Date.now();
          showExitToast();
        }
        return;
      }

      // 1.5. Hub-and-Spoke Navigation: If pressing back on secondary root tabs, go to Home hub
      const secondaryRootTabs = [
        "/student/library",
        "/student/prime",
        "/student/history",
        "/student/notices",
        "/student/profile",
        "/student/pyq/bookmarks",
        "/student/pyq/progress"
      ];
      if (secondaryRootTabs.includes(currentPath) && !currentSearch) {
        navigate('/student', { replace: true });
        return;
      }

      // 2. Try to go back in history if React Router has a history stack
      const hasRouterHistory = window.history.state && window.history.state.idx > 0;
      
      if (hasRouterHistory) {
        navigate(-1);
      } else {
        // 3. Smart Fallback for complex routes (IDs, skipped intermediate paths)
        if (currentPath.includes('/analytics/')) {
          navigate('/student/history');
        } else if (currentPath.includes('/library/chapter/')) {
          navigate('/student/library');
        } else if (currentPath.includes('/test/') || currentPath.includes('/listedattempts/') || currentPath.includes('/leaderboard/')) {
          navigate('/student'); 
        } else if (currentPath.startsWith('/student/pyq/')) {
          navigate('/student/pyq');
        } else if (currentPath.startsWith('/student/')) {
          navigate('/student');
        } else if (currentPath.startsWith('/admin/')) {
          navigate('/admin');
        } else if (currentPath.startsWith('/super/') || currentPath.startsWith('/system/')) {
          navigate('/super');
        } else {
          navigate('/');
        }
      }
    });

    return () => { sub.then(h => h.remove()); };
  }, [navigate]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    ScreenOrientation.lock({ orientation: 'portrait-primary' }).catch(() => { });
  }, []);

  return (
    <ThemeProvider>
      <ViolationProvider>
        <AuthProvider>
          <StudentVersionGate>
            <Routes>

          {/* ── Public ── */}
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/help" element={<HelpCenter />} />

          {/* ── Student ── */}
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
            <Route path="analytics/:testId/attempt/:attemptNumber/answers" element={<AnswerSheet />} />
            <Route path="analytics/quiz/:attemptId" element={<AttemptAnalytics />} />
            <Route path="analytics/quiz/:attemptId/answers" element={<AnswerSheet />} />
            <Route path="listedattempts/:testId" element={<ListedAttempts />} />
            <Route path="listedattempts/quiz/:testId" element={<ListedAttempts />} />
            <Route path="pdf/:source/:id" element={<PdfViewerPage />} />
            <Route path="leaderboard/:testId" element={<LeaderboardPage />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="library/chapter/:chapterId" element={<StudentLibrary />} />
            <Route path="qbank" element={<QBank />} />
            <Route path="personal" element={<StudentPersonalAnalytics />} />
            <Route path="test/:testId" element={<TestAttempt />} />
            <Route path="quiz/*" element={<StudentQuizFlow />} />
            <Route path="quiztest" element={<StudentQuizTest />} />
            <Route path="pyq" element={<PYQExplorer />} />
            <Route path="pyq/papers" element={<PYQPapers />} />
            <Route path="pyq/progress" element={<PYQProgress />} />
            <Route path="pyq/bookmarks" element={<PYQBookmarks />} />
            <Route path="pyq/:subjectId" element={<PYQExplorer />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="subscription" element={<StudentSubscription />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="prime" element={<Prime />} />
            <Route path="prime/course/:courseId" element={<PrimeCourse />} />
            <Route path="prime/video/:videoId" element={<PrimeVideo />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="downloads" element={<StudentDownloads />} />

            <Route path="faqs" element={<StudentFAQs />} />
            <Route path="goal-selection" element={<GoalSelectionPage />} />
            <Route path="delete-account" element={<DeleteAccountPage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
            <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="cookie-policy" element={<CookiePolicyPage />} />
            <Route path="refund-policy" element={<RefundPolicyPage />} />
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
          <Route path="/admin/notices" element={<ProtectedRoute role="TEACHER"><TeacherNotices /></ProtectedRoute>} />
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
          </StudentVersionGate>
        </AuthProvider>
      </ViolationProvider>
    </ThemeProvider>
  );
}