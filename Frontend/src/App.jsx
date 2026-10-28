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
import { getParentRoute } from "./utils/navigationHierarchy";

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
import StudentQuizResult from "./student/quiz/StudentQuizResult";
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
  const maxAllowedIdxRef = useRef(window.history.state?.idx ?? 0);

  useEffect(() => {
    locationRef.current = location;
    const currentIdx = window.history.state?.idx;
    if (typeof currentIdx === 'number' && currentIdx > maxAllowedIdxRef.current) {
      maxAllowedIdxRef.current = currentIdx;
    }
  }, [location]);

  // If user directly lands on a child route with no prior history in the tab,
  // prime the browser history so the browser Back button is enabled and takes them to the parent route.
  useEffect(() => {
    const fullCurrentUrl = window.location.pathname + window.location.search;
    if (
      fullCurrentUrl.endsWith("/counsellor") ||
      fullCurrentUrl === "/student/notices/pdf" ||
      fullCurrentUrl === "/student/notices/image" ||
      fullCurrentUrl.startsWith("/student/quiz/settings") ||
      fullCurrentUrl.startsWith("/student/quiztest")
    ) {
      const parent = getParentRoute(fullCurrentUrl, window.history.state) || "/student";
      const currentIdx = window.history.state?.idx;
      if (currentIdx === undefined || currentIdx === 0) {
        window.history.replaceState({ idx: 0 }, "", parent);
        window.history.pushState({ idx: 1 }, "", window.location.href);
        maxAllowedIdxRef.current = 1;
      }
    }
  }, []);

  const lastBackPressTimeRef = useRef(0);

  function showExitToast() {
    const existing = document.getElementById('nexus-exit-toast');
    if (existing) return;

    const toast = document.createElement('div');
    toast.id = 'nexus-exit-toast';
    toast.innerText = "Press back again to exit";
    toast.style.position = 'fixed';
    toast.style.bottom = '100px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0,0,0,0.85)';
    toast.style.color = '#ffffff';
    toast.style.padding = '10px 22px';
    toast.style.borderRadius = '24px';
    toast.style.fontSize = '14px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '99999';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease-in-out';
    toast.style.pointerEvents = 'none';
    toast.style.fontFamily = 'system-ui, -apple-system, sans-serif';
    toast.style.boxShadow = '0 8px 32px rgba(0,0,0,0.35)';
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
    
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
    const handleAppBack = () => {
      const currentPath = locationRef.current.pathname;
      const currentSearch = locationRef.current.search;
      const fullCurrentPath = currentPath + (currentSearch || "");
      const currentState = locationRef.current.state;

      // 0. If on a counsellor route, directly return to parent route
      if (currentPath.endsWith("/counsellor")) {
        const parentRoute = getParentRoute(fullCurrentPath, currentState) || "/student";
        navigate(parentRoute, { replace: true });
        return true;
      }

      // 0.1 Check if any component intercepts the back button (Modals, Overlays, Sheets)
      if (executeBackAction()) {
        return true;
      }

      const rootPaths = ["/", "/login", "/student", "/admin", "/institute-admin", "/super"];

      // 1. If we are on root without query params, ask for double press to exit
      if (rootPaths.includes(currentPath) && !currentSearch) {
        const now = Date.now();
        if (now - lastBackPressTimeRef.current < 2000) {
          if (Capacitor.isNativePlatform()) {
            CapApp.exitApp();
          }
        } else {
          lastBackPressTimeRef.current = now;
          showExitToast();
        }
        return true;
      }

      // 2. Hierarchical Parent-Child resolution for student routes
      if (currentPath.startsWith("/student")) {
        const parentRoute = getParentRoute(fullCurrentPath, currentState);
        if (parentRoute && parentRoute !== fullCurrentPath) {
          navigate(parentRoute, { replace: true });
          return true;
        }
      }

      // 3. Fallback for other roles (admin, super admin)
      if (currentPath.startsWith("/admin/")) {
        navigate("/admin", { replace: true });
        return true;
      }
      if (currentPath.startsWith("/super/") || currentPath.startsWith("/system/")) {
        navigate("/super", { replace: true });
        return true;
      }

      navigate("/");
      return true;
    };

    let sub = null;
    if (Capacitor.isNativePlatform()) {
      sub = CapApp.addListener("backButton", () => {
        handleAppBack();
      });
    }

    const handlePopState = () => {
      const previousPath = locationRef.current.pathname;
      const previousSearch = locationRef.current.search;
      const previousFullUrl = previousPath + (previousSearch || "");
      const previousState = locationRef.current.state;
      const newPath = window.location.pathname;
      const newSearch = window.location.search;
      const newFullUrl = newPath + (newSearch || "");

      // Forward blocker: when user has gone back, prevent browser forward arrow from going ahead
      // NEVER run forward blocker on active test or quiz, as it causes cascading back exits
      const isQuizOrTest = (
        previousPath === '/student/quiztest' ||
        newPath === '/student/quiztest' ||
        previousPath.startsWith('/student/test/') ||
        newPath.startsWith('/student/test/')
      );
      if (!isQuizOrTest) {
        const currentIdx = window.history.state?.idx;
        if (typeof currentIdx === 'number' && currentIdx > maxAllowedIdxRef.current) {
          window.history.back();
          return;
        }
      }

      // Never allow browser forward navigation into bookmarks or progress modal views
      if (newPath === '/student/pyq/bookmarks' || newPath === '/student/pyq/progress') {
        const currentIdx = window.history.state?.idx;
        const isForward = typeof currentIdx === 'number' && currentIdx >= maxAllowedIdxRef.current && (previousPath === '/student/pyq' || previousPath.startsWith('/student/pyq/subject/'));
        if (isForward) {
          window.history.back();
          return;
        }
      }

      const currentIdx = window.history.state?.idx;
      if (typeof currentIdx === 'number') {
        maxAllowedIdxRef.current = currentIdx;
      }

      // 0. Check if any component intercepts the back button (Active Exam Guard, Modals, Overlays)
      if (!previousPath.endsWith("/counsellor")) {
        if (executeBackAction()) {
          if (newPath !== previousPath) {
            navigate(previousFullUrl, { replace: true, state: previousState });
          } else {
            const currState = window.history.state || {};
            window.history.pushState(currState, "", previousFullUrl);
          }
          return;
        }
      }

      // 0.1 Active Exam / Quiz Guard Fallback: If still on test or quiz, trap back and trigger interceptor
      if (
        (previousPath === "/student/quiztest" && newPath !== "/student/quiztest") ||
        (previousPath.startsWith("/student/test/") && newPath !== previousPath)
      ) {
        executeBackAction();
        navigate(previousFullUrl, { replace: true, state: previousState });
        return;
      }

      const rootPaths = ["/", "/login", "/student", "/admin", "/institute-admin", "/super"];

      // 1. If at root, do not intercept normal browser back navigation
      if (rootPaths.includes(previousPath)) {
        return;
      }

      // 2. Hierarchical back: ensure user always returns to designated parent
      if (previousPath.startsWith("/student")) {
        const parentRoute = getParentRoute(previousFullUrl, previousState);
        const hasParentQuery = parentRoute && parentRoute.includes("?");
        const isAlreadyAtParent = parentRoute && (
          newFullUrl === parentRoute ||
          (!hasParentQuery && newPath === parentRoute) ||
          (parentRoute === '/student/quiz/settings' && newPath === '/student/quiz/settings' && (!newSearch || newSearch === '?step=0'))
        );
        if (parentRoute && parentRoute !== previousFullUrl && !isAlreadyAtParent) {
          navigate(parentRoute, { replace: true });
          return;
        }
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      if (sub) sub.then(h => h.remove());
      window.removeEventListener("popstate", handlePopState);
    };
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
            <Route path="counsellor" element={<StudentDashboard initialCounsellor={true} />} />
            <Route path="history" element={<TestHistory />} />
            <Route path="history/counsellor" element={<TestHistory initialCounsellor={true} />} />
            <Route path="analytics/:testId/attempt/:attemptNumber" element={<AttemptAnalytics />} />
            <Route path="analytics/:testId/attempt/:attemptNumber/answers" element={<AnswerSheet />} />
            <Route path="analytics/quiz/:attemptId" element={<AttemptAnalytics />} />
            <Route path="analytics/quiz/:attemptId/answers" element={<AnswerSheet />} />
            <Route path="listedattempts/:testId" element={<ListedAttempts />} />
            <Route path="listedattempts/quiz/:testId" element={<ListedAttempts />} />
            <Route path="pdf/:source/:id" element={<PdfViewerPage />} />
            <Route path="library/pdf" element={<PdfViewerPage />} />
            <Route path="leaderboard/:testId" element={<LeaderboardPage />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="library" element={<StudentLibrary />} />
            <Route path="library/counsellor" element={<StudentLibrary initialCounsellor={true} />} />
            <Route path="library/chapter/:chapterId" element={<StudentLibrary />} />
            <Route path="qbank" element={<QBank />} />
            <Route path="qbank/counsellor" element={<QBank initialCounsellor={true} />} />
            <Route path="personal" element={<StudentPersonalAnalytics />} />
            <Route path="test/:testId" element={<TestAttempt />} />
            <Route path="quiz" element={<StudentQuizFlow />} />
            <Route path="quiz/settings" element={<StudentQuizFlow />} />
            <Route path="quiz/settings/:stepId" element={<StudentQuizFlow />} />
            <Route path="quiz/result" element={<StudentQuizResult />} />
            <Route path="quiz/*" element={<StudentQuizFlow />} />
            <Route path="quiztest" element={<StudentQuizTest />} />
            <Route path="quiztest/result" element={<StudentQuizResult />} />
            <Route path="pyq" element={<PYQExplorer />} />
            <Route path="pyq/papers" element={<PYQPapers />} />
            <Route path="pyq/progress" element={<PYQProgress />} />
            <Route path="pyq/bookmarks" element={<PYQBookmarks />} />
            <Route path="pyq/subject/:subjectId/chapter/:chapterId/practice" element={<PYQExplorer />} />
            <Route path="pyq/subject/:subjectId/chapter/:chapterId" element={<PYQExplorer />} />
            <Route path="pyq/subject/:subjectId" element={<PYQExplorer />} />
            <Route path="pyq/chapter/:chapterId/practice" element={<PYQExplorer />} />
            <Route path="pyq/chapter/:chapterId" element={<PYQExplorer />} />
            <Route path="pyq/:subjectId/chapter/:chapterId/practice" element={<PYQExplorer />} />
            <Route path="pyq/:subjectId/chapter/:chapterId" element={<PYQExplorer />} />
            <Route path="pyq/:subjectId" element={<PYQExplorer />} />
            <Route path="feedback" element={<FeedbackPage />} />
            <Route path="subscription" element={<StudentSubscription />} />
            <Route path="notices" element={<NoticeBoard />} />
            <Route path="notices/pdf" element={<NoticeBoard />} />
            <Route path="notices/image" element={<NoticeBoard />} />
            <Route path="prime" element={<Prime />} />
            <Route path="prime/counsellor" element={<Prime initialCounsellor={true} />} />
            <Route path="prime/course/:courseId" element={<PrimeCourse />} />
            <Route path="prime/video/:videoId" element={<PrimeVideo />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/logout" element={<SettingsPage initialLogout={true} />} />
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