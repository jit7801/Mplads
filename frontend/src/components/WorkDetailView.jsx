import React, { useState, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import { 
  ArrowLeft, 
  Printer, 
  TrendingUp, 
  Clock, 
  Copy, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Building2, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { fetchWorkExplanation } from '../api/client';

export default function WorkDetailView({ workId, onBack, onOpenDuplicateDiff }) {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workId) return;
    setLoading(true);
    fetchWorkExplanation(workId)
      .then((data) => {
        setDossier(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [workId]);

  if (!workId) return null;

  const handlePrintNotice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !dossier) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Field Verification Order - ${dossier.work_id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 16px; font-weight: bold; text-transform: uppercase; }
          .sub { font-size: 13px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
          td { padding: 7px; border: 1px solid #ccc; font-size: 13px; }
          .label { font-weight: bold; width: 30%; background: #f9f9f9; }
          .section-title { font-size: 13px; font-weight: bold; margin-top: 18px; margin-bottom: 6px; text-decoration: underline; }
          .evidence-list { margin-left: 20px; font-size: 13px; }
          .directive { background: #fcf8e3; border: 1px solid #faebcc; padding: 10px; margin-top: 15px; font-size: 13px; font-weight: bold; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">OFFICE OF THE DISTRICT MAGISTRATE & NODAL OFFICER (MPLADS)</div>
          <div class="sub">District: ${dossier.district} | State: ${dossier.state}</div>
          <div class="sub">Statutory Project Field Verification & Audit Notice</div>
        </div>

        <p><strong>Order Ref:</strong> MPLADS/INQ/${dossier.district.toUpperCase()}/${new Date().getFullYear()}/${dossier.work_id}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>

        <table>
          <tr><td class="label">Work ID</td><td>${dossier.work_id}</td></tr>
          <tr><td class="label">Work Title</td><td>${dossier.work_title}</td></tr>
          <tr><td class="label">Work Category</td><td>${dossier.work_category}</td></tr>
          <tr><td class="label">Unified Risk Score</td><td><strong>${dossier.overall_risk_score} / 100 (${dossier.risk_level})</strong></td></tr>
          <tr><td class="label">Primary Signal</td><td>${dossier.primary_risk_factor}</td></tr>
        </table>

        <div class="section-title">EMPIRICAL GROUNDS FOR SPOT VERIFICATION:</div>
        <ul class="evidence-list">
          ${dossier.evidence_summary.map((e) => `<li>${e}</li>`).join('')}
        </ul>

        <div class="section-title">ORDERED ADMINISTRATIVE DIRECTIVE:</div>
        <div class="directive">
          ${dossier.recommended_action}
        </div>

        <p style="margin-top: 15px; font-size: 13px;">
          The designated Junior/Assistant Engineer is directed to conduct an on-site physical inspection, 
          record geotagged photographic proof of actual linear/spatial progress, and submit a compliance verification report within 7 working days.
        </p>

        <div class="signatures">
          <div><br><br>__________________________<br>Inspecting Officer</div>
          <div style="text-align: right;"><br><br>__________________________<br>District Magistrate / Collector<br>${dossier.district}</div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back Link */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#667085] hover:text-[#1F2933] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Risk Works</span>
        </button>
      </div>

      {loading ? (
        <div className="gov-card p-16 text-center text-[#667085]">
          <div className="inline-block w-6 h-6 border-2 border-[#183B56] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading work risk intelligence dossier...</p>
        </div>
      ) : error ? (
        <div className="gov-card p-8 text-center text-[#B85C5C]">
          <AlertCircle className="w-8 h-8 mx-auto mb-2" />
          <p className="text-xs font-medium">Error: {error}</p>
        </div>
      ) : dossier ? (
        <>
          {/* Main Top Header Card */}
          <div className="gov-card p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-[#667085]">
                    {dossier.work_id}
                  </span>
                  <span className="text-xs text-[#667085]">·</span>
                  <span className="text-xs text-[#667085]">
                    {dossier.work_category}
                  </span>
                </div>

                <h1 className="text-xl font-bold text-[#1F2933] leading-snug">
                  {dossier.work_title}
                </h1>

                <div className="flex items-center gap-3 text-xs text-[#667085] pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#98A2B3]" />
                    {dossier.district}, {dossier.state}
                  </span>
                </div>
              </div>

              {/* Risk Badge & Score */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-[#E4E7EC] pt-3 md:pt-0 md:pl-6 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-[#667085] block">Risk Score</span>
                  <div className="text-2xl font-bold text-[#1F2933]">
                    {dossier.overall_risk_score} <span className="text-xs font-normal text-[#667085]">/ 100</span>
                  </div>
                </div>
                <RiskBadge score={dossier.overall_risk_score} level={dossier.risk_level} size="lg" />
              </div>

            </div>
          </div>

          {/* Risk Summary Component Breakdown (Section 8) */}
          <div className="gov-card p-5">
            <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-3">
              Risk Score Components
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Financial Risk */}
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span className="truncate">Financial Risk</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#C8754D]" />
                </div>
                <div className="text-lg font-bold text-[#1F2933]">
                  {dossier.component_breakdown.financial_risk.score}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown.financial_risk.max}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${(dossier.component_breakdown.financial_risk.score / 30) * 100}%` }}
                    className="h-full bg-[#C8754D] rounded-full"
                  />
                </div>
              </div>

              {/* Delay Risk */}
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span className="truncate">Delay / Stagnation</span>
                  <Clock className="w-3.5 h-3.5 text-[#C49A4A]" />
                </div>
                <div className="text-lg font-bold text-[#1F2933]">
                  {dossier.component_breakdown.delay_risk.score}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown.delay_risk.max}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${(dossier.component_breakdown.delay_risk.score / 30) * 100}%` }}
                    className="h-full bg-[#C49A4A] rounded-full"
                  />
                </div>
              </div>

              {/* Duplicate Risk */}
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span className="truncate">Duplicate / Overlap</span>
                  <Copy className="w-3.5 h-3.5 text-[#2F6F8F]" />
                </div>
                <div className="text-lg font-bold text-[#1F2933]">
                  {dossier.component_breakdown.duplicate_risk.score}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown.duplicate_risk.max}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${(dossier.component_breakdown.duplicate_risk.score / 25) * 100}%` }}
                    className="h-full bg-[#2F6F8F] rounded-full"
                  />
                </div>
              </div>

              {/* Compliance Risk */}
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span className="truncate">Compliance Deficit</span>
                  <FileCheck className="w-3.5 h-3.5 text-[#B85C5C]" />
                </div>
                <div className="text-lg font-bold text-[#1F2933]">
                  {dossier.component_breakdown.compliance_risk.score}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown.compliance_risk.max}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${(dossier.component_breakdown.compliance_risk.score / 15) * 100}%` }}
                    className="h-full bg-[#B85C5C] rounded-full"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* "WHY WAS THIS FLAGGED?" Evidence Section (Section 9) */}
          <div className="gov-card p-5">
            <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <span>Why was this work flagged?</span>
            </h3>

            <div className="space-y-2">
              {dossier.evidence_summary.map((point, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-[#344054]">
                  <span className="text-[#183B56] font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial vs Physical Progress Comparison (Section 11) */}
          {dossier.delay_evaluation && (
            <div className="gov-card p-5">
              <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-3">
                Financial vs. Physical Progress
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#344054]">Financial Disbursement</span>
                      <strong className="text-[#183B56]">{dossier.delay_evaluation.financial_progress}%</strong>
                    </div>
                    <div className="w-full bg-[#E4E7EC] h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${dossier.delay_evaluation.financial_progress}%` }}
                        className="h-full bg-[#2F6F8F] rounded-full"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#344054]">Physical Completion</span>
                      <strong className="text-[#487A5E]">{dossier.delay_evaluation.physical_progress}%</strong>
                    </div>
                    <div className="w-full bg-[#E4E7EC] h-2.5 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${dossier.delay_evaluation.physical_progress}%` }}
                        className="h-full bg-[#5F8D73] rounded-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#F9FAFB] p-3.5 rounded-lg border border-[#EAECF0] text-xs space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-[#475467]">Progress Mismatch:</span>
                    <span className="text-[#B85C5C] font-mono">
                      {dossier.delay_evaluation.progress_gap} percentage points
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Days Without Progress Update:</span>
                    <span className="text-[#1F2933] font-mono">{dossier.delay_evaluation.days_dormant} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Days Past Scheduled Deadline:</span>
                    <span className="text-[#1F2933] font-mono">{dossier.delay_evaluation.days_overdue} days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Peer Cohort Cost Comparison (Section 12) */}
          {dossier.cohort_stats && (
            <div className="gov-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider">
                  Cost Anomaly Analysis
                </h3>
                <span className="text-xs text-[#667085]">
                  Compared against {dossier.cohort_stats.sample_size} works in {dossier.district}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3 text-center">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                  <span className="text-[11px] text-[#667085] block">This Work</span>
                  <div className="text-base font-bold text-[#1F2933] mt-0.5">
                    ₹{(dossier.cost_evaluation.work_cost / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                  <span className="text-[11px] text-[#667085] block">Peer Median</span>
                  <div className="text-base font-bold text-[#1F2933] mt-0.5">
                    ₹{(dossier.cohort_stats.median / 100000).toFixed(2)} Lakhs
                  </div>
                </div>
                <div className="p-3 bg-[#FEF9EE] rounded-lg border border-[#F9ECCB]">
                  <span className="text-[11px] text-[#B58532] block">Cost Difference</span>
                  <div className="text-base font-bold text-[#B58532] mt-0.5">
                    +{Math.round((dossier.cost_evaluation.cost_ratio - 1) * 100)}%
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#667085] leading-relaxed">
                {dossier.cost_evaluation.explanation}
              </p>
            </div>
          )}

          {/* Possible Duplicate Work Match (Section 14) */}
          {dossier.duplicate_match && (
            <div className="gov-card p-5 border-l-4 border-l-[#2F6F8F]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-1">
                    Possible Duplicate or Overlapping Work Detected
                  </h3>
                  <p className="text-xs text-[#667085]">
                    Found work located <strong>{dossier.duplicate_match.distance_meters}m</strong> away with 
                    <strong> {dossier.duplicate_match.text_similarity}%</strong> title similarity.
                  </p>
                  <div className="text-xs font-medium text-[#1F2933] mt-1">
                    Matched: {dossier.duplicate_match.paired_work.work_title} ({dossier.duplicate_match.paired_work_id})
                  </div>
                </div>

                <button
                  onClick={() => onOpenDuplicateDiff(dossier.work_id, dossier.duplicate_match.paired_work_id)}
                  className="btn-secondary whitespace-nowrap self-start sm:self-center"
                >
                  Investigate Side-by-Side
                </button>
              </div>
            </div>
          )}

          {/* Simple Project Timeline (Section 10) */}
          <div className="gov-card p-5">
            <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-4">
              Project Lifecycle Milestones
            </h3>

            <div className="flex items-center justify-between text-xs text-[#475467] overflow-x-auto pb-2">
              <div className="text-center min-w-[80px]">
                <div className="w-2 h-2 rounded-full bg-[#183B56] mx-auto mb-1.5" />
                <div className="font-semibold text-[#1F2933]">Recommended</div>
                <div className="text-[10px] text-[#667085]">{dossier.cost_evaluation?.work_cost ? 'Feb 2024' : '—'}</div>
              </div>
              <div className="flex-1 h-0.5 bg-[#E4E7EC] mx-2" />
              <div className="text-center min-w-[80px]">
                <div className="w-2 h-2 rounded-full bg-[#183B56] mx-auto mb-1.5" />
                <div className="font-semibold text-[#1F2933]">Sanctioned</div>
                <div className="text-[10px] text-[#667085]">Mar 2024</div>
              </div>
              <div className="flex-1 h-0.5 bg-[#E4E7EC] mx-2" />
              <div className="text-center min-w-[80px]">
                <div className="w-2 h-2 rounded-full bg-[#183B56] mx-auto mb-1.5" />
                <div className="font-semibold text-[#1F2933]">Started</div>
                <div className="text-[10px] text-[#667085]">Apr 2024</div>
              </div>
              <div className="flex-1 h-0.5 bg-[#E4E7EC] mx-2" />
              <div className="text-center min-w-[80px]">
                <div className="w-2 h-2 rounded-full bg-[#B85C5C] mx-auto mb-1.5" />
                <div className="font-semibold text-[#B85C5C]">Stalled / Dormant</div>
                <div className="text-[10px] text-[#667085]">{dossier.delay_evaluation?.days_dormant}d inactive</div>
              </div>
              <div className="flex-1 h-0.5 bg-[#E4E7EC] mx-2" />
              <div className="text-center min-w-[80px]">
                <div className="w-2 h-2 rounded-full bg-[#D0D5DD] mx-auto mb-1.5" />
                <div className="font-semibold text-[#667085]">Completed</div>
                <div className="text-[10px] text-[#667085]">Pending Verification</div>
              </div>
            </div>
          </div>

          {/* Recommended Action & Notice Export (Section 10) */}
          <div className="gov-card p-5 bg-[#F9FAFB] border-[#D0D5DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-[#183B56] uppercase tracking-wider block mb-1">
                Recommended Action
              </span>
              <p className="text-xs text-[#344054] leading-relaxed">
                {dossier.recommended_action}
              </p>
            </div>

            <button
              onClick={handlePrintNotice}
              className="btn-primary flex items-center gap-2 whitespace-nowrap self-start sm:self-center"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Field Verification Notice</span>
            </button>
          </div>

        </>
      ) : null}

    </div>
  );
}
