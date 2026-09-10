import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import { ArrowRight, ChevronRight, Eye, ChevronDown, ChevronUp } from 'lucide-react';

export default function PriorityTable({ works, onSelectWork, onViewAll }) {
  const [showAllPriority, setShowAllPriority] = useState(false);

  // Filter high/critical priority works (score >= 60)
  const priorityWorks = works
    .filter((w) => w.overall_risk_score >= 60)
    .sort((a, b) => b.overall_risk_score - a.overall_risk_score);

  const displayedWorks = showAllPriority ? priorityWorks : priorityWorks.slice(0, 6);

  const getSignalBadge = (signal) => {
    let color = 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]';
    if (signal === 'Cost Anomaly') color = 'bg-[#FEF9EE] text-[#B58532] border-[#F9ECCB]';
    if (signal === 'Delay & Stagnation') color = 'bg-[#FDF6F0] text-[#C8754D] border-[#FCE8DB]';
    if (signal === 'Duplicate Overlap') color = 'bg-[#F0F5F8] text-[#2F6F8F] border-[#D7E6EE]';
    if (signal === 'Compliance Deficit') color = 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]';

    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-medium border whitespace-nowrap ${color}`}>
        {signal}
      </span>
    );
  };

  return (
    <div className="gov-card overflow-hidden mb-6">
      
      {/* Header */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-[#E4E7EC] flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#1F2933]">
              Today's Priority Works
            </h2>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FDF2F2] text-[#B85C5C] border border-[#F8D7DA]">
              {priorityWorks.length} Flagged
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-[#667085]">
            Works with highest empirical divergence requiring immediate administrative verification.
          </p>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs font-semibold text-[#183B56] hover:text-[#112A3E] flex items-center gap-1 transition-colors self-start sm:self-center py-1 px-2 rounded-md hover:bg-[#F2F4F7]"
          >
            <span>Full Registry ({works.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Desktop & Tablet Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse gov-table min-w-[640px]">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Priority</th>
              <th>Work Title & ID</th>
              <th>Location</th>
              <th>Risk Score</th>
              <th>Primary Signal</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedWorks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-[#667085]">
                  No high-risk works currently pending priority review.
                </td>
              </tr>
            ) : (
              displayedWorks.map((work) => (
                <tr
                  key={work.work_id}
                  onClick={() => onSelectWork(work.work_id)}
                  className="cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Priority Level */}
                  <td>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      work.overall_risk_score >= 80 
                        ? 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]' 
                        : 'bg-[#FEF9EE] text-[#C8754D] border-[#F9ECCB]'
                    }`}>
                      {work.overall_risk_score >= 80 ? 'Critical' : 'High'}
                    </span>
                  </td>

                  {/* Work Title & ID */}
                  <td className="max-w-[280px]">
                    <div className="font-semibold text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                      {work.work_title}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-[#667085] font-mono mt-0.5 truncate">
                      {work.work_id} · {work.work_category}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="whitespace-nowrap">
                    <div className="text-[#1F2933] font-medium">{work.district}</div>
                    <div className="text-[10px] text-[#667085]">{work.state}</div>
                  </td>

                  {/* Risk Score */}
                  <td className="whitespace-nowrap">
                    <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                  </td>

                  {/* Primary Signal */}
                  <td className="whitespace-nowrap">
                    {getSignalBadge(work.primary_risk_factor)}
                  </td>

                  {/* Action */}
                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWork(work.work_id);
                      }}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-[#667085]" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Expand / View All Footer */}
      {priorityWorks.length > 6 && (
        <div className="p-2.5 bg-[#F9FAFB] border-t border-[#E4E7EC] text-center">
          <button
            onClick={() => setShowAllPriority(!showAllPriority)}
            className="text-xs font-medium text-[#183B56] hover:text-[#112A3E] inline-flex items-center gap-1.5 py-1 px-3 rounded hover:bg-white transition-colors"
          >
            {showAllPriority ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Show Fewer ({displayedWorks.length} shown)</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Show All {priorityWorks.length} Priority Works</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
