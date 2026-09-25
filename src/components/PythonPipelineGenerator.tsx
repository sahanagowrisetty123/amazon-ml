import React, { useState } from 'react';
import { FileCode, Copy, Check, Download, ShieldCheck, Terminal } from 'lucide-react';
import { PYTHON_PIPELINE_CODE } from '../data/sampleDataset';

export const PythonPipelineGenerator: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PYTHON_PIPELINE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([PYTHON_PIPELINE_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs uppercase font-extrabold tracking-widest text-amber-400">
          <Terminal className="w-4 h-4" />
          <span>Competition Runnable Code Submission</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Production Python Starter Pipeline</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              100% compliant with Amazon ML Challenge 2026 rules: zero external API calls, pure offline feature extraction, multi-key blocking, and Macro F0.5 precision thresholding.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download pipeline.py</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-800 text-xs text-slate-400">
          <span className="font-mono text-amber-400">code/pipeline.py</span>
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Strict Offline Rule Verified</span>
          </span>
        </div>

        <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed">
          {PYTHON_PIPELINE_CODE}
        </pre>
      </div>
    </div>
  );
};
