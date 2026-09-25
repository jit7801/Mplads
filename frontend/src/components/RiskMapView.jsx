import React, { useState, useMemo, useEffect } from 'react';
import RiskBadge from './RiskBadge';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import { MapPin, Filter, Eye, ChevronRight, RotateCcw, Building2, AlertTriangle, Layers } from 'lucide-react';
import { useToast } from './Toast';
import { fetchWorks } from '../api/client';

export default function RiskMapView({ works = [], onSelectWork }) {
  const { addToast } = useToast();
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeWork, setActiveWork] = useState(null);
  const [mapCenterKey, setMapCenterKey] = useState(0);

  const [geoWorks, setGeoWorks] = useState([]);

  useEffect(() => {
    const passedGeos = works.filter((w) => w.latitude && w.longitude);
    if (passedGeos.length >= 100) {
      setGeoWorks(passedGeos);
    } else {
      fetchWorks({ has_coords: true, limit: 1000 })
        .then(res => {
          if (res.items && res.items.length > 0) {
            setGeoWorks(res.items);
          } else {
            setGeoWorks(passedGeos);
          }
        })
        .catch(err => {
          console.warn('Map geoWorks fetch fallback:', err);
          setGeoWorks(passedGeos);
        });
    }
  }, [works]);

  const validWorks = geoWorks;
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
    if (score >= 80) return '#C94C4C'; // Critical
    if (score >= 60) return '#C94C4C'; // High
    if (score >= 30) return '#E6A23C'; // Medium
    return '#2E8B57'; // Low
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
          <h2 className="text-lg sm:text-xl font-bold text-[#050505] tracking-tight">
            Geospatial Risk Intelligence
          </h2>
          <p className="text-xs text-[#5E5E5D] mt-0.5">
            Spatial distribution of monitored works color-coded by empirical risk tier across constituencies.
          </p>
        </div>

        <button
          onClick={resetFilters}
          className="btn-secondary flex items-center gap-1.5 py-2 px-3.5 text-xs font-medium rounded-xl hover:bg-[#F7F7F1] self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#AA896C]" />
          <span>Reset Map View</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="gov-card rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border border-[#E8E4DC] shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 max-w-2xl">
          
          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="w-full bg-[#F7F7F1] hover:bg-[#F2F0EB] text-[#050505] text-xs font-medium rounded-xl border border-[#D8D2C7] px-3 py-2.5 focus:outline-none focus:border-[#4B3C32] focus:bg-white cursor-pointer transition-colors"
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
            className="w-full bg-[#F7F7F1] hover:bg-[#F2F0EB] text-[#050505] text-xs font-medium rounded-xl border border-[#D8D2C7] px-3 py-2.5 focus:outline-none focus:border-[#4B3C32] focus:bg-white cursor-pointer transition-colors"
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
            className="w-full bg-[#F7F7F1] hover:bg-[#F2F0EB] text-[#050505] text-xs font-medium rounded-xl border border-[#D8D2C7] px-3 py-2.5 focus:outline-none focus:border-[#4B3C32] focus:bg-white cursor-pointer transition-colors"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#5E5E5D] pt-3 md:pt-0 border-t md:border-t-0 border-[#F2EFEB]">
          <span className="font-semibold text-[#050505]">{filtered.length} visible works</span>
          <div className="flex items-center gap-2.5 text-[11px]">
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C94C4C]" /> Critical
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#C94C4C] opacity-80" /> High
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E6A23C]" /> Medium
            </span>
            <span className="flex items-center gap-1 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E8B57]" /> Low
            </span>
          </div>
        </div>
      </div>

      {/* Map + Detail Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Map View Container */}
        <div className="lg:col-span-2 gov-card rounded-2xl h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden relative z-0 border border-[#E8E4DC] shadow-xs">
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
                  <div className="p-1.5 space-y-2 min-w-[220px] text-xs">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-[#8E8D8A]">{work.work_id}</span>
                      <RiskBadge score={work.overall_risk_score} level={work.risk_level} size="sm" />
                    </div>
                    <div className="font-bold text-[#050505] leading-snug">{work.work_title}</div>
                    <div className="text-[11px] text-[#5E5E5D]">
                      {work.district}, {work.state} · ₹{((work.sanctioned_amount || 0) / 100000).toFixed(2)}L
                    </div>
                    <button
                      onClick={() => onSelectWork(work.work_id)}
                      className="btn-primary w-full py-1.5 text-xs font-semibold text-center mt-1 rounded-xl"
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
        <div className="gov-card rounded-2xl p-5 border border-[#E8E4DC] shadow-xs flex flex-col justify-between bg-white">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4DC] mb-3.5">
              <h3 className="text-xs font-bold text-[#050505] uppercase tracking-wider">
                Work Location Profile
              </h3>
              {activeWork && (
                <button
                  onClick={() => setActiveWork(null)}
                  className="text-[11px] font-medium text-[#5E5E5D] hover:text-[#050505] transition-colors"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {activeWork ? (
              <div className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-mono text-xs text-[#8E8D8A]">{activeWork.work_id}</span>
                    <RiskBadge score={activeWork.overall_risk_score} level={activeWork.risk_level} />
                  </div>
                  <h4 className="text-sm font-bold text-[#050505] leading-snug">
                    {activeWork.work_title}
                  </h4>
                  <p className="text-xs text-[#5E5E5D] mt-0.5">
                    {activeWork.district}, {activeWork.state}
                  </p>
                </div>

                <div className="space-y-2 text-xs text-[#5E5E5D] py-3 border-y border-[#F2EFEB]">
                  <div className="flex justify-between">
                    <span className="text-[#8E8D8A]">Category:</span>
                    <span className="font-semibold text-[#050505]">{activeWork.work_category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8D8A]">Sanctioned Fund:</span>
                    <span className="font-bold text-[#050505]">₹{((activeWork.sanctioned_amount || 0) / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8D8A]">Progress:</span>
                    <span className="font-semibold text-[#050505]">{activeWork.physical_progress}% phys / {activeWork.financial_progress}% fin</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8D8A]">Primary Signal:</span>
                    <span className="font-bold text-[#C94C4C]">{activeWork.primary_risk_factor}</span>
                  </div>
                </div>

                {activeWork.evidence_summary && activeWork.evidence_summary[0] && (
                  <div className="text-xs text-[#5E5E5D] bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E8E4DC] space-y-1">
                    <span className="font-bold text-[#050505] block">Key Anomaly Reason:</span>
                    <p className="leading-relaxed">{activeWork.evidence_summary[0]}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-14 sm:py-20 text-center text-[#5E5E5D] space-y-2.5">
                <MapPin className="w-10 h-10 text-[#C8BFB3] mx-auto" />
                <p className="text-xs font-semibold text-[#050505]">
                  No project marker selected
                </p>
                <p className="text-[11px] text-[#8E8D8A] max-w-[210px] mx-auto leading-relaxed">
                  Click any colored marker on the map to preview detailed metrics and evidence.
                </p>
              </div>
            )}
          </div>

          {activeWork && (
            <button
              onClick={() => onSelectWork(activeWork.work_id)}
              className="btn-primary w-full text-xs mt-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5"
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
