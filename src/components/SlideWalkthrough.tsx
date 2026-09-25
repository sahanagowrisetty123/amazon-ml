import React, { useState } from 'react';
import { 
  ChevronLeft, ChevronRight, CheckCircle2, XCircle, ArrowRight, 
  Layers, Database, FileSpreadsheet, ShieldAlert, Award, AlertCircle, HelpCircle
} from 'lucide-react';

export const SlideWalkthrough: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(1);

  const slides = [
    {
      id: 1,
      title: "Business Entity Resolution",
      subtitle: "Amazon ML Challenge 2026",
      tagline: "Determine which business records, arriving from three independent sources with no shared identifier, describe the same real-world business.",
      type: "intro"
    },
    {
      id: 2,
      title: "From Sign-up to Matched Records",
      subtitle: "The 2-Stage Pipeline Architecture",
      tagline: "One business, three representations, each from a different data vendor, with no shared ID.",
      type: "pipeline"
    },
    {
      id: 3,
      title: "Train to Learn, Test to Prove It",
      subtitle: "The Datasets & TSV Contract",
      tagline: "Ground truth is one row per Source 1 entity: id mapped to a comma-separated list of matches.",
      type: "dataset"
    },
    {
      id: 4,
      title: "A File, Then a Package",
      subtitle: "Submission Deliverables",
      tagline: "During the challenge upload matching_results.tsv; at closing submit the full audited ZIP archive.",
      type: "submission"
    },
    {
      id: 5,
      title: "Scored on Macro F0.5, Precision-Weighted",
      subtitle: "Judging Metric & Winning Strategies",
      tagline: "A false merge costs about twice as much as a miss. So when unsure, do NOT merge!",
      type: "metrics"
    },
    {
      id: 6,
      title: "All the Best",
      subtitle: "Competition Guidelines & Integrity",
      tagline: "Pure Machine Learning: external APIs and geocoders are strictly prohibited. Good luck!",
      type: "conclusion"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Slide Navigation Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center space-x-2">
          {slides.map((s) => (
            <button
              key={s.id}
              onClick={() => setCurrentSlide(s.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentSlide === s.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800'
              }`}
            >
              Slide {s.id}/6
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(1, prev - 1))}
            disabled={currentSlide === 1}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <span className="text-xs font-mono font-bold text-amber-400">
            {currentSlide} of {slides.length}
          </span>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(slides.length, prev + 1))}
            disabled={currentSlide === slides.length}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slide Card Container */}
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-10 shadow-2xl min-h-[580px] flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle decorative background watermark */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Slide Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-extrabold text-amber-500 mb-2">
            <span>Amazon ML Challenge 2026</span>
            <span>•</span>
            <span>Slide {currentSlide} of 6</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {slides[currentSlide - 1].title}
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-1 font-medium">
            {slides[currentSlide - 1].tagline}
          </p>
        </div>

        {/* Dynamic Slide Content */}
        <div className="my-8 flex-1 flex flex-col justify-center">

          {/* SLIDE 1: Welcome & Overview */}
          {currentSlide === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200">
                  <h3 className="text-amber-400 font-bold text-sm mb-1 uppercase tracking-wider">What is Entity Resolution?</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    A fundamental and widely encountered problem in real-world data science. When businesses sign up or data is acquired across disparate providers, records exist without a universal unique key.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-200">
                  <h3 className="text-amber-400 font-bold text-sm mb-1 uppercase tracking-wider">The Challenge Mission</h3>
                  <p className="text-sm leading-relaxed text-slate-300">
                    You will receive business records from <strong className="text-white">three independent sources</strong>, each noisy and inconsistent. Your goal is to determine which of them describe the <strong className="text-amber-300">same real-world business entity</strong>.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-xs text-amber-400/90 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Only Business Name and Business Address are provided to resolve identities.</span>
                </div>
              </div>

              {/* Visual Graphic */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col items-center text-center shadow-inner">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4">
                  <Layers className="w-8 h-8" />
                </div>
                <h4 className="text-white font-bold text-lg">3 Sources • 0 Shared IDs</h4>
                <p className="text-slate-400 text-xs mt-1 max-w-xs">
                  Linking Reference Records (Source 1) with Vendor A (Source 2) and Vendor B (Source 3)
                </p>
                <div className="mt-6 flex items-center justify-center gap-2">
                  <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-md text-xs font-mono border border-slate-700">Source 1</span>
                  <ArrowRight className="w-4 h-4 text-amber-500" />
                  <span className="px-3 py-1 bg-amber-950/60 text-amber-300 rounded-md text-xs font-mono border border-amber-800/60">Source 2</span>
                  <span className="text-slate-500 text-xs">+</span>
                  <span className="px-3 py-1 bg-orange-950/60 text-orange-300 rounded-md text-xs font-mono border border-orange-800/60">Source 3</span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 2: From Sign-up to Matched Records (Core Architecture) */}
          {currentSlide === 2 && (
            <div className="space-y-6">
              {/* Sign up preview */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 max-w-xl mx-auto shadow-lg">
                <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span>Amazon Business: Account Registration Details Captured</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business Name</label>
                    <div className="p-2 bg-slate-900 rounded border border-slate-700 font-mono text-white">Acme Robotics Inc</div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Business Address</label>
                    <div className="p-2 bg-slate-900 rounded border border-slate-700 font-mono text-white">500 Market St, San Jose, CA</div>
                  </div>
                </div>
              </div>

              {/* 3 Sources Visual Representation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Source 1 */}
                <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-4 shadow-md">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">
                    SOURCE 1 (Reference)
                  </div>
                  <div className="text-xs text-slate-400 mb-2 font-mono">Deduplicated internal catalog</div>
                  <div className="text-sm font-bold text-white">Acme Robotics Inc.</div>
                  <div className="text-xs text-slate-400 mt-1">500 Market St, San Jose</div>
                  <span className="mt-3 inline-block px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">S1-732914</span>
                </div>

                {/* Source 2 */}
                <div className="bg-amber-950/30 border-2 border-amber-600/60 rounded-xl p-4 shadow-md">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-400 mb-1">
                    SOURCE 2 (Vendor A format)
                  </div>
                  <div className="text-xs text-amber-300/70 mb-2 font-mono">Expanded legal company suffix</div>
                  <div className="text-sm font-bold text-amber-200">Acme Robotics Incorporated</div>
                  <div className="text-xs text-slate-300 mt-1">500 Market Street, San Jose CA</div>
                  <span className="mt-3 inline-block px-2 py-0.5 bg-amber-900/40 text-amber-300 text-[10px] font-mono rounded">S2-118820</span>
                </div>

                {/* Source 3 */}
                <div className="bg-orange-950/30 border-2 border-orange-600/60 rounded-xl p-4 shadow-md">
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-orange-400 mb-1">
                    SOURCE 3 (Vendor B format)
                  </div>
                  <div className="text-xs text-orange-300/70 mb-2 font-mono">Landmark reference in city</div>
                  <div className="text-sm font-bold text-orange-200">Acme Robotics</div>
                  <div className="text-xs text-slate-300 mt-1">Nr. City Hall, San Jose</div>
                  <span className="mt-3 inline-block px-2 py-0.5 bg-orange-900/40 text-orange-300 text-[10px] font-mono rounded">S3-905477</span>
                </div>
              </div>

              {/* Look-alikes warning box */}
              <div className="bg-rose-950/20 border border-rose-800/50 rounded-xl p-3 flex items-start space-x-3 text-xs">
                <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-slate-300">
                  <strong className="text-rose-300">Look-alikes must be eliminated in Stage 2!</strong>
                  <span className="block mt-0.5 text-slate-400">
                    e.g., <code className="text-rose-200">S2-540221 (Acme Robotics, Austin TX)</code> shares the name but in the wrong city;
                    and <code className="text-rose-200">S3-063118 (Acme Bakery, 500 Market St)</code> shares the address but is a distinct business!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: The Dataset */}
          {currentSlide === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Training Set */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Training Set</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Labels Provided</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                    <span>Records across all 3 independent sources.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                    <span>Ground-truth labels: <code className="text-amber-300 font-mono">train_ground_truth.tsv</code></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5" />
                    <span>Use it to train classifiers, tune blocking keys, and calibrate threshold &tau;.</span>
                  </li>
                </ul>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono text-slate-300">
                  <div className="text-[10px] text-slate-400 mb-1"># TSV Ground Truth format (sep=&apos;\t&apos;)</div>
                  <div>S1-732914<span className="text-amber-500 font-bold">\t</span>S2-118820,S3-905477</div>
                  <div>S1-201774<span className="text-amber-500 font-bold">\t</span><span className="text-slate-500">&lt;empty = singleton&gt;</span></div>
                </div>
              </div>

              {/* Test Set */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Test Set</span>
                  <span className="text-[10px] bg-emerald-950/60 text-emerald-300 px-2 py-0.5 rounded font-mono">Leaderboard Scored</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span>Same 3 sources, but zero labels provided.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span>Produce a match prediction for every single Source 1 entity.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5" />
                    <span>Evaluated against held-out ground truth using Macro $F_{0.5}$.</span>
                  </li>
                </ul>

                <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
                  <strong>Important Rule on TSV Delimiter:</strong>
                  <p className="text-[11px] text-slate-300 mt-1">
                    All challenge files are tab-separated (<code className="font-mono">.tsv</code>). In Python pandas, always use:
                    <code className="block mt-1 font-mono text-emerald-400">pd.read_csv(&apos;...tsv&apos;, sep=&apos;\t&apos;)</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 4: What You Submit */}
          {currentSlide === 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leaderboard File */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400">
                  <FileSpreadsheet className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">1. Leaderboard File</h3>
                </div>
                <p className="text-xs text-slate-300">
                  Throughout the challenge, upload <code className="text-amber-300 font-mono">matching_results.tsv</code> to update your rank on the leaderboard.
                </p>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                  <div>• Exactly 1 row per Source 1 entity</div>
                  <div>• Tab-separated columns: [Source1_ID, Matches]</div>
                  <div>• Empty list means no match (Singleton)</div>
                </div>
              </div>

              {/* Final Package (.zip) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center space-x-2 text-orange-400">
                  <Award className="w-5 h-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">2. Final Challenge Package (.zip)</h3>
                </div>
                <p className="text-xs text-slate-300">
                  At the close of the challenge, finalists submit a structured ZIP archive:
                </p>
                <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-amber-300 space-y-1">
                  <div>📁 archive.zip</div>
                  <div className="pl-4">├── 📁 output/</div>
                  <div className="pl-8">├── matching_results.tsv (final matches)</div>
                  <div className="pl-8">└── candidate_pairs.tsv (blocking set)</div>
                  <div className="pl-4">├── 📁 code/ (runnable pipeline)</div>
                  <div className="pl-4">└── Documentation_template.md</div>
                </div>
              </div>

              {/* Validation Warning */}
              <div className="md:col-span-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
                <span>Always run the official validation script before submitting to avoid disqualifying formatting faults!</span>
                <code className="bg-slate-900 px-2.5 py-1 rounded text-amber-400 font-mono border border-slate-700">
                  python utils/validate_submission.py
                </code>
              </div>
            </div>
          )}

          {/* SLIDE 5: Judging Metric & Strategy */}
          {currentSlide === 5 && (
            <div className="space-y-6">
              {/* Formula Card */}
              <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-5 text-center shadow-lg">
                <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">Official Evaluation Metric</span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-white mt-2">
                  F<sub>0.5</sub> = (1.25 × Precision × Recall) / (0.25 × Precision + Recall)
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Precision is weighted <strong className="text-amber-300">twice as heavily</strong> as recall (β = 0.5).
                </p>
              </div>

              {/* 3 Winning Golden Rules */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-4 h-4" />
                    <span>1. False Merge Penalty (2x)</span>
                  </div>
                  <p className="text-slate-300">
                    A false merge costs twice as much as a miss. <strong className="text-white">When unsure, do NOT merge!</strong> Set a conservative threshold.
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>2. The Singleton Bonus</span>
                  </div>
                  <p className="text-slate-300">
                    Singletons have no match in S2 or S3. Predict empty list: <strong className="text-white">earn full 1.0!</strong> Predict any match: <strong className="text-rose-400">score 0.0!</strong>
                  </p>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>3. Blocking Sets the Ceiling</span>
                  </div>
                  <p className="text-slate-300">
                    You cannot match a candidate your blocking stage pruned. Design multi-key blocking to maintain a ~98%+ recall ceiling.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 6: Competition Integrity */}
          {currentSlide === 6 && (
            <div className="text-center max-w-2xl mx-auto space-y-5">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">Pure Machine Learning Challenge</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Build something you are proud of, resolve those entities, and enjoy the process. Amazon Business teams will audit top finalist submissions.
              </p>

              <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs text-rose-300 text-left">
                <div className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Strict Integrity Rule</span>
                </div>
                External databases, public search APIs, commercial geocoders (e.g. Google Maps API, Nominatim), and LLM web-browsing lookups are <strong className="text-white underline">strictly prohibited</strong>. Models must run offline using only the provided dataset features.
              </div>
            </div>
          )}

        </div>

        {/* Slide Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Amazon ML Challenge 2026 • Business Entity Resolution</span>
          <div className="flex space-x-1">
            {slides.map((s) => (
              <span
                key={s.id}
                onClick={() => setCurrentSlide(s.id)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${
                  currentSlide === s.id ? 'bg-amber-400 scale-125' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
