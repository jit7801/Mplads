import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import KPICards from './components/KPICards';
import PriorityTable from './components/PriorityTable';
import WorksTableView from './components/WorksTableView';
import WorkDetailView from './components/WorkDetailView';
import CostAnomaliesView from './components/CostAnomaliesView';
import DelayStagnationView from './components/DelayStagnationView';
import DuplicatesView from './components/DuplicatesView';
import RiskMapView from './components/RiskMapView';
import ReportsView from './components/ReportsView';
import SettingsModal from './components/SettingsModal';
import CitizenView from './components/CitizenView';
import { CardSkeleton, TableSkeleton } from './components/SkeletonLoader';
import { fetchSummary, fetchWorks, fetchDuplicateCandidates } from './api/client';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('COMMAND_CENTER');
  const [currentRole, setCurrentRole] = useState('DISTRICT');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Data state
  const [summary, setSummary] = useState(null);
  const [works, setWorks] = useState([]);
  const [duplicatePairs, setDuplicatePairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Work Dossier Inspection
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, worksData, dupData] = await Promise.all([
        fetchSummary(),
        fetchWorks({ limit: 500 }),
        fetchDuplicateCandidates()
      ]);
      setSummary(sumData);
      setWorks(worksData.items || []);
      setDuplicatePairs(dupData.pairs || []);
    } catch (err) {
      console.error('API Fetch Error:', err);
      setError('Unable to connect to the MPLADS Risk Intelligence engine at http://localhost:8001. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectWork = (workId) => {
    setSelectedWorkId(workId);
  };

  const handleBackToWorks = () => {
    setSelectedWorkId(null);
  };

  const handleOpenDuplicateDiff = (workIdA, workIdB) => {
    setSelectedWorkId(null);
    setCurrentTab('DUPLICATES');
  };

  return (
    <div className="flex h-screen bg-[#F7F8F6] text-[#1F2933] overflow-hidden">
      
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedWorkId(null);
        }}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          criticalCount={summary?.critical_count || 0}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Backend Connection Warning */}
            {error && (
              <div className="gov-card p-4 mb-6 border-[#F8D7DA] bg-[#FDF2F2] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 text-[#B85C5C]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadData}
                  className="btn-secondary py-1 px-2.5 text-xs text-[#B85C5C] border-[#F8D7DA] hover:bg-white"
                >
                  <RefreshCw className="w-3.5 h-3.5 inline mr-1" />
                  Retry Connection
                </button>
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div className="space-y-4">
                <CardSkeleton />
                <TableSkeleton rows={8} />
              </div>
            ) : currentRole === 'CITIZEN' ? (
              /* Role: Citizen Transparency View */
              <CitizenView works={works} />
            ) : selectedWorkId ? (
              /* Focused Work Detail Dossier View */
              <WorkDetailView
                workId={selectedWorkId}
                onBack={handleBackToWorks}
                onOpenDuplicateDiff={handleOpenDuplicateDiff}
              />
            ) : (
              /* Standard Administrative Views */
              <>
                {/* 1. Risk Command Center (Overview) */}
                {currentTab === 'COMMAND_CENTER' && (
                  <div className="space-y-6">
                    {/* Header Intro */}
                    <div>
                      <h1 className="text-xl font-bold text-[#1F2933] tracking-tight">
                        Risk Command Center
                      </h1>
                      <p className="text-xs text-[#667085]">
                        Monitor works that may require attention and verification.
                      </p>
                    </div>

                    {/* Compact KPI Cards */}
                    <KPICards summary={summary} />

                    {/* Today's Priority Works Table */}
                    <PriorityTable
                      works={works}
                      onSelectWork={handleSelectWork}
                      onViewAll={() => setCurrentTab('WORK_LIST')}
                    />

                    {/* Master Works Registry */}
                    <WorksTableView
                      works={works}
                      onSelectWork={handleSelectWork}
                    />
                  </div>
                )}

                {/* 2. Full Risk Works Registry */}
                {currentTab === 'WORK_LIST' && (
                  <WorksTableView
                    works={works}
                    onSelectWork={handleSelectWork}
                  />
                )}

                {/* 3. Dedicated Cost Anomalies View */}
                {currentTab === 'COST_ANOMALIES' && (
                  <CostAnomaliesView
                    works={works}
                    onSelectWork={handleSelectWork}
                  />
                )}

                {/* 4. Dedicated Delay & Stagnation View */}
                {currentTab === 'DELAY_STAGNATION' && (
                  <DelayStagnationView
                    works={works}
                    onSelectWork={handleSelectWork}
                  />
                )}

                {/* 5. Dedicated Possible Duplicates View */}
                {currentTab === 'DUPLICATES' && (
                  <DuplicatesView
                    pairs={duplicatePairs}
                    onSelectWork={handleSelectWork}
                  />
                )}

                {/* 6. Geospatial Risk Map */}
                {currentTab === 'MAP' && (
                  <RiskMapView
                    works={works}
                    onSelectWork={handleSelectWork}
                  />
                )}

                {/* 7. Reports & Orders */}
                {currentTab === 'REPORTS' && (
                  <ReportsView
                    works={works}
                    onSelectWork={handleSelectWork}
                  />
                )}
              </>
            )}

          </div>
        </main>

      </div>

      {/* Policy Weights Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onWeightsApplied={loadData}
      />

      {/* Vercel Analytics */}
      <Analytics />

    </div>
  );
}
