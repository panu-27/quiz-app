import { useState, useEffect } from "react";
import api from "./api/axios";
import { 
  PlusIcon, 
  TrashIcon, 
  BuildingLibraryIcon, 
  XMarkIcon,
  FingerPrintIcon 
} from "@heroicons/react/24/outline";

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState("institutes");
  const [institutes, setInstitutes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({ 
    name: "", code: "", email: "", password: "", instituteId: "" 
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === "institutes" ? "/super/institutes" : "/super/all-admins";
      const res = await api.get(endpoint);
      if (activeTab === "institutes") setInstitutes(res.data);
      else setAdmins(res.data);
    } catch (err) {
      console.error("FETCH_ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const endpoint = activeTab === "institutes" ? "/super/create-institute" : "/super/create-institute-admin";
      await api.post(endpoint, formData);
      setShowModal(false);
      setFormData({ name: "", code: "", email: "", password: "", instituteId: "" });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || "ACTION_FAILED"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`PERMANENTLY DELETE THIS ${type.toUpperCase()}?`)) return;
    try {
      const path = type === "institute" ? `/super/institute/${id}` : `/super/admin/${id}`;
      await api.delete(path);
      fetchData();
    } catch (err) { console.error("DELETE_FAILED"); }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] font-sans text-slate-900 pb-10">
      {/* NEXUS PREMIUM HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-blue-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
               <BuildingLibraryIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter italic text-blue-600">NEXUS<span className="text-slate-800 not-italic uppercase text-sm ml-1 tracking-widest">Control</span></h1>
            </div>
          </div>
          
          <button 
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <PlusIcon className="w-5 h-5 stroke-[3px]" /> 
            {activeTab === 'institutes' ? 'New Institute' : 'New Admin'}
          </button>
        </div>

        {/* MODERN TABS */}
        <div className="max-w-7xl mx-auto mt-6 flex bg-blue-50/50 p-1 rounded-2xl w-full md:w-fit">
          {['institutes', 'admins'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 md:flex-none px-10 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-white text-blue-600 shadow-md' 
                : 'text-slate-400 hover:text-blue-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {loading ? (
          <div className="py-40 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4" />
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.3em]">Syncing_Nexus...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === "institutes" ? (
              institutes.map((ins) => (
                <div key={ins._id} className="bg-white rounded-[2.5rem] border border-blue-50 flex flex-col overflow-hidden hover:shadow-2xl hover:shadow-blue-200/50 transition-all group">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <BuildingLibraryIcon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-blue-400 bg-blue-50 px-3 py-1 rounded-full tracking-widest uppercase">#{ins.code}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{ins.name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created: {new Date(ins.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="p-4 mt-auto">
                    <button 
                      onClick={() => handleDelete("institute", ins._id)}
                      className="w-full py-3 bg-red-50 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white"
                    >
                      <TrashIcon className="w-4 h-4" /> Terminate Institute
                    </button>
                  </div>
                </div>
              ))
            ) : (
              admins.map((admin) => (
                <div key={admin._id} className="bg-white rounded-[2.5rem] border border-blue-50 p-6 hover:border-blue-500 transition-all group relative">
                   <button 
                    onClick={() => handleDelete("admin", admin._id)}
                    className="absolute top-6 right-6 p-2 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200">
                      <FingerPrintIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h3 className="font-bold text-slate-800 truncate uppercase tracking-tight">{admin.name}</h3>
                      <p className="text-xs text-slate-400 truncate">{admin.email}</p>
                    </div>
                  </div>
                  <div className="inline-block bg-blue-50 text-blue-600 px-4 py-1.5 text-[10px] font-black rounded-xl uppercase tracking-widest">
                    {admin.instituteId?.name || "Global_Access"}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* NEXUS MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 animate-in slide-in-from-bottom duration-500 shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black italic text-blue-600 tracking-tighter uppercase">
                {activeTab === 'institutes' ? 'Add_Institute' : 'Add_Admin'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-all"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-6">
              {activeTab === "institutes" ? (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Legal Identity</label>
                    <input required className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                           placeholder="E.g. Nexus Academy" onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-blue-400 tracking-widest">Access Code</label>
                    <input required className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                           placeholder="NXS-001" onChange={e => setFormData({...formData, code: e.target.value})} />
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <input required className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold" 
                         placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                  <input required type="email" className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold" 
                         placeholder="Email Address" onChange={e => setFormData({...formData, email: e.target.value})} />
                  <input required type="password" className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold" 
                         placeholder="Password" onChange={e => setFormData({...formData, password: e.target.value})} />
                  <select required className="w-full bg-blue-50/50 border-none rounded-2xl px-5 py-3 text-sm font-bold text-slate-500" 
                          onChange={e => setFormData({...formData, instituteId: e.target.value})}>
                    <option value="">Select Institute...</option>
                    {institutes.map(ins => <option key={ins._id} value={ins._id}>{ins.name}</option>)}
                  </select>
                </div>
              )}
              <button className="w-full bg-blue-600 text-white py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all mt-4">
                Execute_Creation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}