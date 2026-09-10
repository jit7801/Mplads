import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Filter, Eye, ChevronRight, RotateCcw, Building2, AlertTriangle, Layers } from 'lucide-react';
import { useToast } from './Toast';

export default function RiskMapView({ works = [], onSelectWork }) {
  const { addToast } = useToast();
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeWork, setActiveWork] = useState(null);
  const [mapCenterKey, setMapCenterKey] = useState(0);

  const validWorks = useMemo(() => works.filter((w) => w.latitude && w.longitude), [works]);
  const districts = useMemo(() => Array.from(new Set(validWorks.map((w) => w.district))).filter(Boolean).sort(), [validWorks]);
  const categories = useMemo(() => Array.from(new Set(validWorks.map((w) => w.work_category))).filter(Boolean).sort(), [validWorks]);

  const filtered = useMemo(() => {
    return validWorks.filter((w) => {
      if (selectedRisk === 'CRITICAL' && w.overall_risk_score < 80) return false;
      if (selectedRisk === 'HIGH' && (w.overall_risk_score < 60 || w.overall_risk_score >= 80)) return false;
      if (selectedRisk === 'MEDIUM' && (w.overall_risk_score < 30 || w.overall_risk_score >= 60)) return false;
      if (selectedRisk === 'LOW' && w.overall_risk_score >= 30) return false;
      if (selectedDistrict !== 'ALL' && w.district !== selectedDistrict) return false;
      if (selectedCategory !== 'ALL' && w.work_category !== selectedCategory) return false;
      return true;
    });
  }, [validWorks, selectedRisk, selectedDistrict, selectedCategory]);

  const getMarkerColor = (score) => {
    if (score >= 80) return '#B85C5C'; // Restrained Crimson
    if (score >= 60) return '#C8754D'; // Restrained Terracotta
    if (score >= 30) return '#C49A4A'; // Restrained Amber
    return '#5F8D73'; // Restrained Sage Green
  };

  const defaultCenter = [26.9124, 75.7873]; // Jaipur coordinates

  const resetFilters = () => {
    setSelectedRisk('ALL');
    setSelectedDistrict('ALL');
    setSelectedCategory('ALL');
    setActiveWork(null);
    setMapCenterKey((k) => k + 1);
    addToast('Map filters reset to default view.', 'info');
  };

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
            Geospatial Risk Intelligence
          </h2>
          <p className="text-xs text-[#667085]">
            Spatial distribution of monitored works color-coded by empirical risk tier across constituencies.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="btn-secondary flex items-center gap-1.5 py-1.5 text-xs font-medium self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#667085]" />
          <span>Reset Map View</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1 max-w-2xl">
          
          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-[#F9FAFB] text-[#1F2933] text-xs font-medium rounded-md border border-[#D0D5DD] px-2.5 py-2 focus:outline-none focus:border-[#183B56] cursor-pointer"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical (80+)</option>
            <option value="HIGH">High (60–79)</option>
            <option value="MEDIUM">Medium (30–59)</option>
            <option value="LOW">Low (0–29)</option>
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-[#F9FAFB] text-[#1F2933] text-xs font-medium rounded-md border border-[#D0D5DD] px-2.5 py-2 focus:outline-none focus:border-[#183B56] cursor-pointer"
          >
            <option value="ALL">All Districts</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-[#F9FAFB] text-[#1F2933] text-xs font-medium rounded-md border border-[#D0D5DD] px-2.5 py-2 focus:outline-none focus:border-[#183B56] cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085] pt-2 md:pt-0 border-t md:border-t-0 border-[#EAECF0]">
          <span className="font-semibold text-[#1F2933]">{filtered.length} visible works</span>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B85C5C]" /> Critical
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8754D]" /> High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C49A4A]" /> Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5F8D73]" /> Low
            </span>
          </div>
        </div>
      </div>

      {/* Map + Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Map View Container */}
        <div className="lg:col-span-2 gov-card h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden relative z-0">
          <MapContainer
            key={mapCenterKey}
            center={defaultCenter}
            zoom={7}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filtered.map((work) => (
              <CircleMarker
                key={work.work_id}
                center={[work.latitude, work.longitude]}
                radius={work.overall_risk_score >= 80 ? 8 : work.overall_risk_score >= 60 ? 6 : 4.5}
                fillColor={getMarkerColor(work.overall_risk_score)}
                color="#FFFFFF"
                weight={1.5}
                opacity={0.95}
                fillOpacity={0.85}
                eventHandlers={{
                  click: () => setActiveWork(work),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1.5 min-w-[210px] text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-[#667085]">{work.work_id}</span>
                      <RiskBadge score={work.overall_risk_score} level={work.risk_level} size="sm" />
                    </div>
                    <div className="font-bold text-[#1F2933]">{work.work_title}</div>
                    <div className="text-[11px] text-[#667085]">
                      {work.district}, {work.state} · ₹{((work.sanctioned_amount || 0) / 100000).toFixed(2)}L
                    </div>
                    <button
                      onClick={() => onSelectWork(work.work_id)}
                      className="btn-primary w-full py-1 text-xs font-semibold text-center mt-1"
                    >
                      Open Full Dossier
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Selected Work Inspection Panel */}
        <div className="gov-card p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#E4E7EC] mb-3">
              <h3 className="text-xs font-bold text-[#1F2933] uppercase tracking-wider">
                Work Location Profile
              </h3>
              {activeWork && (
                <button
                  onClick={() => setActiveWork(null)}
                  className="text-[11px] text-[#667085] hover:text-[#1F2933]"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {activeWork ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs text-[#667085]">{activeWork.work_id}</span>
                    <RiskBadge score={activeWork.overall_risk_score} level={activeWork.risk_level} />
                  </div>
                  <h4 className="text-sm font-bold text-[#1F2933] leading-snug">
                    {activeWork.work_title}
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {activeWork.district}, {activeWork.state}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-[#475467] py-2.5 border-y border-[#E4E7EC]">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Category:</span>
                    <span className="font-semibold text-[#1F2933]">{activeWork.work_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Sanctioned Fund:</span>
                    <span className="font-bold text-[#1F2933]">₹{((activeWork.sanctioned_amount || 0) / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Progress:</span>
                    <span className="font-semibold text-[#1F2933]">{activeWork.physical_progress}% phys / {activeWork.financial_progress}% fin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Primary Signal:</span>
                    <span className="font-bold text-[#B85C5C]">{activeWork.primary_risk_factor}</span>
                  </div>
                </div>

                {activeWork.evidence_summary && activeWork.evidence_summary[0] && (
                  <div className="text-xs text-[#475467] bg-[#F9FAFB] p-3 rounded-lg border border-[#EAECF0] space-y-1">
                    <span className="font-bold text-[#1F2933] block">Key Anomaly Reason:</span>
                    <p className="leading-relaxed">{activeWork.evidence_summary[0]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 sm:py-16 text-center text-[#667085] space-y-2">
                <MapPin className="w-10 h-10 text-[#D0D5DD] mx-auto" />
                <p className="text-xs font-medium text-[#1F2933]">
                  No project marker selected
                </p>
                <p className="text-[11px] text-[#667085] max-w-[200px] mx-auto">
                  Click any colored marker on the map to preview detailed metrics and evidence.
                </p>
              </div>
            )}
          </div>

          {activeWork && (
            <button
              onClick={() => onSelectWork(activeWork.work_id)}
              className="btn-primary w-full text-xs mt-4 py-2 flex items-center justify-center gap-1.5"
            >
              <span>Inspect Full Forensic Dossier</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
