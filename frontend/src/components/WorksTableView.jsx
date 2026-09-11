import React, { useState, useMemo, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import {
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FilterX,
  LayoutGrid,
  List,
  Eye,
  MapPin,
  Building2,
  AlertCircle
} from 'lucide-react';
import { useToast } from './Toast';

export default function WorksTableView({ works = [], onSelectWork, initialRiskFilter = '' }) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRisk, setSelectedRisk] = useState(initialRiskFilter);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const [sortBy, setSortBy] = useState('overall_risk_score');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (initialRiskFilter) {
      setSelectedRisk(initialRiskFilter);
    }
  }, [initialRiskFilter]);

  // Extract unique filter options
  const districts = useMemo(() => {
    const list = selectedState ? works.filter((w) => w.state === selectedState) : works;
    return Array.from(new Set(list.map((w) => w.district))).filter(Boolean).sort();
  }, [works, selectedState]);
  const categories = useMemo(() => Array.from(new Set(works.map((w) => w.work_category))).filter(Boolean).sort(), [works]);

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
    addToast('All filters have been reset.', 'info');
  };

  // Filter & Sort Works
  const filteredWorks = useMemo(() => {
    return works.filter((w) => {
      const matchSearch =
        !search ||
        (w.work_title && w.work_title.toLowerCase().includes(search.toLowerCase())) ||
        (w.work_id && w.work_id.toLowerCase().includes(search.toLowerCase())) ||
        (w.district && w.district.toLowerCase().includes(search.toLowerCase())) ||
        (w.implementing_agency && w.implementing_agency.toLowerCase().includes(search.toLowerCase()));

      const matchState = !selectedState || w.state === selectedState;
      const matchDistrict = !selectedDistrict || w.district === selectedDistrict;
      const matchCategory = !selectedCategory || w.work_category === selectedCategory;
      const matchRisk = !selectedRisk || w.risk_level === selectedRisk;
      const matchStatus = !selectedStatus || w.status === selectedStatus;

      return matchSearch && matchState && matchDistrict && matchCategory && matchRisk && matchStatus;
    }).sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
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
    if (filteredWorks.length === 0) {
      addToast('No records available to export.', 'warning');
      return;
    }

    const headers = [
      'Work ID', 'Title', 'Category', 'State', 'District', 'Sanctioned Amount (INR)',
      'Actual Expenditure (INR)', 'Physical Progress (%)', 'Financial Progress (%)',
      'Unified Risk Score', 'Risk Level', 'Primary Signal', 'Status', 'Agency'
    ];
    const rows = filteredWorks.map((w) => [
      `"${w.work_id || ''}"`,
      `"${(w.work_title || '').replace(/"/g, '""')}"`,
      `"${w.work_category || ''}"`,
      `"${w.state || ''}"`,
      `"${w.district || ''}"`,
      w.sanctioned_amount || 0,
      w.actual_expenditure || 0,
      w.physical_progress || 0,
      w.financial_progress || 0,
      w.overall_risk_score || 0,
      w.risk_level || '',
      `"${(w.primary_risk_factor || '').replace(/"/g, '""')}"`,
      w.status || '',
      `"${(w.implementing_agency || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MPLADS_Works_Registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(`Exported ${filteredWorks.length} projects to CSV successfully.`, 'success');
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
            Browse, filter, and inspect all {works.length} monitored infrastructure projects.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#F2F4F7] p-0.5 rounded-md border border-[#EAECF0]">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-white text-[#183B56] shadow-xs' : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              title="Table View"
              aria-label="Switch to table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-white text-[#183B56] shadow-xs' : 'text-[#667085] hover:text-[#1F2933]'
                }`}
              title="Card Grid View"
              aria-label="Switch to grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={exportCSV}
            className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-medium"
            title="Download CSV report of filtered works"
          >
            <Download className="w-3.5 h-3.5 text-[#667085]" />
            <span className="hidden xs:inline">Export CSV</span>
            <span className="xs:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="gov-card p-3 sm:p-4 space-y-3">

        {/* Search & Main Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">

          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search title, ID, district, agency..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-9 pr-7 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#1F2933]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Risk Level Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] px-2.5 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56] cursor-pointer"
            >
              <option value="">All Risk Tiers</option>
              <option value="CRITICAL">Critical (80+)</option>
              <option value="HIGH">High (60–79)</option>
              <option value="MEDIUM">Medium (30–59)</option>
              <option value="LOW">Low (0–29)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] px-2.5 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] px-2.5 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56] cursor-pointer"
            >
              <option value="">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] px-2.5 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56] cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="SANCTIONED">Sanctioned</option>
              <option value="COMPLETED">Completed</option>
              <option value="STALLED">Stalled</option>
            </select>
          </div>

        </div>

        {/* Results Count & Clear Button */}
        <div className="flex items-center justify-between pt-2 border-t border-[#EAECF0] text-xs text-[#667085]">
          <div>
            Showing <strong className="text-[#1F2933]">{filteredWorks.length}</strong> matching projects
            {hasActiveFilters && ' (filtered)'}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[#B85C5C] hover:text-[#912018] flex items-center gap-1 font-semibold text-xs py-0.5 px-2 rounded hover:bg-[#FDF2F2] transition-colors"
            >
              <FilterX className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

      </div>

      {/* Grid View Mode */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {paginatedWorks.length === 0 ? (
            <div className="col-span-full gov-card p-12 text-center text-[#667085]">
              <AlertCircle className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" />
              <div className="font-semibold text-sm text-[#1F2933]">No projects found</div>
              <p className="text-xs text-[#667085] mt-1">Try broadening your search or resetting active filters.</p>
              <button onClick={clearFilters} className="btn-secondary text-xs mt-3">Reset Filters</button>
            </div>
          ) : (
            paginatedWorks.map((work) => (
              <div
                key={work.work_id}
                onClick={() => onSelectWork(work.work_id)}
                className="gov-card p-4 gov-card-hover cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-2">
                    <span className="font-mono text-[10px] text-[#667085] truncate">{work.work_id}</span>
                    <RiskBadge score={work.overall_risk_score} level={work.risk_level} size="sm" />
                  </div>

                  <h3 className="text-sm font-bold text-[#1F2933] hover:text-[#183B56] transition-colors line-clamp-2 mb-2">
                    {work.work_title}
                  </h3>

                  <div className="space-y-1 text-xs text-[#667085] mb-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                      <span className="truncate">{work.district}, {work.state}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                      <span className="truncate">{work.work_category}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#F2F4F7] space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#667085]">Sanctioned Fund:</span>
                    <strong className="text-[#1F2933]">₹{((work.sanctioned_amount || 0) / 100000).toFixed(2)}L</strong>
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-[#667085] mb-1">
                      <span>Progress (Phys / Fin)</span>
                      <span className="font-semibold text-[#1F2933]">{work.physical_progress}% / {work.financial_progress}%</span>
                    </div>
                    <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${work.physical_progress}%` }} className="h-full bg-[#487A5E]" />
                      <div style={{ width: `${Math.max(0, work.financial_progress - work.physical_progress)}%` }} className="h-full bg-[#C8754D]" />
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectWork(work.work_id);
                    }}
                    className="btn-secondary w-full py-1 text-xs font-medium text-center mt-2"
                  >
                    Inspect Dossier
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View Mode */
        <div className="gov-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse gov-table min-w-[760px]">
              <thead>
                <tr>
                  <th
                    onClick={() => toggleSort('work_id')}
                    className="cursor-pointer hover:bg-[#F2F4F7] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Work ID & Title</span>
                      <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                    </div>
                  </th>
                  <th
                    onClick={() => toggleSort('district')}
                    className="cursor-pointer hover:bg-[#F2F4F7] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Location</span>
                      <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                    </div>
                  </th>
                  <th>Category</th>
                  <th
                    onClick={() => toggleSort('sanctioned_amount')}
                    className="cursor-pointer hover:bg-[#F2F4F7] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Sanctioned</span>
                      <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                    </div>
                  </th>
                  <th>Progress (Phys / Fin)</th>
                  <th
                    onClick={() => toggleSort('overall_risk_score')}
                    className="cursor-pointer hover:bg-[#F2F4F7] transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>Risk Score</span>
                      <ArrowUpDown className="w-3 h-3 text-[#98A2B3]" />
                    </div>
                  </th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorks.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-[#667085]">
                      <AlertCircle className="w-8 h-8 text-[#98A2B3] mx-auto mb-2" />
                      <div className="font-semibold text-sm text-[#1F2933]">No projects found</div>
                      <p className="text-xs text-[#667085] mt-1">Try broadening your search or resetting active filters.</p>
                      <button onClick={clearFilters} className="btn-secondary text-xs mt-3">Reset Filters</button>
                    </td>
                  </tr>
                ) : (
                  paginatedWorks.map((work) => (
                    <tr
                      key={work.work_id}
                      onClick={() => onSelectWork(work.work_id)}
                      className="cursor-pointer hover:bg-[#F9FAFB] transition-colors"
                    >
                      {/* Work ID & Title */}
                      <td className="max-w-[280px]">
                        <div className="font-semibold text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                          {work.work_title}
                        </div>
                        <div className="text-[10px] text-[#667085] font-mono mt-0.5 truncate">
                          {work.work_id} · {work.status}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="whitespace-nowrap">
                        <div className="text-[#1F2933] font-medium">{work.district}</div>
                        <div className="text-[10px] text-[#667085]">{work.state}</div>
                      </td>

                      {/* Category */}
                      <td className="whitespace-nowrap text-xs text-[#475467]">
                        {work.work_category}
                      </td>

                      {/* Sanctioned */}
                      <td className="whitespace-nowrap font-medium text-[#1F2933]">
                        ₹{((work.sanctioned_amount || 0) / 100000).toFixed(2)}L
                      </td>

                      {/* Progress */}
                      <td className="whitespace-nowrap">
                        <div className="text-xs font-semibold text-[#1F2933]">
                          {work.physical_progress}% <span className="text-[#667085] font-normal">phys</span> / {work.financial_progress}% <span className="text-[#667085] font-normal">fin</span>
                        </div>
                        <div className="w-24 bg-[#E4E7EC] h-1.5 rounded-full mt-1 overflow-hidden flex">
                          <div style={{ width: `${work.physical_progress}%` }} className="h-full bg-[#487A5E]" />
                          <div style={{ width: `${Math.max(0, work.financial_progress - work.physical_progress)}%` }} className="h-full bg-[#C8754D]" />
                        </div>
                      </td>

                      {/* Risk Score */}
                      <td className="whitespace-nowrap">
                        <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
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
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="gov-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-[#667085]">
            Page <strong className="text-[#1F2933]">{currentPage}</strong> of <strong className="text-[#1F2933]">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {/* Page number buttons */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pNum = Math.min(totalPages - 4 + i, currentPage - 2 + i);
                }
                return (
                  <button
                    key={pNum}
                    onClick={() => setCurrentPage(pNum)}
                    className={`w-7 h-7 rounded-md font-medium text-xs transition-colors ${currentPage === pNum
                        ? 'bg-[#183B56] text-white'
                        : 'text-[#475467] hover:bg-[#F2F4F7]'
                      }`}
                  >
                    {pNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary py-1 px-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              aria-label="Next page"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
