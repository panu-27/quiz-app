import { useState } from "react";
import PublicHeader from "./PublicHeader";

export default function HelpCenter() {
    const [activeCard, setActiveCard] = useState(null);

const helpCategories = [
  {
    id: "account",
    title: "My Account",
    description: "Discount codes, Knowledge Hats and more.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/guideToUnacademy.svg",
    issue: "Login issues, account verification pending, profile update problems",
    contact: "Institute Admin / Assigned Teacher",
    content:
      "Get help with login problems, account verification, profile updates, discount codes and security settings.",
  },
  {
    id: "payments",
    title: "Payments",
    description: "EMI & Part Payment related queries.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/payments.svg",
    issue: "Payment not reflecting, EMI issues, receipt or invoice problems",
    contact: "Institute Admin / Accounts Team",
    content:
      "Issues related to payments, EMI options, part payments, refunds and invoices.",
  },
  {
    id: "courses",
    title: "Tests and Study Material",
    description: "Enroll for a new course, learn about classes and more.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/myCourses.svg",
    issue: "Unable to access classes, course not visible, batch not assigned",
    contact: "Institute Teacher / Course Coordinator",
    content:
      "Learn how to enroll in courses, attend live classes and access recordings.",
  },
  {
    id: "technical",
    title: "Technical Difficulties",
    description: "Account related issues, buffering issues and more.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/technicalIssues.svg",
    issue: "Website not loading, test not opening, buffering or app crash",
    contact: "Nexus Technical Support",
    content:
      "Fix issues like login failure, buffering, test not loading or app crashes.",
  },
  {
    id: "tests",
    title: "Nexus Exclusives",
    description: "Information regarding the tests and reports.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/testSeries.svg",
    issue: "Test not visible, result missing, report not generated",
    contact: "Institute Teacher / Test Coordinator",
    content:
      "Details about test series, rankings, analytics and performance reports.",
  },
  {
    id: "support",
    title: "Login Issue!",
    description: "Your complete guide to the Nexus platform.",
    icon: "https://static.uacdn.net/production/_next/static/images/helpCenter/letsBegin.svg",
    issue: "Login not working, account pending approval, access denied",
    contact: "Institute Admin / Assigned Teacher",
    content:
      "If your login is not working or your account is pending approval, please contact your institute teacher or admin.",
    isSupport: true,
  },
];



    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* HEADER */}
            <PublicHeader />

            {/* CONTENT */}
            {/* CONTENT */}
            <div className="flex-1 px-4 sm:px-10 md:px-6 xl:px-84 pt-13 pb-16">

                {/* Title */}
                <p className="text-slate-600 text-sm mb-2">
                    Nexus Help & Support
                </p>

                <h1 className="text-[26px] sm:text-3xl font-semibold text-slate-800">
                    I need more information on:
                </h1>

                {/* GRID */}
                <div className="mt-10 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                    {helpCategories.map((item) => {
                        const isOpen = activeCard === item.id;

                        return (
                            <div key={item.id} className="relative">
                                {/* CARD */}
                                <div
                                    onClick={() => setActiveCard(isOpen ? null : item.id)}
className="
  cursor-pointer bg-white
  rounded-2xl px-6 py-7
  shadow-[0_8px_30px_rgba(0,0,0,0.05)]
  hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
  transition
  flex flex-col
  min-h-[190px]
"
                  >

                                    <img
                                        src={item.icon}
                                        alt={item.title}
                                        className="w-12 h-12 mb-5"
                                        loading="lazy"
                                    />

                                    <h5 className="text-lg font-semibold text-slate-800">
                                        {item.title}
                                    </h5>

                                    <p className="mt-2 text-[12px] text-slate-500 leading-relaxed max-h-[42px] overflow-hidden">
                                        {item.description}
                                    </p>

                                </div>

                                {/* MOBILE EXPAND */}
                                <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
                                    <div className="mt-4 p-5 bg-slate-50 rounded-xl text-sm text-slate-700">
  <p>{item.content}</p>

  <div className="mt-4">
    <p className="text-xs font-semibold text-slate-500 uppercase">
      Common issue
    </p>
    <p className="mt-1">{item.issue}</p>
  </div>

  <div className="mt-3 bg-white rounded-lg px-4 py-3 border text-sm">
    <span className="font-semibold">Contact:</span>{" "}
    {item.contact}
  </div>
</div>

                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>


            {/* DESKTOP POPUP */}
            {/* DESKTOP POPUP */}
            {activeCard && (
                <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setActiveCard(null)}
                    />

                    <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl z-10">
                        {(() => {
                            const card = helpCategories.find(c => c.id === activeCard);
                            if (!card) return null;

                            return (
                                <>
                                    <h3 className="text-2xl font-semibold text-slate-800">
                                        {card.title}
                                    </h3>

                                    <p className="mt-4 text-sm text-slate-600 leading-relaxed">
  {card.content}
</p>

{/* ISSUE */}
<div className="mt-5">
  <p className="text-xs font-semibold text-slate-500 uppercase">
    Common issue
  </p>
  <p className="text-sm text-slate-700 mt-1">
    {card.issue}
  </p>
</div>

{/* CONTACT */}
<div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-sm">
  <span className="font-semibold text-slate-700">
    Contact:
  </span>{" "}
  <span className="text-slate-600">{card.contact}</span>
</div>


                                    <button
                                        onClick={() => setActiveCard(null)}
                                        className="mt-7 w-full py-3 rounded-xl bg-slate-800
                         text-white font-semibold hover:bg-slate-900"
                                    >
                                        Close
                                    </button>
                                </>
                            );
                        })()}
                    </div>
                </div>
            )}

        </div>
    );
}

