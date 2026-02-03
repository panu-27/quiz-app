import React from 'react';
import { motion } from 'framer-motion';

const GetStarted = ({ setIsLogin, setShowForm }) => {
  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-white font-sans">
      
      {/* Background Layer - Cinematic Classroom */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop" 
          alt="Modern Study Space"
          className="w-full h-full object-cover"
        />
        {/* Cinematic Scrim: Softening the image for UI clarity */}
        <div className="absolute inset-0 " />
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 flex-1 flex flex-col justify-between px-8 pt-[max(4rem,env(safe-area-inset-top))] pb-[max(3rem,env(safe-area-inset-bottom))]"
      >
        {/* Top: Minimal Branding */}
        <div className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-7xl font-black italic tracking-tighter text-slate-900"
          >
            NEXUS
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-600 text-[11px] font-bold tracking-[0.4em] uppercase mt-4"
          >
            Evolution of Learning
          </motion.p>
        </div>

        {/* Bottom: Focused Action Area */}
        <div className="w-full max-w-sm mx-auto space-y-6">
          <div className="text-center space-y-2 mb-8">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-semibold text-slate-800"
            >
              Ready to begin?
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-900 text-sm"
            >
              Sign in to access your classroom and tools.
            </motion.p>
          </div>

          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setIsLogin(true); setShowForm(true); }}
              className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-slate-900/30 transition-all flex items-center justify-center gap-3"
            >
              Get Started
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.9)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setIsLogin(false); setShowForm(true); }}
              className="w-full py-4.5 bg-white/70 backdrop-blur-md border border-slate-200 text-slate-900 rounded-2xl font-bold text-base transition-all"
            >
              Create Account
            </motion.button>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-indigo-900 text-[10px] font-bold uppercase tracking-widest pt-4"
          >
            Join the Nexus Community
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

export default GetStarted;