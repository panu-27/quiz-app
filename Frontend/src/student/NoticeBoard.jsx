import React, { useState, useEffect, useRef } from "react";
import { Bell, ArrowLeft, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { initSocket } from "../api/socket";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const STATUS_BAR_H = 28.5;

export default function NoticeBoard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize lastViewed synchronously
  const [lastViewed, setLastViewed] = useState(() => {
    const stored = localStorage.getItem("lastNoticeViewAt");
    if (stored) return new Date(stored);
    // If first time opening, default to user's account creation time (or epoch)
    return user?.createdAt ? new Date(user.createdAt) : new Date(0);
  });
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchNotices();
    
    const socket = initSocket();
    socket.connect();

    socket.on("new_notice", (newNotice) => {
      // Append to the bottom for the chat-style view
      setNotices((prev) => [...prev, newNotice]);
    });

    socket.on("delete_notice", (deletedId) => {
      setNotices((prev) => prev.filter(n => n._id !== deletedId));
    });

    // Mark messages as read after 2 seconds on the page
    const readTimer = setTimeout(() => {
      localStorage.setItem("lastNoticeViewAt", new Date().toISOString());
    }, 2000);

    return () => {
      clearTimeout(readTimer);
      socket.off("new_notice");
      socket.off("delete_notice");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [notices]);

  const fetchNotices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${baseURL}/notices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Sort ascending (oldest first) so newest is at the bottom
        const sorted = res.data.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setNotices(sorted);
      }
    } catch (err) {
      console.error("Failed to fetch notices", err);
    } finally {
      setLoading(false);
    }
  };

  const resolveMediaUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:5000'}${url}`;
  };

  // Helper to format dates like "Today", "Yesterday", or "August 12, 2026"
  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDark ? 'bg-[#0A0F1A] text-white' : 'bg-[#F4F7FC] text-slate-900'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Sora', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ══ STICKY HEADER AREA ══ */}
      <div className={`flex-shrink-0 sticky top-0 z-40 px-5 pb-4 flex flex-col gap-4 ${isDark ? 'bg-[#0A0F1A]' : 'bg-[#F4F7FC]'}`} style={{ paddingTop: STATUS_BAR_H + 8 }}>
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                  <button
                      onClick={() => navigate(-1)}
                      className={`w-10 h-10 -ml-2 flex items-center justify-center transition-colors ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                      <ArrowLeft size={24} />
                  </button>
                  <h1 className={`text-[17px] font-bold font-display truncate leading-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Updates
                  </h1>
              </div>
          </div>
      </div>

      {/* List Content */}
      <div className="flex-1 px-5 pt-2 pb-28 space-y-3">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : notices.length === 0 ? (
          <div className="text-center py-10 text-slate-500 font-medium flex flex-col items-center">
            <Bell size={40} strokeWidth={1.5} className="mb-3 opacity-50 text-slate-400" />
            No new notices
          </div>
        ) : (
          <div className="space-y-4">
            {notices.map((notice, idx) => {
              const currentDateHeader = formatDateHeader(notice.createdAt);
              const prevDateHeader = idx > 0 ? formatDateHeader(notices[idx - 1].createdAt) : null;
              const showDateHeader = currentDateHeader !== prevDateHeader;

              // Check if this is the first unread message
              const isUnread = lastViewed ? new Date(notice.createdAt) > lastViewed : false;
              const prevIsUnread = idx > 0 ? (lastViewed ? new Date(notices[idx - 1].createdAt) > lastViewed : false) : false;
              const showUnreadDivider = isUnread && !prevIsUnread;

              return (
                <React.Fragment key={notice._id}>
                  {/* Faint Line Date Divider (No Fill) */}
                  {showDateHeader && (
                    <div className="flex items-center justify-center my-6">
                      <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800/60' : 'bg-slate-300/80'}`} />
                      <span className={`px-4 text-[11px] font-semibold tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {currentDateHeader}
                      </span>
                      <div className={`h-[1px] flex-1 ${isDark ? 'bg-slate-800/60' : 'bg-slate-300/80'}`} />
                    </div>
                  )}

                  {/* Unread Messages Divider */}
                  {showUnreadDivider && (
                    <div className="flex items-center justify-center my-4" style={{ animation: 'slideUp 0.3s ease-out' }}>
                       <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wider ${isDark ? 'bg-slate-800/50 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                         UNREAD MESSAGES
                       </span>
                    </div>
                  )}

                  {/* WhatsApp Style Message Bubble */}
                  <div 
                    className="flex items-start gap-2.5"
                    style={{ animation: `slideUp 0.3s ease-out both` }}
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full shrink-0 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold mt-1 shadow-sm overflow-hidden">
                      {notice.teacherId?.profilePic ? (
                        <img src={resolveMediaUrl(notice.teacherId.profilePic)} alt="teacher" className="w-full h-full object-cover" />
                      ) : (
                        notice.teacherId?.name?.[0] || "T"
                      )}
                    </div>

                    {/* Chat Bubble Group */}
                    <div className="flex flex-col gap-1.5 max-w-[85%]">
                      
                      {/* Main Text Bubble */}
                      <div className={`relative rounded-2xl rounded-tl-none px-4 py-3 shadow-sm ${isDark ? 'bg-[#1E293B] text-slate-200 border border-slate-800' : 'bg-white text-slate-800 border border-slate-100'}`}>
                        {/* Title / Teacher Name */}
                        <div className="flex items-center justify-between gap-4 mb-1">
                          <span className={`text-[13px] font-extrabold ${isDark ? 'text-indigo-400' : 'text-[#2D5588]'}`}>
                            {notice.title}
                          </span>
                        </div>
                        
                        {/* Message Content */}
                        <p className={`text-[14px] leading-relaxed whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {notice.content}
                        </p>

                        {/* Document Attachment Button */}
                        {notice.attachmentUrl && !/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(notice.attachmentUrl) && (
                          <div className="mt-3 mb-1">
                              <button
                                  onClick={() => {
                                    const fileUrl = resolveMediaUrl(notice.attachmentUrl);
                                    const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}`;
                                    window.open(viewerUrl, '_blank');
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                                >
                                <FileText size={14} /> Open Attachment
                              </button>
                          </div>
                        )}

                        {/* Time */}
                        <div className={`text-[10px] font-medium text-right mt-1.5 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          {new Date(notice.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>

                      {/* Dedicated Image Bubble */}
                      {notice.imageUrl && (
                        <div className={`relative rounded-2xl p-1 shadow-sm w-fit ${isDark ? 'bg-[#1E293B] border border-slate-800' : 'bg-white border border-slate-100'}`}>
                          <img 
                            src={resolveMediaUrl(notice.imageUrl)} 
                            alt="Attached Graphic" 
                            className="w-full h-auto rounded-xl cursor-pointer object-contain hover:opacity-95 transition-opacity"
                            onClick={() => window.open(resolveMediaUrl(notice.imageUrl), '_blank')}
                          />
                        </div>
                      )}

                      {/* Legacy Image Attachment Bubble */}
                      {notice.attachmentUrl && /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(notice.attachmentUrl) && (
                        <div className={`relative rounded-2xl p-1 shadow-sm w-fit ${isDark ? 'bg-[#1E293B] border border-slate-800' : 'bg-white border border-slate-100'}`}>
                          <img 
                            src={resolveMediaUrl(notice.attachmentUrl)} 
                            alt="Attached Graphic" 
                            className="w-full h-auto rounded-xl cursor-pointer object-contain hover:opacity-95 transition-opacity"
                            onClick={() => window.open(resolveMediaUrl(notice.attachmentUrl), '_blank')}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
