import React, { useState, useMemo } from 'react';
import { 
  Cpu, Sliders, CheckCircle2, XCircle, ArrowRight, Download, Filter, 
  HelpCircle, Eye, RefreshCw, AlertTriangle, Layers, FileSpreadsheet
} from 'lucide-react';
import { 
  BusinessRecord, GroundTruthRecord, BlockingSettings, MatchingSettings, 
  CandidatePair, ScoredPair 
} from '../types/entity-resolution';
import { 
  generateBlockingKeys, computeRecordSimilarity, normalizeBusinessName, normalizeAddress 
} from '../utils/textProcessing';
import { generateTsvString } from '../utils/tsvParser';

interface InteractivePipelineProps {
  source1Records: BusinessRecord[];
  source2Records: BusinessRecord[];
  source3Records: BusinessRecord[];
  groundTruth: GroundTruthRecord[];
  onPredictionsUpdated: (predictions: Map<string, string[]>, candidatePairs: Map<string, string[]>) => void;
}

export const InteractivePipeline: React.FC<InteractivePipelineProps> = ({
  source1Records,
  source2Records,
  source3Records,
  groundTruth,
  onPredictionsUpdated,
}) => {
  // Blocking settings
  const [blockingSettings, setBlockingSettings] = useState<BlockingSettings>({
    strategy: 'multi_index',
    tokenMinLength: 3,
    allowLookAlikes: true,
    includeCityStateKey: true,
    normalizeStreetSuffixes: true,
  });

  // Matching settings
  const [matchingSettings, setMatchingSettings] = useState<MatchingSettings>({
    threshold: 0.73,
    nameWeight: 0.65,
    addressWeight: 0.35,
    conservativeThresholdForSingletons: true,
    preferPrecisionBias: true,
    landmarkTolerance: true,
  });

  const [activeSubTab, setActiveSubTab] = useState<'flow' | 'candidate_pairs' | 'matching_results' | 'scoring_table'>('flow');
  const [selectedEntityId, setSelectedEntityId] = useState<string>(source1Records[0]?.id || 'S1-732914');

  // Lookups
  const s2Lookup = useMemo(() => new Map(source2Records.map((r) => [r.id, r])), [source2Records]);
  const s3Lookup = useMemo(() => new Map(source3Records.map((r) => [r.id, r])), [source3Records]);
  const s1Lookup = useMemo(() => new Map(source1Records.map((r) => [r.id, r])), [source1Records]);
  const gtLookup = useMemo(() => new Map(groundTruth.map((gt) => [gt.source1Id, new Set(gt.matchingIds)])), [groundTruth]);

  // STAGE 1: BLOCKING EXECUTION
  const { candidatePairsMap, blockingBlocks, totalCandidatesGenerated, fullSearchSpace } = useMemo(() => {
    const blocks = new Map<string, string[]>();

    // Index Source 2 and Source 3
    const allCandidates = [...source2Records, ...source3Records];
    for (const r of allCandidates) {
      const keys = generateBlockingKeys(r.name, r.address, blockingSettings.strategy);
      for (const k of keys) {
        if (!blocks.has(k)) blocks.set(k, []);
        blocks.get(k)!.push(r.id);
      }
    }

    const candidateMap = new Map<string, string[]>();
    let totalCands = 0;

    for (const s1 of source1Records) {
      const keys = generateBlockingKeys(s1.name, s1.address, blockingSettings.strategy);
      const candSet = new Set<string>();

      for (const k of keys) {
        const matchesInBlock = blocks.get(k) || [];
        for (const cId of matchesInBlock) {
          candSet.add(cId);
        }
      }

      const cArray = Array.from(candSet);
      candidateMap.set(s1.id, cArray);
      totalCands += cArray.length;
    }

    const searchSpace = source1Records.length * allCandidates.length;

    return {
      candidatePairsMap: candidateMap,
      blockingBlocks: blocks,
      totalCandidatesGenerated: totalCands,
      fullSearchSpace: searchSpace,
    };
  }, [source1Records, source2Records, source3Records, blockingSettings]);

  // STAGE 2: MATCHING & CLASSIFICATION EXECUTION
  const { scoredPairsList, predictionsMap, truePositivesCount, falsePositivesCount } = useMemo(() => {
    const scoredList: ScoredPair[] = [];
    const predMap = new Map<string, string[]>();
    let tp = 0;
    let fp = 0;

    for (const s1 of source1Records) {
      const candidates = candidatePairsMap.get(s1.id) || [];
      const matchedIds: string[] = [];
      const gtMatches = gtLookup.get(s1.id) || new Set();

      for (const candId of candidates) {
        const cand = s2Lookup.get(candId) || s3Lookup.get(candId);
        if (!cand) continue;

        const sim = computeRecordSimilarity(
          { name: s1.name, address: s1.address },
          { name: cand.name, address: cand.address },
          {
            nameWeight: matchingSettings.nameWeight,
            addressWeight: matchingSettings.addressWeight,
            landmarkTolerance: matchingSettings.landmarkTolerance,
          }
        );

        let finalScore = sim.overallScore;
        // Conservative bias: if preferPrecisionBias is enabled and address looks very different, dampen score
        if (matchingSettings.preferPrecisionBias && sim.addressScore < 0.35 && !sim.notes.includes('Landmark')) {
          finalScore *= 0.85;
        }

        const isMatch = finalScore >= matchingSettings.threshold;
        const isGroundTruth = gtMatches.has(candId);

        if (isMatch) {
          matchedIds.push(candId);
          if (isGroundTruth) tp++;
          else fp++;
        }

        scoredList.push({
          source1Id: s1.id,
          candidateId: candId,
          candidateSource: cand.source,
          nameScore: Number(sim.nameScore.toFixed(3)),
          addressScore: Number(sim.addressScore.toFixed(3)),
          overallScore: Number(finalScore.toFixed(3)),
          predictedMatch: isMatch,
          groundTruthMatch: isGroundTruth,
          notes: sim.notes,
        });
      }

      predMap.set(s1.id, matchedIds);
    }

    // Notify parent
    onPredictionsUpdated(predMap, candidatePairsMap);

    return {
      scoredPairsList: scoredList,
      predictionsMap: predMap,
      truePositivesCount: tp,
      falsePositivesCount: fp,
    };
  }, [
    source1Records,
    candidatePairsMap,
    s2Lookup,
    s3Lookup,
    gtLookup,
    matchingSettings,
    onPredictionsUpdated,
  ]);

  // Reduction ratio for blocking
  const reductionRatio = fullSearchSpace > 0 
    ? ((1 - totalCandidatesGenerated / fullSearchSpace) * 100).toFixed(1)
    : '0';

  // Export functions
  const downloadCandidatePairs = () => {
    const tsv = generateTsvString(candidatePairsMap);
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'candidate_pairs.tsv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadMatchingResults = () => {
    const tsv = generateTsvString(predictionsMap);
    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'matching_results.tsv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedEntity = s1Lookup.get(selectedEntityId);
  const selectedPairs = scoredPairsList.filter((p) => p.source1Id === selectedEntityId);

  return (
    <div className="space-y-6">
      {/* Configuration Control Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* STAGE 1: BLOCKING CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-black">
                1
              </span>
              <h3 className="font-bold text-white text-sm">Stage 1: Blocking Algorithm</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-300 rounded border border-amber-500/20">
              Candidate Pruning
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1.5">
                Blocking Strategy (Key Generator):
              </label>
              <select
                value={blockingSettings.strategy}
                onChange={(e) => setBlockingSettings({ ...blockingSettings, strategy: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:border-amber-500 focus:outline-none"
              >
                <option value="multi_index">Multi-Index Blocking (Name Token + City + Num)</option>
                <option value="name_token_city">Single Index (First Name Token + City)</option>
                <option value="soundex_city">Phonetic Soundex (Soundex(Name) + City)</option>
                <option value="character_ngram">Character 3-Grams (Substrings)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Reduction Ratio</span>
                <span className="text-lg font-black font-mono text-emerald-400">{reductionRatio}%</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">pairs pruned from O(N1×(N2+N3))</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Candidates Kept</span>
                <span className="text-lg font-black font-mono text-amber-400">{totalCandidatesGenerated}</span>
                <span className="block text-[10px] text-slate-500 mt-0.5">out of {fullSearchSpace} pairs</span>
              </div>
            </div>

            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300/90 text-[11px] flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>Blocking sets your recall ceiling. Invest here to avoid missing look-alikes.</span>
            </div>
          </div>
        </div>

        {/* STAGE 2: MATCHING & CLASSIFICATION CONTROLS */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-6 h-6 rounded-md bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-black">
                2
              </span>
              <h3 className="font-bold text-white text-sm">Stage 2: Matching Model</h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-orange-500/10 text-orange-300 rounded border border-orange-500/20">
              Scoring & Thresholding
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Threshold Slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-medium">
                  Decision Threshold (τ): <span className="font-mono font-bold text-amber-400">{matchingSettings.threshold.toFixed(2)}</span>
                </label>
                <span className="text-[10px] text-slate-500">Pairs with score ≥ τ are classified as Match</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.01"
                value={matchingSettings.threshold}
                onChange={(e) => setMatchingSettings({ ...matchingSettings, threshold: parseFloat(e.target.value) })}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Weights Sliders */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">
                  Name Weight: <span className="font-mono text-white font-bold">{matchingSettings.nameWeight.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={matchingSettings.nameWeight}
                  onChange={(e) => {
                    const nw = parseFloat(e.target.value);
                    setMatchingSettings({ ...matchingSettings, nameWeight: nw, addressWeight: Number((1 - nw).toFixed(2)) });
                  }}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">
                  Address Weight: <span className="font-mono text-white font-bold">{matchingSettings.addressWeight.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={matchingSettings.addressWeight}
                  onChange={(e) => {
                    const aw = parseFloat(e.target.value);
                    setMatchingSettings({ ...matchingSettings, addressWeight: aw, nameWeight: Number((1 - aw).toFixed(2)) });
                  }}
                  className="w-full accent-orange-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Precision bias toggles */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={matchingSettings.preferPrecisionBias}
                  onChange={(e) => setMatchingSettings({ ...matchingSettings, preferPrecisionBias: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>High-Precision Bias (&quot;When unsure, do NOT merge&quot; - penalizes street mismatches)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={matchingSettings.landmarkTolerance}
                  onChange={(e) => setMatchingSettings({ ...matchingSettings, landmarkTolerance: e.target.checked })}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0"
                />
                <span>Landmark Tolerance (&quot;Nr. City Hall&quot; in same city treated as proximity signal)</span>
              </label>
            </div>
          </div>
        </div>

      </div>

      {/* Pipeline Output & File Inspection Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveSubTab('flow')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'flow' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              Entity Inspector
            </button>
            <button
              onClick={() => setActiveSubTab('scoring_table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'scoring_table' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              All Scored Candidate Pairs ({scoredPairsList.length})
            </button>
            <button
              onClick={() => setActiveSubTab('matching_results')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'matching_results' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              matching_results.tsv (Leaderboard)
            </button>
            <button
              onClick={() => setActiveSubTab('candidate_pairs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSubTab === 'candidate_pairs' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              candidate_pairs.tsv (Audited)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={downloadMatchingResults}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download matching_results.tsv</span>
            </button>
            <button
              onClick={downloadCandidatePairs}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download candidate_pairs.tsv</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: ENTITY INSPECTOR (Visual Step-by-Step as on Slide 2) */}
        {activeSubTab === 'flow' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-xs">
              <span className="text-slate-400 font-semibold">Select Source 1 Entity to Inspect:</span>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
              >
                {source1Records.map((r) => {
                  const isSingleton = (gtLookup.get(r.id)?.size || 0) === 0;
                  return (
                    <option key={r.id} value={r.id}>
                      {r.id}: {r.name} {isSingleton ? '(Singleton)' : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedEntity && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Entity Card */}
                <div className="bg-slate-950 border-2 border-slate-700 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Source 1 Reference</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">{selectedEntity.id}</span>
                  </div>
                  <div className="text-base font-bold text-white">{selectedEntity.name}</div>
                  <div className="text-xs text-slate-400">{selectedEntity.address}</div>
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                    Blocking Keys Generated:
                    <div className="flex flex-wrap gap-1 mt-1">
                      {generateBlockingKeys(selectedEntity.name, selectedEntity.address, blockingSettings.strategy).map((k) => (
                        <span key={k} className="px-2 py-0.5 bg-slate-800 text-amber-300 font-mono rounded text-[10px]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Candidate & Scoring List */}
                <div className="md:col-span-2 space-y-2">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Candidates passing Stage 1 Blocking ({selectedPairs.length})</span>
                    <span className="text-[10px] text-slate-500">Filtered by Matching Model at τ = {matchingSettings.threshold}</span>
                  </div>

                  {selectedPairs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800 text-slate-400 text-xs">
                      No candidates generated for this entity. Predicted as a <strong className="text-emerald-400">Singleton (empty match)</strong>.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {selectedPairs.map((p) => {
                        const cand = s2Lookup.get(p.candidateId) || s3Lookup.get(p.candidateId);
                        if (!cand) return null;
                        const isMatch = p.predictedMatch;
                        const isGT = p.groundTruthMatch;

                        return (
                          <div
                            key={p.candidateId}
                            className={`p-3 rounded-xl border transition-all ${
                              isMatch
                                ? 'bg-emerald-950/20 border-emerald-700/60'
                                : 'bg-slate-950/60 border-slate-800 opacity-75'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                    cand.source === 'S2' ? 'bg-amber-950/80 text-amber-300' : 'bg-orange-950/80 text-orange-300'
                                  }`}>
                                    {cand.id} ({cand.source})
                                  </span>
                                  <span className="text-xs font-bold text-white">{cand.name}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">{cand.address}</div>
                                {p.notes && (
                                  <div className="text-[10px] text-amber-400/80 mt-1 italic">
                                    Note: {p.notes}
                                  </div>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <div className="flex items-center justify-end space-x-2 text-xs font-mono">
                                  <span className="text-slate-400 text-[10px]">Name: {(p.nameScore * 100).toFixed(0)}%</span>
                                  <span className="text-slate-400 text-[10px]">Addr: {(p.addressScore * 100).toFixed(0)}%</span>
                                  <span className={`font-bold px-2 py-0.5 rounded text-xs ${
                                    p.overallScore >= matchingSettings.threshold
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {(p.overallScore * 100).toFixed(1)}%
                                  </span>
                                </div>

                                <div className="mt-1 flex items-center justify-end space-x-1">
                                  {isMatch ? (
                                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      <span>Matched</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                                      <XCircle className="w-3.5 h-3.5" />
                                      <span>Rejected (Look-alike)</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: ALL SCORED CANDIDATE PAIRS */}
        {activeSubTab === 'scoring_table' && (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="p-2.5 font-semibold">Source 1 ID</th>
                  <th className="p-2.5 font-semibold">Candidate ID</th>
                  <th className="p-2.5 font-semibold">Source 1 Name / Addr</th>
                  <th className="p-2.5 font-semibold">Candidate Name / Addr</th>
                  <th className="p-2.5 font-semibold text-center">Name Sim</th>
                  <th className="p-2.5 font-semibold text-center">Addr Sim</th>
                  <th className="p-2.5 font-semibold text-center">Score</th>
                  <th className="p-2.5 font-semibold text-center">Prediction</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                {scoredPairsList.map((p, idx) => {
                  const s1 = s1Lookup.get(p.source1Id);
                  const cand = s2Lookup.get(p.candidateId) || s3Lookup.get(p.candidateId);
                  if (!s1 || !cand) return null;

                  return (
                    <tr key={idx} className={p.predictedMatch ? 'bg-emerald-950/10' : 'hover:bg-slate-950/40'}>
                      <td className="p-2.5 font-bold text-amber-400">{p.source1Id}</td>
                      <td className="p-2.5 font-bold text-orange-400">{p.candidateId}</td>
                      <td className="p-2.5 font-sans">
                        <div className="font-semibold text-white">{s1.name}</div>
                        <div className="text-[10px] text-slate-400">{s1.address}</div>
                      </td>
                      <td className="p-2.5 font-sans">
                        <div className="font-semibold text-white">{cand.name}</div>
                        <div className="text-[10px] text-slate-400">{cand.address}</div>
                      </td>
                      <td className="p-2.5 text-center">{(p.nameScore * 100).toFixed(0)}%</td>
                      <td className="p-2.5 text-center">{(p.addressScore * 100).toFixed(0)}%</td>
                      <td className="p-2.5 text-center font-bold text-white">{(p.overallScore * 100).toFixed(1)}%</td>
                      <td className="p-2.5 text-center">
                        {p.predictedMatch ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            MATCH
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px]">
                            REJECTED
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* SUBTAB 3: matching_results.tsv */}
        {activeSubTab === 'matching_results' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>This is the official submission file scored on the challenge leaderboard:</span>
              <span className="font-mono text-amber-400">Tab-separated (.tsv), 1 row per S1</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto max-h-72">
              {generateTsvString(predictionsMap)}
            </pre>
          </div>
        )}

        {/* SUBTAB 4: candidate_pairs.tsv */}
        {activeSubTab === 'candidate_pairs' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Audited blocking candidates file included in the final challenge ZIP:</span>
              <span className="font-mono text-orange-400">Total pairs: {totalCandidatesGenerated}</span>
            </div>
            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto max-h-72">
              {generateTsvString(candidatePairsMap)}
            </pre>
          </div>
        )}

      </div>
    </div>
  );
};
