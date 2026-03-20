/**
 * ══════════════════════════════════════════════════════════════════════
 * QUIZ API SERVICE — quizApi.js (FIXED v2)
 * ──────────────────────────────────────────────────────────────────────
 * FIXES:
 * ✅ fetchQuizQuestions now forwards totalTime + subjectWiseCounts
 * ✅ Auth headers on all POST/GET requests that need them
 * ✅ HTTP status checking & friendly error messages
 * ══════════════════════════════════════════════════════════════════════
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getAuthToken = () =>
  localStorage.getItem('auth_token') || localStorage.getItem('token') || '';

const fetchWithAuth = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.message || 'Request failed');
  }

  return json;
};

/* ══════════════════════════════════════════════════════════════════════
   METADATA ENDPOINTS (no auth)
══════════════════════════════════════════════════════════════════════ */

export async function fetchSubjects() {
  const res = await fetch(`${BASE_URL}/quiz/subjects`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch subjects');
  return json.data;
}

export async function fetchChapters(subjectId) {
  const res = await fetch(`${BASE_URL}/quiz/subjects/${subjectId}/chapters`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch chapters`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch chapters');
  return json.data;
}

export async function fetchTopics(chapterId) {
  const res = await fetch(`${BASE_URL}/quiz/chapters/${chapterId}/topics`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch topics`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch topics');
  return json.data;
}

export async function fetchYearRange() {
  const res = await fetch(`${BASE_URL}/quiz/year-range`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch year range`);
  const json = await res.json();
  if (!json.success) throw new Error(json.message || 'Failed to fetch year range');
  return json.data;
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTION FETCHING (requires auth)
   
   Payload shape:
   {
     type: "practice" | "pyq",
     subjectIds: [...],
     chapterIds: [...],
     topicIds?: [...],
     difficulty: "Easy" | "Medium" | "Hard",
     yearRange?: { min, max },
     totalTime: 90,           // ← NEW: minutes
     subjectWiseCounts: {     // ← NEW: { subjectId: questionCount }
       "abc123": 50,
     },
     limit: 10,               // fallback if subjectWiseCounts not provided
   }
══════════════════════════════════════════════════════════════════════ */

export async function fetchQuizQuestions({
  type = 'practice',
  subjectIds = [],
  chapterIds = [],
  topicIds = [],
  difficulty = 'Medium',
  yearRange = null,
  totalTime = 90,
  subjectWiseCounts = {},
  limit = 10,
}) {
  const payload = {
    type,
    subjectIds,
    chapterIds,
    topicIds,
    difficulty,
    yearRange,
    totalTime,
    subjectWiseCounts,
    limit,
  };

  console.log('[quizApi] fetchQuizQuestions', payload);

  const json = await fetchWithAuth(`${BASE_URL}/quiz/fetch-questions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  console.log('[quizApi] fetchQuizQuestions success:', json.data);
  return json.data;
}

export async function fetchPYQQuestions({
  subjectIds = [],
  chapterIds = [],
  topicIds = [],
  difficulty = 'Medium',
  yearRange = null,
  totalTime = 90,
  subjectWiseCounts = {},
  limit = 10,
}) {
  return fetchQuizQuestions({
    type: 'pyq',
    subjectIds,
    chapterIds,
    topicIds,
    difficulty,
    yearRange,
    totalTime,
    subjectWiseCounts,
    limit,
  });
}

/* ══════════════════════════════════════════════════════════════════════
   ATTEMPT SUBMISSION (requires auth)
══════════════════════════════════════════════════════════════════════ */

export async function submitQuizAttempt({ blocks = [], timeTakenSeconds = 0 }) {
  const json = await fetchWithAuth(`${BASE_URL}/quiz/submit-attempt`, {
    method: 'POST',
    body: JSON.stringify({ blocks, timeTakenSeconds }),
  });
  return json.data;
}

/* ══════════════════════════════════════════════════════════════════════
   RESULTS & HISTORY (requires auth)
══════════════════════════════════════════════════════════════════════ */

export async function listStudentAttempts({ limit = 10, page = 1 } = {}) {
  const json = await fetchWithAuth(
    `${BASE_URL}/quiz/attempts?limit=${limit}&page=${page}`,
    { method: 'GET' }
  );
  return { attempts: json.data, pagination: json.pagination };
}

export async function getAttemptDetails(attemptId) {
  const json = await fetchWithAuth(
    `${BASE_URL}/quiz/attempts/${attemptId}`,
    { method: 'GET' }
  );
  return json.data;
}