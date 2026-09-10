import React, { useState, useMemo } from 'react';
import RiskBadge from './RiskBadge';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Filter, Eye, ChevronRight } from 'lucide-react';

export default function RiskMapView({ works = [], onSelectWork }) {
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeWork, setActiveWork] = useState(null);

  const validWorks = useMemo(() => works.filter((w) => w.latitude && w.longitude), [works]);
  const districts = useMemo(() => Array.from(new Set(validWorks.map((w) => w.district))).filter(Boolean), [validWorks]);
  const categories = useMemo(() => Array.from(new Set(validWorks.map((w) => w.work_category))).filter(Boolean), [validWorks]);

  const filtered = useMemo(() => {
    return validWorks.filter((w) => {
      if (selectedRisk === 'CRITICAL' && w.overall_risk_score < 80) return false;
      if (selectedRisk === 'HIGH' && (w.overall_risk_score < 60 || w.overall_risk_score >= 80)) return false;
      if (selectedRisk === 'MEDIUM' && (w.overall_risk_score < 30 || w.overall_risk_score >= 60)) return false;
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

  const defaultCenter = [24.5, 76.5];

  return (
    <div className="space-y-4">
      
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-[#1F2933] tracking-tight">
          Geospatial Risk Intelligence
        </h2>
        <p className="text-xs text-[#667085]">
          Spatial distribution of monitored works color-coded by empirical risk tier.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="gov-card p-3 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="CRITICAL">Critical (80+)</option>
            <option value="HIGH">High (60–79)</option>
            <option value="MEDIUM">Medium (30–59)</option>
          </select>

          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2.5 py-1.5 focus:outline-none"
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
            className="bg-[#F9FAFB] text-[#1F2933] text-xs rounded border border-[#D0D5DD] px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

        <div className="flex items-center gap-4 text-xs text-[#667085]">
          <span>Displaying <strong>{filtered.length}</strong> works</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#B85C5C]" /> Critical
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C8754D]" /> High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C49A4A]" /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5F8D73]" /> Low
            </span>
          </div>
        </div>
      </div>

      {/* Map + Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Map */}
        <div className="lg:col-span-2 gov-card h-[540px] overflow-hidden relative z-0">
          <MapContainer
            center={defaultCenter}
            zoom={6}
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
                radius={work.overall_risk_score >= 80 ? 8 : work.overall_risk_score >= 60 ? 6 : 4}
                fillColor={getMarkerColor(work.overall_risk_score)}
                color="#FFFFFF"
                weight={1.5}
                opacity={0.9}
                fillOpacity={0.85}
                eventHandlers={{
                  click: () => setActiveWork(work),
                }}
              >
                <Popup>
                  <div className="p-1 space-y-1 min-w-[200px] text-xs">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-[10px] text-[#667085]">{work.work_id}</span>
                      <RiskBadge score={work.overall_risk_score} level={work.risk_level} />
                    </div>
                    <div className="font-semibold text-[#1F2933]">{work.work_title}</div>
                    <div className="text-[11px] text-[#667085]">{work.district} · ₹{(work.sanctioned_amount / 100000).toFixed(2)}L</div>
                    <button
                      onClick={() => onSelectWork(work.work_id)}
                      className="w-full mt-2 btn-secondary py-1 text-[11px] font-medium text-center"
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
        <div className="gov-card p-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-semibold text-[#1F2933] uppercase tracking-wider mb-2">
              Work Location Profile
            </h3>

            {activeWork ? (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-mono text-xs text-[#667085]">{activeWork.work_id}</span>
                    <RiskBadge score={activeWork.overall_risk_score} level={activeWork.risk_level} />
                  </div>
                  <h4 className="text-sm font-semibold text-[#1F2933] leading-snug">
                    {activeWork.work_title}
                  </h4>
                  <p className="text-xs text-[#667085] mt-0.5">
                    {activeWork.district}, {activeWork.state}
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-[#475467] py-2 border-y border-[#E4E7EC]">
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Category:</span>
                    <span className="font-medium text-[#1F2933]">{activeWork.work_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Sanctioned Amount:</span>
                    <span className="font-medium text-[#1F2933]">₹{(activeWork.sanctioned_amount / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Progress:</span>
                    <span className="font-medium text-[#1F2933]">{activeWork.physical_progress}% phys / {activeWork.financial_progress}% fin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#667085]">Primary Signal:</span>
                    <span className="font-medium text-[#B85C5C]">{activeWork.primary_risk_factor}</span>
                  </div>
                </div>

                {activeWork.evidence_summary && activeWork.evidence_summary[0] && (
                  <div className="text-xs text-[#475467] bg-[#F9FAFB] p-2.5 rounded border border-[#EAECF0]">
                    <span className="font-semibold text-[#1F2933] block mb-0.5">Key Alert Reason:</span>
                    {activeWork.evidence_summary[0]}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-[#667085]">
                <MapPin className="w-8 h-8 text-[#D0D5DD] mx-auto mb-2" />
                <p className="text-xs">
                  Click any marker on the map to preview work metrics and evidence.
                </p>
              </div>
            )}
          </div>

          {activeWork && (
            <button
              onClick={() => onSelectWork(activeWork.work_id)}
              className="btn-primary w-full text-xs mt-4 flex items-center justify-center gap-1.5"
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
