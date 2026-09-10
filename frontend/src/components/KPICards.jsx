import React from 'react';
import { 
  Briefcase, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Copy,
  ChevronRight
} from 'lucide-react';

export default function KPICards({ summary, onSelectFilter }) {
  if (!summary) return null;

  const cards = [
    {
      id: 'TOTAL',
      label: 'Total Monitored Works',
      value: summary.total_works || 0,
      context: `₹${((summary.total_sanctioned_amount || 0) / 10000000).toFixed(1)} Cr sanctioned`,
      icon: Briefcase,
      color: 'text-[#183B56]',
      bg: 'bg-white',
      borderHover: 'hover:border-[#183B56]',
    },
    {
      id: 'HIGH',
      label: 'High Risk Works',
      value: summary.high_count || 0,
      context: 'Score 60–79 · elevated risk',
      icon: AlertTriangle,
      color: 'text-[#C8754D]',
      bg: 'bg-white',
      borderHover: 'hover:border-[#C8754D]',
    },
    {
      id: 'CRITICAL',
      label: 'Critical Works',
      value: summary.critical_count || 0,
      context: 'Requires scrutiny today',
      icon: AlertOctagon,
      color: 'text-[#B85C5C]',
      bg: 'bg-white',
      borderHover: 'hover:border-[#B85C5C]',
    },
    {
      id: 'STAGNATION',
      label: 'Stalled / Progress Gap',
      value: summary.stagnation_count || 0,
      context: 'Expenditure > physical by 20%+',
      icon: Clock,
      color: 'text-[#C49A4A]',
      bg: 'bg-white',
      borderHover: 'hover:border-[#C49A4A]',
    },
    {
      id: 'DUPLICATE',
      label: 'Possible Duplicates',
      value: summary.duplicate_candidates_count || 0,
      context: 'Co-located within 150m radius',
      icon: Copy,
      color: 'text-[#2F6F8F]',
      bg: 'bg-white',
      borderHover: 'hover:border-[#2F6F8F]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <button
            key={card.id}
            onClick={() => onSelectFilter && onSelectFilter(card.id)}
            className={`gov-card p-3 sm:p-4 text-left transition-all duration-150 flex flex-col justify-between group cursor-pointer focus-visible:ring-2 focus-visible:ring-[#183B56] ${card.borderHover} ${
              card.id === 'DUPLICATE' ? 'col-span-2 sm:col-span-1' : ''
            }`}
            title={`Filter by ${card.label}`}
          >
            <div className="flex items-center justify-between mb-1 sm:mb-1.5 w-full">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#667085] truncate group-hover:text-[#1F2933]">
                {card.label}
              </span>
              <Icon className={`w-3.5 h-3.5 ${card.color} shrink-0`} />
            </div>
            
            <div className="text-xl sm:text-2xl font-bold text-[#1F2933] tracking-tight">
              {card.value}
            </div>

            <div className="flex items-center justify-between mt-1 text-[10px] sm:text-[11px] text-[#667085] w-full">
              <span className="truncate">{card.context}</span>
              <ChevronRight className="w-3 h-3 text-[#98A2B3] group-hover:text-[#183B56] transition-transform group-hover:translate-x-0.5 shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}
