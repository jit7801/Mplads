import React from 'react';
import { 
  Building2, 
  Layers, 
  UserCheck, 
  ShieldCheck, 
  CheckCircle2, 
  MapPin, 
  Sliders, 
  FileText, 
  Printer, 
  Filter,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function RoleContextBanner({ 
  currentRole, 
  scopedDistrict,
  scopedState,
  scopedCount,
  totalCount,
  onOpenSettings,
  onNavigateTab,
  onClearScope,
  isScoped
}) {
  const roleConfigs = {
    DISTRICT: {
      title: "District Magistrate & Collector's Dashboard",
      designation: "Executive District Authority",
      location: "Jaipur District, Rajasthan",
      badgeColor: "bg-[#183B56] text-white",
      accentBg: "bg-[#F0F5F8] border-[#D7E6EE]",
      icon: Building2,
      description: "Statutory spot inquiry, contractor rate audit against Jaipur DSR, and physical asset verification.",
      actions: [
        { label: "Jaipur Risk Map", tab: "MAP", icon: MapPin },
        { label: "Print Inspection Orders", tab: "REPORTS", icon: Printer },
        { label: "Check Co-located Duplicates", tab: "DUPLICATES", icon: FileText }
      ]
    },
    STATE: {
      title: "State Nodal Officer's Oversight Dashboard",
      designation: "State Planning Authority",
      location: "Govt. of Rajasthan (All Constituencies)",
      badgeColor: "bg-[#2F6F8F] text-white",
      accentBg: "bg-[#F2F8F4] border-[#D8EADB]",
      icon: Layers,
      description: "Inter-district expenditure velocity tracking, fund tranche reallocation, and state-wide milestone monitoring.",
      actions: [
        { label: "Cost Anomaly Outliers", tab: "COST_ANOMALIES", icon: Sparkles },
        { label: "State Delay Matrix", tab: "DELAY_STAGNATION", icon: Filter },
        { label: "State Consolidated Reports", tab: "REPORTS", icon: FileText }
      ]
    },
    MP: {
      title: "Hon'ble Member of Parliament (Lok Sabha)",
      designation: "Constituency Representative",
      location: "Jaipur Parliamentary Constituency",
      badgeColor: "bg-[#C8754D] text-white",
      accentBg: "bg-[#FDF6F0] border-[#FCE8DB]",
      icon: UserCheck,
      description: "Tracking delivery of MP-recommended community works, progress transparency, and redressing constituent delay flags.",
      actions: [
        { label: "Constituency Risk Works", tab: "WORK_LIST", icon: Building2 },
        { label: "Geospatial Site Map", tab: "MAP", icon: MapPin },
        { label: "Progress Reports", tab: "REPORTS", icon: FileText }
      ]
    },
    MINISTRY: {
      title: "Central Ministry of Statistics & Programme Implementation (MoSPI)",
      designation: "National Oversight Authority",
      location: "New Delhi (National eSAKSHI Portal)",
      badgeColor: "bg-[#0F273D] text-white",
      accentBg: "bg-[#F9FAFB] border-[#E4E7EC]",
      icon: ShieldCheck,
      description: "Macro fiscal leakage prevention, policy weight calibration, and cross-state anomaly benchmarking nationwide.",
      actions: [
        { label: "Calibrate Policy Weights", action: onOpenSettings, icon: Sliders },
        { label: "National Anomaly Map", tab: "MAP", icon: MapPin },
        { label: "Audit Registry", tab: "REPORTS", icon: FileText }
      ]
    },
    CITIZEN: {
      title: "MPLADS Citizen Transparency Portal",
      designation: "Open Public Audit",
      location: "Constituency Public Domain",
      badgeColor: "bg-[#487A5E] text-white",
      accentBg: "bg-[#F2F8F4] border-[#D8EADB]",
      icon: CheckCircle2,
      description: "Open access to sanctioned development works, physical completion proofs, and executing agency accountability in your ward.",
      actions: []
    }
  };

  const config = roleConfigs[currentRole] || roleConfigs.DISTRICT;
  const RoleIcon = config.icon;

  if (currentRole === 'CITIZEN') return null;

  return (
    <div className={`gov-card p-4 sm:p-5 border transition-all duration-200 ${config.accentBg} mb-6`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Left: Role identity & Mission */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-lg ${config.badgeColor} flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
            <RoleIcon className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeColor}`}>
                {config.designation}
              </span>
              <span className="text-xs text-[#667085] flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-[#98A2B3]" />
                {config.location}
              </span>
              <span className="text-[11px] font-semibold text-[#183B56] bg-white px-2 py-0.5 rounded border border-[#D0D5DD]">
                {scopedCount} Works in Role Scope ({totalCount} Total)
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-[#1F2933]">
              {config.title}
            </h2>

            <p className="text-xs text-[#475467] leading-relaxed max-w-2xl">
              {config.description}
            </p>
          </div>
        </div>

        {/* Right: Role-specific Quick Navigation Pills */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#D0D5DD]/60">
          {config.actions.map((act, idx) => {
            const ActIcon = act.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (act.action) act.action();
                  else if (act.tab && onNavigateTab) onNavigateTab(act.tab);
                }}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:bg-white"
              >
                <ActIcon className="w-3.5 h-3.5 text-[#183B56]" />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
