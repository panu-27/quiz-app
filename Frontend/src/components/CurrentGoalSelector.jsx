import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CurrentGoalSelector({
  isDark = false,
  useDarkText,
  isDarkText: isDarkTextProp,
  labelColor,
  titleColor,
  chevronColor,
  className = ''
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const selectedGoal = localStorage.getItem("selectedGoal") || "Select Goal";
  const canChange = !user?.approved;

  // Determine text color based on props
  const isDarkText = useDarkText !== undefined
    ? useDarkText
    : (isDarkTextProp !== undefined ? isDarkTextProp : !isDark);

  const resolvedLabelColor = labelColor || (isDarkText ? 'text-slate-500' : 'text-slate-300');
  const resolvedTitleColor = titleColor || (isDarkText ? 'text-slate-900' : 'text-white');
  const resolvedChevronColor = chevronColor || (titleColor || (isDarkText ? 'text-slate-900' : 'text-white'));

  const handleClick = () => {
    if (canChange) {
      const fromPath = (location.pathname + location.search) || '/student';
      try {
        sessionStorage.setItem('student_goal_parent', fromPath);
      } catch (e) {
        // ignore
      }
      navigate(`/student/goal-selection?from=${encodeURIComponent(fromPath)}`, { state: { from: fromPath } });
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`min-w-0 flex-1 overflow-hidden select-none ${canChange ? 'cursor-pointer active:opacity-80 transition-opacity' : ''} ${className}`}
    >
      <p
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        className={`text-[10px] font-medium leading-tight mb-0.5 tracking-normal ${resolvedLabelColor}`}
      >
        Current goal
      </p>
      <div className="flex items-center gap-1 min-w-0">
        <span
          style={{ fontFamily: "'Sora', sans-serif" }}
          className={`font-bold text-[17px] tracking-tight truncate min-w-0 leading-snug ${resolvedTitleColor}`}
        >
          {selectedGoal}
        </span>
        {canChange && (
          <ChevronDown
            size={18}
            className={`flex-shrink-0 ${resolvedChevronColor}`}
            strokeWidth={2.5}
          />
        )}
      </div>
    </div>
  );
}
