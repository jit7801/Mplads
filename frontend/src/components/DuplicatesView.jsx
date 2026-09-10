import React, { useState } from 'react';
import { Copy, MapPin, CheckCircle, AlertCircle, ArrowRight, ShieldAlert, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DuplicatesView({ pairs = [], onSelectWork }) {
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
  const { work_a, work_b, distance_meters, text_similarity, combined_score, same_agency, same_category } = activePair;

  const centerLat = (work_a.latitude + work_b.latitude) / 2;
  const centerLon = (work_a.longitude + work_b.longitude) / 2;

  const pairId = activePair.pair_id;
  const currentStatus = resolutionStatus[pairId] || activePair.verification_status || 'PENDING_VERIFICATION';

  const markStatus = (newStatus) => {
    setResolutionStatus((prev) => ({ ...prev, [pairId]: newStatus }));
  };

  return (
    <div className="space-y-5">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
            Possible Duplicate & Overlapping Work Candidates
          </h2>
          <p className="text-xs text-[#667085]">
            Investigate co-located infrastructure works with high textual similarity to verify if they represent a single physical asset.
          </p>
        </div>

        <span className="text-xs text-[#667085] self-start sm:self-center">
          Showing pair <strong className="text-[#1F2933]">{selectedPairIndex + 1}</strong> of <strong className="text-[#1F2933]">{pairs.length}</strong>
        </span>
      </div>

      {/* Candidate Pair Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {pairs.map((p, idx) => (
          <button
            key={p.pair_id}
            onClick={() => setSelectedPairIndex(idx)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md border whitespace-nowrap transition-colors ${
              selectedPairIndex === idx
                ? 'bg-[#183B56] text-white border-[#183B56]'
                : 'bg-white text-[#475467] border-[#D0D5DD] hover:bg-[#F9FAFB]'
            }`}
          >
            Pair #{idx + 1} ({p.distance_meters}m · {p.text_similarity}% match)
          </button>
        ))}
      </div>

      {/* Main Side-by-Side Comparison Workspace (Section 14) */}
      <div className="gov-card p-6 space-y-6">
        
        {/* Top Status Alert */}
        <div className="p-3.5 rounded-lg bg-[#FEF9EE] border border-[#F9ECCB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B58532]" />
            <span className="text-xs font-semibold text-[#B58532]">
              Possible overlap — requires administrative verification
            </span>
          </div>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
            currentStatus === 'VERIFIED_DUPLICATE'
              ? 'bg-[#FDF2F2] text-[#B85C5C] border-[#F8D7DA]'
              : currentStatus === 'LEGITIMATE_SEPARATE'
              ? 'bg-[#F2F8F4] text-[#487A5E] border-[#D8EADB]'
              : 'bg-white text-[#667085] border-[#E4E7EC]'
          }`}>
            Status: {currentStatus.replace('_', ' ')}
          </span>
        </div>

        {/* Side-by-Side Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* WORK A */}
          <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#183B56]">WORK A</span>
              <span className="font-mono text-xs text-[#667085]">{work_a.work_id}</span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1F2933] leading-snug">
                {work_a.work_title}
              </h4>
              <p className="text-xs text-[#667085] mt-1 font-mono">
                Sanctioned: <strong>₹{(work_a.sanctioned_amount / 100000).toFixed(2)} Lakhs</strong>
              </p>
            </div>

            <div className="space-y-1 text-xs text-[#475467] pt-2 border-t border-[#EAECF0]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Category:</span>
                <span>{work_a.work_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Agency:</span>
                <span className="truncate max-w-[180px]">{work_a.implementing_agency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Progress:</span>
                <span>{work_a.physical_progress}% phys / {work_a.financial_progress}% fin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Location:</span>
                <span>{work_a.village || work_a.district}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectWork(work_a.work_id)}
              className="text-xs font-medium text-[#183B56] hover:underline pt-1 inline-block"
            >
              Open Work A Dossier →
            </button>
          </div>

          {/* WORK B */}
          <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC]">
              <span className="text-xs font-bold text-[#2F6F8F]">WORK B</span>
              <span className="font-mono text-xs text-[#667085]">{work_b.work_id}</span>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#1F2933] leading-snug">
                {work_b.work_title}
              </h4>
              <p className="text-xs text-[#667085] mt-1 font-mono">
                Sanctioned: <strong>₹{(work_b.sanctioned_amount / 100000).toFixed(2)} Lakhs</strong>
              </p>
            </div>

            <div className="space-y-1 text-xs text-[#475467] pt-2 border-t border-[#EAECF0]">
              <div className="flex justify-between">
                <span className="text-[#667085]">Category:</span>
                <span>{work_b.work_category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Agency:</span>
                <span className="truncate max-w-[180px]">{work_b.implementing_agency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Progress:</span>
                <span>{work_b.physical_progress}% phys / {work_b.financial_progress}% fin</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#667085]">Location:</span>
                <span>{work_b.village || work_b.district}</span>
              </div>
            </div>

            <button
              onClick={() => onSelectWork(work_b.work_id)}
              className="text-xs font-medium text-[#2F6F8F] hover:underline pt-1 inline-block"
            >
              Open Work B Dossier →
            </button>
          </div>

        </div>

        {/* Evidence Comparison Strip (Section 14) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-2.5 rounded bg-white border border-[#E4E7EC] text-center">
            <span className="text-[11px] text-[#667085] block">Title Similarity</span>
            <strong className="text-sm text-[#1F2933] font-mono">{text_similarity}%</strong>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#E4E7EC] text-center">
            <span className="text-[11px] text-[#667085] block">Location Distance</span>
            <strong className="text-sm text-[#1F2933] font-mono">{distance_meters} m</strong>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#E4E7EC] text-center">
            <span className="text-[11px] text-[#667085] block">Agency Match</span>
            <strong className={`text-sm ${same_agency ? 'text-[#B58532]' : 'text-[#475467]'}`}>
              {same_agency ? 'Yes (Same)' : 'No (Different)'}
            </strong>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#E4E7EC] text-center">
            <span className="text-[11px] text-[#667085] block">Category Match</span>
            <strong className="text-sm text-[#1F2933]">
              {same_category ? 'Yes' : 'No'}
            </strong>
          </div>
          <div className="p-2.5 rounded bg-white border border-[#E4E7EC] text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] text-[#667085] block">Combined Index</span>
            <strong className="text-sm text-[#B85C5C] font-mono">{combined_score}%</strong>
          </div>
        </div>

        {/* Synchronized Spatial Map */}
        <div className="h-52 rounded-lg overflow-hidden border border-[#E4E7EC] relative z-0">
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

        {/* Verification Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E4E7EC]">
          <span className="text-xs text-[#667085]">
            Inspection Order Action for Junior Engineer:
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => markStatus('LEGITIMATE_SEPARATE')}
              className="btn-secondary text-xs"
            >
              Mark Legitimate Separate Asset
            </button>
            <button
              onClick={() => markStatus('VERIFIED_DUPLICATE')}
              className="btn-primary text-xs"
            >
              Order Spot Verification
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
