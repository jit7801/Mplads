import React from 'react';
import { ArrowRight, AlertTriangle, AlertCircle, FileSearch, Sparkles } from 'lucide-react';

export default function PriorityQueue({ works, onSelectWork }) {
  // Filter only high and critical risk works, sorted by score descending
  const priorityWorks = works
    .filter((w) => w.overall_risk_score >= 60)
    .slice(0, 10);

  const getRiskBadge = (score, level) => {
    if (level === "CRITICAL" || score >= 80) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping mr-1.5" />
          {score} • CRITICAL
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/30">
        {score} • HIGH
      </span>
    );
  };

  const getPrimaryRiskBadge = (factor) => {
    const colorMap = {
      "Cost Anomaly": "text-amber-300 bg-amber-500/10 border-amber-500/20",
      "Delay & Stagnation": "text-orange-300 bg-orange-500/10 border-orange-500/20",
      "Duplicate Overlap": "text-purple-300 bg-purple-500/10 border-purple-500/20",
      "Compliance Deficit": "text-rose-300 bg-rose-500/10 border-rose-500/20",
    };
    const style = colorMap[factor] || "text-slate-300 bg-slate-800 border-slate-700";
    return (
      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${style}`}>
        {factor}
      </span>
    );
  };

  return (
    <div className="glass-panel rounded-xl p-5 mb-8 border border-slate-800">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Today's High-Priority Verification Queue
            </h2>
            <span className="px-2 py-0.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
              {priorityWorks.length} Flagged Works
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by multi-factor empirical risk score. Click any work to review forensic evidence and issue inquiry notices.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Priority</th>
              <th className="py-2.5 px-3">Project Title & ID</th>
              <th className="py-2.5 px-3">District / Category</th>
              <th className="py-2.5 px-3">Risk Score</th>
              <th className="py-2.5 px-3">Primary Risk Signal</th>
              <th className="py-2.5 px-3">Key Evidence Summary</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {priorityWorks.map((work, idx) => (
              <tr
                key={work.work_id}
                onClick={() => onSelectWork(work.work_id)}
                className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
              >
                {/* Priority Rank */}
                <td className="py-3 px-3 font-bold text-slate-400">
                  <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-200">
                    #{idx + 1}
                  </span>
                </td>

                {/* Title & ID */}
                <td className="py-3 px-3 max-w-[280px]">
                  <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {work.work_title}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {work.work_id} • {work.implementing_agency}
                  </div>
                </td>

                {/* District & Category */}
                <td className="py-3 px-3 whitespace-nowrap">
                  <div className="text-slate-200 font-medium">{work.district}</div>
                  <div className="text-[10px] text-slate-400">{work.work_category}</div>
                </td>

                {/* Score */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getRiskBadge(work.overall_risk_score, work.risk_level)}
                </td>

                {/* Primary Risk */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {getPrimaryRiskBadge(work.primary_risk_factor)}
                </td>

                {/* Evidence Snippet */}
                <td className="py-3 px-3 max-w-[320px]">
                  <p className="text-slate-300 text-xs line-clamp-2">
                    {work.evidence_summary && work.evidence_summary[0]
                      ? work.evidence_summary[0]
                      : "Multi-parameter divergence detected."}
                  </p>
                </td>

                {/* Action Link */}
                <td className="py-3 px-3 text-right whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWork(work.work_id);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded transition-colors"
                  >
                    <FileSearch className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
