import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { Coins, Filter, Search, TrendingUp, Info } from 'lucide-react';

export default function CostAnomaliesView({ works, onSelectWork }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [search, setSearch] = useState('');

  // Extract categories & districts
  const categories = useMemo(() => Array.from(new Set(works.map((w) => w.work_category))).filter(Boolean), [works]);
  const districts = useMemo(() => Array.from(new Set(works.map((w) => w.district))).filter(Boolean), [works]);

  // Filter works that have elevated financial risk (score >= 15)
  const costAnomalies = useMemo(() => {
    return works.filter((w) => {
      const isOutlier = w.financial_risk >= 15;
      const matchCat = !selectedCategory || w.work_category === selectedCategory;
      const matchDist = !selectedDistrict || w.district === selectedDistrict;
      const matchSearch = !search || w.work_title.toLowerCase().includes(search.toLowerCase()) || w.work_id.toLowerCase().includes(search.toLowerCase());
      return isOutlier && matchCat && matchDist && matchSearch;
    }).sort((a, b) => b.financial_risk - a.financial_risk);
  }, [works, selectedCategory, selectedDistrict, search]);

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
          Cost Anomaly Intelligence
        </h2>
        <p className="text-xs text-[#667085]">
          Identify works whose cost significantly exceeds comparable like-for-like projects within the same peer group.
        </p>
      </div>

      {/* Explanatory Context Box */}
      <div className="gov-card p-4 bg-[#F9FAFB] border-[#E4E7EC] flex items-start gap-3">
        <Info className="w-4 h-4 text-[#2F6F8F] shrink-0 mt-0.5" />
        <div className="text-xs text-[#475467] leading-relaxed">
          <strong className="text-[#1F2933]">Methodology:</strong> Works are stratified into fine-grained peer cohorts (<em>Work Category × District</em>). 
          The system calculates the robust Median and Median Absolute Deviation (MAD) of historical sanctioned rates. Works with Modified Z-scores &gt; 2.5 or cost ratios &gt; 1.45× peer median are surfaced for rate validation against District Schedule of Rates (DSR).
        </div>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search cost outlier works..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-8 pr-3 py-1.5 rounded border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
          </div>

          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2.5 py-1.5 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-[#667085]">
          Found <strong className="text-[#1F2933]">{costAnomalies.length}</strong> cost anomalies
        </span>
      </div>

      {/* Outliers Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table">
            <thead>
              <tr>
                <th>Work Title & ID</th>
                <th>Location</th>
                <th>Category</th>
                <th>This Work</th>
                <th>Peer Median</th>
                <th>Difference</th>
                <th>Risk Score</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {costAnomalies.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-[#667085]">
                    No cost anomalies found matching selected criteria.
                  </td>
                </tr>
              ) : (
                costAnomalies.map((work) => {
                  const cEval = work.cost_evaluation || {};
                  const median = cEval.cohort_median || work.sanctioned_amount;
                  const ratio = cEval.cost_ratio || 1.0;
                  const diffPct = Math.round((ratio - 1.0) * 100);

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
                          {work.work_id}
                        </div>
                      </td>

                      <td className="whitespace-nowrap">
                        <div className="text-[#1F2933]">{work.district}</div>
                        <div className="text-[11px] text-[#667085]">{work.state}</div>
                      </td>

                      <td className="whitespace-nowrap text-xs text-[#475467]">
                        {work.work_category}
                      </td>

                      <td className="whitespace-nowrap font-medium text-[#1F2933]">
                        ₹{(work.sanctioned_amount / 100000).toFixed(2)}L
                      </td>

                      <td className="whitespace-nowrap text-[#667085] font-medium">
                        ₹{(median / 100000).toFixed(2)}L
                      </td>

                      <td className="whitespace-nowrap">
                        <span className="font-medium text-[#B58532] bg-[#FEF9EE] px-1.5 py-0.5 rounded border border-[#F9ECCB] text-xs">
                          +{diffPct}%
                        </span>
                      </td>

                      <td className="whitespace-nowrap">
                        <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                      </td>

                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectWork(work.work_id);
                          }}
                          className="btn-secondary py-1 px-2.5 text-xs font-medium"
                        >
                          Inspect
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
