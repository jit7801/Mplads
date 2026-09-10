import React from 'react';
import RiskBadge from './RiskBadge';
import { FileText, Printer, Download, CheckCircle, Clock } from 'lucide-react';

export default function ReportsView({ works, onSelectWork }) {
  // Flagged works requiring field inquiries
  const flaggedWorks = works.filter((w) => w.overall_risk_score >= 60);

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
            Inspection Orders & Audit Registry
          </h2>
          <p className="text-xs text-[#667085]">
            Formal administrative verification directives issued for high-risk and critical infrastructure projects.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="btn-secondary flex items-center gap-1.5 self-start sm:self-center"
        >
          <Printer className="w-3.5 h-3.5 text-[#667085]" />
          <span>Print Audit Summary</span>
        </button>
      </div>

      {/* Orders Table */}
      <div className="gov-card overflow-hidden">
        <div className="p-3.5 border-b border-[#E4E7EC] bg-[#F9FAFB] flex items-center justify-between text-xs">
          <span className="font-semibold text-[#1F2933]">
            Active Field Verification Directives ({flaggedWorks.length})
          </span>
          <span className="text-[#667085]">
            District Magistrate Oversight · Jaipur Division
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse gov-table">
            <thead>
              <tr>
                <th>Order Ref / Work ID</th>
                <th>Project Title</th>
                <th>Location</th>
                <th>Risk Level</th>
                <th>Ordered Administrative Action</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {flaggedWorks.map((work) => (
                <tr
                  key={work.work_id}
                  onClick={() => onSelectWork(work.work_id)}
                  className="cursor-pointer transition-colors"
                >
                  <td className="whitespace-nowrap font-mono text-xs text-[#1F2933] font-medium">
                    {work.work_id}
                  </td>

                  <td className="max-w-[260px]">
                    <div className="font-medium text-[#1F2933] hover:text-[#183B56] transition-colors truncate">
                      {work.work_title}
                    </div>
                    <div className="text-[11px] text-[#667085] truncate">
                      Agency: {work.implementing_agency}
                    </div>
                  </td>

                  <td className="whitespace-nowrap text-xs text-[#475467]">
                    {work.district}, {work.state}
                  </td>

                  <td className="whitespace-nowrap">
                    <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                  </td>

                  <td className="max-w-[320px] text-xs text-[#475467]">
                    <p className="line-clamp-2">
                      {work.recommended_action}
                    </p>
                  </td>

                  <td className="text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectWork(work.work_id);
                      }}
                      className="btn-secondary py-1 px-2.5 text-xs font-medium"
                    >
                      View Notice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
