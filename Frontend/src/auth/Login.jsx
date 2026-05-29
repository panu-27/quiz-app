import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicHeader from "./PublicHeader";

export default function AuthPage() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const tracks = [
    { name: "MHT-CET (PCM)",        image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/iit_jee.svg" },
    { name: "MHT-CET (PCB)",        image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/neet_ug.svg" },
    { name: "JEE Main + Advanced",  image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/iit_jee.svg" },
    { name: "NEET UG",              image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/neet_ug.svg" },
    { name: "Class 11 Foundation",  image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/class_12.svg" },
    { name: "Class 12 Board + CET", image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/class_12.svg" },
    { name: "Droppers Batch",       image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/cat.svg" },
    { name: "Crash Course",         image: "https://static.uacdn.net/production/_next/static/images/home/goalIcons/bank_exams.svg" },
  ];

  const borderColors = [
    "border-green-500",
    "border-yellow-900",
    "border-red-900",
    "border-blue-400",
    "border-pink-800",
  ];

  return (
    <div className="min-h-screen bg-white">
      
      <PublicHeader />

      <div className=" px-4 sm:px-12 md:px-6 xl:px-52">

        {/* ── HERO ── */}
        <section className="max-w-7xl mx-auto pt-6 sm:pt-24 pb-10">
          <div className="grid md:grid-cols-2 gap-14 items-center">

            {/* LEFT */}
            <div className="max-w-xl">
              <h1 className="text-[32px] sm:text-[40px] leading-[1.15] font-serif tracking-tight text-slate-700">
                Crack your goal with Manchar's Best Platform
              </h1>

              <p className="mt-4 text-[15px] sm:text-[16px] text-slate-600">
                Over <span className="font-semibold text-green-600 underline">10 Thousand</span>{" "}
                learners trust us for their preparation
              </p>

              {/* Mobile illustration
                  ⚠️ FIX: Use ./home-illustration.svg not /home-illustration.svg
                  In Electron, /path resolves to file:///path (doesn't exist).
                  ./path resolves relative to index.html inside dist/ — works correctly. */}
              <div className="mt-8 md:hidden flex justify-center">
                <img
                  src="./home-illustration.svg"
                  alt="Learning"
                  className="w-[300px]"
                />
              </div>

              {/* CTA form */}
              <div className="mt-10 max-w-md">
                <form
                  onSubmit={(e) => { e.preventDefault(); navigate("/register"); }}
                  className="space-y-4"
                >
                  <input
                    type="tel"
                    placeholder="Enter your Email address"
                    className="w-full px-4 py-3 sm:py-3.5 border border-slate-300 rounded-xl
                               text-sm text-slate-700 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <p className="text-xs px-3 sm:px-0 text-slate-500 leading-relaxed">
                    We'll send an OTP for verification
                  </p>
                  <button
                    type="submit"
                    className="w-full py-3 sm:py-3.5 rounded-xl bg-slate-700 text-white
                               font-semibold text-sm cursor-pointer hover:bg-slate-800 transition"
                  >
                    Join for free
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT — desktop illustration */}
            <div className="hidden md:flex justify-end">
              {/* ⚠️ FIX: ./ prefix for Electron */}
              <img
                src="./home-illustration.svg"
                alt="Learning"
                className="w-[520px]"
              />
            </div>

          </div>
        </section>

        {/* ── GOAL SECTION ── */}
        <section className="max-w-7xl mx-auto pt-8 sm:pt-14 pb-20">

          <h2 className="text-[22px] sm:text-[28px] font-semibold text-slate-800">
            Choose your preparation track
          </h2>
          <p className="mt-1 text-slate-600 text-sm sm:text-base">
            Focused programs designed for Maharashtra & national entrance exams
          </p>

          <div className="mt-6 max-w-md">
            <input
              type="text"
              placeholder="Search your exam or course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl
                         text-sm placeholder:text-slate-400
                         focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <h3 className="mt-10 text-lg font-semibold text-slate-800">
            Popular Career Tracks
          </h3>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 min-h-[420px]">
            {tracks
              .filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
              .map((track, index) => (
                <div
                  key={track.name}
                  className={`flex flex-col items-center p-5 border ${borderColors[index % borderColors.length]}
                              rounded-2xl hover:shadow-sm cursor-pointer transition`}
                >
                  <div className="w-20 h-20 bg-slate-100 rounded-full mb-3 flex items-center justify-center">
                    {/* Track icons are from external CDN — fine in both web and Electron */}
                    <img src={track.image} alt={track.name} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-sm font-medium text-center text-slate-700">{track.name}</span>
                </div>
              ))}
          </div>

          <div className="mt-10">
            <button className="px-6 py-3 border border-slate-300 rounded-xl
                               cursor-pointer font-medium text-sm hover:bg-slate-50 transition">
              Join In Your Dream Our Responsiblity
            </button>
          </div>

        </section>
      </div>
    </div>
  );
}