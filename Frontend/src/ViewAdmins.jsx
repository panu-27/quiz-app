import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { FingerPrintIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "./api/axios";

export default function ViewAdmins() {
  const { searchQuery } = useOutletContext();
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    api.get("/super/all-admins").then(res => setAdmins(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("DELETE ADMIN?")) return;
    await api.delete(`/super/admin/${id}`);
    setAdmins(prev => prev.filter(a => a._id !== id));
  };

  const filtered = admins.filter(a => 
    a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((item) => (
        <div key={item._id} className="bg-white border-l-8 border-l-blue-500 p-5 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <FingerPrintIcon className="w-5 h-5 text-blue-500" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm uppercase truncate">{item.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">{item.email}</p>
            </div>
          </div>
          <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-300 hover:text-red-500">
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
}