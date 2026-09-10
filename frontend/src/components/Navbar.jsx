import React from 'react';
import { ShieldAlert, MapPin, Layers, Sliders, CheckCircle2, Building2, UserCheck, AlertTriangle } from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentRole, 
  setCurrentRole, 
  onOpenSimulator 
}) {
  const roles = [
    { id: "DISTRICT", label: "District Magistrate (Jaipur)", icon: Building2 },
    { id: "STATE", label: "State Nodal Officer (Rajasthan)", icon: Layers },
    { id: "MP", label: "Hon'ble MP (Jaipur)", icon: UserCheck },
    { id: "MINISTRY", label: "Central Ministry (MoSPI)", icon: ShieldAlert },
    { id: "CITIZEN", label: "Citizen Transparency View", icon: CheckCircle2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">MPLADS ERIL</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded">
                  SIH26102
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Explainable Risk Intelligence Layer for eSAKSHI
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            {[
              { id: "COMMAND_CENTER", label: "Risk Command Center" },
              { id: "WORK_LIST", label: "Risk Work List" },
              { id: "DUPLICATES", label: "Duplicate Inspector" },
              { id: "MAP", label: "Geospatial Risk Map" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-all ${
                  currentTab === tab.id
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Right Action Tools & Role Switcher */}
          <div className="flex items-center gap-3">
            {/* Judge Simulator Button */}
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-300 border border-amber-500/30 rounded-lg transition-all"
              title="Interactive Judge Simulator: Adjust weights live"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Weight Simulator</span>
            </button>

            {/* Role Dropdown */}
            <div className="relative">
              <select
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="bg-slate-900 text-slate-200 text-xs font-medium border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
