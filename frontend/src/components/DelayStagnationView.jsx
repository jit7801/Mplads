import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Clock, AlertTriangle, Search, Filter } from 'lucide-react';

export default function DelayStagnationView({ works, onSelectWork }) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, MISMATCH, OVERDUE, DORMANT

  const delayedWorks = useMemo(() => {
    return works.filter((w) => {
      const dEval = w.delay_evaluation || {};
      const gap = dEval.progress_gap || (w.financial_progress - w.physical_progress);
      const daysDormant = dEval.days_dormant || 0;
      const daysOverdue = dEval.days_overdue || 0;

      const hasDelayRisk = w.delay_risk >= 12 || gap >= 20 || daysDormant >= 60;
      if (!hasDelayRisk) return false;

      if (filterType === 'MISMATCH' && gap < 25) return false;
      if (filterType === 'DORMANT' && daysDormant < 60) return false;
      if (filterType === 'OVERDUE' && daysOverdue <= 0) return false;

      if (search) {
        const s = search.toLowerCase();
        return w.work_title.toLowerCase().includes(s) || w.work_id.toLowerCase().includes(s) || w.district.toLowerCase().includes(s);
      }
      return true;
    }).sort((a, b) => (b.delay_risk || 0) - (a.delay_risk || 0));
  }, [works, filterType, search]);

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
          Delay & Stagnation Intelligence
        </h2>
        <p className="text-xs text-[#667085]">
          Track works where financial expenditure outpaces verified physical assets, milestone dates have lapsed, or progress updates have halted.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search delayed works..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-8 pr-3 py-1.5 rounded border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F2F4F7] p-0.5 rounded border border-[#EAECF0] text-xs">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'ALL' ? 'bg-white text-[#183B56] shadow-sm' : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              All Delayed
            </button>
            <button
              onClick={() => setFilterType('MISMATCH')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'MISMATCH' ? 'bg-white text-[#183B56] shadow-sm' : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              Progress Mismatch (&gt;25%)
            </button>
            <button
              onClick={() => setFilterType('DORMANT')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                filterType === 'DORMANT' ? 'bg-white text-[#183B56] shadow-sm' : 'text-[#667085] hover:text-[#1F2933]'
              }`}
            >
              Dormant (&gt;60 days)
            </button>
          </div>
        </div>

        <span className="text-xs text-[#667085]">
          Found <strong className="text-[#1F2933]">{delayedWorks.length}</strong> flagged works
        </span>
      </div>

      {/* Delayed Works Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table">
            <thead>
              <tr>
                <th>Work Title & ID</th>
                <th>Location</th>
                <th>Target Completion</th>
                <th>Days Since Update</th>
                <th>Physical Progress</th>
                <th>Financial Progress</th>
                <th>Mismatch Gap</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {delayedWorks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-[#667085]">
                    No delayed or stagnant works match the selected filters.
                  </td>
                </tr>
              ) : (
                delayedWorks.map((work) => {
                  const dEval = work.delay_evaluation || {};
                  const gap = Math.round(dEval.progress_gap || (work.financial_progress - work.physical_progress));
                  const daysDormant = dEval.days_dormant || 0;

                  return (
                    <tr
                      key={work.work_id}
                      onClick={() => onSelectWork(work.work_id)}
                      className="cursor-pointer transition-colors"
                    >
                      <td className="max-w-[280px]">
                        <div className="font-medium text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                          {work.work_title}
                        </div>
                        <div className="text-[11px] text-[#667085] font-mono mt-0.5">
                          {work.work_id} · {work.status}
                        </div>
                      </td>

                      <td className="whitespace-nowrap">
                        <div className="text-[#1F2933]">{work.district}</div>
                        <div className="text-[11px] text-[#667085]">{work.state}</div>
                      </td>

                      <td className="whitespace-nowrap text-xs text-[#475467] font-mono">
                        {work.expected_completion_date || '—'}
                      </td>

                      <td className="whitespace-nowrap text-xs">
                        <span className={daysDormant >= 90 ? 'text-[#B85C5C] font-semibold' : 'text-[#475467]'}>
                          {daysDormant} days
                        </span>
                      </td>

                      <td className="whitespace-nowrap text-xs font-mono font-medium text-[#487A5E]">
                        {work.physical_progress}%
                      </td>

                      <td className="whitespace-nowrap text-xs font-mono font-medium text-[#183B56]">
                        {work.financial_progress}%
                      </td>

                      <td className="whitespace-nowrap">
                        {gap >= 25 ? (
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold text-[#B85C5C] bg-[#FDF2F2] border border-[#F8D7DA]">
                            +{gap}% gap
                          </span>
                        ) : (
                          <span className="text-xs text-[#667085] font-mono">
                            +{gap}%
                          </span>
                        )}
                      </td>

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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
