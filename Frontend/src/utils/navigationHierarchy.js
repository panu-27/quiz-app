/**
 * Navigation Hierarchy & Parent Resolver
 * 
 * Implements strict hierarchical (parent-child) app navigation:
 * 1. Single-Parent screens: Always return directly to their designated parent (no looping through sibling tabs).
 * 2. Multi-Parent screens: If opened from a specific parent (`location.state.from`), return to that parent;
 *    otherwise safely fall back to the default semantic parent.
 * 3. Root screen: Returns null (signals exit app guard).
 */

export const STUDENT_ROOT = "/student";

/**
 * Resolves the parent URL for any student route.
 * @param {string} currentPath - current window.location.pathname
 * @param {object} [locationState] - current window.history.state or react-router location.state
 * @returns {string|null} parent pathname, or null if already at root
 */
export function getParentRoute(currentPath, locationState = {}) {
  if (!currentPath) return STUDENT_ROOT;

  // Split path into base pathname and search query string
  const [rawPath, rawSearch] = currentPath.split("?");
  const path = (rawPath || "").replace(/\/+$/, "") || "/";
  let searchParams = null;
  try {
    if (rawSearch !== undefined) {
      searchParams = new URLSearchParams("?" + rawSearch);
    } else if (typeof window !== "undefined" && window.location) {
      searchParams = new URLSearchParams(window.location.search);
    }
  } catch (e) {
    searchParams = new URLSearchParams();
  }

  // 1. If at root, no parent (triggers double-tap exit)
  if (path === STUDENT_ROOT || path === "/" || path === "/login") {
    return null;
  }

  // 1.5. Hub-and-Spoke Secondary Root Tabs (Direct Children of Home):
  // When pressing back from any of these tabs at base level, ALWAYS return directly to Home hub!
  const secondaryRootTabs = [
    "/student/library",
    "/student/history",
    "/student/prime",
    "/student/qbank",
  ];
  if (secondaryRootTabs.includes(path)) {
    return STUDENT_ROOT;
  }

  // Notice attachments -> Parent is Notice list
  if (path === "/student/notices/pdf" || path === "/student/notices/image") {
    return "/student/notices";
  }

  // Quiz Result Screen -> Parent is /student/quiz (or /student/quiztest/result if reviewing answers)
  if (path === "/student/quiztest/result" || path === "/student/quiz/result") {
    if (searchParams?.get("review") === "true") {
      return path;
    }
    return "/student/quiz";
  }

  // Quiz attempt internal dialogs/drawers -> Parent is /student/quiztest
  if (path === "/student/quiztest" && (searchParams?.get("dialog") || searchParams?.get("panel"))) {
    return "/student/quiztest";
  }

  // Active Quiz attempt -> Traps back press by opening quit dialog
  if (path === "/student/quiztest") {
    return "/student/quiztest?dialog=quit";
  }

  // Stage 2 settings -> Parent is Stage 1 (Quiz selection) or previous step
  if (path === "/student/quiz/settings" || path.startsWith("/student/quiz/settings")) {
    let stepNum = 0;
    const parts = path.split("/").filter(Boolean);
    if (parts[2] === "settings" && parts[3]) {
      stepNum = parseInt(parts[3], 10) || 0;
    } else {
      try {
        stepNum = parseInt(searchParams?.get("step") || "0", 10);
      } catch(e) {}
    }
    if (stepNum > 1) {
      return `/student/quiz/settings/${stepNum - 1}`;
    }
    if (stepNum === 1) {
      return "/student/quiz/settings";
    }
    return "/student/quiz";
  }

  // Stage 1 creation -> Parent is Library or caller (never its own sub-routes)
  if (path === "/student/quiz" || path.startsWith("/student/quiz")) {
    let queryFromQuiz = "";
    try {
      queryFromQuiz = new URLSearchParams(window.location.search).get("from") || "";
    } catch(e) {}
    const candidateFrom = (locationState?.from || queryFromQuiz || "").replace(/\/+$/, "");
    if (candidateFrom && candidateFrom.startsWith("/student") && !candidateFrom.startsWith("/student/quiz")) {
      return candidateFrom;
    }
    return "/student/library";
  }

  // 2. Multi-Parent Context Check:
  let queryFrom = "";
  try {
    queryFrom = new URLSearchParams(window.location.search).get("from") || "";
  } catch (e) {}
  const fromPath = (locationState?.from || queryFrom || "").replace(/\/+$/, "");
  const isChildOfCurrentPath = fromPath && (
    fromPath.startsWith(path + "/") ||
    (path === "/student/pyq" && fromPath.startsWith("/student/pyq")) ||
    (path === "/student/quiz" && fromPath.startsWith("/student/quiz"))
  );
  if (fromPath && fromPath !== path && fromPath.startsWith("/student") && !isChildOfCurrentPath) {
    return fromPath;
  }

  // 3. Specific Sub-routes with Dynamic / Nested Parent Relationships:

  // Answers sheet -> Parent is its attempt analysis
  if (path.includes("/analytics/") && path.endsWith("/answers")) {
    return fromPath || path.replace(/\/answers$/, "");
  }

  // Attempt analytics -> Parent is ListedAttempts, TestHistory, or fromPath
  if (path.startsWith("/student/analytics/")) {
    return fromPath || "/student/history";
  }

  // Listed attempts -> Parent is TestHistory or fromPath
  if (path.startsWith("/student/listedattempts/")) {
    return fromPath || "/student/history";
  }

  // PDF Viewer -> Multi-parent: returns to exact caller (chapter, pyq, downloads, or library)
  if (path.startsWith("/student/pdf/") || path === "/student/library/pdf") {
    if (fromPath) return fromPath;
    if (path.includes("/pyq")) return "/student/pyq";
    if (path.includes("library")) return "/student/library";
    return STUDENT_ROOT;
  }

  // Library Chapter full-screen / chapter view -> Parent is Library or caller
  if (path.startsWith("/student/library/chapter/")) {
    return fromPath || "/student/library";
  }

  // PYQ Practice Mode -> Parent is Chapter Questions screen
  if (path.startsWith("/student/pyq/") && path.endsWith("/practice")) {
    return path.replace(/\/practice$/, "");
  }

  // PYQ Chapter Questions Screen -> Parent is the Subject Chapters screen
  if (path.startsWith("/student/pyq/") && path.includes("/chapter/")) {
    if (path.includes("/subject/")) {
      return path.split("/chapter/")[0];
    }
    const match = path.match(/^\/student\/pyq\/([^/]+)\/chapter\/[^/]+$/);
    if (match && match[1] && match[1] !== "subject") {
      return `/student/pyq/subject/${match[1]}`;
    }
    return "/student/pyq";
  }

  // PYQ Papers -> Dedicated parent is Library
  if (path === "/student/pyq/papers") {
    return "/student/library";
  }

  // PYQ Sub-features (bookmarks, progress) -> Parent is where user came from
  if (path === "/student/pyq/bookmarks" || path === "/student/pyq/progress") {
    let saved = null;
    try { saved = sessionStorage.getItem('pyq_feature_from'); } catch(e) {}
    if (fromPath && fromPath.startsWith("/student/pyq") && !fromPath.includes('/bookmarks') && !fromPath.includes('/progress')) {
      return fromPath;
    }
    if (saved && saved.startsWith("/student/pyq") && !saved.includes('/bookmarks') && !saved.includes('/progress')) {
      return saved;
    }
    return "/student/pyq";
  }

  // PYQ Subject Chapters Screen -> Parent is /student/pyq
  if (path.startsWith("/student/pyq/subject/") || (path.startsWith("/student/pyq/") && !["/student/pyq/papers", "/student/pyq/bookmarks", "/student/pyq/progress"].includes(path))) {
    return "/student/pyq";
  }

  // PYQ Explorer top level -> Parent is ALWAYS Library or Home (NEVER a sub-route of /student/pyq)
  if (path === "/student/pyq") {
    if (fromPath && fromPath.startsWith("/student") && !fromPath.startsWith("/student/pyq")) {
      return fromPath;
    }
    return "/student/library";
  }

  // Prime Video -> Parent is Prime Course or Prime Hub
  if (path.startsWith("/student/prime/video/")) {
    return fromPath || "/student/prime";
  }

  // Prime Course -> Parent is Prime Hub or caller
  if (path.startsWith("/student/prime/course/")) {
    return fromPath || "/student/prime";
  }

  // Settings logout popup route -> Parent is Settings
  if (path === "/student/settings/logout") {
    return "/student/settings";
  }

  // FAQs -> Multi-parent: Profile or Settings or caller
  if (path === "/student/faqs") {
    let saved = null;
    try { saved = sessionStorage.getItem('student_faqs_parent'); } catch(e) {}
    if (fromPath && fromPath !== '/student/faqs') return fromPath;
    if (saved && saved !== '/student/faqs' && saved.startsWith('/student')) return saved;
    return "/student/profile";
  }

  // Downloads -> Parent is Profile or caller
  if (path === "/student/downloads") {
    return fromPath || "/student/profile";
  }

  // Settings sub-pages -> Parent is Settings or caller
  const settingsSubPages = [
    "/student/settings/logout",
    "/student/delete-account",
    "/student/change-password",
    "/student/privacy-policy",
    "/student/cookie-policy",
    "/student/refund-policy",
  ];
  if (settingsSubPages.includes(path)) {
    return fromPath || "/student/settings";
  }

  // Settings page -> Parent is Profile or caller
  if (path === "/student/settings") {
    let saved = null;
    try { saved = sessionStorage.getItem('student_settings_parent'); } catch(e) {}
    if (fromPath && fromPath !== '/student/settings') return fromPath;
    if (saved && saved !== '/student/settings' && saved.startsWith('/student')) return saved;
    return "/student/profile";
  }

  // Updates / Notices -> If opened from Profile, return to Profile; otherwise Home
  if (path === "/student/notices") {
    if (fromPath && (fromPath === "/student/profile" || fromPath.startsWith("/student/profile/"))) {
      return "/student/profile";
    }
    return fromPath || STUDENT_ROOT;
  }

  // Profile page -> Parent is external caller or Home
  if (path === "/student/profile") {
    const PROFILE_CHILD_ROUTES = [
      '/student/profile',
      '/student/settings',
      '/student/settings/logout',
      '/student/faqs',
      '/student/downloads',
      '/student/notices',
      '/student/personal',
      '/student/goal-selection',
      '/student/change-password',
      '/student/delete-account',
      '/student/privacy-policy',
      '/student/cookie-policy',
      '/student/refund-policy',
    ];
    let saved = null;
    try { saved = sessionStorage.getItem('student_profile_parent'); } catch(e) {}
    if (fromPath && !PROFILE_CHILD_ROUTES.some(r => fromPath === r || fromPath.startsWith(r + '/'))) {
      return fromPath;
    }
    if (saved && !PROFILE_CHILD_ROUTES.some(r => saved === r || saved.startsWith(r + '/')) && saved.startsWith('/student')) {
      return saved;
    }
    return STUDENT_ROOT;
  }

  // Goal Selection -> Parent is caller or Home
  if (path === "/student/goal-selection") {
    let saved = null;
    try { saved = sessionStorage.getItem('student_goal_parent'); } catch(e) {}
    return fromPath || (saved && saved !== '/student/goal-selection' ? saved : null) || STUDENT_ROOT;
  }

  // Talk to Counsellor routes -> Parent is specific page or caller or Home
  if (path.endsWith("/counsellor")) {
    const parent = path.replace(/\/counsellor$/, "") || STUDENT_ROOT;
    return fromPath || parent;
  }

  // Personal analytics / Leaderboard -> Parent is caller, saved session (Library, Settings, Profile), or Home
  if (path === "/student/personal") {
    let saved = null;
    try { saved = sessionStorage.getItem('student_leaderboard_parent'); } catch(e) {}
    if (fromPath && fromPath !== '/student/personal') return fromPath;
    if (saved && saved !== '/student/personal' && saved.startsWith('/student')) return saved;
    return STUDENT_ROOT;
  }

  // Feedback -> Parent is caller or Home
  if (path === "/student/feedback") {
    return fromPath || STUDENT_ROOT;
  }

  // Store & Subscription -> Parent is caller or Home
  if (path === "/student/store" || path === "/student/subscription") {
    return fromPath || STUDENT_ROOT;
  }

  // Leaderboard -> Parent is where user came from or Home
  if (path.startsWith("/student/leaderboard/")) {
    return fromPath || STUDENT_ROOT;
  }

  // Quiz flow stages handled above with priority

  // Test Attempt -> Parent is where user came from or Home
  if (path.startsWith("/student/test/")) {
    return fromPath || STUDENT_ROOT;
  }

  // Default fallback for any student sub-path
  if (path.startsWith("/student/")) {
    return fromPath || STUDENT_ROOT;
  }

  // Admin fallbacks
  if (path.startsWith("/admin/")) return "/admin";
  if (path.startsWith("/super/") || path.startsWith("/system/")) return "/super";

  return "/";
}
