import React from 'react';
import { Bell, User, HelpCircle, ShieldCheck } from 'lucide-react';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  criticalCount = 0 
}) {
  const roles = [
    { id: 'DISTRICT', label: 'District Magistrate (Jaipur)', badge: 'District' },
    { id: 'STATE', label: 'State Nodal Officer (Rajasthan)', badge: 'State' },
    { id: 'MP', label: "Hon'ble MP (Jaipur)", badge: 'Constituency' },
    { id: 'MINISTRY', label: 'Ministry of Statistics (MoSPI)', badge: 'National' },
    { id: 'CITIZEN', label: 'Citizen Transparency View', badge: 'Public' },
  ];

  return (
    <header className="h-16 bg-white border-b border-[#E4E7EC] px-6 flex items-center justify-between z-10 shrink-0">
      
      {/* Left: Product & Subtitle */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#1F2933]">
              MPLADS Risk Intelligence
            </span>
            <span className="text-[11px] text-[#667085] hidden sm:inline">
              — Early warning, evidence and action for every MPLADS work.
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions & Role */}
      <div className="flex items-center gap-3">
        
        {/* Role Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-xs text-[#667085] hidden md:inline font-medium">
            Role View:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs font-medium border border-[#D0D5DD] rounded-md px-2.5 py-1.5 focus:outline-none focus:border-[#183B56] cursor-pointer"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Notifications Icon with Critical Counter */}
        <button
          className="relative p-2 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F9FAFB] transition-colors"
          title={`${criticalCount} Critical works requiring verification`}
        >
          <Bell className="w-4 h-4" />
          {criticalCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#B85C5C]" />
          )}
        </button>

        {/* Help / Guide */}
        <button
          className="p-2 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F9FAFB] transition-colors"
          title="Scheme documentation & verification guidelines"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#E4E7EC]">
          <div className="w-7 h-7 rounded-full bg-[#E4E7EC] text-[#475467] flex items-center justify-center font-semibold text-xs">
            <User className="w-3.5 h-3.5" />
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-medium text-[#1F2933]">DM Office, Jaipur</div>
            <div className="text-[10px] text-[#667085]">Nodal Authority</div>
          </div>
        </div>

      </div>

    </header>
  );
}
