import React from 'react';
import RiskBadge from './RiskBadge';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function PriorityTable({ works, onSelectWork, onViewAll }) {
  // Sort by overall risk score descending and get top critical/high works
  const priorityWorks = works
    .filter((w) => w.overall_risk_score >= 60)
    .slice(0, 8);

  const getSignalBadge = (signal) => {
    let color = 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]';
    if (signal === 'Cost Anomaly') color = 'bg-[#FEF9EE] text-[#B58532] border-[#F9ECCB]';
    if (signal === 'Delay & Stagnation') color = 'bg-[#FDF6F0] text-[#C8754D] border-[#FCE8DB]';
    if (signal === 'Duplicate Overlap') color = 'bg-[#F0F5F8] text-[#2F6F8F] border-[#D7E6EE]';
    if (signal === 'Compliance Deficit') color = 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]';

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium border ${color}`}>
        {signal}
      </span>
    );
  };

  const getDaysAgo = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      const now = new Date('2024-09-15');
      const diffDays = Math.max(0, Math.round((now - d) / (1000 * 60 * 60 * 24)));
      return `${diffDays} days ago`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="gov-card overflow-hidden mb-6">
      
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-[#E4E7EC] flex items-center justify-between bg-white">
        <div>
          <h2 className="text-sm font-semibold text-[#1F2933]">
            Today's Priority Works
          </h2>
          <p className="text-xs text-[#667085]">
            Works with highest empirical divergence requiring administrative verification today.
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-medium text-[#183B56] hover:text-[#112A3E] flex items-center gap-1 transition-colors"
          >
            <span>View All ({works.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table">
          <thead>
            <tr>
              <th style={{ width: '90px' }}>Priority</th>
              <th>Work Title & ID</th>
              <th>Location</th>
              <th>Risk Score</th>
              <th>Primary Signal</th>
              <th>Last Update</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {priorityWorks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-[#667085]">
                  No high-risk works currently pending priority review.
                </td>
              </tr>
            ) : (
              priorityWorks.map((work) => (
                <tr
                  key={work.work_id}
                  onClick={() => onSelectWork(work.work_id)}
                  className="cursor-pointer transition-colors"
                >
                  {/* Priority Level */}
                  <td>
                    <span className={`text-[11px] font-semibold uppercase tracking-wider ${
                      work.overall_risk_score >= 80 ? 'text-[#B85C5C]' : 'text-[#C8754D]'
                    }`}>
                      {work.overall_risk_score >= 80 ? 'Critical' : 'High'}
                    </span>
                  </td>

                  {/* Work Title & ID */}
                  <td className="max-w-[320px]">
                    <div className="font-medium text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                      {work.work_title}
                    </div>
                    <div className="text-[11px] text-[#667085] font-mono mt-0.5 truncate">
                      {work.work_id} · {work.work_category}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="whitespace-nowrap">
                    <div className="text-[#1F2933]">{work.district}</div>
                    <div className="text-[11px] text-[#667085]">{work.state}</div>
                  </td>

                  {/* Risk Score */}
                  <td className="whitespace-nowrap">
                    <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                  </td>

                  {/* Primary Signal */}
                  <td className="whitespace-nowrap">
                    {getSignalBadge(work.primary_risk_factor)}
                  </td>

                  {/* Last Update */}
                  <td className="whitespace-nowrap text-[#667085] text-xs">
                    {getDaysAgo(work.last_update_date)}
                  </td>

                  {/* Action */}
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWork(work.work_id);
                      }}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
