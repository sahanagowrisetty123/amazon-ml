import React from 'react';
import { Layers, Database, ShieldCheck, Cpu, Download, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface HeaderProps {
  activeTab: 'walkthrough' | 'pipeline' | 'metrics' | 'validator' | 'python' | 'records';
  setActiveTab: (tab: 'walkthrough' | 'pipeline' | 'metrics' | 'validator' | 'python' | 'records') => void;
  currentMacroF05: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, currentMacroF05 }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Challenge Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-orange-500/20">
              ML
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-widest font-bold text-amber-400">
                  Amazon ML Challenge 2026
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
                  Official Briefing
                </span>
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Business Entity Resolution <span className="text-xs font-normal text-slate-400">Workbench</span>
              </h1>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="hidden md:flex items-center space-x-4 bg-slate-800/80 px-4 py-1.5 rounded-xl border border-slate-700/60">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Leaderboard Metric</div>
              <div className="text-sm font-semibold text-amber-400 font-mono">Macro F0.5</div>
            </div>
            <div className="h-7 w-px bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black font-mono text-emerald-400">
                {(currentMacroF05 * 100).toFixed(1)}%
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">current<br/>score</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('walkthrough')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'walkthrough'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Video Walkthrough (6 Slides)</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'pipeline'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Blocking & Matching Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'metrics'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Macro F0.5 & Singletons Math</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'validator'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submission Validator & Zip Packager</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'python'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Python Pipeline Script</span>
          </button>

          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'records'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dataset Browser (S1, S2, S3)</span>
          </button>
        </div>
      </div>
    </header>
  );
};
