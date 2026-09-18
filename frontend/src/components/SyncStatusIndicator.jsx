import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Download, 
  X, 
  ChevronRight,
  Clock,
  AlertCircle
} from 'lucide-react';
import syncManager from '../services/syncManager';
import { getAllCachedProjects, saveProjects, getAllQueueItems } from '../services/db';
import { fetchOfflineProjectBundle } from '../api/client';
import { useToast } from './Toast';

export default function SyncStatusIndicator({ onSelectWork }) {
  const { addToast } = useToast();
  const [syncState, setSyncState] = useState(syncManager.getState());
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [cachedCount, setCachedCount] = useState(0);
  const [queueItems, setQueueItems] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((state) => {
      setSyncState(state);
    });
    return () => unsubscribe();
  }, []);

  const loadLocalStats = async () => {
    try {
      const projs = await getAllCachedProjects();
      setCachedCount(projs.length);
      const items = await getAllQueueItems();
      setQueueItems(items);
    } catch (err) {
      console.warn('Could not load local stats:', err);
    }
  };

  useEffect(() => {
    loadLocalStats();
    const interval = setInterval(loadLocalStats, 5000);
    return () => clearInterval(interval);
  }, [syncState]);

  const handleDownloadBundle = async () => {
    setIsDownloading(true);
    try {
      const bundle = await fetchOfflineProjectBundle({ limit: 100 });
      if (bundle && bundle.projects) {
        await saveProjects(bundle.projects);
        setCachedCount(bundle.projects.length);
        addToast(`Downloaded and cached ${bundle.projects.length} projects for offline verification.`, 'success');
      }
    } catch (err) {
      addToast(`Offline bundle download failed: ${err.message}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleTriggerSync = () => {
    syncManager.triggerSync();
    addToast('Initiating synchronization with central intelligence engine...', 'info');
  };

  const { isOnline, isSyncing, queueSummary, statusMessage } = syncState;
  const hasConflicts = queueSummary.conflict > 0;
  const hasFailed = queueSummary.failed > 0;
  const hasPending = queueSummary.pending > 0;

  return (
    <>
      {/* Compact Header Pill */}
      <button
        onClick={() => setIsPanelOpen(true)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
          !isOnline
            ? 'bg-[#FEF6EE] text-[#B54708] border-[#F9DBAF]'
            : isSyncing
            ? 'bg-[#EFF8FF] text-[#175CD3] border-[#B2DDFF]'
            : hasConflicts
            ? 'bg-[#FFF4ED] text-[#C4320A] border-[#FD853A]'
            : hasFailed
            ? 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]'
            : hasPending
            ? 'bg-[#FFFAEB] text-[#B54708] border-[#FEDF89]'
            : 'bg-[#F6FEF9] text-[#027A48] border-[#A6F4C5]'
        }`}
        title="Offline Field Verification & Sync Manager"
        aria-label="Offline Sync Manager Status"
      >
        {!isOnline ? (
          <>
            <span className="w-2 h-2 rounded-full bg-[#B54708] animate-pulse" />
            <span>Offline</span>
            {hasPending && <span className="text-[10px] font-bold">({queueSummary.pending})</span>}
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="w-3 h-3 text-[#175CD3] animate-spin" />
            <span>Syncing...</span>
          </>
        ) : hasConflicts ? (
          <>
            <AlertTriangle className="w-3 h-3 text-[#C4320A]" />
            <span>Conflict ({queueSummary.conflict})</span>
          </>
        ) : hasFailed ? (
          <>
            <AlertCircle className="w-3 h-3 text-[#B85C5C]" />
            <span>Sync Failed ({queueSummary.failed})</span>
          </>
        ) : hasPending ? (
          <>
            <Clock className="w-3 h-3 text-[#B54708]" />
            <span>{queueSummary.pending} pending</span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-[#12B76A]" />
            <span className="hidden sm:inline">Online</span>
            <CheckCircle2 className="w-3 h-3 text-[#12B76A]" />
          </>
        )}
      </button>

      {/* Sync Manager Modal / Slideover Panel */}
      {isPanelOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4 animate-in fade-in"
          onClick={() => setIsPanelOpen(false)}
        >
          <div 
            className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg ${isOnline ? 'bg-[#ECFDF3] text-[#027A48]' : 'bg-[#FEF6EE] text-[#B54708]'}`}>
                  {isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1F2933]">
                    Field Verification & Sync Center
                  </h3>
                  <p className="text-[11px] text-[#667085]">
                    {isOnline ? 'Connected to Central AI Engine' : 'Offline Mode — Local IndexedDB Active'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1 rounded text-[#667085] hover:text-[#1F2933]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Status Alert Banner */}
              <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 ${
                !isOnline 
                  ? 'bg-[#FEF6EE] border-[#F9DBAF] text-[#B54708]' 
                  : isSyncing 
                  ? 'bg-[#EFF8FF] border-[#B2DDFF] text-[#175CD3]'
                  : hasConflicts
                  ? 'bg-[#FFF4ED] border-[#FD853A] text-[#C4320A]'
                  : 'bg-[#F6FEF9] border-[#A6F4C5] text-[#027A48]'
              }`}>
                <div className="flex items-center gap-2">
                  {!isOnline ? <WifiOff className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span className="font-semibold">{statusMessage}</span>
                </div>
                {isOnline && (hasPending || hasFailed) && (
                  <button
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="btn-primary py-1 px-2.5 text-[11px] flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>Sync Now</span>
                  </button>
                )}
              </div>

              {/* Offline Storage Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                  <div className="text-[11px] text-[#667085] font-medium">Cached Projects</div>
                  <div className="text-lg font-bold text-[#1F2933] mt-0.5">{cachedCount}</div>
                  <div className="text-[10px] text-[#98A2B3]">Ready for field</div>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                  <div className="text-[11px] text-[#667085] font-medium">Pending Sync</div>
                  <div className="text-lg font-bold text-[#B54708] mt-0.5">{queueSummary.pending}</div>
                  <div className="text-[10px] text-[#98A2B3]">In sync queue</div>
                </div>
                <div className="p-3 bg-[#F9FAFB] rounded-lg border border-[#EAECF0]">
                  <div className="text-[11px] text-[#667085] font-medium">Synced Records</div>
                  <div className="text-lg font-bold text-[#027A48] mt-0.5">{queueSummary.synced}</div>
                  <div className="text-[10px] text-[#98A2B3]">Authoritative</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleDownloadBundle}
                  disabled={!isOnline || isDownloading}
                  className="flex-1 btn-secondary text-xs flex items-center justify-center gap-1.5 py-2"
                >
                  <Download className="w-3.5 h-3.5 text-[#667085]" />
                  <span>{isDownloading ? 'Caching Data...' : 'Cache Projects for Field Work'}</span>
                </button>

                <button
                  onClick={handleTriggerSync}
                  disabled={!isOnline || isSyncing}
                  className="btn-primary text-xs flex items-center justify-center gap-1.5 py-2 px-4"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Queue</span>
                </button>
              </div>

              {/* Conflict Notice if any */}
              {hasConflicts && (
                <div className="p-3 bg-[#FFF4ED] border border-[#FD853A] rounded-lg text-[#C4320A] space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Version Conflict Detected</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-[#7A271A]">
                    This project was updated after it was downloaded. Your offline verification could not automatically overwrite the newer server information. Review the latest project information before submitting again.
                  </p>
                </div>
              )}

              {/* Sync Queue Operations Log */}
              <div className="space-y-2 pt-2 border-t border-[#EAECF0]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1F2933] text-xs uppercase tracking-wider">
                    Recent Queue Operations
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    Total: {queueItems.length}
                  </span>
                </div>

                {queueItems.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] text-center text-xs text-[#667085]">
                    No operations in sync queue. All field records are up to date.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {queueItems.map((item) => (
                      <div
                        key={item.operation_id}
                        className="p-2.5 rounded-lg border border-[#EAECF0] bg-white flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#1F2933]">{item.project_id}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                              item.status === 'synced'
                                ? 'bg-[#ECFDF3] text-[#027A48]'
                                : item.status === 'syncing'
                                ? 'bg-[#EFF8FF] text-[#175CD3]'
                                : item.status === 'conflict'
                                ? 'bg-[#FFF4ED] text-[#C4320A]'
                                : item.status === 'failed'
                                ? 'bg-[#FDF2F2] text-[#B85C5C]'
                                : 'bg-[#FEF6EE] text-[#B54708]'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#667085]">
                            Progress: {item.payload?.progress}% · {item.payload?.verification_status}
                          </div>
                          {item.last_error && (
                            <div className="text-[10px] text-[#B85C5C] italic">
                              Error: {item.last_error}
                            </div>
                          )}
                        </div>

                        {onSelectWork && (
                          <button
                            onClick={() => {
                              setIsPanelOpen(false);
                              onSelectWork(item.project_id);
                            }}
                            className="p-1 rounded text-[#667085] hover:text-[#183B56]"
                            title="Inspect work dossier"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-[#EAECF0] bg-[#F9FAFB] flex justify-between items-center text-[11px] text-[#667085]">
              <span>MPLADS Offline Sync Protocol v1.0</span>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="btn-secondary py-1 px-3 text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
