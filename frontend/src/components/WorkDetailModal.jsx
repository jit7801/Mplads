import React, { useState, useEffect } from 'react';
import { X, AlertOctagon, TrendingUp, Clock, Copy, FileCheck, MapPin, Printer, ShieldAlert, CheckCircle2, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { fetchWorkExplanation } from '../api/client';

export default function WorkDetailModal({ workId, onClose, onOpenDuplicateDiff }) {
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
    const printWindow = window.open("", "_blank");
    if (!printWindow || !dossier) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Field Verification Notice - ${dossier.work_id}</title>
        <style>
          body { font-family: 'Times New Roman', serif; margin: 40px; color: #111; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .title { font-size: 18px; font-weight: bold; text-transform: uppercase; }
          .sub { font-size: 13px; color: #444; }
          .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .meta-table td { padding: 6px; border: 1px solid #ccc; font-size: 13px; }
          .label { font-weight: bold; width: 30%; background: #f5f5f5; }
          .section-title { font-size: 14px; font-weight: bold; margin-top: 20px; margin-bottom: 8px; text-decoration: underline; }
          .evidence-list { margin-left: 20px; font-size: 13px; }
          .evidence-list li { margin-bottom: 6px; }
          .directive { background: #fff8e1; border: 1px solid #ffe082; padding: 12px; margin-top: 20px; font-size: 13px; font-weight: bold; }
          .signature-block { margin-top: 60px; display: flex; justify-content: space-between; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">OFFICE OF THE DISTRICT MAGISTRATE / DISTRICT COLLECTOR</div>
          <div class="sub">District: ${dossier.district} | State: ${dossier.state}</div>
          <div class="sub">MPLADS Project Verification Order & Statutory Inquiry</div>
        </div>

        <p><strong>Memo No:</strong> MPLADS/VERIF/${dossier.district.toUpperCase()}/${new Date().getFullYear()}/${dossier.work_id}</p>
        <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>

        <table class="meta-table">
          <tr><td class="label">Work ID</td><td>${dossier.work_id}</td></tr>
          <tr><td class="label">Project Title</td><td>${dossier.work_title}</td></tr>
          <tr><td class="label">Category</td><td>${dossier.work_category}</td></tr>
          <tr><td class="label">Unified Risk Score</td><td><strong>${dossier.overall_risk_score} / 100 (${dossier.risk_level})</strong></td></tr>
          <tr><td class="label">Primary Risk Factor</td><td>${dossier.primary_risk_factor}</td></tr>
        </table>

        <div class="section-title">EMPIRICAL REASONS FOR ADMINISTRATIVE SCRUTINY:</div>
        <ul class="evidence-list">
          ${dossier.evidence_summary.map((e) => `<li>${e}</li>`).join('')}
        </ul>

        <div class="section-title">ORDERED ADMINISTRATIVE DIRECTIVE:</div>
        <div class="directive">
          ${dossier.recommended_action}
        </div>

        <p style="margin-top: 20px; font-size: 13px;">
          The designated Assistant / Junior Engineer is hereby instructed to carry out an immediate spot inspection, 
          record geotagged photographic evidence of the actual linear/physical milestones, and submit a compliance verification 
          report within 7 working days.
        </p>

        <div class="signature-block">
          <div><br><br>__________________________<br>Signature of Inspecting Officer</div>
          <div style="text-align: right;"><br><br>__________________________<br>District Magistrate / Nodal Officer<br>${dossier.district}</div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative my-8">
        
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-medium">Synthesizing forensic risk dossier...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">
            <AlertOctagon className="w-10 h-10 mx-auto mb-2 text-red-400" />
            <p className="text-sm font-medium">Error: {error}</p>
          </div>
        ) : dossier ? (
          <div className="p-6 md:p-8 space-y-6">
            
            {/* Header section */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-blue-400 border border-slate-700 rounded">
                  {dossier.work_id}
                </span>
                <span className="text-xs text-slate-400">
                  {dossier.district}, {dossier.state} • {dossier.work_category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {dossier.work_title}
              </h2>
            </div>

            {/* Top Risk Score & Component Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* URS Score Dial Card */}
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Unified Risk Score (URS)
                </span>
                <div className="relative flex items-center justify-center my-1">
                  <div className={`w-24 h-24 rounded-full border-4 flex flex-col items-center justify-center ${
                    dossier.overall_risk_score >= 80
                      ? "border-red-500 text-red-400 bg-red-500/10 pulse-critical"
                      : dossier.overall_risk_score >= 60
                      ? "border-orange-500 text-orange-400 bg-orange-500/10"
                      : "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                  }`}>
                    <span className="text-3xl font-extrabold tracking-tight">{dossier.overall_risk_score}</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider">{dossier.risk_level}</span>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400 mt-2">
                  Primary: <strong className="text-slate-200">{dossier.primary_risk_factor}</strong>
                </span>
              </div>

              {/* Component Gauges */}
              <div className="md:col-span-2 p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Component Score Breakdown
                </span>

                {/* Financial Risk */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Financial & Cost Anomaly
                    </span>
                    <span className="font-mono font-bold text-amber-400">
                      {dossier.component_breakdown.financial_risk.score} / {dossier.component_breakdown.financial_risk.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(dossier.component_breakdown.financial_risk.score / 30) * 100}%` }}
                      className="h-full bg-amber-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Delay & Stagnation */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-orange-400" /> Delay & Progress Disparity
                    </span>
                    <span className="font-mono font-bold text-orange-400">
                      {dossier.component_breakdown.delay_risk.score} / {dossier.component_breakdown.delay_risk.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(dossier.component_breakdown.delay_risk.score / 30) * 100}%` }}
                      className="h-full bg-orange-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Duplicate Overlap */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <Copy className="w-3.5 h-3.5 text-purple-400" /> Candidate Duplicate / Overlap
                    </span>
                    <span className="font-mono font-bold text-purple-400">
                      {dossier.component_breakdown.duplicate_risk.score} / {dossier.component_breakdown.duplicate_risk.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(dossier.component_breakdown.duplicate_risk.score / 25) * 100}%` }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </div>
                </div>

                {/* Compliance Deficit */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-rose-400" /> Statutory Compliance & Certificates
                    </span>
                    <span className="font-mono font-bold text-rose-400">
                      {dossier.component_breakdown.compliance_risk.score} / {dossier.component_breakdown.compliance_risk.max}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${(dossier.component_breakdown.compliance_risk.score / 15) * 100}%` }}
                      className="h-full bg-rose-500 rounded-full"
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* "WHY WAS THIS FLAGGED?" Evidence Callout */}
            <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <h4 className="text-sm font-bold text-white uppercase tracking-wide">
                  Empirical Evidence: Why Was This Work Flagged?
                </h4>
              </div>
              <ul className="space-y-2">
                {dossier.evidence_summary.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Financial vs Physical Divergence Visualizer */}
            {dossier.delay_evaluation && (
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">
                  Progress Disparity Analysis
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Verified Physical Progress</span>
                        <span className="font-mono text-emerald-400 font-bold">{dossier.delay_evaluation.physical_progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${dossier.delay_evaluation.physical_progress}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">Financial Disbursement</span>
                        <span className="font-mono text-blue-400 font-bold">{dossier.delay_evaluation.financial_progress}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${dossier.delay_evaluation.financial_progress}%` }}
                          className="h-full bg-blue-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/60 p-3.5 rounded-lg border border-slate-700/60 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Mismatch Gap:</span>
                      <strong className="text-red-400 font-mono">+{dossier.delay_evaluation.progress_gap}%</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Days Since Last Update:</span>
                      <span className="text-slate-200 font-mono">{dossier.delay_evaluation.days_dormant} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Days Past Scheduled Deadline:</span>
                      <span className="text-slate-200 font-mono">{dossier.delay_evaluation.days_overdue} days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Peer Cohort Cost Distribution Chart */}
            {dossier.cohort_stats && (
              <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Peer Cohort Cost Comparison
                    </span>
                    <p className="text-xs text-slate-400">
                      Evaluated against {dossier.cohort_stats.sample_size} comparable works in {dossier.district}
                    </p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <span className="text-slate-400">Cohort Median: </span>
                    <strong className="text-slate-200">₹{(dossier.cohort_stats.median / 100000).toFixed(2)}L</strong>
                  </div>
                </div>

                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Min", cost: dossier.cohort_stats.min / 100000 },
                        { name: "25th %ile", cost: dossier.cohort_stats.q25 / 100000 },
                        { name: "Median", cost: dossier.cohort_stats.median / 100000 },
                        { name: "75th %ile", cost: dossier.cohort_stats.q75 / 100000 },
                        { name: "Max", cost: dossier.cohort_stats.max / 100000 },
                        { name: "THIS WORK", cost: dossier.cost_evaluation.work_cost / 100000, target: true }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} unit="L" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(val) => [`₹${val.toFixed(2)} Lakhs`, "Sanctioned Cost"]}
                      />
                      <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                        {[0, 1, 2, 3, 4, 5].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 5 ? "#ef4444" : "#3b82f6"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Candidate Duplicate Link Banner */}
            {dossier.duplicate_match && (
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Copy className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-white">
                      Nearby Co-Located Asset Detected ({dossier.duplicate_match.distance_meters}m away)
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Matching work: <strong>{dossier.duplicate_match.paired_work_id}</strong> — "{dossier.duplicate_match.paired_work.work_title}"
                  </p>
                </div>
                <button
                  onClick={() => onOpenDuplicateDiff(dossier.work_id, dossier.duplicate_match.paired_work_id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <span>Compare Side-by-Side</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Action Directive & Print Notice Bar */}
            <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block mb-1">
                  Recommended Administrative Action
                </span>
                <p className="text-xs text-slate-200">
                  {dossier.recommended_action}
                </p>
              </div>

              <button
                onClick={handlePrintNotice}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
              >
                <Printer className="w-4 h-4" />
                <span>Export Field Verification Notice</span>
              </button>
            </div>

          </div>
        ) : null}

      </div>
    </div>
  );
}
