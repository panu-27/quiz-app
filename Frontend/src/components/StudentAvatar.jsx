import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function StudentAvatar({ user, size = "w-8 h-8", className = "", onClick }) {
  const navigate = useNavigate();
  const location = useLocation();

  const resolveMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
      return url;
    }
    const base = window.__API_URL__
      ? window.__API_URL__.replace(/\/api$/, '')
      : (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `${base}${cleanPath}`;
  };

  const pic = resolveMediaUrl(user?.profilePic);
  const firstLetter = (user?.name?.trim()?.charAt(0) || user?.studentName?.trim()?.charAt(0) || "S").toUpperCase();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      const fromPath = (location.pathname + location.search) || '/student';
      try {
        sessionStorage.setItem('student_profile_parent', fromPath);
      } catch (e) {
        // ignore
      }
      navigate(`/student/profile?from=${encodeURIComponent(fromPath)}`, { state: { from: fromPath } });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${size} rounded-full overflow-hidden border-2 border-transparent flex-shrink-0 cursor-pointer active:scale-95 transition-transform flex items-center justify-center ${className}`}
      aria-label="Student Profile"
    >
      {pic ? (
        <img src={pic} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-[#E57373] flex items-center justify-center text-white font-bold text-xs select-none">
          {firstLetter}
        </div>
      )}
    </button>
  );
}
