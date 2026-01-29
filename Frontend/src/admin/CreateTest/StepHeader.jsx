import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function StepHeader({ step, setStep }) {
  const stepLabels = ["Title", "Config", "Phy", "Chem", "Math/Bio", "Review"];
  const totalSteps = stepLabels.length;

  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100;

  const handleStepClick = (targetStep) => {
    // Only allow going backward
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  return (
    <div className="w-full py-6 px-8 bg-white border-b border-slate-100">
      <div className="relative flex items-center justify-between">

        {/* Base line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />

        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        {stepLabels.map((label, idx) => {
          const s = idx + 1;
          const isCompleted = step > s;
          const isActive = step === s;
          const isClickable = step > s;

          return (
            <div
              key={label}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <button
                type="button"
                onClick={() => handleStepClick(s)}
                disabled={!isClickable}
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${s}: ${label}`}
                className={`
                  w-7 h-7 flex items-center justify-center rounded-full
                  text-[10px] font-black transition-all duration-300
                  ${
                    isActive
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 shadow-md scale-110"
                      : ""
                  }
                  ${
                    isCompleted
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                      : ""
                  }
                  ${
                    !isCompleted && !isActive
                      ? "bg-white border-2 border-slate-300 text-slate-300 cursor-not-allowed"
                      : ""
                  }
                `}
              >
                {(isCompleted || isActive) ? (
                  <CheckCircleIcon className="w-4 h-4 stroke-[3]" />
                ) : (
                  s
                )}
              </button>

              <span
                className={`text-[9px] font-bold uppercase tracking-tighter transition-colors duration-300 ${
                  isActive ? "text-indigo-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
