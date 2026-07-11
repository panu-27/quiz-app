import React from 'react';
import { useTheme } from '../context/ThemeContext';

export default function PrimaryButton({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  variant = 'solid', // 'solid' or 'outline'
  className = '' 
}) {
  const { theme } = useTheme();

  const baseStyles = "w-full py-3 font-medium text-[15px] active:scale-[0.98] transition-all shadow-none text-center disabled:opacity-70";
  
  let variantStyles = "";
  if (variant === 'solid') {
    variantStyles = `rounded-[12px] font-bold ${
      theme === 'dark' 
        ? 'bg-white text-black hover:bg-slate-100' 
        : 'bg-slate-900 text-white hover:bg-slate-800'
    }`;
  } else if (variant === 'outline') {
    variantStyles = `rounded-[12px] font-bold border bg-transparent backdrop-blur-sm ${
      theme === 'dark' 
        ? 'border-[#5F6368] text-[#8AB4F8] hover:bg-white/5' 
        : 'border-[#DADCE0] text-[#1A73E8] hover:bg-black/5'
    }`;
  } else if (variant === 'google') {
    // Google style: professional blue, less rounded, regular font weight
    variantStyles = 'rounded-md bg-blue-600 text-white hover:bg-blue-700 tracking-wide';
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}
