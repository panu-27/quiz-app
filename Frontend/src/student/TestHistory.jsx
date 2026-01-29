import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  ChevronRightIcon, 
  ClockIcon, 
  TrophyIcon, 
  CalendarIcon,
  DocumentCheckIcon 
} from "@heroicons/react/24/outline";

export default function TestHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState(null);

  useEffect(() => {
    api.get("/tests/my-history")
      .then(res => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center font-mono">FETCHING_HISTORY...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 font-sans">
      <header className="mb-10">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Performance Dashboard</h1>
        <p className="text-slate-500 mt-2">Track your progress across all examination attempts.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Test List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Your Registered Tests</h2>
          {history.map((record) => (
            <div 
              key={record._id}
              onClick={() => setSelectedTest(record)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                selectedTest?._id === record._id 
                ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                : 'border-slate-100 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                  record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {record.status}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Attempts: {record.attempts.length}</span>
              </div>
              <h3 className="font-bold text-slate-800 leading-tight">{record.testDetails?.title}</h3>
            </div>
          ))}
        </div>

        {/* Right: Attempt Details */}
        <div className="lg:col-span-2">
          {selectedTest ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <div className="flex justify-between items-end mb-8 border-b pb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedTest.testDetails?.title}</h2>
                  <p className="text-slate-500 text-sm">{selectedTest.testDetails?.description}</p>
                </div>
                <div className="text-right">
                    <span className="block text-[10px] font-black uppercase text-slate-400">Total Marks</span>
                    <span className="text-xl font-bold">{selectedTest.testDetails?.totalMarks || 300}</span>
                </div>
              </div>

              {selectedTest.attempts.length > 0 ? (
                <div className="space-y-4">
                  {selectedTest.attempts.map((attempt) => (
                    <div key={attempt._id} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-lg hover:ring-1 hover:ring-indigo-100 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-slate-100 shadow-sm">
                           <span className="text-xs font-black text-indigo-600">#{attempt.attemptNumber}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(attempt.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-lg font-black text-slate-800">Score: {attempt.score}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="hidden md:block text-right">
                          <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase justify-end">
                            <ClockIcon className="w-3 h-3" /> Time Taken
                          </div>
                          <div className="text-sm font-bold text-slate-700">
                            {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                          </div>
                        </div>
                        <button className="p-2 bg-indigo-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                   <DocumentCheckIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-medium">No attempts recorded yet.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl p-20 text-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Select a test to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}