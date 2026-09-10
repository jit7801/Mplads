import React from 'react';
import { 
  LayoutDashboard, 
  ListFilter, 
  Coins, 
  Clock, 
  Copy, 
  Map, 
  FileText, 
  Sliders, 
  ChevronLeft, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import Logo from './Logo';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  isCollapsed, 
  setIsCollapsed, 
  onOpenSettings 
}) {
  const navItems = [
    { id: 'COMMAND_CENTER', label: 'Overview', icon: LayoutDashboard },
    { id: 'WORK_LIST', label: 'Risk Works', icon: ListFilter },
    { id: 'COST_ANOMALIES', label: 'Cost Anomalies', icon: Coins },
    { id: 'DELAY_STAGNATION', label: 'Delay & Stagnation', icon: Clock },
    { id: 'DUPLICATES', label: 'Possible Duplicates', icon: Copy },
    { id: 'MAP', label: 'Risk Map', icon: Map },
    { id: 'REPORTS', label: 'Reports', icon: FileText },
  ];

  return (
    <aside
      className={`bg-white border-r border-[#E4E7EC] flex flex-col transition-all duration-200 shrink-0 z-20 ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-3.5 border-b border-[#E4E7EC] overflow-hidden">
        <Logo collapsed={isCollapsed} size="md" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2.5 space-y-0.5 overflow-y-auto">
        <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider">
          {!isCollapsed ? 'Analytics & Monitoring' : '•••'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#F2F4F7] text-[#183B56] font-semibold'
                  : 'text-[#475467] hover:bg-[#F9FAFB] hover:text-[#1F2933]'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#183B56]' : 'text-[#667085]'}`} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer Tools & Collapse Button */}
      <div className="p-2.5 border-t border-[#E4E7EC] space-y-1">
        <button
          onClick={onOpenSettings}
          title={isCollapsed ? 'Policy Settings & Weights' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium text-[#475467] hover:bg-[#F9FAFB] hover:text-[#1F2933] transition-colors"
        >
          <Sliders className="w-4 h-4 text-[#667085] shrink-0" />
          {!isCollapsed && <span className="truncate">Policy Weights</span>}
        </button>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-xs text-[#667085] hover:bg-[#F9FAFB] hover:text-[#1F2933] transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-[11px]">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
