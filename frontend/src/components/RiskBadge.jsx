import React from 'react';

export default function RiskBadge({ score, level, size = 'sm' }) {
  const normLevel = (level || '').toUpperCase();

  let text = 'Low';
  let colorClass = 'text-[#487A5E] bg-[#F2F8F4] border-[#D8EADB]';

  if (normLevel === 'CRITICAL' || score >= 80) {
    text = 'Critical';
    colorClass = 'text-[#B85C5C] bg-[#FDF2F2] border-[#F8D7DA]';
  } else if (normLevel === 'HIGH' || score >= 60) {
    text = 'High';
    colorClass = 'text-[#C8754D] bg-[#FDF6F0] border-[#FCE8DB]';
  } else if (normLevel === 'MEDIUM' || score >= 30) {
    text = 'Medium';
    colorClass = 'text-[#B58532] bg-[#FEF9EE] border-[#F9ECCB]';
  }

  const padding = size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${padding} ${colorClass} whitespace-nowrap`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{text}</span>
      {score !== undefined && score !== null && (
        <span className="font-semibold opacity-90">· {score}</span>
      )}
    </span>
  );
}
