import { useState } from "react";
import api from "./api/axios";
import { useNavigate } from "react-router-dom";
import SuperHeader from "./SuperHeader";

export default function CreateInstitutePage() {
  const [formData, setFormData] = useState({ name: "", code: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/super/create-institute`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` , "Content-Type": "application/json" } ,
        body: JSON.stringify(formData)
      });
      console.log(res);
      alert("institute created");
    } catch {
      alert("Institute creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
<SuperHeader/>
      <div className="px-4 sm:px-12 md:px-6 xl:px-52 pt-10 sm:pt-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT */}
          <div className="max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Create Institute
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Provision a new institute on Nexus
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <input
                required
                placeholder="Institute Name"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl
                  text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                required
                placeholder="Access Code"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl
                  text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
              />

              <button
                disabled={loading}
                className="w-full py-3 rounded-xl bg-slate-800 text-white
                  font-semibold text-sm hover:bg-slate-900 transition"
              >
                {loading ? "Creating..." : "Create Institute"}
              </button>
            </form>
          </div>

          {/* RIGHT */}
          <div className="hidden sm:flex justify-center items-center">
            <img
              src="/institute.svg"
              className="w-[300px] md:w-[500px] object-contain"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
