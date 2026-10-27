import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function EnquiryBottomBar({ className = '' }) {
  const { user } = useAuth();

  if (user?.approved !== false) return null;

  const poppinsFont = { fontFamily: '"Poppins", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif' };

  return (
    <div
      style={poppinsFont}
      className={`bg-gradient-to-r from-[#1EBA9B] to-[#25D3A4] text-white px-5 py-2.5 flex items-center justify-between shadow-[0_-4px_15px_rgba(30,186,155,0.2)] ${className}`}
    >
      <div className="flex flex-col" style={poppinsFont}>
        <span className="font-bold text-[13px] leading-tight" style={poppinsFont}>
          Get access to all batches
        </span>
        <span className="text-[13px] text-white/90 mt-0.5" style={poppinsFont}>
          Please fill out this form
        </span>
      </div>
      <button
        type="button"
        onClick={() => window.open('https://forms.gle/oHKY3wtTYrpGGDp76', '_blank')}
        style={poppinsFont}
        className="bg-white text-[#1EBA9B] px-5 py-2 rounded-lg font-bold text-[13px] active:scale-95 transition-transform shadow-sm whitespace-nowrap"
      >
        Enquiry Form
      </button>
    </div>
  );
}
