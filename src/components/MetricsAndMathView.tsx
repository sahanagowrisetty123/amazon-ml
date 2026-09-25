import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, XCircle, ArrowUpRight, 
  HelpCircle, Scale, Sparkles, TrendingUp
} from 'lucide-react';
import { MacroMetrics, EntityMetricDetail } from '../types/entity-resolution';

interface MetricsAndMathViewProps {
  metrics: MacroMetrics;
}

export const MetricsAndMathView: React.FC<MetricsAndMathViewProps> = ({ metrics }) => {
  // Interactive Simulator State
  const [simTP, setSimTP] = useState<number>(10);
  const [simFP, setSimFP] = useState<number>(1); // False Merges
  const [simFN, setSimFN] = useState<number>(2); // Misses

  const simP = simTP + simFP > 0 ? simTP / (simTP + simFP) : 0;
  const simR = simTP + simFN > 0 ? simTP / (simTP + simFN) : 0;
  const simF05 = (0.25 * simP + simR) > 0 
    ? (1.25 * simP * simR) / (0.25 * simP + simR)
    : 0;

  // Compare what happens if 1 extra False Merge vs 1 extra Miss is added:
  const withExtraFP_P = simTP / (simTP + simFP + 1);
  const withExtraFP_F05 = (0.25 * withExtraFP_P + simR) > 0
    ? (1.25 * withExtraFP_P * simR) / (0.25 * withExtraFP_P + simR)
    : 0;
  const fpDelta = withExtraFP_F05 - simF05;

  const withExtraFN_R = simTP / (simTP + simFN + 1);
  const withExtraFN_F05 = (0.25 * simP + withExtraFN_R) > 0
    ? (1.25 * simP * withExtraFN_R) / (0.25 * simP + withExtraFN_R)
    : 0;
  const fnDelta = withExtraFN_F05 - simF05;

  return (
    <div className="space-y-6">

      {/* Top Banner: Real-Time Score on Dataset */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase font-extrabold tracking-widest text-amber-400">
              <Scale className="w-4 h-4" />
              <span>Amazon ML Challenge 2026 Official Metric</span>
            </div>
            <h2 className="text-3xl font-extrabold text-white mt-1">Macro F<sub>0.5</sub> Evaluation</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Calculates the mean F<sub>0.5</sub> across all Source 1 entities. Precision is weighted twice as heavily as recall.
            </p>
          </div>

          <div className="flex items-center space-x-6 bg-slate-950/80 px-6 py-4 rounded-xl border border-slate-800 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Macro F0.5</span>
              <span className="text-4xl font-black font-mono text-emerald-400">
                {(metrics.macroF05 * 100).toFixed(1)}%
              </span>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="space-y-1 text-xs font-mono">
              <div className="text-slate-400">Macro P: <span className="text-white font-bold">{(metrics.macroPrecision * 100).toFixed(1)}%</span></div>
              <div className="text-slate-400">Macro R: <span className="text-white font-bold">{(metrics.macroRecall * 100).toFixed(1)}%</span></div>
              <div className="text-slate-400">Singletons: <span className="text-amber-400 font-bold">{metrics.correctSingletons}/{metrics.singletonCount}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Formula */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">Mathematical Definition</span>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-sm text-center text-white">
            F<sub>0.5</sub> = <span className="text-amber-300">1.25 · P · R</span> / (<span className="text-orange-300">0.25 · P + R</span>)
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Derived from general F<sub>&beta;</sub> with &beta; = 0.5:
            F<sub>&beta;</sub> = (1 + &beta;&sup2;) &times; (P &times; R) / (&beta;&sup2; &times; P + R).
            &beta; &lt; 1 penalizes False Positives (merges) much more severely than False Negatives (misses).
          </p>
        </div>

        {/* Why False Merges Cost 2x */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-400">The 2x False Merge Penalty</span>
          <div className="p-3 bg-rose-950/20 border border-rose-800/40 rounded-lg text-xs text-rose-300">
            <strong>&quot;When unsure, do NOT merge!&quot;</strong>
            <p className="text-[11px] text-slate-300 mt-1">
              In entity resolution, incorrectly merging two separate businesses corrupts legal accounts, billing, and supply chains. Therefore, the metric penalizes false merges roughly twice as hard as a missed link.
            </p>
          </div>
        </div>

        {/* Singletons Bonus */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">Singleton Math (All or Nothing)</span>
          <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs text-emerald-300">
            <div className="flex justify-between items-center mb-1">
              <span>Predict Empty:</span>
              <strong className="text-emerald-400 font-mono font-bold">+1.0 Score</strong>
            </div>
            <div className="flex justify-between items-center text-rose-300">
              <span>Predict Any Match:</span>
              <strong className="text-rose-400 font-mono font-bold">0.0 Score</strong>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If an entity has no match in S2 or S3, predicting a candidate results in an instantaneous zero!
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Precision vs Recall Simulator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white text-base">Interactive F<sub>0.5</sub> Sensitivity Simulator</h3>
          </div>
          <span className="text-xs text-slate-400">Test how False Merges vs Misses impact score</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>True Positives (Correct Matches):</span>
                <span className="font-mono font-bold text-emerald-400">{simTP}</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={simTP}
                onChange={(e) => setSimTP(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-rose-300 mb-1">
                <span>False Positives (False Merges):</span>
                <span className="font-mono font-bold text-rose-400">{simFP}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simFP}
                onChange={(e) => setSimFP(parseInt(e.target.value))}
                className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-amber-300 mb-1">
                <span>False Negatives (Missed Matches):</span>
                <span className="font-mono font-bold text-amber-400">{simFN}</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={simFN}
                onChange={(e) => setSimFN(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-2">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Simulated Score</span>
            <div className="text-4xl font-black font-mono text-amber-400">
              {(simF05 * 100).toFixed(1)}%
            </div>
            <div className="flex justify-center gap-4 text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
              <span>Precision: <strong className="text-white">{(simP * 100).toFixed(1)}%</strong></span>
              <span>Recall: <strong className="text-white">{(simR * 100).toFixed(1)}%</strong></span>
            </div>
          </div>

          {/* Delta Comparison */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 text-xs">
            <span className="font-bold text-slate-300 block">Cost of Next Error:</span>
            
            <div className="p-2.5 rounded bg-rose-950/30 border border-rose-800/40 text-rose-300">
              <div className="flex justify-between font-bold">
                <span>+1 False Merge:</span>
                <span className="font-mono">{(fpDelta * 100).toFixed(2)}% drop</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Penalizes precision directly</span>
            </div>

            <div className="p-2.5 rounded bg-amber-950/30 border border-amber-800/40 text-amber-300">
              <div className="flex justify-between font-bold">
                <span>+1 Missed Match:</span>
                <span className="font-mono">{(fnDelta * 100).toFixed(2)}% drop</span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Penalizes recall (lower weight)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Entity Details Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-white text-sm">Entity-by-Entity Evaluation Breakdown</h3>
          <span className="text-xs text-slate-400">{metrics.entityDetails.length} Entities Evaluated</span>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <th className="p-2.5 font-semibold">Entity ID & Name</th>
                <th className="p-2.5 font-semibold text-center">Type</th>
                <th className="p-2.5 font-semibold">Ground Truth</th>
                <th className="p-2.5 font-semibold">Predicted</th>
                <th className="p-2.5 font-semibold text-center">Precision</th>
                <th className="p-2.5 font-semibold text-center">Recall</th>
                <th className="p-2.5 font-semibold text-center">F0.5 Score</th>
                <th className="p-2.5 font-semibold text-center">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {metrics.entityDetails.map((e) => {
                return (
                  <tr key={e.source1Id} className="hover:bg-slate-950/40">
                    <td className="p-2.5 font-sans">
                      <div className="font-bold text-white font-mono text-xs">{e.source1Id}</div>
                      <div className="text-slate-300 text-[11px]">{e.source1Name}</div>
                    </td>
                    <td className="p-2.5 text-center">
                      {e.isGroundTruthSingleton ? (
                        <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 text-[10px] font-bold">
                          SINGLETON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                          MULTI
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {e.groundTruthMatches.length === 0 ? (
                        <span className="text-slate-500 italic">None</span>
                      ) : (
                        e.groundTruthMatches.join(', ')
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {e.predictedMatches.length === 0 ? (
                        <span className="text-slate-500 italic">None</span>
                      ) : (
                        e.predictedMatches.join(', ')
                      )}
                    </td>
                    <td className="p-2.5 text-center">{(e.precision * 100).toFixed(0)}%</td>
                    <td className="p-2.5 text-center">{(e.recall * 100).toFixed(0)}%</td>
                    <td className="p-2.5 text-center font-bold text-white">
                      {(e.f05 * 100).toFixed(1)}%
                    </td>
                    <td className="p-2.5 text-center">
                      {e.status === 'perfect' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          PERFECT (1.0)
                        </span>
                      )}
                      {e.status === 'false_merge' && (
                        <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                          FALSE MERGE
                        </span>
                      )}
                      {e.status === 'empty_match_fail' && (
                        <span className="px-2 py-0.5 rounded bg-rose-600/30 text-rose-300 font-bold text-[10px]">
                          SINGLETON BROKEN (0.0)
                        </span>
                      )}
                      {e.status === 'miss' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                          MISS
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
