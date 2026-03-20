/**
 * pyqData.js — Static frontend cache for PYQ subjects, chapters, topics
 * No API calls needed for browsing structure.
 * Questions are fetched live from backend via the PYQExplorer page.
 */

export const PYQ_SUBJECTS = [
    {
        _id: '69a6be2794b749c00e88cd23',
        name: 'Physics',
        emoji: '⚛️',
        color: 'bg-[#EBF3FF]',
        badge: 'bg-[#D1E5FF]',
        accent: '#4F46E5',
        accentLight: '#EEF2FF',
        accentBorder: '#C7D2FE',
    },
    {
        _id: '69a6be2794b749c00e88cd24',
        name: 'Chemistry',
        emoji: '🧪',
        color: 'bg-[#FFF4EB]',
        badge: 'bg-[#FFE9D6]',
        accent: '#EA580C',
        accentLight: '#FFF7ED',
        accentBorder: '#FED7AA',
    },
    {
        _id: '69a6be2794b749c00e88cd25',
        name: 'Mathematics',
        emoji: '📐',
        color: 'bg-[#F3EBFF]',
        badge: 'bg-[#E6D6FF]',
        accent: '#9333EA',
        accentLight: '#FDF4FF',
        accentBorder: '#E9D5FF',
    },
    {
        _id: '69a6be2794b749c00e88cd26',
        name: 'Biology',
        emoji: '🔬',
        color: 'bg-[#EBFDEB]',
        badge: 'bg-[#D6F7D6]',
        accent: '#16A34A',
        accentLight: '#F0FDF4',
        accentBorder: '#BBF7D0',
    },
];

/**
 * Chapters are loaded live from /api/quiz/subjects/:id/chapters
 * and cached in memory per session in PYQExplorer state.
 * This map provides fallback display names if needed.
 */
export const SUBJECT_MAP = Object.fromEntries(
    PYQ_SUBJECTS.map(s => [s._id, s])
);

export const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Medium', 'Hard'];

export const YEAR_OPTIONS = (() => {
    const years = ['All'];
    for (let y = 2025; y >= 2004; y--) years.push(String(y));
    return years;
})();