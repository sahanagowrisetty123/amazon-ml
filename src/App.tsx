/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SlideWalkthrough } from './components/SlideWalkthrough';
import { InteractivePipeline } from './components/InteractivePipeline';
import { MetricsAndMathView } from './components/MetricsAndMathView';
import { ValidatorAndPackager } from './components/ValidatorAndPackager';
import { PythonPipelineGenerator } from './components/PythonPipelineGenerator';
import { DatasetBrowser } from './components/DatasetBrowser';

import { 
  SAMPLE_SOURCE_1, 
  SAMPLE_SOURCE_2, 
  SAMPLE_SOURCE_3, 
  SAMPLE_GROUND_TRUTH 
} from './data/sampleDataset';
import { evaluatePredictions } from './utils/metrics';
import { BusinessRecord, GroundTruthRecord } from './types/entity-resolution';

export default function App() {
  const [activeTab, setActiveTab] = useState<'walkthrough' | 'pipeline' | 'metrics' | 'validator' | 'python' | 'records'>('walkthrough');

  // Datasets
  const [source1Records, setSource1Records] = useState<BusinessRecord[]>(SAMPLE_SOURCE_1);
  const [source2Records, setSource2Records] = useState<BusinessRecord[]>(SAMPLE_SOURCE_2);
  const [source3Records, setSource3Records] = useState<BusinessRecord[]>(SAMPLE_SOURCE_3);
  const [groundTruth, setGroundTruth] = useState<GroundTruthRecord[]>(SAMPLE_GROUND_TRUTH);

  // Predictions state updated by the InteractivePipeline
  const [predictions, setPredictions] = useState<Map<string, string[]>>(() => {
    // Initial mock prediction matching ground truth with realistic noise
    const map = new Map<string, string[]>();
    for (const gt of SAMPLE_GROUND_TRUTH) {
      map.set(gt.source1Id, [...gt.matchingIds]);
    }
    return map;
  });

  const [candidatePairs, setCandidatePairs] = useState<Map<string, string[]>>(() => {
    const map = new Map<string, string[]>();
    for (const s1 of SAMPLE_SOURCE_1) {
      map.set(s1.id, []);
    }
    return map;
  });

  // Live calculation of Macro F0.5 metrics
  const macroMetrics = useMemo(() => {
    return evaluatePredictions(predictions, groundTruth, source1Records);
  }, [predictions, groundTruth, source1Records]);

  const handlePredictionsUpdated = (
    newPreds: Map<string, string[]>, 
    newCandidates: Map<string, string[]>
  ) => {
    setPredictions(newPreds);
    setCandidatePairs(newCandidates);
  };

  const handleDatasetUpdated = (
    s1: BusinessRecord[],
    s2: BusinessRecord[],
    s3: BusinessRecord[],
    gt: GroundTruthRecord[]
  ) => {
    setSource1Records(s1);
    setSource2Records(s2);
    setSource3Records(s3);
    setGroundTruth(gt);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentMacroF05={macroMetrics.macroF05}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'walkthrough' && <SlideWalkthrough />}

        {activeTab === 'pipeline' && (
          <InteractivePipeline
            source1Records={source1Records}
            source2Records={source2Records}
            source3Records={source3Records}
            groundTruth={groundTruth}
            onPredictionsUpdated={handlePredictionsUpdated}
          />
        )}

        {activeTab === 'metrics' && (
          <MetricsAndMathView metrics={macroMetrics} />
        )}

        {activeTab === 'validator' && (
          <ValidatorAndPackager
            source1Records={source1Records}
            currentPredictions={predictions}
            currentCandidatePairs={candidatePairs}
          />
        )}

        {activeTab === 'python' && <PythonPipelineGenerator />}

        {activeTab === 'records' && (
          <DatasetBrowser
            source1Records={source1Records}
            source2Records={source2Records}
            source3Records={source3Records}
            groundTruth={groundTruth}
            onDatasetUpdated={handleDatasetUpdated}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/90 border-t border-slate-800/80 py-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-400">Amazon ML Challenge 2026</span>
            <span>•</span>
            <span>Business Entity Resolution</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Metric: <strong className="text-amber-400 font-mono">Macro F0.5</strong></span>
            <span>Delimiter: <strong className="text-slate-300 font-mono">TSV (\t)</strong></span>
            <span>Rule: <strong className="text-rose-400">Zero External APIs</strong></span>
          </div>
        </div>
      </footer>
    </div>
  );
}
