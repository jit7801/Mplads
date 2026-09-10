import React, { useState, useEffect, useCallback } from 'react';
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
import { ToastProvider, useToast } from './components/Toast';

function AppContent() {
  const { addToast } = useToast();
  const [currentTab, setCurrentTab] = useState('COMMAND_CENTER');
  const [currentRole, setCurrentRole] = useState('DISTRICT');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data state
  const [summary, setSummary] = useState(null);
  const [works, setWorks] = useState([]);
  const [duplicatePairs, setDuplicatePairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Active Work Dossier Inspection
  const [selectedWorkId, setSelectedWorkId] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [initialRiskFilter, setInitialRiskFilter] = useState('');

  // 1. Sync URL Hash for Browser Back/Forward & Refresh state
  const syncStateFromHash = useCallback(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash || hash === 'overview') {
      setCurrentTab('COMMAND_CENTER');
      setSelectedWorkId(null);
    } else if (hash.startsWith('work/')) {
      const wId = hash.replace('work/', '');
      setSelectedWorkId(wId);
    } else if (hash === 'works' || hash === 'work-list') {
      setCurrentTab('WORK_LIST');
      setSelectedWorkId(null);
    } else if (hash === 'cost-anomalies') {
      setCurrentTab('COST_ANOMALIES');
      setSelectedWorkId(null);
    } else if (hash === 'delay-stagnation') {
      setCurrentTab('DELAY_STAGNATION');
      setSelectedWorkId(null);
    } else if (hash === 'duplicates') {
      setCurrentTab('DUPLICATES');
      setSelectedWorkId(null);
    } else if (hash === 'map') {
      setCurrentTab('MAP');
      setSelectedWorkId(null);
    } else if (hash === 'reports') {
      setCurrentTab('REPORTS');
      setSelectedWorkId(null);
    } else if (hash === 'citizen') {
      setCurrentRole('CITIZEN');
      setSelectedWorkId(null);
    }
  }, []);

  useEffect(() => {
    syncStateFromHash();
    window.addEventListener('hashchange', syncStateFromHash);
    return () => window.removeEventListener('hashchange', syncStateFromHash);
  }, [syncStateFromHash]);

  // Update hash when navigating
  const navigateTab = (tab) => {
    setCurrentTab(tab);
    setSelectedWorkId(null);
    setInitialRiskFilter('');
    const tabToHash = {
      COMMAND_CENTER: 'overview',
      WORK_LIST: 'works',
      COST_ANOMALIES: 'cost-anomalies',
      DELAY_STAGNATION: 'delay-stagnation',
      DUPLICATES: 'duplicates',
      MAP: 'map',
      REPORTS: 'reports'
    };
    window.location.hash = `#/${tabToHash[tab] || 'overview'}`;
  };

  const handleSelectWork = (workId) => {
    setSelectedWorkId(workId);
    window.location.hash = `#/work/${workId}`;
  };

  const handleBackToWorks = () => {
    setSelectedWorkId(null);
    window.location.hash = `#/works`;
  };

  const handleOpenDuplicateDiff = (workIdA, workIdB) => {
    setSelectedWorkId(null);
    navigateTab('DUPLICATES');
  };

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
      setError('Unable to connect to the MPLADS Risk Intelligence engine. Ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleKPISelect = (kpiId) => {
    if (kpiId === 'TOTAL') {
      setInitialRiskFilter('');
      navigateTab('WORK_LIST');
    } else if (kpiId === 'HIGH') {
      setInitialRiskFilter('HIGH');
      navigateTab('WORK_LIST');
      addToast('Filtered works registry by High Risk (Score 60–79).', 'info');
    } else if (kpiId === 'CRITICAL') {
      setInitialRiskFilter('CRITICAL');
      navigateTab('WORK_LIST');
      addToast('Filtered works registry by Critical Risk (Score 80+).', 'info');
    } else if (kpiId === 'STAGNATION') {
      navigateTab('DELAY_STAGNATION');
    } else if (kpiId === 'DUPLICATE') {
      navigateTab('DUPLICATES');
    }
  };

  return (
    <div className="flex h-screen bg-[#F7F8F6] text-[#1F2933] overflow-hidden">
      
      {/* Collapsible Left Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={navigateTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <Header
          currentRole={currentRole}
          setCurrentRole={(r) => {
            setCurrentRole(r);
            if (r === 'CITIZEN') {
              window.location.hash = '#/citizen';
            }
          }}
          criticalCount={summary?.critical_count || 0}
          works={works}
          onSelectWork={handleSelectWork}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onRefreshData={loadData}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Backend Connection Warning */}
            {error && (
              <div className="gov-card p-4 border-[#F8D7DA] bg-[#FDF2F2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-[#B85C5C]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadData}
                  className="btn-secondary py-1 px-3 text-xs text-[#B85C5C] border-[#F8D7DA] hover:bg-white self-start sm:self-auto"
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
                onViewOnMap={(wId) => {
                  navigateTab('MAP');
                }}
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
                        Monitor high-risk infrastructure anomalies, progress gaps, and duplicate works across constituencies.
                      </p>
                    </div>

                    {/* Compact Interactive KPI Cards */}
                    <KPICards 
                      summary={summary} 
                      onSelectFilter={handleKPISelect}
                    />

                    {/* Today's Priority Works Table */}
                    <PriorityTable
                      works={works}
                      onSelectWork={handleSelectWork}
                      onViewAll={() => navigateTab('WORK_LIST')}
                    />

                    {/* Master Works Registry */}
                    <WorksTableView
                      works={works}
                      onSelectWork={handleSelectWork}
                      initialRiskFilter={initialRiskFilter}
                    />
                  </div>
                )}

                {/* 2. Full Risk Works Registry */}
                {currentTab === 'WORK_LIST' && (
                  <WorksTableView
                    works={works}
                    onSelectWork={handleSelectWork}
                    initialRiskFilter={initialRiskFilter}
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

    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
