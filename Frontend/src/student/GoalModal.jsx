import React, { useState, useEffect } from "react";
import { X, Plus, BookOpen, Trophy, FlaskConical, Atom, Stethoscope, Lock, ChevronDown } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

/* ─── Goal list data ─────────────────────────────────────── */
const GOALS = [
  {
    id: "iit-jee-rank-booster",
    name: "IIT JEE Rank Booster",
    subtitle: "Expired",
    selectable: true,
    icon: <Atom size={20} />,
    emoji: "⚗️",
    subtitleColor: "text-red-400",
  },
  {
    id: "cbse-class-11",
    name: "CBSE Class 11",
    subtitle: "Expired",
    selectable: true,
    icon: <BookOpen size={20} />,
    emoji: "📚",
    subtitleColor: "text-red-400",
  },
  {
    id: "cbse-class-12",
    name: "CBSE Class 12",
    subtitle: "Expired",
    selectable: true,
    icon: <BookOpen size={20} />,
    emoji: "📖",
    subtitleColor: "text-red-400",
  },
  {
    id: "iit-jee",
    name: "IIT JEE",
    subtitle: "Expired",
    selectable: true,
    icon: <Atom size={20} />,
    emoji: "🔬",
    subtitleColor: "text-red-400",
  },
  {
    id: "mht-cet",
    name: "MHT CET",
    subtitle: null,
    selectable: true,
    icon: <FlaskConical size={20} />,
    emoji: "🧪",
    subtitleColor: "",
  },
  {
    id: "mh-ssc-class-10",
    name: "MH SSC Class 10",
    subtitle: null,
    selectable: true,
    icon: <BookOpen size={20} />,
    emoji: "📓",
    subtitleColor: "",
  },
  {
    id: "mh-hsc-class-11",
    name: "MH HSC Class 11",
    subtitle: null,
    selectable: true,
    icon: <BookOpen size={20} />,
    emoji: "📕",
    subtitleColor: "",
  },
  {
    id: "neet",
    name: "NEET",
    subtitle: "Coming soon",
    selectable: false,
    icon: <Stethoscope size={20} />,
    emoji: "🩺",
    subtitleColor: "text-slate-500",
  },
];

/* ─── Icon container ─────────────────────────────────────── */
function GoalIcon({ emoji, selectable, isDark }) {
  return (
    <div
      className={`w-10 h-10 rounded-sm flex items-center justify-center text-lg flex-shrink-0 ${
        selectable
          ? isDark
            ? "bg-[#1E2C40]"
            : "bg-slate-100"
          : isDark
          ? "bg-[#161F2C]"
          : "bg-slate-50"
      }`}
    >
      {emoji}
    </div>
  );
}

/* ─── Radio circle ───────────────────────────────────────── */
function RadioCircle({ selected, selectable, isDark }) {
  if (!selectable) {
    return (
      <Lock
        size={16}
        className={isDark ? "text-slate-600" : "text-slate-300"}
      />
    );
  }
  return (
    <div
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
        selected
          ? "border-[#25D3A4] bg-[#25D3A4]"
          : isDark
          ? "border-slate-600"
          : "border-slate-300"
      }`}
    >
      {selected && (
        <div className="w-2.5 h-2.5 rounded-full bg-white" />
      )}
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────── */
export default function GoalModal({ isOpen, onClose, onSelectGoal }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [selectedId, setSelectedId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [visible, setVisible] = useState(false);

  // Animate in on open
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-hide-nav", "true");
      return () => {
        document.body.style.overflow = "";
        document.body.removeAttribute("data-hide-nav");
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (goal) => {
    if (!goal.selectable) return;
    setSelectedId(goal.id);
    // Short delay for visual feedback then close
    setTimeout(() => {
      onSelectGoal(goal.name);
    }, 200);
  };

  const bg = isDark ? "bg-[#10151F]" : "bg-white";
  const headerBg = isDark ? "bg-[#10151F]" : "bg-white";
  const rowBg = isDark ? "" : "";
  const rowBorder = isDark ? "border-[#1A2535]" : "border-slate-100";
  const titleColor = isDark ? "text-white" : "text-slate-900";
  const subtitleMuted = isDark ? "text-slate-500" : "text-slate-400";
  const nameMuted = isDark ? "text-slate-500" : "text-slate-400";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[190] bg-black/50"
        onClick={onClose}
      />

      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[200] ${bg} rounded-t-lg flex flex-col border-t ${rowBorder}`}
        style={{
          maxHeight: "92vh"
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className={`w-10 h-1 rounded-full ${isDark ? "bg-slate-700" : "bg-slate-200"}`} />
        </div>

        {/* Header */}
        <div
          className={`${headerBg} flex items-center justify-between px-5 py-4 flex-shrink-0 border-b ${rowBorder}`}
        >
          <h2 className={`text-[17px] font-bold ${titleColor}`}>My goals</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing((v) => !v)}
              className={`text-[13px] font-bold tracking-wide ${
                isEditing
                  ? "text-[#25D3A4]"
                  : isDark
                  ? "text-slate-400"
                  : "text-slate-500"
              } uppercase`}
            >
              {isEditing ? "DONE" : "EDIT"}
            </button>
            <button
              onClick={onClose}
              className={`w-7 h-7 rounded-sm border flex items-center justify-center bg-transparent ${
                isDark ? "border-slate-800 text-slate-450 hover:bg-slate-800/20" : "border-slate-200 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Goal list */}
        <div className="flex-1 overflow-y-auto">
          {GOALS.map((goal, idx) => {
            const isSelected = selectedId === goal.id;
            const isLast = idx === GOALS.length - 1;
            return (
              <button
                key={goal.id}
                disabled={!goal.selectable}
                onClick={() => handleSelect(goal)}
                className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all active:bg-opacity-80 ${
                  !isLast ? `border-b ${rowBorder}` : ""
                } ${
                  isSelected
                    ? isDark
                      ? "bg-[#1A2535]"
                      : "bg-teal-50"
                    : ""
                } ${!goal.selectable ? "opacity-50" : ""}`}
              >
                {/* Icon */}
                <GoalIcon emoji={goal.emoji} selectable={goal.selectable} isDark={isDark} />

                {/* Label + subtitle */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[15px] font-semibold leading-tight ${
                      goal.selectable ? titleColor : nameMuted
                    }`}
                  >
                    {goal.name}
                  </p>
                  {goal.subtitle && (
                    <p className={`text-[12px] mt-0.5 font-medium ${goal.subtitleColor || subtitleMuted}`}>
                      {goal.subtitle}
                    </p>
                  )}
                </div>

                {/* Radio / Lock */}
                <RadioCircle
                  selected={isSelected}
                  selectable={goal.selectable}
                  isDark={isDark}
                />
              </button>
            );
          })}
        </div>

        {/* Footer: ADD GOAL */}
        <div
          className={`flex-shrink-0 border-t ${rowBorder} px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]`}
        >
          <button
            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-sm border-2 border-dashed bg-transparent transition-all active:scale-[0.98] ${
              isDark
                ? "border-slate-700 text-slate-400 hover:border-[#25D3A4] hover:text-[#25D3A4]"
                : "border-slate-200 text-slate-500 hover:border-[#25D3A4] hover:text-[#25D3A4]"
            }`}
          >
            <Plus size={18} />
            <span className="text-[14px] font-bold uppercase tracking-wide">Add Goal</span>
          </button>
        </div>
      </div>
    </>
  );
}
