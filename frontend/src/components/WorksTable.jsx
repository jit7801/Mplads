import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, ArrowUpDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

export default function WorksTable({ works, onSelectWork }) {
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedRisk, setSelectedRisk] = useState("");
  const [sortBy, setSortBy] = useState("overall_risk_score");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Extract unique filter choices
  const states = useMemo(() => Array.from(new Set(works.map((w) => w.state))).filter(Boolean), [works]);
  const districts = useMemo(() => {
    const list = selectedState ? works.filter((w) => w.state === selectedState) : works;
    return Array.from(new Set(list.map((w) => w.district))).filter(Boolean);
  }, [works, selectedState]);
  const categories = useMemo(() => Array.from(new Set(works.map((w) => w.work_category))).filter(Boolean), [works]);

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

      return matchSearch && matchState && matchDistrict && matchCategory && matchRisk;
    }).sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [works, search, selectedState, selectedDistrict, selectedCategory, selectedRisk, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredWorks.length / pageSize) || 1;
  const paginatedWorks = filteredWorks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const exportCSV = () => {
    const headers = [
      "Work ID", "Title", "Category", "State", "District", "Sanctioned Amount",
      "Actual Expenditure", "Physical Progress", "Financial Progress", "Risk Score",
      "Risk Level", "Primary Risk Factor", "Agency", "Status"
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
      `"${w.implementing_agency || ''}"`,
      w.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MPLADS_Risk_Analysis_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-red-400 bg-red-500/10 border-red-500/20";
    if (score >= 60) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
    if (score >= 30) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800">
      
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Master Risk Work Queue
          </h3>
          <p className="text-xs text-slate-400">
            Showing {filteredWorks.length} of {works.length} monitored infrastructure works.
          </p>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search title, ID, district..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-900 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4 p-3 rounded-lg bg-slate-900/60 border border-slate-800">
        <select
          value={selectedState}
          onChange={(e) => {
            setSelectedState(e.target.value);
            setSelectedDistrict("");
            setCurrentPage(1);
          }}
          className="bg-slate-800 text-slate-300 text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={selectedDistrict}
          onChange={(e) => {
            setSelectedDistrict(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-800 text-slate-300 text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none"
        >
          <option value="">All Districts</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-800 text-slate-300 text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={selectedRisk}
          onChange={(e) => {
            setSelectedRisk(e.target.value);
            setCurrentPage(1);
          }}
          className="bg-slate-800 text-slate-300 text-xs rounded px-2.5 py-1.5 border border-slate-700 focus:outline-none"
        >
          <option value="">All Risk Tiers</option>
          <option value="CRITICAL">Critical (80–100)</option>
          <option value="HIGH">High (60–79)</option>
          <option value="MEDIUM">Medium (30–59)</option>
          <option value="LOW">Low (0–29)</option>
        </select>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">
                <button onClick={() => toggleSort("overall_risk_score")} className="flex items-center gap-1 hover:text-white">
                  <span>Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Project Title & ID</th>
              <th className="py-2.5 px-3">District</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">
                <button onClick={() => toggleSort("sanctioned_amount")} className="flex items-center gap-1 hover:text-white">
                  <span>Cost (₹)</span>
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-3">Progress (Phys vs Fin)</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedWorks.map((work) => {
              const gap = Math.round(work.financial_progress - work.physical_progress);
              return (
                <tr
                  key={work.work_id}
                  onClick={() => onSelectWork(work.work_id)}
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                >
                  {/* Risk Score Pill */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs border ${getScoreColor(work.overall_risk_score)}`}>
                      {work.overall_risk_score}
                    </span>
                  </td>

                  {/* Title & ID */}
                  <td className="py-3 px-3 max-w-[260px]">
                    <div className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                      {work.work_title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {work.work_id}
                    </div>
                  </td>

                  {/* District */}
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    {work.district}
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                    <span className="text-[11px]">{work.work_category}</span>
                  </td>

                  {/* Sanctioned Cost */}
                  <td className="py-3 px-3 text-slate-200 font-mono whitespace-nowrap">
                    ₹{(work.sanctioned_amount / 100000).toFixed(2)}L
                  </td>

                  {/* Progress Comparison */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${Math.min(work.physical_progress, 100)}%` }}
                          className="bg-emerald-500 h-full"
                          title={`Physical: ${work.physical_progress}%`}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">
                        {Math.round(work.physical_progress)}% / {Math.round(work.financial_progress)}%
                      </span>
                      {gap >= 25 && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          +{gap}% gap
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                      work.status === "COMPLETED"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : work.status === "STALLED"
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {work.status}
                    </span>
                  </td>

                  {/* Action Link */}
                  <td className="py-3 px-3 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWork(work.work_id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded bg-slate-800 text-slate-300 disabled:opacity-30 hover:bg-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
