import React from 'react';
import { 
  Briefcase, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Copy 
} from 'lucide-react';

export default function KPICards({ summary }) {
  if (!summary) return null;

  const cards = [
    {
      label: 'Total Monitored Works',
      value: summary.total_works || 0,
      context: `₹${((summary.total_sanctioned_amount || 0) / 10000000).toFixed(1)} Cr sanctioned`,
      icon: Briefcase,
      color: 'text-[#183B56]',
    },
    {
      label: 'High Risk Works',
      value: summary.high_count || 0,
      context: 'Score 60–79 · elevated risk',
      icon: AlertTriangle,
      color: 'text-[#C8754D]',
    },
    {
      label: 'Critical Works',
      value: summary.critical_count || 0,
      context: 'Requires scrutiny today',
      icon: AlertOctagon,
      color: 'text-[#B85C5C]',
    },
    {
      label: 'Stalled / Progress Mismatch',
      value: summary.stagnation_count || 0,
      context: 'Expenditure > physical by 30%+',
      icon: Clock,
      color: 'text-[#C49A4A]',
    },
    {
      label: 'Possible Duplicates',
      value: summary.duplicate_candidates_count || 0,
      context: 'Co-located within 150m radius',
      icon: Copy,
      color: 'text-[#2F6F8F]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="gov-card p-4 gov-card-hover flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#667085] truncate">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
            </div>
            
            <div className="text-2xl font-bold text-[#1F2933] tracking-tight">
              {card.value}
            </div>

            <div className="text-[11px] text-[#667085] mt-1 truncate">
              {card.context}
            </div>
          </div>
        );
      })}
    </div>
  );
}
