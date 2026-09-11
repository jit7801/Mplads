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
  ChevronRight,
  ShieldAlert,
  Send,
  Check,
  X,
  Map
} from 'lucide-react';
import { fetchWorkExplanation } from '../api/client';
import { useToast } from './Toast';

export default function WorkDetailView({ 
  workId, 
  onBack, 
  onOpenDuplicateDiff,
  onViewOnMap 
}) {
  const { addToast } = useToast();
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Interactive Verification Form State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [selectedAction, setSelectedAction] = useState('SCHEDULE_INSPECTION');
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

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
        <title>Field Verification Directive - ${dossier.work_id}</title>
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
          ${(dossier.evidence_summary || []).map((e) => `<li>${e}</li>`).join('')}
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

  const handleRecordAction = (e) => {
    e.preventDefault();
    setIsSubmittingAction(true);
    setTimeout(() => {
      setIsSubmittingAction(false);
      setIsActionModalOpen(false);
      addToast(`Administrative determination recorded for ${dossier.work_id}.`, 'success');
      setInspectorNotes('');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Back Link & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#183B56] hover:text-[#112A3E] transition-colors py-1.5 px-2.5 rounded-md hover:bg-[#F2F4F7] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risk Works Registry</span>
        </button>

        {dossier && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrintNotice}
              className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-medium"
              title="Print formal statutory inspection notice"
            >
              <Printer className="w-3.5 h-3.5 text-[#667085]" />
              <span>Print Notice</span>
            </button>

            {onViewOnMap && (
              <button
                onClick={() => onViewOnMap(dossier.work_id)}
                className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-medium"
                title="View on Risk Map"
              >
                <Map className="w-3.5 h-3.5 text-[#667085]" />
                <span>Map</span>
              </button>
            )}

            <button
              onClick={() => setIsActionModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 py-1.5 text-xs font-medium"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Take Administrative Action</span>
            </button>
          </div>
        )}
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
          <div className="gov-card p-5 sm:p-6">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              
              <div className="space-y-2 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#183B56] bg-[#F2F4F7] px-2 py-0.5 rounded border border-[#E4E7EC]">
                    {dossier.work_id}
                  </span>
                  <span className="text-xs text-[#667085]">·</span>
                  <span className="text-xs font-medium text-[#475467]">
                    {dossier.work_category}
                  </span>
                  <span className="text-xs text-[#667085]">·</span>
                  <span className="text-xs font-medium text-[#475467]">
                    Status: <strong className="text-[#1F2933]">{dossier.status || 'IN_PROGRESS'}</strong>
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-[#1F2933] leading-snug">
                  {dossier.work_title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] pt-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#98A2B3]" />
                    {dossier.village || dossier.ward ? `${dossier.village || dossier.ward}, ` : ''}{dossier.district}, {dossier.state}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#98A2B3]" />
                    Agency: {dossier.implementing_agency || 'District Rural Development Agency'}
                  </span>
                </div>
              </div>

              {/* Risk Badge & Score */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-[#E4E7EC] pt-3 md:pt-0 md:pl-6 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-[#667085] block">Unified Risk Score</span>
                  <div className="text-2xl font-bold text-[#1F2933]">
                    {dossier.overall_risk_score} <span className="text-xs font-normal text-[#667085]">/ 100</span>
                  </div>
                </div>
                <RiskBadge score={dossier.overall_risk_score} level={dossier.risk_level} size="lg" />
              </div>

            </div>
          </div>

          {/* Risk Summary Component Breakdown */}
          <div className="gov-card p-4 sm:p-5">
            <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider mb-3">
              Explainable Risk Components (4-Pillar Model)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Financial Risk */}
              <div className="p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0]">
                <div className="flex items-center justify-between text-xs text-[#667085] mb-1">
                  <span className="truncate">Financial / Cost</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#C8754D]" />
                </div>
                <div className="text-lg font-bold text-[#1F2933]">
                  {dossier.component_breakdown?.financial_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown?.financial_risk?.max ?? 30}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.financial_risk?.score ?? 0) / 30) * 100}%` }}
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
                  {dossier.component_breakdown?.delay_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown?.delay_risk?.max ?? 30}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.delay_risk?.score ?? 0) / 30) * 100}%` }}
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
                  {dossier.component_breakdown?.duplicate_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown?.duplicate_risk?.max ?? 25}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.duplicate_risk?.score ?? 0) / 25) * 100}%` }}
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
                  {dossier.component_breakdown?.compliance_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#667085]"> / {dossier.component_breakdown?.compliance_risk?.max ?? 15}</span>
                </div>
                <div className="w-full bg-[#E4E7EC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.compliance_risk?.score ?? 0) / 15) * 100}%` }}
                    className="h-full bg-[#B85C5C] rounded-full"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Evidence Checklist & Ground Justifications */}
          <div className="gov-card p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
              Empirical Evidence Checklist
            </h3>

            <div className="space-y-2">
              {(dossier.evidence_summary || []).map((evidence, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg bg-[#FDF2F2] border border-[#F8D7DA] flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-[#B85C5C] shrink-0 mt-0.5" />
                  <span className="text-xs text-[#7A271A] font-medium leading-relaxed">
                    {evidence}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Financial & Physical Progress Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Financial vs Physical Progress Divergence */}
            <div className="gov-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
                Progress Divergence Analysis
              </h3>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#667085]">Financial Expenditure Disbursed</span>
                    <strong className="text-[#1F2933]">{dossier.financial_progress}% (₹{((dossier.actual_expenditure || 0) / 100000).toFixed(2)}L)</strong>
                  </div>
                  <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${dossier.financial_progress}%` }} className="h-full bg-[#C8754D]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#667085]">Physically Built Assets</span>
                    <strong className="text-[#1F2933]">{dossier.physical_progress}%</strong>
                  </div>
                  <div className="w-full bg-[#E4E7EC] h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${dossier.physical_progress}%` }} className="h-full bg-[#487A5E]" />
                  </div>
                </div>

                {dossier.financial_progress > dossier.physical_progress && (
                  <div className="p-2.5 rounded bg-[#FEF9EE] border border-[#F9ECCB] text-xs text-[#7A4D05] flex items-center justify-between">
                    <span>Progress Mismatch Divergence:</span>
                    <strong className="text-[#B58532] font-mono">
                      +{dossier.financial_progress - dossier.physical_progress} percentage points
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Anomaly vs Peer Cohort */}
            <div className="gov-card p-5 space-y-4">
              <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
                Peer Cost Baselining (DSR Comparison)
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between text-xs border-b border-[#EAECF0] pb-2">
                  <span className="text-[#667085]">This Work's Sanctioned Cost:</span>
                  <strong className="text-[#1F2933]">₹{((dossier.sanctioned_amount || 0) / 100000).toFixed(2)} Lakhs</strong>
                </div>

                <div className="flex justify-between text-xs border-b border-[#EAECF0] pb-2">
                  <span className="text-[#667085]">Peer Cohort Median Rate:</span>
                  <strong className="text-[#1F2933]">
                    ₹{((dossier.cost_evaluation?.cohort_median || dossier.sanctioned_amount) / 100000).toFixed(2)} Lakhs
                  </strong>
                </div>

                <div className="p-2.5 rounded bg-[#F9FAFB] border border-[#EAECF0] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Variance vs Peer Median:</span>
                    <strong className="text-[#B85C5C]">
                      {dossier.cost_evaluation?.cost_ratio ? `+${Math.round((dossier.cost_evaluation.cost_ratio - 1) * 100)}%` : 'Standard'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-[#667085]">
                    Peer cohort: {dossier.work_category} projects in {dossier.district}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Statutory Administrative Directive */}
          <div className="gov-card p-5 border-l-4 border-l-[#183B56] space-y-3">
            <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
              Statutory Administrative Directive
            </h3>
            <p className="text-xs text-[#1F2933] font-medium leading-relaxed bg-[#F9FAFB] p-3 rounded-lg border border-[#EAECF0]">
              {dossier.recommended_action}
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={handlePrintNotice}
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-[#667085]" />
                <span>Export Field Verification Notice</span>
              </button>

              <button
                onClick={() => setIsActionModalOpen(true)}
                className="btn-primary text-xs flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Record Inspection Determination</span>
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Action Determination Modal */}
      {isActionModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4"
          onClick={() => setIsActionModalOpen(false)}
        >
          <div 
            className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <div>
                <h3 className="text-sm font-bold text-[#1F2933]">
                  Record Field Verification Action
                </h3>
                <p className="text-[11px] text-[#667085]">
                  Work ID: {dossier?.work_id} · {dossier?.district}
                </p>
              </div>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="p-1 rounded text-[#667085] hover:text-[#1F2933]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordAction} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#1F2933] mb-1.5">
                  Administrative Directive Type
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] px-3 py-2 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
                >
                  <option value="SCHEDULE_INSPECTION">Order Physical Spot Inspection by Assistant Engineer (7 Days)</option>
                  <option value="WITHHOLD_DISBURSEMENT">Withhold Interim Fund Tranche Pending Measurement Book Audit</option>
                  <option value="REQUEST_DSR_JUSTIFICATION">Demand Technical Justification from Implementing Agency for Cost Outlier</option>
                  <option value="CLOSE_DUPLICATE">Verify Co-located Duplicate Asset and Initiate Recovery Notice</option>
                  <option value="APPROVE_CLEARED">Mark Satisfactorily Verified & Clear Risk Flag</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#1F2933] mb-1.5">
                  Nodal Authority Audit Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific instructions for the inspecting officer or executive engineer..."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="w-full bg-[#F9FAFB] text-xs text-[#1F2933] p-3 rounded-md border border-[#D0D5DD] focus:outline-none focus:border-[#183B56]"
                />
              </div>

              <div className="pt-2 border-t border-[#EAECF0] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingAction ? 'Recording...' : 'Issue Statutory Order'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
