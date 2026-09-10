import React, { useState } from 'react';
import { Search, MapPin, Building2, ExternalLink } from 'lucide-react';

export default function CitizenView({ works }) {
  const [search, setSearch] = useState('');

  const filtered = works.filter((w) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      w.work_title.toLowerCase().includes(s) ||
      (w.village && w.village.toLowerCase().includes(s)) ||
      (w.ward && w.ward.toLowerCase().includes(s)) ||
      w.district.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Citizen Banner */}
      <div className="gov-card p-6 bg-white border-[#E4E7EC]">
        <div className="max-w-2xl space-y-2">
          <span className="inline-block px-2.5 py-0.5 rounded text-xs font-semibold text-[#183B56] bg-[#F2F4F7] border border-[#E4E7EC]">
            Public Transparency Portal
          </span>
          <h2 className="text-xl font-bold text-[#1F2933] tracking-tight">
            MPLADS Constituency Works Transparency Register
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Open public registry of development works recommended under the Member of Parliament Local Area Development Scheme. 
            Track community asset status, sanctioned amounts, and physical progress in your local ward or village.
          </p>

          <div className="pt-2 relative max-w-md">
            <Search className="w-3.5 h-3.5 text-[#98A2B3] absolute left-3 top-5" />
            <input
              type="text"
              placeholder="Search by village, ward, district, or project title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] pl-8 pr-3 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
            />
          </div>
        </div>
      </div>

      {/* Citizen Project Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.slice(0, 15).map((work) => (
          <div
            key={work.work_id}
            className="gov-card p-4 gov-card-hover flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-mono text-[11px] text-[#667085]">{work.work_id}</span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  work.status === 'COMPLETED'
                    ? 'bg-[#F2F8F4] text-[#487A5E] border-[#D8EADB]'
                    : 'bg-[#F2F4F7] text-[#344054] border-[#EAECF0]'
                }`}>
                  {work.status}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-[#1F2933] mb-2 leading-snug line-clamp-2">
                {work.work_title}
              </h4>

              <div className="text-xs text-[#667085] space-y-1 mb-3">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#98A2B3] shrink-0" />
                  <span className="truncate">{work.village || work.ward}, {work.district}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-[#98A2B3] shrink-0" />
                  <span className="truncate">Agency: {work.implementing_agency}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2F4F7] space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#667085]">Sanctioned Fund:</span>
                <strong className="text-[#1F2933]">₹{(work.sanctioned_amount / 100000).toFixed(2)} Lakhs</strong>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-[#667085] mb-1">
                  <span>Physical Completion</span>
                  <span className="font-medium text-[#487A5E]">{work.physical_progress}%</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${work.physical_progress}%` }}
                    className="h-full bg-[#5F8D73] rounded-full"
                  />
                </div>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
