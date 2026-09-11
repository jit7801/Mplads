import React, { useState } from 'react';
import { Bell, User, HelpCircle, Menu, ChevronDown } from 'lucide-react';
import NotificationsPanel from './NotificationsPanel';
import HelpModal from './HelpModal';
import UserProfileModal from './UserProfileModal';
import { useToast } from './Toast';

export default function Header({ 
  currentRole, 
  setCurrentRole, 
  criticalCount = 0,
  works = [],
  onSelectWork,
  onToggleMobileSidebar,
  onRefreshData
}) {
  const { addToast } = useToast();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const roles = [
    { id: 'DISTRICT', label: 'District Magistrate (Jaipur)', shortLabel: 'DM Jaipur' },
    { id: 'STATE', label: 'State Nodal Officer (Rajasthan)', shortLabel: 'State Nodal' },
    { id: 'MP', label: "Hon'ble MP (Jaipur)", shortLabel: 'MP Jaipur' },
    { id: 'MINISTRY', label: 'Ministry of Statistics (MoSPI)', shortLabel: 'MoSPI Central' },
    { id: 'CITIZEN', label: 'Citizen Transparency View', shortLabel: 'Citizen Portal' },
  ];

  return (
    <>
      <header className="h-16 bg-white border-b border-[#E4E7EC] px-3 sm:px-6 flex items-center justify-between z-10 shrink-0 select-none">
        
        {/* Left: Mobile Menu Trigger & Product Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          
          {/* Hamburger Menu (visible on mobile/tablet < lg) */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 -ml-1 rounded-md text-[#475467] hover:text-[#1F2933] hover:bg-[#F2F4F7] transition-colors focus-visible:ring-2 focus-visible:ring-[#183B56]"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="truncate">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-bold text-[#1F2933] truncate">
                MPLADS Risk Intelligence
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EFF8FF] text-[#175CD3] border border-[#B2DDFF]">
                eSAKSHI Decision Support
              </span>
              <span className="hidden 2xl:inline text-[11px] text-[#667085] truncate">
                — Early warning, empirical evidence and action for every work.
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Role */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          
          {/* Role Switcher */}
          <div className="flex items-center gap-1.5" title="eSAKSHI RBAC Profile (Select administrative role)">
            <label htmlFor="role-select" className="text-xs text-[#667085] hidden md:inline font-medium">
              Role:
            </label>
            <div className="relative">
              <select
                id="role-select"
                value={currentRole}
                title="eSAKSHI RBAC Profile (Select administrative role)"
                onChange={(e) => {
                  const newRole = e.target.value;
                  setCurrentRole(newRole);
                  const selectedRoleObj = roles.find(r => r.id === newRole);
                  if (selectedRoleObj) {
                    addToast(`Switched active view to: ${selectedRoleObj.label}`, 'info');
                  }
                }}
                className="bg-[#F9FAFB] text-[#1F2933] text-xs font-semibold border border-[#D0D5DD] rounded-md pl-2 pr-6 py-1.5 focus:outline-none focus:border-[#183B56] cursor-pointer appearance-none"
                aria-label="Select administrative role"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#667085] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Notifications Button */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F9FAFB] transition-colors focus-visible:ring-2 focus-visible:ring-[#183B56]"
            title={`${criticalCount} Critical works requiring verification`}
            aria-label={`${criticalCount} Critical alerts pending review`}
          >
            <Bell className="w-4 h-4" />
            {criticalCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#B85C5C] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#B85C5C]"></span>
              </span>
            )}
          </button>

          {/* Help / Guide Button */}
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F9FAFB] transition-colors focus-visible:ring-2 focus-visible:ring-[#183B56]"
            title="Scheme documentation & verification guidelines"
            aria-label="Open verification guidelines and help documentation"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* User Badge (Clickable to open profile modal) */}
          <button
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-2 pl-1.5 sm:pl-2 border-l border-[#E4E7EC] hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[#183B56] rounded-md p-1"
            title="Click to view nodal authority profile & session settings"
            aria-label="Open user and nodal authority profile"
          >
            <div className="w-7 h-7 rounded-full bg-[#183B56] text-white flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-[#1F2933] leading-tight">
                {currentRole === 'DISTRICT' && 'DM Office, Jaipur'}
                {currentRole === 'STATE' && 'Govt. of Rajasthan'}
                {currentRole === 'MP' && "Hon'ble MP (Jaipur)"}
                {currentRole === 'MINISTRY' && 'MoSPI Central Ministry'}
                {currentRole === 'CITIZEN' && 'Citizen Transparency'}
              </div>
              <div className="text-[10px] text-[#667085]">
                {currentRole === 'DISTRICT' && 'District Magistrate'}
                {currentRole === 'STATE' && 'State Nodal Officer'}
                {currentRole === 'MP' && 'Constituency Rep'}
                {currentRole === 'MINISTRY' && 'National Oversight'}
                {currentRole === 'CITIZEN' && 'Public Portal'}
              </div>
            </div>
          </button>

        </div>

      </header>

      {/* Notifications Drawer */}
      <NotificationsPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        works={works}
        onSelectWork={onSelectWork}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        onRefreshData={onRefreshData}
      />
    </>
  );
}
