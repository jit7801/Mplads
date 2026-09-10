import React, { useState } from 'react';
import { 
  Copy, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ShieldAlert, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Building2 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useToast } from './Toast';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DuplicatesView({ pairs = [], onSelectWork }) {
  const { addToast } = useToast();
  const [selectedPairIndex, setSelectedPairIndex] = useState(0);
  const [resolutionStatus, setResolutionStatus] = useState({});

  if (!pairs || pairs.length === 0) {
    return (
      <div className="gov-card p-12 text-center text-[#667085]">
        <Copy className="w-8 h-8 text-[#D0D5DD] mx-auto mb-2" />
        <div className="font-semibold text-sm text-[#1F2933]">No duplicate candidates detected</div>
        <p className="text-xs text-[#667085] mt-1 max-w-sm mx-auto">
          All projects evaluated within 150m spatial bubbles currently show distinct titles and independent physical assets.
        </p>
      </div>
    );
  }

  const activePair = pairs[selectedPairIndex] || pairs[0];
  const { 
    work_a, 
    work_b, 
    distance_meters, 
    text_similarity, 
    combined_score, 
    same_agency, 
    same_category,
    pair_id
  } = activePair;

  const centerLat = (work_a.latitude + work_b.latitude) / 2;
  const centerLon = (work_a.longitude + work_b.longitude) / 2;

  const currentStatus = resolutionStatus[pair_id] || activePair.verification_status || 'PENDING_VERIFICATION';

  const markStatus = (newStatus) => {
    setResolutionStatus((prev) => ({ ...prev, [pair_id]: newStatus }));
    if (newStatus === 'VERIFIED_DUPLICATE') {
      addToast(`Spot verification notice issued for Pair #${selectedPairIndex + 1}.`, 'warning');
    } else {
      addToast(`Pair #${selectedPairIndex + 1} marked as Legitimate Separate Assets.`, 'success');
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
            Possible Duplicate & Overlapping Work Candidates
          </h2>
          <p className="text-xs text-[#667085]">
            Investigate co-located infrastructure works with high textual similarity to verify whether they represent a duplicate sanction.
          </p>
        </div>

        {/* Previous / Next Pair Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-[#667085]">
            Pair <strong>{selectedPairIndex + 1}</strong> of <strong>{pairs.length}</strong>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedPairIndex((i) => Math.max(0, i - 1))}
              disabled={selectedPairIndex === 0}
              className="btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Previous pair"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedPairIndex((i) => Math.min(pairs.length - 1, i + 1))}
              disabled={selectedPairIndex === pairs.length - 1}
              className="btn-secondary p-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Next pair"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Pair Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5">
        {pairs.map((p, idx) => {
          const status = resolutionStatus[p.pair_id] || p.verification_status || 'PENDING_VERIFICATION';
          const isResolved = status !== 'PENDING_VERIFICATION';
          return (
            <button
              key={p.pair_id}
              onClick={() => setSelectedPairIndex(idx)}
              className={`px-3 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedPairIndex === idx
                  ? 'bg-[#183B56] text-white border-[#183B56] shadow-sm'
                  : 'bg-white text-[#475467] border-[#D0D5DD] hover:bg-[#F9FAFB]'
              }`}
            >
              <span>Pair #{idx + 1}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedPairIndex === idx ? 'bg-white/20 text-white' : 'bg-[#F2F4F7] text-[#475467]'
              }`}>
                {p.distance_meters}m · {p.text_similarity}%
              </span>
              {isResolved && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Comparison Dossier */}
      <div className="gov-card p-4 sm:p-6 space-y-5">
        
        {/* Verification Status Banner */}
        <div className="p-3 rounded-lg bg-[#FEF9EE] border border-[#F9ECCB] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B58532] shrink-0" />
            <span className="text-xs font-semibold text-[#B58532]">
              Possible Duplicate Sanction Candidate — Co-located within {distance_meters} meters
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded border self-start sm:self-auto ${
            currentStatus === 'VERIFIED_DUPLICATE'
              ? 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]'
              : currentStatus === 'LEGITIMATE_SEPARATE'
              ? 'bg-[#F2F8F4] text-[#487A5E] border-[#D8EADB]'
              : 'bg-white text-[#667085] border-[#E4E7EC]'
          }`}>
            {currentStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Side-by-Side Work Dossiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Work A */}
          <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#183B56] uppercase tracking-wider text-[11px]">Primary Record (Work A)</span>
                <span className="font-mono text-[#667085] text-[10px]">{work_a.work_id}</span>
              </div>
              <h4 className="text-sm font-bold text-[#1F2933] leading-snug mb-2">
                {work_a.work_title}
              </h4>
              <div className="space-y-1 text-xs text-[#667085]">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-[#1F2933]">{work_a.work_category}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Agency:</span>
                  <span className="text-[#1F2933] truncate max-w-[180px]">{work_a.implementing_agency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sanctioned:</span>
                  <strong className="text-[#1F2933]">₹{((work_a.sanctioned_amount || 0) / 100000).toFixed(2)}L</strong>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-semibold text-[#1F2933]">{work_a.physical_progress}% phys</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectWork(work_a.work_id)}
              className="btn-secondary w-full py-1 text-xs font-medium inline-flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Full Work A Dossier</span>
            </button>
          </div>

          {/* Work B */}
          <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#C8754D] uppercase tracking-wider text-[11px]">Suspected Match (Work B)</span>
                <span className="font-mono text-[#667085] text-[10px]">{work_b.work_id}</span>
              </div>
              <h4 className="text-sm font-bold text-[#1F2933] leading-snug mb-2">
                {work_b.work_title}
              </h4>
              <div className="space-y-1 text-xs text-[#667085]">
                <div className="flex justify-between">
                  <span>Category:</span>
                  <strong className="text-[#1F2933]">{work_b.work_category}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Agency:</span>
                  <span className="text-[#1F2933] truncate max-w-[180px]">{work_b.implementing_agency}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sanctioned:</span>
                  <strong className="text-[#1F2933]">₹{((work_b.sanctioned_amount || 0) / 100000).toFixed(2)}L</strong>
                </div>
                <div className="flex justify-between">
                  <span>Progress:</span>
                  <span className="font-semibold text-[#1F2933]">{work_b.physical_progress}% phys</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectWork(work_b.work_id)}
              className="btn-secondary w-full py-1 text-xs font-medium inline-flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect Full Work B Dossier</span>
            </button>
          </div>

        </div>

        {/* Empirical Overlap Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg bg-white border border-[#E4E7EC] text-center">
            <span className="text-[10px] text-[#667085] block font-medium">Text Similarity</span>
            <strong className="text-sm text-[#1F2933] font-mono">{text_similarity}%</strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E4E7EC] text-center">
            <span className="text-[10px] text-[#667085] block font-medium">Spatial Distance</span>
            <strong className="text-sm text-[#1F2933] font-mono">{distance_meters} m</strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E4E7EC] text-center">
            <span className="text-[10px] text-[#667085] block font-medium">Implementing Agency</span>
            <strong className={`text-sm ${same_agency ? 'text-[#B58532]' : 'text-[#475467]'}`}>
              {same_agency ? 'Identical' : 'Different'}
            </strong>
          </div>
          <div className="p-3 rounded-lg bg-white border border-[#E4E7EC] text-center">
            <span className="text-[10px] text-[#667085] block font-medium">Duplicate Index</span>
            <strong className="text-sm text-[#B85C5C] font-mono">{combined_score}%</strong>
          </div>
        </div>

        {/* Synchronized Spatial Map */}
        <div className="h-56 sm:h-64 rounded-lg overflow-hidden border border-[#E4E7EC] relative z-0">
          <MapContainer
            center={[centerLat, centerLon]}
            zoom={18}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[work_a.latitude, work_a.longitude]}>
              <Popup>
                <div className="text-xs">
                  <strong>Work A: {work_a.work_id}</strong><br />
                  {work_a.work_title}
                </div>
              </Popup>
            </Marker>
            <Marker position={[work_b.latitude, work_b.longitude]}>
              <Popup>
                <div className="text-xs">
                  <strong>Work B: {work_b.work_id}</strong><br />
                  {work_b.work_title}
                </div>
              </Popup>
            </Marker>
            <Polyline
              positions={[
                [work_a.latitude, work_a.longitude],
                [work_b.latitude, work_b.longitude]
              ]}
              color="#B85C5C"
              dashArray="4, 6"
            />
          </MapContainer>
        </div>

        {/* Verification Action Directives */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E4E7EC]">
          <span className="text-xs text-[#667085]">
            Administrative Determination for District Authority:
          </span>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => markStatus('LEGITIMATE_SEPARATE')}
              className={`btn-secondary text-xs py-1.5 px-3 ${
                currentStatus === 'LEGITIMATE_SEPARATE' ? 'bg-[#F2F8F4] border-[#D8EADB] text-[#487A5E] font-bold' : ''
              }`}
            >
              <Check className="w-3.5 h-3.5 inline mr-1" />
              Mark Legitimate Separate Asset
            </button>
            <button
              onClick={() => markStatus('VERIFIED_DUPLICATE')}
              className={`btn-primary text-xs py-1.5 px-3 ${
                currentStatus === 'VERIFIED_DUPLICATE' ? 'bg-[#B85C5C] hover:bg-[#912018]' : ''
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 inline mr-1" />
              Order Spot Verification
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
