import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { 
  Search, 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpDown, 
  FilterX,
  SlidersHorizontal 
} from 'lucide-react';

export default function WorksTableView({ works, onSelectWork }) {
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('overall_risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique filters
  const states = useMemo(() => Array.from(new Set(works.map((w) => w.state))).filter(Boolean), [works]);
  const districts = useMemo(() => {
    const list = selectedState ? works.filter((w) => w.state === selectedState) : works;
    return Array.from(new Set(list.map((w) => w.district))).filter(Boolean);
  }, [works, selectedState]);
  const categories = useMemo(() => Array.from(new Set(works.map((w) => w.work_category))).filter(Boolean), [works]);

  const hasActiveFilters = Boolean(
    search || selectedState || selectedDistrict || selectedCategory || selectedRisk || selectedStatus
  );

  const clearFilters = () => {
    setSearch('');
    setSelectedState('');
    setSelectedDistrict('');
    setSelectedCategory('');
    setSelectedRisk('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  // Filter & Sort
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchSearch =
        !search ||
        w.work_title.toLowerCase().includes(search.toLowerCase()) ||
        w.work_id.toLowerCase().includes(search.toLowerCase()) ||
        w.district.toLowerCase().includes(search.toLowerCase()) ||
        (w.implementing_agency && w.implementing_agency.toLowerCase().includes(search.toLowerCase()));

      const matchState = !selectedState || w.state === selectedState;
      const matchDistrict = !selectedDistrict || w.district === selectedDistrict;
      const matchCategory = !selectedCategory || w.work_category === selectedCategory;
      const matchRisk = !selectedRisk || w.risk_level === selectedRisk;
      const matchStatus = !selectedStatus || w.status === selectedStatus;

      return matchSearch && matchState && matchDistrict && matchCategory && matchRisk && matchStatus;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [works, search, selectedState, selectedDistrict, selectedCategory, selectedRisk, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredWorks.length / pageSize) || 1;
  const paginatedWorks = filteredWorks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const exportCSV = () => {
    const headers = [
      'Work ID', 'Title', 'Category', 'State', 'District', 'Sanctioned Amount',
      'Actual Expenditure', 'Physical Progress', 'Financial Progress', 'Risk Score',
      'Risk Level', 'Primary Signal', 'Status'
    ];
    const rows = filteredWorks.map((w) => [
      `"${w.work_id}"`,
      `"${w.work_title.replace(/"/g, '""')}"`,
      `"${w.work_category}"`,
      `"${w.state}"`,
      `"${w.district}"`,
      w.sanctioned_amount,
      w.actual_expenditure,
      w.physical_progress,
      w.financial_progress,
      w.overall_risk_score,
      w.risk_level,
      `"${w.primary_risk_factor}"`,
      w.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Risk_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
            Risk Works Registry
          </h2>
          <p className="text-xs text-[#667085]">
            Browse and filter all {works.length} monitored infrastructure projects.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-1.5 py-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#667085]" />
            <span>Export Table (CSV)</span>
          </button>
        </div>
      </div>

      {/* Horizontal Filter Bar */}
      <div className="gov-card p-3 space-y-2.5">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          
          {/* Search */}
          <div className="relative col-span-2 sm:col-span-1 lg:col-span-2">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search by title, ID, location..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-8 pr-3 py-1.5 rounded border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
          </div>

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedDistrict('');
              setCurrentPage(1);
            }}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2 py-1.5 focus:outline-none focus:border-[#183B56]"
          >
            <option value="">All States</option>
            {states.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* District */}
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2 py-1.5 focus:outline-none focus:border-[#183B56]"
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2 py-1.5 focus:outline-none focus:border-[#183B56]"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Risk Level */}
          <select
            value={selectedRisk}
            onChange={(e) => {
              setSelectedRisk(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2 py-1.5 focus:outline-none focus:border-[#183B56]"
          >
            <option value="">All Risk Tiers</option>
            <option value="CRITICAL">Critical (80–100)</option>
            <option value="HIGH">High (60–79)</option>
            <option value="MEDIUM">Medium (30–59)</option>
            <option value="LOW">Low (0–29)</option>
          </select>

        </div>

        {/* Active Filter Chips & Clear Action */}
        {hasActiveFilters && (
          <div className="flex items-center flex-wrap gap-2 pt-1 border-t border-[#F2F4F7] text-xs">
            <span className="text-[11px] text-[#667085] font-medium">Active filters:</span>
            
            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] text-[11px]">
                Search: "{search}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearch('')} />
              </span>
            )}
            {selectedState && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] text-[11px]">
                State: {selectedState}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedState('')} />
              </span>
            )}
            {selectedDistrict && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] text-[11px]">
                District: {selectedDistrict}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedDistrict('')} />
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] text-[11px]">
                {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('')} />
              </span>
            )}
            {selectedRisk && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F2F4F7] text-[#344054] text-[11px]">
                Tier: {selectedRisk}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedRisk('')} />
              </span>
            )}

            <button
              onClick={clearFilters}
              className="text-[11px] font-medium text-[#B85C5C] hover:underline ml-auto"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      <div className="gov-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table">
            <thead>
              <tr>
                <th style={{ width: '100px' }}>
                  <button onClick={() => toggleSort('overall_risk_score')} className="flex items-center gap-1 hover:text-[#1F2933]">
                    <span>Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Work Title & ID</th>
                <th>Location</th>
                <th>Category</th>
                <th>
                  <button onClick={() => toggleSort('sanctioned_amount')} className="flex items-center gap-1 hover:text-[#1F2933]">
                    <span>Sanctioned Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th>Progress (Phys / Fin)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedWorks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-[#667085]">
                    <FilterX className="w-8 h-8 text-[#D0D5DD] mx-auto mb-2" />
                    <div className="font-semibold text-sm text-[#1F2933]">No works found</div>
                    <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
                      No infrastructure projects match your selected filter criteria. Try adjusting or clearing your filters.
                    </p>
                    <button
                      onClick={clearFilters}
                      className="btn-secondary mt-3 py-1 px-3 text-xs"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedWorks.map((work) => {
                  const gap = Math.round(work.financial_progress - work.physical_progress);
                  return (
                    <tr
                      key={work.work_id}
                      onClick={() => onSelectWork(work.work_id)}
                      className="cursor-pointer transition-colors"
                    >
                      {/* Risk Score */}
                      <td className="whitespace-nowrap">
                        <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                      </td>

                      {/* Work Title & ID */}
                      <td className="max-w-[280px]">
                        <div className="font-medium text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                          {work.work_title}
                        </div>
                        <div className="text-[11px] text-[#667085] font-mono mt-0.5 truncate">
                          {work.work_id} · {work.implementing_agency}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap">
                        <div className="text-[#1F2933]">{work.district}</div>
                        <div className="text-[11px] text-[#667085]">{work.state}</div>
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap text-[#475467] text-xs">
                        {work.work_category}
                      </td>

                      {/* Sanctioned Cost */}
                      <td className="whitespace-nowrap font-medium text-[#1F2933]">
                        ₹{(work.sanctioned_amount / 100000).toFixed(2)}L
                      </td>

                      {/* Progress Comparison */}
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-[#344054]">
                            {Math.round(work.physical_progress)}% / {Math.round(work.financial_progress)}%
                          </span>
                          {gap >= 25 && (
                            <span className="text-[10px] font-semibold text-[#B85C5C] bg-[#FDF2F2] px-1 rounded border border-[#F8D7DA]">
                              +{gap}% gap
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="whitespace-nowrap">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          work.status === 'COMPLETED'
                            ? 'bg-[#F2F8F4] text-[#487A5E] border-[#D8EADB]'
                            : work.status === 'STALLED'
                            ? 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]'
                            : 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]'
                        }`}>
                          {work.status}
                        </span>
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

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-[#E4E7EC] flex items-center justify-between text-xs text-[#667085] bg-white">
          <div>
            Showing <strong className="text-[#1F2933]">{filteredWorks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-[#1F2933]">{Math.min(currentPage * pageSize, filteredWorks.length)}</strong> of{' '}
            <strong className="text-[#1F2933]">{filteredWorks.length}</strong> works
          </div>

          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1 rounded border border-[#D0D5DD] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1 rounded border border-[#D0D5DD] disabled:opacity-40 hover:bg-[#F9FAFB] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
