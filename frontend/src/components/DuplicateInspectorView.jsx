import React from 'react';
import { Copy, MapPin, ArrowRight, ShieldAlert, CheckCircle2, Eye } from 'lucide-react';

export default function DuplicateInspectorView({ pairs, onSelectPair }) {
  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Candidate Duplicate & Overlapping Asset Inspector
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full">
              {pairs.length} Detected Pairs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Projects within 150m spatial bubble exhibiting high semantic title similarity and agency overlap.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pairs.map((pair) => {
          const { work_a, work_b, distance_meters, text_similarity, combined_score, same_agency } = pair;
          return (
            <div
              key={pair.pair_id}
              onClick={() => onSelectPair(pair)}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-purple-500/15 text-purple-300 rounded border border-purple-500/25">
                  Distance: {distance_meters}m
                </span>
                <span className="text-xs font-bold text-red-400 font-mono">
                  Overlap Index: {combined_score}%
                </span>
              </div>

              {/* Work A vs Work B comparison cards */}
              <div className="space-y-2 mt-3 text-xs">
                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>{work_a.work_id}</span>
                    <span>₹{(work_a.sanctioned_amount / 100000).toFixed(2)}L</span>
                  </div>
                  <p className="font-semibold text-white truncate">{work_a.work_title}</p>
                </div>

                <div className="p-2 rounded bg-slate-800/60 border border-slate-700/50">
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                    <span>{work_b.work_id}</span>
                    <span>₹{(work_b.sanctioned_amount / 100000).toFixed(2)}L</span>
                  </div>
                  <p className="font-semibold text-white truncate">{work_b.work_title}</p>
                </div>
              </div>

              {/* Meta tags */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800">
                <span className="truncate">
                  {same_agency ? "Same Agency: " + work_a.implementing_agency : "Different Agencies"}
                </span>
                <span className="flex items-center gap-1 text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Inspect Diff</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
