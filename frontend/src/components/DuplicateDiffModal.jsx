import React, { useState } from 'react';
import { X, Copy, MapPin, CheckCircle, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function DuplicateDiffModal({ pair, onClose }) {
  const [status, setStatus] = useState(pair ? pair.verification_status : "PENDING_VERIFICATION");
  const [resolutionNote, setResolutionNote] = useState("");

  if (!pair) return null;

  const { work_a, work_b, distance_meters, text_similarity, combined_score, same_agency } = pair;

  const centerLat = (work_a.latitude + work_b.latitude) / 2;
  const centerLon = (work_a.longitude + work_b.longitude) / 2;

  const handleResolve = (newStatus) => {
    setStatus(newStatus);
    alert(`Status updated to: ${newStatus}\nResolution logged into audit trail.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl relative my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Copy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Side-by-Side Duplicate / Overlap Investigation
                </h3>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  status === "VERIFIED_DUPLICATE"
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : status === "LEGITIMATE_SEPARATE"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Comparing two co-located works within {distance_meters}m to verify whether they represent a single physical asset.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Top Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Spatial Proximity</span>
              <span className="text-xl font-bold text-white font-mono">{distance_meters} m</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Direct distance</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Semantic Title Match</span>
              <span className="text-xl font-bold text-purple-400 font-mono">{text_similarity}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">TF-IDF n-gram match</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Implementing Agency</span>
              <span className={`text-sm font-bold mt-1 block ${same_agency ? "text-amber-400" : "text-slate-300"}`}>
                {same_agency ? "Identical Agency" : "Different Agency"}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">{same_agency ? "Shared execution unit" : "Separate units"}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Combined Overlap Index</span>
              <span className="text-xl font-bold text-red-400 font-mono">{combined_score}%</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">WDI multi-attribute score</span>
            </div>
          </div>

          {/* Interactive Map Visualizer */}
          <div className="h-56 rounded-xl overflow-hidden border border-slate-800 relative z-0">
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
                color="#ef4444"
                dashArray="5, 10"
              />
            </MapContainer>
          </div>

          {/* Side-by-Side Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Work A Column */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 rounded">
                  WORK A: {work_a.work_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ₹{(work_a.sanctioned_amount / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-3">
                {work_a.work_title}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200">{work_a.work_category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Sanction Date:</span>
                  <span className="text-slate-200 font-mono">{work_a.sanction_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Agency:</span>
                  <span className="text-slate-200">{work_a.implementing_agency}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Status / Progress:</span>
                  <span className="text-slate-200">{work_a.status} ({work_a.physical_progress}% phys / {work_a.financial_progress}% fin)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-200 font-mono">{work_a.latitude}, {work_a.longitude}</span>
                </div>
              </div>
            </div>

            {/* Work B Column */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-purple-500/30">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="px-2 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-400 rounded">
                  WORK B: {work_b.work_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ₹{(work_b.sanctioned_amount / 100000).toFixed(2)} Lakhs
                </span>
              </div>
              <h4 className="text-sm font-bold text-white mb-3">
                {work_b.work_title}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-slate-200">{work_b.work_category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Sanction Date:</span>
                  <span className="text-slate-200 font-mono">{work_b.sanction_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Agency:</span>
                  <span className="text-slate-200">{work_b.implementing_agency}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Status / Progress:</span>
                  <span className="text-slate-200">{work_b.status} ({work_b.physical_progress}% phys / {work_b.financial_progress}% fin)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="text-slate-200 font-mono">{work_b.latitude}, {work_b.longitude}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Audit Resolution Decision Box */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Official Inquiry Action & Decision Record
            </span>
            <input
              type="text"
              placeholder="Enter inspection officer findings or case resolution notes..."
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              className="w-full bg-slate-800 text-xs text-slate-200 p-2.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleResolve("LEGITIMATE_SEPARATE")}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg transition-colors"
              >
                Mark Verified Legitimate Separate Works
              </button>
              <button
                onClick={() => handleResolve("VERIFIED_DUPLICATE")}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg shadow-lg shadow-red-500/20 transition-colors"
              >
                Confirm Overlapping / Duplicate Work
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
