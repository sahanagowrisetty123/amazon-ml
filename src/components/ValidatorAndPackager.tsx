import React, { useState } from 'react';
import { 
  CheckCircle2, AlertTriangle, FileArchive, Download, Upload, 
  FileText, ShieldCheck, RefreshCw, Layers 
} from 'lucide-react';
import JSZip from 'jszip';
import { validateMatchingResultsTsv, generateTsvString } from '../utils/tsvParser';
import { SubmissionValidationReport, BusinessRecord } from '../types/entity-resolution';
import { DOCUMENTATION_TEMPLATE, PYTHON_PIPELINE_CODE } from '../data/sampleDataset';

interface ValidatorAndPackagerProps {
  source1Records: BusinessRecord[];
  currentPredictions: Map<string, string[]>;
  currentCandidatePairs: Map<string, string[]>;
}

export const ValidatorAndPackager: React.FC<ValidatorAndPackagerProps> = ({
  source1Records,
  currentPredictions,
  currentCandidatePairs,
}) => {
  const defaultTsv = generateTsvString(currentPredictions);
  const [tsvInput, setTsvInput] = useState<string>(defaultTsv);
  const [validationReport, setValidationReport] = useState<SubmissionValidationReport>(() => {
    return validateMatchingResultsTsv(defaultTsv, source1Records.map((r) => r.id));
  });
  const [isPackaging, setIsPackaging] = useState<boolean>(false);
  const [packageSuccess, setPackageSuccess] = useState<boolean>(false);

  const handleValidate = (textToValidate?: string) => {
    const text = textToValidate !== undefined ? textToValidate : tsvInput;
    const report = validateMatchingResultsTsv(text, source1Records.map((r) => r.id));
    setValidationReport(report);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setTsvInput(content);
      handleValidate(content);
    };
    reader.readAsText(file);
  };

  const handleSyncCurrentPipeline = () => {
    const synched = generateTsvString(currentPredictions);
    setTsvInput(synched);
    handleValidate(synched);
  };

  // Generate and download final ZIP submission package
  const handleDownloadZipPackage = async () => {
    setIsPackaging(true);
    setPackageSuccess(false);

    try {
      const zip = new JSZip();

      // Folder structure:
      // output/matching_results.tsv
      // output/candidate_pairs.tsv
      // code/pipeline.py
      // Documentation_template.md

      const outputFolder = zip.folder('output');
      outputFolder?.file('matching_results.tsv', tsvInput);
      outputFolder?.file('candidate_pairs.tsv', generateTsvString(currentCandidatePairs));

      const codeFolder = zip.folder('code');
      codeFolder?.file('pipeline.py', PYTHON_PIPELINE_CODE);

      zip.file('Documentation_template.md', DOCUMENTATION_TEMPLATE);

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'amazon_ml_challenge_2026_submission_package.zip';
      a.click();
      URL.revokeObjectURL(url);

      setPackageSuccess(true);
      setTimeout(() => setPackageSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to create ZIP package', err);
    } finally {
      setIsPackaging(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center space-x-2 text-xs uppercase font-extrabold tracking-widest text-amber-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Slide 4 Compliance: &quot;A File, Then A Package&quot;</span>
        </div>
        <h2 className="text-2xl font-bold text-white">Submission Validator & ZIP Packager</h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Mimics the official <code className="text-amber-300 font-mono">utils/validate_submission.py</code> script to catch formatting faults, delimiters, and missing IDs before submitting.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* VALIDATOR INPUT & TESTER */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">matching_results.tsv Validator</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSyncCurrentPipeline}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-xs flex items-center gap-1 transition-colors"
                title="Load output from current pipeline simulation"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Simulator</span>
              </button>
              <label className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded text-xs flex items-center gap-1 cursor-pointer transition-colors border border-amber-500/30">
                <Upload className="w-3 h-3" />
                <span>Upload .tsv</span>
                <input type="file" accept=".tsv,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>TSV Content (Tab-separated; 1 row per S1):</span>
              <span className="font-mono text-slate-500">{tsvInput.split('\n').filter(Boolean).length} rows</span>
            </div>
            <textarea
              value={tsvInput}
              onChange={(e) => {
                setTsvInput(e.target.value);
                handleValidate(e.target.value);
              }}
              rows={12}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 font-mono text-xs text-slate-200 focus:border-amber-500 focus:outline-none"
              placeholder="S1-732914\tS2-118820,S3-905477&#10;S1-201774\t"
            />
          </div>

          <button
            onClick={() => handleValidate()}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Run validate_submission.py Check</span>
          </button>
        </div>

        {/* VALIDATION RESULTS REPORT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Official Validation Verdict</h3>
              {validationReport.isValid ? (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PASS: SUBMISSION READY</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs flex items-center gap-1.5 border border-rose-500/30">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>FAIL: {validationReport.errors.length} ERROR(S)</span>
                </span>
              )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Rows</span>
                <span className="text-base font-black font-mono text-white">{validationReport.rowCount}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Singletons</span>
                <span className="text-base font-black font-mono text-amber-400">{validationReport.singletonCount}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Avg Matches/S1</span>
                <span className="text-base font-black font-mono text-emerald-400">{validationReport.averageMatchesPerEntity}</span>
              </div>
            </div>

            {/* Error & Warning Lists */}
            <div className="space-y-2">
              {validationReport.errors.length > 0 && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-xl text-xs space-y-1.5 text-rose-300">
                  <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Formatting Faults:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    {validationReport.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationReport.warnings.length > 0 && (
                <div className="p-3 bg-amber-950/30 border border-amber-800/60 rounded-xl text-xs space-y-1.5 text-amber-300">
                  <div className="font-bold uppercase tracking-wider flex items-center gap-1.5 text-amber-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Warnings:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px]">
                    {validationReport.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationReport.errors.length === 0 && validationReport.warnings.length === 0 && (
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Perfect TSV Syntax Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Every Source 1 entity is uniquely represented with valid tab separators and candidate comma format.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* FINAL PACKAGE ZIP GENERATOR */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="text-xs text-slate-400">
              Generate audited competition ZIP containing:
              <code className="block text-[11px] text-amber-300 font-mono mt-0.5">
                output/matching_results.tsv, output/candidate_pairs.tsv, code/pipeline.py, Documentation_template.md
              </code>
            </div>

            <button
              onClick={handleDownloadZipPackage}
              disabled={isPackaging || !validationReport.isValid}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FileArchive className="w-4 h-4" />
              <span>{isPackaging ? 'Generating ZIP...' : 'Download Final Submission Package (.zip)'}</span>
            </button>

            {packageSuccess && (
              <div className="text-center text-xs font-bold text-emerald-400 animate-pulse">
                ✓ ZIP archive downloaded successfully!
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
