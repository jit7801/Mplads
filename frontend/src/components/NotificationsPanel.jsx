import React from 'react';
import { Bell, AlertOctagon, AlertTriangle, CheckCircle2, ChevronRight, X, Trash2 } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function NotificationsPanel({ 
  isOpen, 
  onClose, 
  works = [], 
  onSelectWork 
}) {
  if (!isOpen) return null;

  // Derive notifications from critical and high risk works
  const criticalAlerts = works
    .filter((w) => w.overall_risk_score >= 60)
    .slice(0, 10);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-end p-3 sm:p-4 bg-black/20 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white border border-[#E4E7EC] rounded-xl shadow-2xl overflow-hidden mt-12 animate-in slide-in-from-top-4 fade-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#E4E7EC] bg-[#F9FAFB]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#FDF2F2] text-[#B85C5C] flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#1F2933]">
                Priority Risk Alerts ({criticalAlerts.length})
              </h3>
              <span className="text-[10px] text-[#667085]">
                Real-time anomalies requiring field audit
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#667085] hover:text-[#1F2933] hover:bg-[#EAECF0]"
            aria-label="Close notifications"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-[#F2F4F7]">
          {criticalAlerts.length === 0 ? (
            <div className="p-8 text-center text-[#667085]">
              <CheckCircle2 className="w-8 h-8 text-[#487A5E] mx-auto mb-2 opacity-80" />
              <p className="text-xs font-medium text-[#1F2933]">No pending critical alerts</p>
              <p className="text-[11px] text-[#667085] mt-0.5">All monitored works are within policy thresholds.</p>
            </div>
          ) : (
            criticalAlerts.map((work) => {
              const isCritical = work.overall_risk_score >= 80;
              return (
                <div
                  key={work.work_id}
                  onClick={() => {
                    onSelectWork(work.work_id);
                    onClose();
                  }}
                  className="p-3 hover:bg-[#F9FAFB] cursor-pointer transition-colors flex items-start gap-3 group"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isCritical ? 'bg-[#B85C5C]' : 'bg-[#C8754D]'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="font-mono text-[10px] text-[#667085] truncate">{work.work_id}</span>
                      <RiskBadge score={work.overall_risk_score} level={work.risk_level} size="sm" />
                    </div>
                    <p className="text-xs font-medium text-[#1F2933] group-hover:text-[#183B56] transition-colors truncate">
                      {work.work_title}
                    </p>
                    <p className="text-[11px] text-[#B85C5C] font-medium mt-0.5 truncate">
                      {work.primary_risk_factor}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#98A2B3] group-hover:text-[#183B56] transition-colors shrink-0 self-center" />
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {criticalAlerts.length > 0 && (
          <div className="p-2.5 border-t border-[#E4E7EC] bg-[#F9FAFB] text-center">
            <span className="text-[11px] text-[#667085]">
              Click any alert to inspect the complete forensic dossier
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
