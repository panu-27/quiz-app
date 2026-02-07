import { useState, useEffect } from "react";
import api from "./api/axios";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import SuperHeader from "./SuperHeader";

export default function CreateAdminPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [institutes, setInstitutes] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    instituteId: "",
  });
  const baseURL = import.meta.env.VITE_API_BASE_URL;
  useEffect(() => {
    api.get("/super/get-institutes").then((res) => setInstitutes(res.data));


  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${baseURL}/super/create-institute-admin`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` , "Content-Type": "application/json" } ,
        body: JSON.stringify(formData)
      });
      alert("Admin created");
    } catch {
      alert("Admin creation failed");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <SuperHeader />
      <div className="px-4 sm:px-12 md:px-6 xl:px-52 pt-10 sm:pt-16">
        <div className="grid md:grid-cols-2 gap-16 items-start">

          {/* LEFT */}
          <div className="max-w-md">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Create Admin
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Assign an admin to an institute
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                required
                placeholder="Admin Name"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <input
                required
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  placeholder="Set Password"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl text-sm"
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeIcon className="w-5 h-5 text-slate-500" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-slate-500" />
                  )}
                </button>
              </div>

              <select
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, instituteId: e.target.value })
                }
              >
                <option value="">Link to Institute...</option>
                {institutes.map((ins) => (
                  <option key={ins._id} value={ins._id}>
                    {ins.name}
                  </option>
                ))}
              </select>

              <button className="w-full py-3 rounded-xl bg-slate-800 text-white font-semibold text-sm hover:bg-slate-900">
                Create Admin
              </button>
            </form>
          </div>

          {/* RIGHT */}
          <div className="hidden sm:flex justify-center items-center">
            <img
              src="/admin.svg"
              className="w-[300px] md:w-[420px] object-contain"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
}
