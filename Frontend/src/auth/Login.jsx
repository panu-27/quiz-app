import { useNavigate } from "react-router-dom";
import { UserPlusIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import PublicHeader from "./PublicHeader";
import DesktopLanding from "./DesktopLanding";

export default function AuthPage() {
  const navigate = useNavigate();

  return (
    <>
      <DesktopLanding />
      <div className="min-h-screen bg-white pb-24 lg:hidden">
        
        <PublicHeader />

        <div className=" px-4 sm:px-12 md:px-6 xl:px-52">

          {/* ── HERO ── */}
          <section className="max-w-7xl mx-auto pt-6 sm:pt-24 pb-10">
            <div className="grid md:grid-cols-2 gap-14 items-center">

              {/* LEFT */}
              <div className="max-w-xl">
                <h1 className="text-[28px] sm:text-[34px] leading-[1.15] font-serif tracking-tight text-slate-700">
                  Crack your goal with Manchar's Best Coaching Institute
                </h1>

                <p className="mt-4 text-[15px] sm:text-[16px] text-slate-600">
                  Over <span className="font-semibold text-green-600 underline">10 Thousand</span>{" "}
                  learners trust us for their preparation
                </p>

                <div className="mt-8 md:hidden flex justify-center">
                  <img
                    src="./home-illustration.svg"
                    alt="Learning"
                    className="w-[300px]"
                  />
                </div>
              </div>

              {/* RIGHT — desktop illustration */}
              <div className="hidden md:flex justify-end">
                <img
                  src="./home-illustration.svg"
                  alt="Learning"
                  className="w-[520px]"
                />
              </div>

            </div>
          </section>

        </div>

        {/* FIXED BOTTOM BUTTONS */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-8 pt-4 z-50 flex flex-col gap-3 bg-transparent">
          <button
            onClick={() => navigate("/register")}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-[#1A66FF] text-white font-medium text-[15px] cursor-pointer hover:bg-[#1556D6] transition active:scale-[0.98]"
          >
            <UserPlusIcon className="w-5 h-5" />
            Create Account
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-lg bg-white border border-slate-300 text-slate-700 font-medium text-[15px] cursor-pointer hover:bg-slate-50 transition active:scale-[0.98]"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Log In
          </button>
        </div>
        
      </div>
    </>
  );
}