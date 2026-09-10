import React from 'react';
import { AlertOctagon, TrendingUp, Clock, Copy, FileWarning, CheckCircle, ShieldCheck } from 'lucide-react';

export default function SummaryCards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      title: "Total Monitored Works",
      value: summary.total_works || 0,
      subtext: `₹${((summary.total_sanctioned_amount || 0) / 10000000).toFixed(1)} Cr total budget`,
      icon: ShieldCheck,
      color: "text-blue-400",
      border: "border-blue-500/20",
      bg: "bg-blue-500/5",
    },
    {
      title: "Critical Risk Projects",
      value: summary.critical_count || 0,
      subtext: "Requires immediate inspection today",
      icon: AlertOctagon,
      color: "text-red-400",
      border: "border-red-500/30",
      bg: "bg-red-500/10",
      pulse: summary.critical_count > 0,
    },
    {
      title: "Cost Anomalies",
      value: summary.cost_anomalies_count || 0,
      subtext: "Costs > 1.5× peer median",
      icon: TrendingUp,
      color: "text-amber-400",
      border: "border-amber-500/20",
      bg: "bg-amber-500/5",
    },
    {
      title: "Progress Mismatch / Stalled",
      value: summary.stagnation_count || 0,
      subtext: "Financial progress > physical by 30%+",
      icon: Clock,
      color: "text-orange-400",
      border: "border-orange-500/20",
      bg: "bg-orange-500/5",
    },
    {
      title: "Candidate Duplicate Works",
      value: summary.duplicate_candidates_count || 0,
      subtext: "Co-located within 150m radius",
      icon: Copy,
      color: "text-purple-400",
      border: "border-purple-500/20",
      bg: "bg-purple-500/5",
    },
    {
      title: "Missing Certificates",
      value: summary.missing_docs_count || 0,
      subtext: "Missing UC, CC, or geo-photo",
      icon: FileWarning,
      color: "text-rose-400",
      border: "border-rose-500/20",
      bg: "bg-rose-500/5",
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${card.border} ${card.bg} backdrop-blur-sm transition-all duration-200 hover:border-slate-600 relative overflow-hidden ${
              card.pulse ? "pulse-critical" : ""
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {card.value}
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-1 truncate">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
