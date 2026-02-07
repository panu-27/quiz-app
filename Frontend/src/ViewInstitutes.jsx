import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { HomeModernIcon, TrashIcon } from "@heroicons/react/24/outline";
import api from "./api/axios";

export default function ViewInstitutes() {
  const { searchQuery } = useOutletContext();
  const [institutes, setInstitutes] = useState([]);

  useEffect(() => {
    api.get("/super/institutes").then(res => setInstitutes(res.data));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("DELETE INSTITUTE?")) return;
    await api.delete(`/super/institute/${id}`);
    setInstitutes(prev => prev.filter(i => i._id !== id));
  };

  const filtered = institutes.filter(i => 
    i.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((item) => (
        <div key={item._id} className="bg-white border-l-8 border-l-[#08BD80] p-5 rounded-2xl flex justify-between items-center shadow-sm border border-slate-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
              <HomeModernIcon className="w-5 h-5 text-[#08BD80]" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-slate-800 text-xs md:text-sm uppercase truncate">{item.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter truncate">Code: {item.code}</p>
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