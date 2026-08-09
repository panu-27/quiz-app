import React, { useState, useEffect } from "react";
import { Send, Clock, Users, FileText, CheckCircle2, Trash2 } from "lucide-react";
import axios from "axios";

// Assuming baseURL is configured similarly to other teacher pages
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function TeacherNotices() {
  const [batches, setBatches] = useState([]);
  const [notices, setNotices] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [batchesRes, noticesRes] = await Promise.all([
        axios.get(`${baseURL}/teacher/my-batches`, { headers }),
        axios.get(`${baseURL}/notices`, { headers })
      ]);

      const bData = batchesRes.data;
      setBatches(Array.isArray(bData) ? bData : bData.batches || []);
      setNotices(noticesRes.data?.data || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const handleSendNotice = async (e) => {
    e.preventDefault();
    if (!title || !content || !selectedBatch) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("batchId", selectedBatch);
      if (attachment) formData.append("attachment", attachment);
      if (image) formData.append("image", image);

      const res = await axios.post(
        `${baseURL}/notices`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        setSuccess(true);
        setTitle("");
        setContent("");
        setAttachment(null);
        setImage(null);
        // Optimistic UI update
        setNotices([res.data.data, ...notices]);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Error sending notice:", err);
      alert("Failed to send notice");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice? It will be removed for all students.")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${baseURL}/notices/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotices(prev => prev.filter(n => n._id !== id));
      }
    } catch (err) {
      console.error("Error deleting notice:", err);
      alert("Failed to delete notice");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Updates</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Send real-time updates and announcements to your batches.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Compose Section */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit">
          <div className="flex items-center gap-2 mb-6">
            <Send className="text-blue-500" size={20} strokeWidth={2.5} />
            <h2 className="text-lg font-bold text-slate-800">Compose Notice</h2>
          </div>

          <form onSubmit={handleSendNotice} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Select Batch
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              >
                <option value="" disabled>Choose a batch...</option>
                {Object.entries(
                  batches.reduce((acc, b) => {
                    const c = b.className || "General Class";
                    if (!acc[c]) acc[c] = [];
                    acc[c].push(b);
                    return acc;
                  }, {})
                ).map(([cName, classBatches]) => (
                  <optgroup key={cName} label={cName}>
                    {classBatches.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Notice Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Tomorrow's class is rescheduled"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Message Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement here..."
                rows={5}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none placeholder:text-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Document Attachment (PDF, DOC)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => setAttachment(e.target.files[0])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Image Attachment
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm text-white transition-all ${
                success ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30'
              } disabled:opacity-70 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 size={18} strokeWidth={2.5} /> Sent Successfully!
                </>
              ) : (
                <>
                  <Send size={16} strokeWidth={2.5} /> Publish Notice
                </>
              )}
            </button>
          </form>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <Clock className="text-indigo-500" size={20} strokeWidth={2.5} />
              <h2 className="text-lg font-bold text-slate-800">Sent History</h2>
            </div>

            {notices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <FileText size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="font-medium text-sm">No notices sent yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notices.map(notice => {
                  const batchName = batches.find(b => b._id === notice.batchId)?.name || "Unknown Batch";
                  return (
                    <div key={notice._id} className="p-5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-slate-800 text-base leading-tight">{notice.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                            {new Date(notice.createdAt).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDeleteNotice(notice._id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{notice.content}</p>
                      
                      {notice.imageUrl && (
                        <div className="mb-4">
                          <img 
                            src={notice.imageUrl} 
                            alt="Attachment preview" 
                            className="max-w-full rounded-lg shadow-sm border border-slate-200 cursor-pointer max-h-40 object-cover hover:opacity-90 transition-opacity"
                            onClick={() => window.open(notice.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      
                      {notice.attachmentUrl && (
                        <div className="mb-4">
                            <button
                              onClick={() => {
                                const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(notice.attachmentUrl)}`;
                                window.open(viewerUrl, '_blank');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              <FileText size={14} /> View Document
                            </button>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 w-fit px-3 py-1.5 rounded-lg border border-indigo-100">
                        <Users size={12} strokeWidth={3} />
                        Sent to: {batchName}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
