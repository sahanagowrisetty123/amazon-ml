import React, { useState } from 'react';
import { Database, Search, Filter, Upload, Layers } from 'lucide-react';
import { BusinessRecord, GroundTruthRecord } from '../types/entity-resolution';
import { parseBusinessRecordsTsv, parseGroundTruthTsv } from '../utils/tsvParser';

interface DatasetBrowserProps {
  source1Records: BusinessRecord[];
  source2Records: BusinessRecord[];
  source3Records: BusinessRecord[];
  groundTruth: GroundTruthRecord[];
  onDatasetUpdated: (
    s1: BusinessRecord[],
    s2: BusinessRecord[],
    s3: BusinessRecord[],
    gt: GroundTruthRecord[]
  ) => void;
}

export const DatasetBrowser: React.FC<DatasetBrowserProps> = ({
  source1Records,
  source2Records,
  source3Records,
  groundTruth,
  onDatasetUpdated,
}) => {
  const [activeSource, setActiveSource] = useState<'all' | 'S1' | 'S2' | 'S3'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const gtLookup = new Map(groundTruth.map((gt) => [gt.source1Id, gt.matchingIds]));

  const allRecords = [
    ...source1Records,
    ...source2Records,
    ...source3Records,
  ];

  const filteredRecords = allRecords.filter((r) => {
    if (activeSource !== 'all' && r.source !== activeSource) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(term) ||
      r.name.toLowerCase().includes(term) ||
      r.address.toLowerCase().includes(term)
    );
  });

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>, source: 'S1' | 'S2' | 'S3' | 'GT') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (source === 'GT') {
        const parsedGt = parseGroundTruthTsv(content);
        onDatasetUpdated(source1Records, source2Records, source3Records, parsedGt);
      } else {
        const parsedRecs = parseBusinessRecordsTsv(content, source);
        if (source === 'S1') onDatasetUpdated(parsedRecs, source2Records, source3Records, groundTruth);
        if (source === 'S2') onDatasetUpdated(source1Records, parsedRecs, source3Records, groundTruth);
        if (source === 'S3') onDatasetUpdated(source1Records, source2Records, parsedRecs, groundTruth);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs uppercase font-extrabold tracking-widest text-amber-400">
              <Database className="w-4 h-4" />
              <span>Multi-Source Catalog Explorer</span>
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">Challenge Datasets (S1, S2, S3)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              Inspect how business names and addresses vary between Reference and Vendors.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              S1: <strong className="text-white">{source1Records.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-300">
              S2: <strong className="text-white">{source2Records.length}</strong>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-orange-950/40 border border-orange-800/40 text-orange-300">
              S3: <strong className="text-white">{source3Records.length}</strong>
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search records (e.g. Acme, San Jose)..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveSource('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                activeSource === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800 hover:text-white'
              }`}
            >
              All Sources ({allRecords.length})
            </button>
            <button
              onClick={() => setActiveSource('S1')}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                activeSource === 'S1' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800 hover:text-white'
              }`}
            >
              Source 1 Reference ({source1Records.length})
            </button>
            <button
              onClick={() => setActiveSource('S2')}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                activeSource === 'S2' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800 hover:text-white'
              }`}
            >
              Source 2 Vendor A ({source2Records.length})
            </button>
            <button
              onClick={() => setActiveSource('S3')}
              className={`px-3 py-1 rounded-lg text-xs font-medium ${
                activeSource === 'S3' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 bg-slate-800 hover:text-white'
              }`}
            >
              Source 3 Vendor B ({source3Records.length})
            </button>
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono">
                <th className="p-3 font-semibold">Source</th>
                <th className="p-3 font-semibold">Record ID</th>
                <th className="p-3 font-semibold">Business Name</th>
                <th className="p-3 font-semibold">Business Address</th>
                <th className="p-3 font-semibold">Ground Truth Links</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {filteredRecords.map((r) => {
                const gtMatches = r.source === 'S1' ? (gtLookup.get(r.id) || []) : [];
                return (
                  <tr key={r.id} className="hover:bg-slate-950/40">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.source === 'S1'
                          ? 'bg-slate-800 text-slate-300'
                          : r.source === 'S2'
                          ? 'bg-amber-950/80 text-amber-300'
                          : 'bg-orange-950/80 text-orange-300'
                      }`}>
                        {r.source}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{r.id}</td>
                    <td className="p-3 font-sans font-semibold text-slate-100">{r.name}</td>
                    <td className="p-3 font-sans text-slate-400">{r.address}</td>
                    <td className="p-3 text-[11px]">
                      {r.source === 'S1' ? (
                        gtMatches.length === 0 ? (
                          <span className="text-amber-400/80 italic">Singleton (No match)</span>
                        ) : (
                          <span className="text-emerald-400">{gtMatches.join(', ')}</span>
                        )
                      ) : (
                        <span className="text-slate-600">-</span>
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
