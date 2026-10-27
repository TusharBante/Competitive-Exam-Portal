import React from 'react';
import { Outlet } from 'react-router-dom';
import { GraduationCap, CheckCircle2, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left hero side (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center backdrop-blur-md shadow-lg">
              <GraduationCap className="w-7 h-7 text-indigo-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                ExamPrep <Sparkles className="w-4 h-4 text-amber-400" />
              </h1>
              <p className="text-xs text-indigo-200">Competitive Exam Preparation Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 my-auto py-12 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-6">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Rank Booster Platform
          </div>
          <h2 className="text-4xl font-extrabold leading-tight text-white mb-4">
            Master your exams with intelligent practice & social learning.
          </h2>
          <p className="text-indigo-200 text-sm leading-relaxed mb-8">
            Access hundreds of high-yield mock tests for UPSC, SSC, Banking, Railways & MPSC. Analyze detailed performance metrics and learn from topper peers.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Real-time timed examination simulations with negative marking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>In-depth performance analytics & topic accuracy tracking</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Student community discussions & bite-sized educational reels</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-indigo-300/80 border-t border-indigo-800/60 pt-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Secure & Trusted Exam Simulation</span>
          </div>
          <span>&copy; {new Date().getFullYear()} ExamPrep Portal</span>
        </div>
      </div>

      {/* Right side form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
