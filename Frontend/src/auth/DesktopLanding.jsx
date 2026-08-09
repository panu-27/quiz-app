import { Search, Gift, Smartphone, BookOpen, MonitorPlay, ChevronDown, Facebook, Youtube, Twitter, Linkedin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DesktopLanding() {
  const navigate = useNavigate();

  return (
    <div className="hidden lg:block min-h-screen bg-white font-sans text-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-800">
            <img src="/logo.png" alt="Targate Coaching Classes Logo" className="w-10 h-10 object-contain" />
            Targate Coaching Classes
          </div>
          <div className="flex items-center gap-4">
            <button className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-red-500 hover:bg-red-50 transition">
              <Gift size={20} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-2.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-900 transition"
            >
              Join for free
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 max-w-xl">
          <h1 className="text-[44px] md:text-4xl font-serif font-semibold text-[#3C4852] leading-[1.15] tracking-tight mb-6">
            Crack your goal with Manchar's Best Coaching Institute
          </h1>
          <p className="text-[#3C4852] text-lg mb-6 font-medium">
            Over <span className="text-[#08BD80] font-semibold underline">1000+</span> learners trust us for their preparation
          </p>

          <div className="space-y-4 max-w-[420px]">
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden h-14 bg-white focus-within:border-[#08BD80] focus-within:ring-1 focus-within:ring-[#08BD80] transition-all hover:border-slate-400">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-3 h-full outline-none text-[#3C4852] font-medium placeholder:text-slate-400 placeholder:font-normal text-[15px]"
                onFocus={() => navigate("/register")}
              />
            </div>
            <p className="text-[13px] text-slate-500 font-medium">We'll use this for your account security</p>
            <button
              onClick={() => navigate("/register")}
              className="w-full h-12 rounded-lg bg-[#08BD80] text-white font-semibold text-lg hover:bg-[#009965] transition shadow-sm"
            >
              Join for free
            </button>
          </div>
        </div>

        <div className="flex-1 flex justify-center relative w-full mt-10 md:mt-0">
          <img src="/home-illustration.svg" alt="Students studying" className="w-full max-w-[560px] object-contain" />
        </div>
      </section>



      {/* Feature Cards Section */}
      {/* <section className="max-w-[1200px] mx-auto px-6 py-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col gap-6">
            <img src="/daily_live_classes.png" alt="Daily live classes" className="w-full object-contain rounded-xl shadow-sm" />
            <div>
              <h3 className="text-[22px] font-semibold text-[#3C4852] mb-3">Daily live classes</h3>
              <p className="text-[15px] text-slate-600 font-medium leading-relaxed">Chat with educators, ask questions, answer live polls, and get your doubts cleared - all while the class is going on</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img src="/practice_revise.png" alt="Practice and revise" className="w-full object-contain rounded-xl shadow-sm" />
            <div>
              <h3 className="text-[22px] font-semibold text-[#3C4852] mb-3">Practice and revise</h3>
              <p className="text-[15px] text-slate-600 font-medium leading-relaxed">Learning isn't just limited to classes with our practice section, mock tests and lecture notes shared as PDFs for your revision</p>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <img src="/learn_anytime.png" alt="Learn anytime, anywhere" className="w-full object-contain rounded-xl shadow-sm" />
            <div>
              <h3 className="text-[22px] font-semibold text-[#3C4852] mb-3">Learn anytime, anywhere</h3>
              <p className="text-[15px] text-slate-600 font-medium leading-relaxed">One subscription gets you access to all our live and recorded classes to watch from the comfort of any of your devices</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* App Download Section */}
      {/* <section className="max-w-[1200px] mx-auto px-6 py-32 flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="flex-1 max-w-xl">
          <h2 className="text-[32px] md:text-[40px] font-bold text-[#3C4852] leading-[1.15] tracking-tight mb-4">
            Get the learning app
          </h2>
          <p className="text-[#3C4852] text-xl mb-10 font-medium">
            Download lessons and learn anytime, anywhere with the Targate Coaching Classes app
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#" className="hover:opacity-90 transition">
              <img src="https://static.uacdn.net/production/_next/static/images/app_store.png?q=75&auto=format%2Ccompress&w=256" alt="App Store" className="h-[40px] w-auto" />
            </a>
            <a href="#" className="hover:opacity-90 transition">
              <img src="https://static.uacdn.net/production/_next/static/images/play_store.png?q=75&auto=format%2Ccompress&w=256" alt="Google Play" className="h-[40px] w-auto" />
            </a>
          </div>
        </div>
        <div className="flex-1 flex justify-center md:justify-end items-center mt-8 md:mt-0">
          <img 
            src="/app_mockup.png" 
            alt="App Interface Mockups" 
            className="w-full max-w-[400px] object-contain drop-shadow-2xl rounded-2xl" 
          />
        </div>
      </section> */}

      {/* Footer */}
      <footer className="w-full bg-[#181a1b] text-[#a0a5aa] flex flex-col justify-between mt-12" style={{ minHeight: '100vh' }}>
        <div className="max-w-[1200px] mx-auto px-6 pt-32 pb-16 w-full flex flex-col md:flex-row justify-between gap-16 flex-1">
          {/* Left Column */}
          <div className="w-full md:w-[380px] flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-[26px] font-semibold tracking-tight text-white mb-6">
                <img src="/logo.png" alt="Targate Coaching Classes Logo" className="w-10 h-10 object-contain" />
                <span className="text-[#08BD80]">Targate</span>
              </div>
              <p className="text-[14px] font-medium leading-[1.8] mb-10 pr-4">
                Targate Coaching Classes is democratising education, making it accessible to all. Join the revolution, learn on India's largest learning platform.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:opacity-90 transition">
                  <img src="https://static.uacdn.net/production/_next/static/images/app_store.png?q=75&auto=format%2Ccompress&w=256" alt="App Store" className="h-[34px] w-auto" />
                </a>
                <a href="#" className="hover:opacity-90 transition">
                  <img src="https://static.uacdn.net/production/_next/static/images/play_store.png?q=75&auto=format%2Ccompress&w=256" alt="Google Play" className="h-[34px] w-auto" />
                </a>
              </div>
            </div>

            <div className="mt-16 md:mt-auto">
              <h5 className="text-[15px] font-semibold text-white mb-2">Reach out to us</h5>
              <p className="text-[14px] font-medium leading-relaxed mb-4 max-w-[280px]">Get your questions answered about learning with Targate Coaching Classes.</p>
              <a href="tel:+919881626075" className="flex items-center gap-3 group mt-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white"><path fillRule="evenodd" clipRule="evenodd" d="M10.0479 14.2293C8.87792 13.0593 7.99592 11.7493 7.40992 10.4203C7.28592 10.1393 7.35892 9.81032 7.57592 9.59332L8.39492 8.77432C9.06592 8.10332 9.06592 7.15432 8.47992 6.56832L7.30592 5.39532C6.52492 4.61432 5.25892 4.61432 4.47792 5.39532L3.82592 6.04632C3.08492 6.78732 2.77592 7.85632 2.97592 8.91632C3.46992 11.5293 4.98792 14.3903 7.43692 16.8393C9.88592 19.2883 12.7469 20.8063 15.3599 21.3003C16.4199 21.5003 17.4889 21.1913 18.2299 20.4503L18.8809 19.7993C19.6619 19.0183 19.6619 17.7523 18.8809 16.9713L17.7079 15.7983C17.1219 15.2123 16.1719 15.2123 15.5869 15.7983L14.6839 16.7023C14.4669 16.9193 14.1379 16.9923 13.8569 16.8683C12.5279 16.2813 11.2179 15.3983 10.0479 14.2293Z" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path><path d="M12.9198 5.53043V3.19043" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path><path d="M17.0897 7.18053L18.7397 5.54053" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path><path d="M18.7499 11.3604H21.0799" stroke="currentColor" strokeWidth="1.125" strokeLinecap="round" strokeLinejoin="round"></path></svg>
                <span className="text-[15px] font-semibold text-white transition">Call</span>
                <span className="text-[15px] font-semibold text-white">+91 98816 26075</span>
              </a>
            </div>
          </div>

          {/* Right Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-16">

              {/* Row 1 */}
              <div className="flex flex-col gap-4">
                <h5 className="text-[15px] font-semibold text-white mb-1">Company</h5>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">About Us</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Shikshodaya</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Careers</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Blogs</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Privacy policy</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Terms and conditions</a>
              </div>

              <div className="flex flex-col gap-4">
                <h5 className="text-[15px] font-semibold text-white mb-1">Help & support</h5>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">User Guidelines</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Site Map</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Refund Policy</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Takedown Policy</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">Grievance Redressal</a>
              </div>

              <div className="flex flex-col gap-4">
                <h5 className="text-[15px] font-semibold text-white mb-1">Products</h5>
                <a href="#" className="text-[13px] font-medium hover:text-white transition flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-white flex items-center justify-center p-1.5"><img src="/logo.png" alt="Learner app" className="w-full h-full object-contain" /></div>
                  Learner app
                </a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#2D81F7] flex items-center justify-center p-1.5"><img src="/logo.png" alt="Educator app" className="w-full h-full object-contain" /></div>
                  Educator app
                </a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#08BD80] flex items-center justify-center p-1.5"><img src="/logo.png" alt="Institution App" className="w-full h-full object-contain" /></div>
                  Institution App
                </a>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-4 col-start-1 md:col-start-2">
                <h5 className="text-[15px] font-semibold text-white mb-1">Popular goals</h5>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">IIT JEE</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">UPSC</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">SSC</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">CSIR UGC NET</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition">NEET UG</a>
              </div>

              <div className="flex flex-col gap-4">
                <h5 className="text-[15px] font-semibold text-white mb-1">Study material</h5>
                <a href="#" className="text-[13px] font-medium hover:text-white transition leading-snug pr-4">UPSC Study Material</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition leading-snug pr-4">NEET UG Study Material</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition leading-snug pr-4">CA Foundation Study Material</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition leading-snug pr-4">JEE Study Material</a>
                <a href="#" className="text-[13px] font-medium hover:text-white transition leading-snug pr-4">SSC Study Material</a>
              </div>

            </div>
          </div>
        </div>

        <div className="w-full border-t border-[#31363a] mt-auto">
          <div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between">
            <p className="text-[12px] font-medium">© 2026 Targate Coaching Classes Pvt Ltd</p>
            <div className="flex gap-6 text-white/40">
              <a href="#" className="hover:text-white transition"><Facebook size={18} /></a>
              <a href="#" className="hover:text-white transition"><Youtube size={18} /></a>
              <a href="#" className="hover:text-white transition"><Twitter size={18} /></a>
              <a href="#" className="hover:text-white transition"><Linkedin size={18} /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
