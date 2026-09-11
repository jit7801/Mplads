import React, { useState, useMemo } from 'react';
import { Search, MapPin, Building2, ExternalLink, FilterX, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CitizenView({ works = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPublicWork, setSelectedPublicWork] = useState(null);

  const categories = useMemo(() => Array.from(new Set(works.map((w) => w.work_category))).filter(Boolean).sort(), [works]);

  const filtered = useMemo(() => {
    return works.filter((w) => {
      const matchCat = !selectedCategory || w.work_category === selectedCategory;
      const matchStatus = !selectedStatus || w.status === selectedStatus;
      if (!search) return matchCat && matchStatus;
      const s = search.toLowerCase();
      const matchSearch =
        (w.work_title && w.work_title.toLowerCase().includes(s)) ||
        (w.village && w.village.toLowerCase().includes(s)) ||
        (w.ward && w.ward.toLowerCase().includes(s)) ||
        (w.district && w.district.toLowerCase().includes(s)) ||
        (w.work_id && w.work_id.toLowerCase().includes(s));
      return matchCat && matchStatus && matchSearch;
    });
  }, [works, search, selectedCategory, selectedStatus]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  return (
    <div className="space-y-6">
      
      {/* Citizen Transparency Banner */}
      <div className="gov-card p-5 sm:p-6 bg-white border-[#E4E7EC]">
        <div className="max-w-3xl space-y-3">
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold text-[#183B56] bg-[#F2F4F7] border border-[#E4E7EC]">
            Public Transparency & Social Audit Portal
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#1F2933] tracking-tight">
            MPLADS Constituency Works Public Transparency Register
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Open public registry of community development projects recommended under the Member of Parliament Local Area Development Scheme. 
            Track community assets, sanctioned funds, implementing agencies, and physical progress in your local village or ward.
          </p>

          {/* Search Bar */}
          <div className="pt-2 relative max-w-lg">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by village, ward, district, or project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-9 pr-7 py-2.5 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#1F2933]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedCategory ? 'bg-[#183B56] text-white' : 'bg-[#F2F4F7] text-[#475467] hover:bg-[#E4E7EC]'
              }`}
            >
              All Categories
            </button>
            {categories.slice(0, 6).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c === selectedCategory ? '' : c)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === c ? 'bg-[#183B56] text-white' : 'bg-[#F2F4F7] text-[#475467] hover:bg-[#E4E7EC]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#667085] px-1">
        <span>Found <strong>{filtered.length}</strong> public community works</span>
        {(search || selectedCategory || selectedStatus) && (
          <button
            onClick={clearFilters}
            className="text-[#B85C5C] hover:text-[#912018] flex items-center gap-1 font-semibold"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span>Reset Search</span>
          </button>
        )}
      </div>

      {/* Citizen Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.slice(0, 18).map((work) => (
          <div
            key={work.work_id}
            onClick={() => setSelectedPublicWork(work)}
            className="gov-card p-4 gov-card-hover cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[10px] text-[#667085]">{work.work_id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  work.status === 'COMPLETED'
                    ? 'bg-[#F2F8F4] text-[#487A5E] border-[#D8EADB]'
                    : 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]'
                }`}>
                  {work.status}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[#1F2933] mb-2 leading-snug line-clamp-2">
                {work.work_title}
              </h4>

              <div className="text-xs text-[#667085] space-y-1 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                  <span className="truncate">{work.village || work.ward ? `${work.village || work.ward}, ` : ''}{work.district}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#98A2B3] shrink-0" />
                  <span className="truncate">Category: {work.work_category}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2F4F7] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#667085]">Sanctioned Fund:</span>
                <strong className="text-[#1F2933]">₹{((work.sanctioned_amount || 0) / 100000).toFixed(2)} Lakhs</strong>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#667085] mb-1">
                  <span>Physical Completion</span>
                  <span className="font-bold text-[#487A5E]">{work.physical_progress}%</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${work.physical_progress}%` }}
                    className="h-full bg-[#5F8D73] rounded-full"
                  />
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPublicWork(work);
                }}
                className="btn-secondary w-full py-1 text-xs font-medium text-center mt-1 inline-flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3 text-[#667085]" />
                <span>View Public Details</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Public Project Details Modal */}
      {selectedPublicWork && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4"
          onClick={() => setSelectedPublicWork(null)}
        >
          <div 
            className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <div>
                <span className="text-[10px] font-bold text-[#183B56] uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#E4E7EC]">
                  Public Asset Card
                </span>
                <h3 className="text-sm font-bold text-[#1F2933] mt-1">
                  {selectedPublicWork.work_id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPublicWork(null)}
                className="p-1 rounded text-[#667085] hover:text-[#1F2933]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-[#475467]">
              <div>
                <h4 className="text-sm font-bold text-[#1F2933] leading-snug mb-1">
                  {selectedPublicWork.work_title}
                </h4>
                <p className="text-xs text-[#667085]">
                  Location: {selectedPublicWork.village || selectedPublicWork.ward ? `${selectedPublicWork.village || selectedPublicWork.ward}, ` : ''}{selectedPublicWork.district}, {selectedPublicWork.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div>
                  <span className="text-[#667085] block text-[11px]">Sanctioned Fund</span>
                  <strong className="text-sm text-[#1F2933]">₹{((selectedPublicWork.sanctioned_amount || 0) / 100000).toFixed(2)}L</strong>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Executing Agency</span>
                  <strong className="text-xs text-[#1F2933] truncate block">{selectedPublicWork.implementing_agency || 'DRDA'}</strong>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Physical Progress</span>
                  <strong className="text-sm text-[#487A5E]">{selectedPublicWork.physical_progress}%</strong>
                </div>
                <div>
                  <span className="text-[#667085] block text-[11px]">Project Status</span>
                  <strong className="text-xs text-[#1F2933]">{selectedPublicWork.status}</strong>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#F2F8F4] border border-[#D8EADB] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#487A5E] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#1A4B30] leading-relaxed">
                  Citizens can report ground observations, delay concerns, or physical quality feedback directly to the District Planning Officer.
                </p>
              </div>

              <div className="pt-2 border-t border-[#EAECF0] flex justify-end">
                <button
                  onClick={() => setSelectedPublicWork(null)}
                  className="btn-primary text-xs py-1.5 px-4"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
