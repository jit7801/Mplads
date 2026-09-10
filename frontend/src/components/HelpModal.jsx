import React, { useState } from 'react';
import { X, HelpCircle, BookOpen, ShieldCheck, Scale, Clock, Copy, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export default function HelpModal({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', title: 'System Overview & SIH26102', icon: BookOpen },
    { id: 'financial', title: '1. Financial & Cost Anomalies', icon: Scale },
    { id: 'delay', title: '2. Progress Gap & Stagnation', icon: Clock },
    { id: 'duplicates', title: '3. Duplicate & Overlap Detection', icon: Copy },
    { id: 'directives', title: '4. Statutory Field Notices', icon: FileText },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div 
        className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56] text-white flex items-center justify-center shrink-0 shadow-sm">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 id="help-modal-title" className="text-sm sm:text-base font-bold text-[#1F2933]">
                MPLADS Risk Intelligence — Verification Guidelines
              </h2>
              <p className="text-[11px] text-[#667085]">
                Operational manual and algorithmic rationale for district nodal authorities.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#1F2933] hover:bg-[#EAECF0] transition-colors"
            aria-label="Close help guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-hidden">
          
          {/* Navigation Tab list */}
          <div className="w-full sm:w-48 bg-[#F9FAFB] border-b sm:border-b-0 sm:border-r border-[#E4E7EC] p-2 flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto shrink-0">
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'bg-white text-[#183B56] font-semibold shadow-sm border border-[#E4E7EC]'
                      : 'text-[#475467] hover:bg-[#EAECF0] hover:text-[#1F2933]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#183B56]' : 'text-[#667085]'}`} />
                  <span className="truncate">{sec.title}</span>
                </button>
              );
            })}
          </div>

          {/* Section Content Area */}
          <div className="flex-1 p-5 overflow-y-auto text-xs leading-relaxed text-[#475467] space-y-4">
            
            {activeSection === 'overview' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F2933]">Objective & Scope</h3>
                <p>
                  The <strong>MPLADS Risk Intelligence Layer (SIH26102)</strong> is a transparent, explainable decision-support engine developed to assist Members of Parliament, District Magistrates, and central monitoring bodies.
                </p>
                <div className="p-3 bg-[#F2F4F7] rounded-lg border border-[#E4E7EC] space-y-1">
                  <span className="font-semibold text-[#1F2933] block">Unified Risk Scoring (0–100 Scale):</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#475467]">
                    <li><strong className="text-[#B85C5C]">Critical (80–100):</strong> Urgent spot inspection mandated within 7 days.</li>
                    <li><strong className="text-[#C8754D]">High (60–79):</strong> Elevated progress gap or cost outlier requiring desk audit.</li>
                    <li><strong className="text-[#C49A4A]">Medium (30–59):</strong> Routine monitoring with minor milestone slippage.</li>
                    <li><strong className="text-[#487A5E]">Low (0–29):</strong> Fully compliant and on-schedule execution.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'financial' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F2933]">Peer Group Baselining & Cost Outliers</h3>
                <p>
                  Rather than evaluating projects in isolation, every project is benchmarked against its statistical peer cohort (defined by <em>Work Category × District</em>).
                </p>
                <p>
                  The engine computes the median sanctioned rate and Median Absolute Deviation (MAD). Works exceeding <strong>1.45×</strong> of peer median or exhibiting Modified Z-scores &gt; 2.5 are flagged for verification against the District Schedule of Rates (DSR).
                </p>
              </div>
            )}

            {activeSection === 'delay' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F2933]">Physical vs Financial Progress Divergence</h3>
                <p>
                  A critical vulnerability in infrastructure projects is disbursement of public funds without commensurate ground execution.
                </p>
                <p>
                  The engine monitors the progress divergence: <code>Financial Progress % - Physical Progress %</code>. If this gap exceeds <strong>20%</strong> or if zero physical updates have been recorded for <strong>&gt;60 days</strong>, a Stagnation Alert is triggered.
                </p>
              </div>
            )}

            {activeSection === 'duplicates' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F2933]">Spatial & Semantic Duplicate Detection</h3>
                <p>
                  Works sanctioned within a <strong>150-meter spatial bubble</strong> are evaluated using Haversine geodesic proximity combined with TF-IDF character n-gram cosine similarity.
                </p>
                <p>
                  When spatial distance is &lt;100m and title/agency match is &gt;40%, the system flags the pair as candidate duplicate works for field auditors to inspect on-site before double disbursements occur.
                </p>
              </div>
            )}

            {activeSection === 'directives' && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#1F2933]">Statutory Field Verification Notices</h3>
                <p>
                  For any work in the Critical or High risk tier, district administrators can generate a standardized, legally formatted <strong>Field Verification Notice</strong> with one click.
                </p>
                <p>
                  The notice includes the exact mathematical justification, evidence checklist, and assigned Junior Engineer directive to upload geotagged photographic confirmation within 7 working days.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#E4E7EC] bg-[#F9FAFB] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="btn-primary text-xs py-1.5 px-4"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
