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
  Map,
  ClipboardCheck
} from 'lucide-react';
import { fetchWorkExplanation, fetchProjectVerifications } from '../api/client';
import { getLocalVerificationsForProject } from '../services/db';
import { useToast } from './Toast';

export default function WorkDetailView({ 
  workId, 
  onBack, 
  onOpenDuplicateDiff,
  onViewOnMap,
  onOpenFieldVerification
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
  const [verifications, setVerifications] = useState([]);

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

    // Fetch verification audit history
    fetchProjectVerifications(workId)
      .then((data) => setVerifications(data.verifications || []))
      .catch(() => {
        getLocalVerificationsForProject(workId)
          .then((local) => setVerifications(local || []))
          .catch(() => setVerifications([]));
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4B3C32] hover:text-[#050505] transition-colors py-2 px-3 rounded-xl hover:bg-[#F7F7F1] self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Risk Works Registry</span>
        </button>

        {dossier && (
          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={handlePrintNotice}
              className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded-xl hover:bg-[#F7F7F1]"
              title="Print formal statutory inspection notice"
            >
              <Printer className="w-3.5 h-3.5 text-[#AA896C]" />
              <span>Print Notice</span>
            </button>

            {onViewOnMap && (
              <button
                onClick={() => onViewOnMap(dossier.work_id)}
                className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded-xl hover:bg-[#F7F7F1]"
                title="View on Risk Map"
              >
                <Map className="w-3.5 h-3.5 text-[#AA896C]" />
                <span>Map</span>
              </button>
            )}

            <button
              onClick={() => setIsActionModalOpen(true)}
              className="btn-primary flex items-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded-xl"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Take Administrative Action</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="gov-card rounded-2xl p-16 text-center text-[#5E5E5D] border border-[#E8E4DC]">
          <div className="inline-block w-6 h-6 border-2 border-[#4B3C32] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-medium">Loading work risk intelligence dossier...</p>
        </div>
      ) : error ? (
        <div className="gov-card rounded-2xl p-8 text-center text-[#C94C4C] border border-[#FADCDA]">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-[#C94C4C]" />
          <p className="text-xs font-medium">Error: {error}</p>
        </div>
      ) : dossier ? (
        <>
          {/* Main Top Header Card */}
          <div className="gov-card rounded-2xl p-5 sm:p-6 border border-[#E8E4DC] shadow-xs bg-white">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
              
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#4B3C32] bg-[#F2F0EB] px-2.5 py-0.5 rounded-lg border border-[#E8E4DC]">
                    {dossier.work_id}
                  </span>
                  <span className="text-xs text-[#C8BFB3]">·</span>
                  <span className="text-xs font-medium text-[#5E5E5D]">
                    {dossier.work_category}
                  </span>
                  <span className="text-xs text-[#C8BFB3]">·</span>
                  <span className="text-xs font-medium text-[#5E5E5D]">
                    Status: <strong className="text-[#050505]">{dossier.status || 'IN_PROGRESS'}</strong>
                  </span>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-[#050505] leading-snug tracking-tight">
                  {dossier.work_title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-xs text-[#5E5E5D] pt-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#AA896C]" />
                    {dossier.village || dossier.ward ? `${dossier.village || dossier.ward}, ` : ''}{dossier.district}, {dossier.state}
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-[#AA896C]" />
                    Agency: {dossier.implementing_agency || 'District Rural Development Agency'}
                  </span>
                </div>

                {(dossier.mp_name || dossier.constituency || dossier.block || dossier.house) && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 mt-1.5 border-t border-[#F2EFEB] text-xs">
                    {dossier.mp_name && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">MP Name:</span>
                        <strong className="text-[#050505]">{dossier.mp_name}</strong>
                      </div>
                    )}
                    {dossier.constituency && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">Constituency:</span>
                        <strong className="text-[#050505]">{dossier.constituency}</strong>
                      </div>
                    )}
                    {dossier.block && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">Block:</span>
                        <strong className="text-[#050505]">{dossier.block}</strong>
                      </div>
                    )}
                    {dossier.village && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">Village:</span>
                        <strong className="text-[#050505]">{dossier.village}</strong>
                      </div>
                    )}
                    {dossier.sanctioned_amount != null && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">Allocation Amount:</span>
                        <strong className="text-[#050505]">₹{Number(dossier.sanctioned_amount).toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                    {dossier.house && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">House:</span>
                        <strong className="text-[#050505]">{dossier.house}</strong>
                      </div>
                    )}
                    {dossier.ida_approval && (
                      <div>
                        <span className="text-[#8E8D8A] block text-[10px]">IDA Approval:</span>
                        <strong className="text-[#050505]">{dossier.ida_approval}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Risk Badge & Score */}
              <div className="flex md:flex-col items-end justify-between md:justify-center gap-2.5 border-t md:border-t-0 md:border-l border-[#E8E4DC] pt-3 md:pt-0 md:pl-6 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[11px] text-[#8E8D8A] block">Unified Risk Score</span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#050505] tracking-tight">
                    {dossier.overall_risk_score} <span className="text-xs font-normal text-[#8E8D8A]">/ 100</span>
                  </div>
                </div>
                <RiskBadge score={dossier.overall_risk_score} level={dossier.risk_level} size="lg" />
              </div>

            </div>
          </div>

          {/* Risk Summary Component Breakdown */}
          <div className="gov-card rounded-2xl p-5 sm:p-6 border border-[#E8E4DC] shadow-xs bg-white">
            <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider mb-3.5">
              Explainable Risk Components (4-Pillar Model)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              {/* Financial Risk */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC]">
                <div className="flex items-center justify-between text-xs text-[#5E5E5D] mb-1">
                  <span className="truncate">Financial / Cost</span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#AA896C]" />
                </div>
                <div className="text-lg font-bold text-[#050505]">
                  {dossier.component_breakdown?.financial_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#8E8D8A]"> / {dossier.component_breakdown?.financial_risk?.max ?? 30}</span>
                </div>
                <div className="w-full bg-[#E8E4DC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.financial_risk?.score ?? 0) / 30) * 100}%` }}
                    className="h-full bg-[#AA896C] rounded-full"
                  />
                </div>
              </div>

              {/* Delay Risk */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC]">
                <div className="flex items-center justify-between text-xs text-[#5E5E5D] mb-1">
                  <span className="truncate">Delay / Stagnation</span>
                  <Clock className="w-3.5 h-3.5 text-[#E6A23C]" />
                </div>
                <div className="text-lg font-bold text-[#050505]">
                  {dossier.component_breakdown?.delay_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#8E8D8A]"> / {dossier.component_breakdown?.delay_risk?.max ?? 30}</span>
                </div>
                <div className="w-full bg-[#E8E4DC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.delay_risk?.score ?? 0) / 30) * 100}%` }}
                    className="h-full bg-[#E6A23C] rounded-full"
                  />
                </div>
              </div>

              {/* Duplicate Risk */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC]">
                <div className="flex items-center justify-between text-xs text-[#5E5E5D] mb-1">
                  <span className="truncate">Duplicate / Overlap</span>
                  <Copy className="w-3.5 h-3.5 text-[#916540]" />
                </div>
                <div className="text-lg font-bold text-[#050505]">
                  {dossier.component_breakdown?.duplicate_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#8E8D8A]"> / {dossier.component_breakdown?.duplicate_risk?.max ?? 25}</span>
                </div>
                <div className="w-full bg-[#E8E4DC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.duplicate_risk?.score ?? 0) / 25) * 100}%` }}
                    className="h-full bg-[#916540] rounded-full"
                  />
                </div>
              </div>

              {/* Compliance Risk */}
              <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC]">
                <div className="flex items-center justify-between text-xs text-[#5E5E5D] mb-1">
                  <span className="truncate">Compliance Deficit</span>
                  <FileCheck className="w-3.5 h-3.5 text-[#C94C4C]" />
                </div>
                <div className="text-lg font-bold text-[#050505]">
                  {dossier.component_breakdown?.compliance_risk?.score ?? 0}
                  <span className="text-xs font-normal text-[#8E8D8A]"> / {dossier.component_breakdown?.compliance_risk?.max ?? 15}</span>
                </div>
                <div className="w-full bg-[#E8E4DC] h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${((dossier.component_breakdown?.compliance_risk?.score ?? 0) / 15) * 100}%` }}
                    className="h-full bg-[#C94C4C] rounded-full"
                  />
                </div>
              </div>

            </div>
          </div>
          {/* Evidence Checklist & Ground Justifications */}
          <div className="gov-card rounded-2xl p-5 sm:p-6 space-y-3.5 border border-[#E8E4DC] shadow-xs bg-white">
            <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
              Empirical Evidence Checklist
            </h3>

            <div className="space-y-2.5">
              {(dossier.evidence_summary || []).map((evidence, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FDF4F4] border border-[#FADCDA] flex items-start gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-[#C94C4C] shrink-0 mt-0.5" />
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
            <div className="gov-card rounded-2xl p-5 sm:p-6 space-y-4 border border-[#E8E4DC] shadow-xs bg-white">
              <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
                Progress Divergence Analysis
              </h3>

              <div className="space-y-3.5">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#5E5E5D]">Financial Expenditure Disbursed</span>
                    <strong className="text-[#050505] font-semibold">{dossier.financial_progress}% (₹{((dossier.actual_expenditure || 0) / 100000).toFixed(2)}L)</strong>
                  </div>
                  <div className="w-full bg-[#E8E4DC] h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${dossier.financial_progress}%` }} className="h-full bg-[#AA896C] rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#5E5E5D]">Physically Built Assets</span>
                    <strong className="text-[#050505] font-semibold">{dossier.physical_progress}%</strong>
                  </div>
                  <div className="w-full bg-[#E8E4DC] h-2 rounded-full overflow-hidden">
                    <div style={{ width: `${dossier.physical_progress}%` }} className="h-full bg-[#2E8B57] rounded-full" />
                  </div>
                </div>

                {dossier.financial_progress > dossier.physical_progress && (
                  <div className="p-3 rounded-xl bg-[#FEF8ED] border border-[#F8E5C4] text-xs text-[#7A4D05] flex items-center justify-between">
                    <span>Progress Mismatch Divergence:</span>
                    <strong className="text-[#B87D28] font-mono">
                      +{dossier.financial_progress - dossier.physical_progress} percentage points
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Cost Anomaly vs Peer Cohort */}
            <div className="gov-card rounded-2xl p-5 sm:p-6 space-y-4 border border-[#E8E4DC] shadow-xs bg-white">
              <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
                Peer Cost Baselining (DSR Comparison)
              </h3>

              <div className="space-y-3.5">
                <div className="flex justify-between text-xs border-b border-[#F2EFEB] pb-2.5">
                  <span className="text-[#5E5E5D]">This Work's Sanctioned Cost:</span>
                  <strong className="text-[#050505] font-semibold">₹{((dossier.sanctioned_amount || 0) / 100000).toFixed(2)} Lakhs</strong>
                </div>

                <div className="flex justify-between text-xs border-b border-[#F2EFEB] pb-2.5">
                  <span className="text-[#5E5E5D]">Peer Cohort Median Rate:</span>
                  <strong className="text-[#050505] font-semibold">
                    ₹{((dossier.cost_evaluation?.cohort_median || dossier.sanctioned_amount) / 100000).toFixed(2)} Lakhs
                  </strong>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E8E4DC] text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#5E5E5D]">Variance vs Peer Median:</span>
                    <strong className="text-[#C94C4C]">
                      {dossier.cost_evaluation?.cost_ratio ? `+${Math.round((dossier.cost_evaluation.cost_ratio - 1) * 100)}%` : 'Standard'}
                    </strong>
                  </div>
                  <p className="text-[11px] text-[#8E8D8A]">
                    Peer cohort: {dossier.work_category} projects in {dossier.district}
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* Statutory Administrative Directive */}
          <div className="gov-card rounded-2xl p-5 sm:p-6 border-l-4 border-l-[#4B3C32] border border-[#E8E4DC] shadow-xs space-y-3.5 bg-white">
            <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
              Statutory Administrative Directive
            </h3>
            <p className="text-xs text-[#050505] font-medium leading-relaxed bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E8E4DC]">
              {dossier.recommended_action}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={handlePrintNotice}
                className="btn-secondary text-xs rounded-xl flex items-center gap-1.5 hover:bg-[#F7F7F1]"
              >
                <Printer className="w-3.5 h-3.5 text-[#AA896C]" />
                <span>Export Field Verification Notice</span>
              </button>

              <button
                onClick={() => onOpenFieldVerification && onOpenFieldVerification(dossier.work_id)}
                className="btn-primary text-xs rounded-xl flex items-center gap-1.5 bg-[#2E8B57] hover:bg-[#257247]"
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Conduct Field Verification</span>
              </button>

              <button
                onClick={() => setIsActionModalOpen(true)}
                className="btn-secondary text-xs rounded-xl flex items-center gap-1.5 hover:bg-[#F7F7F1]"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#AA896C]" />
                <span>Record Inspection Determination</span>
              </button>
            </div>
          </div>

          {/* Field Verification Audit History Section */}
          <div className="gov-card rounded-2xl p-5 sm:p-6 space-y-3.5 border border-[#E8E4DC] shadow-xs bg-white">
            <div className="flex items-center justify-between border-b border-[#F2EFEB] pb-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#4B3C32]" />
                <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
                  Field Verification History ({verifications.length})
                </h3>
              </div>
              <button
                onClick={() => onOpenFieldVerification && onOpenFieldVerification(dossier.work_id)}
                className="text-xs font-semibold text-[#4B3C32] hover:underline"
              >
                + New Spot Inspection
              </button>
            </div>

            {verifications.length === 0 ? (
              <p className="text-xs text-[#5E5E5D] py-2">
                No offline or online spot verification recorded yet. Use the button above to record ground progress.
              </p>
            ) : (
              <div className="space-y-2.5 pt-1">
                {verifications.map((v, i) => (
                  <div
                    key={v.verification_id || v.operation_id || i}
                    className="p-3.5 rounded-xl border border-[#E8E4DC] bg-[#FAF9F5] text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#050505]">
                          {new Date(v.verified_at || v.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF7F2] text-[#2E8B57] border border-[#D1E8DC]">
                          Verified: {v.progress}%
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#EEF7F2] text-[#2E8B57] border border-[#D1E8DC]">
                        {v.sync_status || 'Synced'}
                      </span>
                    </div>

                    <div className="text-[#5E5E5D] text-[11px]">
                      <strong>Status:</strong> {v.verification_status} · <strong>Officer:</strong> {v.user_id}
                    </div>

                    {v.remarks && (
                      <p className="text-[11px] text-[#050505] italic bg-white p-2.5 rounded-lg border border-[#E8E4DC]">
                        "{v.remarks}"
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-[#8E8D8A]">
                      <span>Location: {v.latitude && v.longitude ? `${v.latitude}, ${v.longitude}` : 'Manual Entry'}</span>
                      <span>Ref: {v.verification_id || v.operation_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Action Determination Modal */}
      {isActionModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4"
          onClick={() => setIsActionModalOpen(false)}
        >
          <div 
            className="bg-white border border-[#E8E4DC] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#E8E4DC] bg-[#FAF9F5]">
              <div>
                <h3 className="text-sm font-bold text-[#050505] tracking-tight">
                  Record Field Verification Action
                </h3>
                <p className="text-[11px] text-[#5E5E5D] mt-0.5">
                  Work ID: {dossier?.work_id} · {dossier?.district}
                </p>
              </div>
              <button
                onClick={() => setIsActionModalOpen(false)}
                className="p-1.5 rounded-lg text-[#5E5E5D] hover:text-[#050505] hover:bg-[#F2F0EB] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordAction} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#050505] mb-1.5">
                  Administrative Directive Type
                </label>
                <select
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value)}
                  className="w-full bg-[#F7F7F1] hover:bg-[#F2F0EB] text-xs text-[#050505] px-3.5 py-2.5 rounded-xl border border-[#D8D2C7] focus:outline-none focus:border-[#4B3C32] focus:bg-white cursor-pointer transition-colors"
                >
                  <option value="SCHEDULE_INSPECTION">Order Physical Spot Inspection by Assistant Engineer (7 Days)</option>
                  <option value="WITHHOLD_DISBURSEMENT">Withhold Interim Fund Tranche Pending Measurement Book Audit</option>
                  <option value="REQUEST_DSR_JUSTIFICATION">Demand Technical Justification from Implementing Agency for Cost Outlier</option>
                  <option value="CLOSE_DUPLICATE">Verify Co-located Duplicate Asset and Initiate Recovery Notice</option>
                  <option value="APPROVE_CLEARED">Mark Satisfactorily Verified & Clear Risk Flag</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#050505] mb-1.5">
                  Nodal Authority Audit Notes / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter specific instructions for the inspecting officer or executive engineer..."
                  value={inspectorNotes}
                  onChange={(e) => setInspectorNotes(e.target.value)}
                  className="w-full bg-[#F7F7F1] text-xs text-[#050505] p-3.5 rounded-xl border border-[#D8D2C7] focus:outline-none focus:border-[#4B3C32] focus:bg-white transition-colors"
                />
              </div>

              <div className="pt-3 border-t border-[#F2EFEB] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsActionModalOpen(false)}
                  className="btn-secondary text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingAction}
                  className="btn-primary text-xs rounded-xl flex items-center gap-1.5"
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
