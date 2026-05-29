import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, PlayCircle, FileText, Smartphone, Users, PhoneCall, GraduationCap, Calendar, ClipboardList, X, Trophy } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function StudentSubscription() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const educators = [
    { name: "Pranav M", exp: "10+ years exp", img: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80" },
    { name: "Anjali S", exp: "8+ years exp", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80" },
    { name: "Rahul V", exp: "12+ years exp", img: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80" },
    { name: "Sneha K", exp: "5+ years exp", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80" },
    { name: "Vikram R", exp: "7+ years exp", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80" },
  ];

  const scrollToPlans = () => {
    const el = document.getElementById("plans");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-[#2A2B2D] text-slate-900 dark:text-white pb-28 font-sans selection:bg-[#25D3A4] selection:text-black ${theme}`}>
      
      {/* 1. Hero Image Section */}
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        {/* Top bar with back button */}
        <div className="fixed top-8 left-0 right-0 z-50 flex items-center p-4 pointer-events-none">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10 transition-colors hover:bg-white/20 shadow-lg pointer-events-auto"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Image */}
        <img 
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop" 
          alt="Student studying"
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 dark:from-[#2A2B2D] via-slate-50/40 dark:via-[#2A2B2D]/40 to-transparent"></div>
      </div>

      <div className="bg-slate-50 dark:bg-[#2A2B2D] -mt-1 text-slate-900 dark:text-white pb-10 relative z-10">
        <div className="max-w-3xl mx-auto px-5 text-center">
           <h1 className="text-2xl md:text-3xl leading-snug font-bold mb-3 mx-4 text-slate-900 dark:text-white">
             Ace your preparation with the IIT JEE Rank Booster subscription
           </h1>
           <p className="text-slate-600 dark:text-[#A3A3A3] text-[13px] mb-8 font-medium">
             Trusted by over 6,00,000 learners
           </p>

           <div className="space-y-4 text-left max-w-sm mx-auto pl-4 mb-10">
             <div className="flex items-center">
               <div className="w-8 h-8 rounded-full bg-[#4285F4] flex items-center justify-center shrink-0 mr-4">
                 <GraduationCap className="w-4 h-4 text-white" />
               </div>
               <span className="text-[14px] text-slate-800 dark:text-white font-semibold">Exceptional educators to learn from</span>
             </div>
             
             <div className="flex items-center">
               <div className="w-8 h-8 rounded-full bg-[#F4B400] flex items-center justify-center shrink-0 mr-4">
                 <Calendar className="w-4 h-4 text-white" />
               </div>
               <span className="text-[14px] text-slate-800 dark:text-white font-semibold">Fully organized study planner</span>
             </div>
             
             <div className="flex items-center">
               <div className="w-8 h-8 rounded-full bg-[#0F9D58] flex items-center justify-center shrink-0 mr-4">
                 <ClipboardList className="w-4 h-4 text-white" />
               </div>
               <span className="text-[14px] text-slate-800 dark:text-white font-semibold">Mock tests, live quizzes & practice</span>
             </div>
           </div>

           <div className="max-w-sm mx-auto px-2">
             <button 
               onClick={scrollToPlans}
               className="w-full py-4 bg-[#0F9D58] hover:bg-[#0d8c4f] text-white font-bold rounded-xl transition-colors text-[15px] shadow-lg shadow-[#0F9D58]/20"
             >
               View subscription plans
             </button>
             <p className="text-center text-slate-600 dark:text-[#E0E0E0] text-[13px] mt-4 mb-6 font-semibold">Starts ₹100,000/mo</p>

             <button className="w-full py-4 border border-slate-300 dark:border-white/60 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white font-bold rounded-xl transition-colors text-[15px]">
               Explore Target Coaching Classes app
             </button>
           </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">

        {/* Divider */}
        <div className="w-full h-2 bg-slate-200 dark:bg-[#1A1A1A] my-10"></div>

        {/* What you get section */}
        <div className="px-5 space-y-10">
          <h2 className="text-2xl font-extrabold mb-8 text-slate-900 dark:text-white">What you get with the subscription</h2>

          {/* Exceptional Educators */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Exceptional educators</h3>
            <p className="text-[15px] text-slate-600 dark:text-white/60 mb-6 mt-1 font-medium">Learn from the best educators in the country.</p>
            
            <div className="flex overflow-x-auto gap-5 pb-4 scrollbar-hide -mx-5 px-5">
              {educators.map((ed, idx) => (
                <div key={idx} className="flex flex-col items-center min-w-[80px]">
                  <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-2 border-slate-200 dark:border-white/10 mb-3 shadow-md bg-white dark:bg-transparent">
                    <img src={ed.img} alt={ed.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm font-bold whitespace-nowrap text-center text-slate-900 dark:text-white">{ed.name}</p>
                  <p className="text-xs text-slate-500 dark:text-white/50 whitespace-nowrap text-center mt-0.5 font-medium">{ed.exp}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Divider */}
        <div className="w-full h-2 bg-slate-200 dark:bg-[#1A1A1A] my-10"></div>

        {/* Subscription Plans Section */}
        <div id="plans" className="px-2 space-y-6 pb-6">
          <h2 className="text-2xl font-extrabold px-3 text-slate-900 dark:text-white">Subscription Plans</h2>
          
          <div className="bg-transparent overflow-x-auto scrollbar-hide -mx-2 px-2 pb-4">
            <table className="w-full text-left min-w-[650px] border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-slate-600 dark:text-[#A3A3A3] font-bold text-[13px] w-[28%] sticky left-0 bg-slate-50 dark:bg-[#2A2B2D] z-10 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-6px_rgba(0,0,0,0.5)]">Benefits</th>
                  <th className="p-4 text-center font-extrabold text-slate-700 dark:text-white/70 w-[18%] text-[14px]">Free</th>
                  <th className="p-4 text-center font-extrabold text-slate-900 dark:text-white/90 w-[18%] text-[14px]">Plus</th>
                  <th className="p-4 text-center font-extrabold text-slate-900 dark:text-white w-[18%] text-[14px]">Pro</th>
                  <th className="p-4 text-center font-extrabold text-[#0d8c4f] dark:text-[#25D3A4] w-[18%] text-[15px] border-l border-t border-r border-[#0F9D58]/20 dark:border-[#25D3A4]/30 bg-[#0F9D58]/5 dark:bg-[#25D3A4]/[0.03] rounded-t-2xl relative">
                    <div className="absolute -top-[1px] -left-[1px] -right-[1px] h-[4px] bg-[#0F9D58] dark:bg-[#25D3A4] rounded-t-2xl"></div>
                    <span className="inline-flex items-center gap-1">
                      <Trophy size={14} className="text-[#0F9D58] dark:text-current" /> Prime
                    </span>
                  </th>
                </tr>
              </thead>
              <tbody className="text-[14px]">
                {[
                  { name: "QBank", f: false, pl: false, pr: true, pm: true },
                  { name: "PYQs", f: false, pl: false, pr: true, pm: true },
                  { name: "Tests", f: false, pl: true, pr: true, pm: true },
                  { name: "Quizzes", f: true, pl: true, pr: true, pm: true },
                  { name: "Notes", f: false, pl: true, pr: true, pm: true },
                  { name: "Lectures", f: true, pl: true, pr: true, pm: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-200 dark:border-white/5">
                    <td className="p-4 font-bold text-slate-800 dark:text-white/90 sticky left-0 bg-slate-50 dark:bg-[#2A2B2D] z-10 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-6px_rgba(0,0,0,0.5)]">{row.name}</td>
                    <td className="p-4 text-center">{row.f ? <Check className="w-5 h-5 text-slate-400 dark:text-white/50 mx-auto" /> : <X className="w-5 h-5 text-slate-300 dark:text-white/10 mx-auto" />}</td>
                    <td className="p-4 text-center">{row.pl ? <Check className="w-5 h-5 text-slate-600 dark:text-white/80 mx-auto" /> : <X className="w-5 h-5 text-slate-300 dark:text-white/10 mx-auto" />}</td>
                    <td className="p-4 text-center">{row.pr ? <Check className="w-5 h-5 text-slate-900 dark:text-white mx-auto stroke-[3]" /> : <X className="w-5 h-5 text-slate-300 dark:text-white/10 mx-auto" />}</td>
                    <td className="p-4 text-center border-l border-r border-[#0F9D58]/20 dark:border-[#25D3A4]/30 bg-[#0F9D58]/5 dark:bg-[#25D3A4]/[0.03]">
                      <div className="w-6 h-6 rounded-full bg-[#0F9D58]/10 dark:bg-[#25D3A4]/20 flex items-center justify-center mx-auto">
                        <Check className="w-4 h-4 text-[#0F9D58] dark:text-[#25D3A4] stroke-[3]" />
                      </div>
                    </td>
                  </tr>
                ))}
                
                <tr className="border-b border-slate-200 dark:border-white/5">
                  <td className="p-4 font-bold text-slate-800 dark:text-white/90 sticky left-0 bg-slate-50 dark:bg-[#2A2B2D] z-10 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-6px_rgba(0,0,0,0.5)]">Ad experience</td>
                  <td className="p-4 text-center text-slate-500 dark:text-white/50 text-[13px] font-semibold">Ads on</td>
                  <td className="p-4 text-center text-slate-700 dark:text-white/70 text-[13px] font-semibold">Less ads</td>
                  <td className="p-4 text-center text-slate-900 dark:text-white/90 text-[13px] font-extrabold">Minimal ads</td>
                  <td className="p-4 text-center border-l border-r border-[#0F9D58]/20 dark:border-[#25D3A4]/30 bg-[#0F9D58]/5 dark:bg-[#25D3A4]/[0.03] text-[#0F9D58] dark:text-[#25D3A4] text-[13px] font-black">
                    No ads
                  </td>
                </tr>

                <tr>
                  <td className="p-4 sticky left-0 bg-slate-50 dark:bg-[#2A2B2D] z-10 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] dark:shadow-[4px_0_12px_-6px_rgba(0,0,0,0.5)]"></td>
                  <td className="p-4 text-center pt-6 pb-4">
                    <p className="text-[15px] font-bold mb-3 text-slate-900 dark:text-white">₹0<span className="text-[10px] text-slate-500 dark:text-white/40 font-medium">/mo</span></p>
                    <button className="w-full py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-lg text-xs font-bold transition-colors">Current</button>
                  </td>
                  <td className="p-4 text-center pt-6 pb-4">
                    <p className="text-[15px] font-bold mb-3 text-slate-900 dark:text-white">₹999<span className="text-[10px] text-slate-500 dark:text-white/40 font-medium">/mo</span></p>
                    <button className="w-full py-2 bg-[#4C3B82] hover:bg-[#3d2f68] text-white rounded-lg text-xs font-bold transition-colors">Get Plus</button>
                  </td>
                  <td className="p-4 text-center pt-6 pb-4">
                    <p className="text-[15px] font-bold mb-3 text-slate-900 dark:text-white">₹1,493<span className="text-[10px] text-slate-500 dark:text-white/40 font-medium">/mo</span></p>
                    <button className="w-full py-2 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-lg text-xs font-bold transition-colors shadow-md shadow-[#4285F4]/20">Get Pro</button>
                  </td>
                  <td className="p-4 text-center border-l border-r border-b border-[#0F9D58]/20 dark:border-[#25D3A4]/30 bg-[#0F9D58]/5 dark:bg-[#25D3A4]/[0.03] rounded-b-2xl pt-6 pb-4">
                    <p className="text-[15px] font-bold mb-3 text-slate-900 dark:text-white">₹2,048<span className="text-[10px] text-slate-500 dark:text-white/40 font-medium">/mo</span></p>
                    <button className="w-full py-2 bg-[#0F9D58] dark:bg-[#25D3A4] hover:bg-[#0d8c4f] dark:hover:bg-[#1EBA9B] text-white dark:text-black rounded-lg text-xs font-black transition-colors shadow-md shadow-[#0F9D58]/20 dark:shadow-[#25D3A4]/20">Get Prime</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>



        {/* Footer "Have questions?" */}
        <div className="mt-8 mb-10 px-5">
          <div className="flex flex-row items-center justify-between mb-8">
            <div className="flex-1 pr-2">
              <h3 className="text-2xl font-extrabold mb-3 text-slate-900 dark:text-white">Have questions?</h3>
              <p className="text-[15px] text-slate-600 dark:text-[#A3A3A3] mb-5 leading-snug font-medium">
                Our experts can answer all your questions over a phone call.
              </p>
              <p className="text-[15px] text-slate-500 dark:text-[#A3A3A3] italic font-semibold">
                "How does the subscription work?"
              </p>
            </div>
            <div className="w-[120px] h-[120px] shrink-0">
              <img src="/student/support_illustration.png" alt="Support" className="w-full h-full object-contain rounded-full border-4 border-slate-50 dark:border-[#2A2B2D] shadow-lg bg-[#FFF0F5]" />
            </div>
          </div>
          
          <button className="w-full py-4 border border-slate-300 dark:border-white/60 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors flex items-center justify-center gap-3 active:scale-[0.98] mb-8">
            <PhoneCall size={20} className="text-slate-900 dark:text-white" />
            <span className="font-extrabold text-[16px] text-slate-900 dark:text-white">+91 8585858585</span>
          </button>
          
          <div className="text-center">
            <button className="text-[11px] font-black text-slate-700 dark:text-white uppercase tracking-widest hover:underline flex items-center justify-center gap-1 mx-auto">
              GET A CALL FROM US <span className="text-[14px]">›</span>
            </button>
          </div>
        </div>

      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-50/95 dark:bg-[#2A2B2D]/95 backdrop-blur-xl border-t border-slate-200 dark:border-white/10 z-50 md:flex md:justify-center">
        <div className="w-full max-w-3xl">
          <button 
            onClick={scrollToPlans}
            className="w-full py-4 bg-[#0F9D58] dark:bg-[#25D3A4] hover:bg-[#0d8c4f] dark:hover:bg-[#1EBA9B] text-white dark:text-black font-extrabold rounded-xl transition-colors text-base shadow-lg shadow-[#0F9D58]/20 dark:shadow-[0_0_25px_rgba(37,211,164,0.15)] active:scale-[0.98]"
          >
            View subscription plans
          </button>
        </div>
      </div>

    </div>
  );
}
