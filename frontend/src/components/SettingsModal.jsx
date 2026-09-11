import React, { useState, useEffect } from 'react';
import { X, Sliders, CheckCircle2, RotateCcw, AlertTriangle, Save } from 'lucide-react';
import { recalculateRiskWeights } from '../api/client';
import { useToast } from './Toast';

export default function SettingsModal({ isOpen, onClose, onWeightsApplied }) {
  const { addToast } = useToast();
  const [finWeight, setFinWeight] = useState(30);
  const [delayWeight, setDelayWeight] = useState(30);
  const [dupWeight, setDupWeight] = useState(25);
  const [compWeight, setCompWeight] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const total = finWeight + delayWeight + dupWeight + compWeight;
  const isValidTotal = total === 100;

  const handleApply = async () => {
    if (!isValidTotal) {
      addToast(`Total policy weights must sum to exactly 100%. Current total: ${total}%.`, 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await recalculateRiskWeights({
        weight_financial: finWeight,
        weight_delay: delayWeight,
        weight_duplicate: dupWeight,
        weight_compliance: compWeight
      });
      addToast('Policy weights updated and risk pipeline recalculated.', 'success');
      if (onWeightsApplied) onWeightsApplied();
      onClose();
    } catch (err) {
      addToast('Failed to recalculate: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFinWeight(30);
    setDelayWeight(30);
    setDupWeight(25);
    setCompWeight(15);
    addToast('Weights reset to baseline statutory defaults (30/30/25/15).', 'info');
  };

  const handleNormalize = () => {
    if (total === 0) return;
    const factor = 100 / total;
    const newFin = Math.round(finWeight * factor);
    const newDelay = Math.round(delayWeight * factor);
    const newDup = Math.round(dupWeight * factor);
    const newComp = 100 - (newFin + newDelay + newDup);
    setFinWeight(newFin);
    setDelayWeight(newDelay);
    setDupWeight(newDup);
    setCompWeight(newComp);
    addToast('Weights normalized to 100%.', 'info');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-3 sm:p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E7EC] bg-[#F9FAFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1F2933]">
                Risk Engine Policy Weights
              </h3>
              <p className="text-[11px] text-[#667085]">
                Calibrate the multi-dimensional Unified Risk Scoring weights.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#667085] hover:text-[#1F2933] hover:bg-[#EAECF0]"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders Container */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Total Weight Status Header */}
          <div className={`p-3 rounded-lg flex items-center justify-between border ${
            isValidTotal 
              ? 'bg-[#F2F8F4] border-[#D8EADB] text-[#1A4B30]' 
              : 'bg-[#FEF9EE] border-[#F9ECCB] text-[#7A4D05]'
          }`}>
            <div className="flex items-center gap-2">
              {isValidTotal ? (
                <CheckCircle2 className="w-4 h-4 text-[#487A5E] shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#C49A4A] shrink-0" />
              )}
              <span className="font-semibold">
                Total Weight: <strong className="font-mono">{total}%</strong> {isValidTotal ? '(Valid 100%)' : '(Must sum to 100%)'}
              </span>
            </div>
            {!isValidTotal && (
              <button
                onClick={handleNormalize}
                className="btn-secondary py-0.5 px-2 text-[11px] font-semibold bg-white"
              >
                Auto-Balance
              </button>
            )}
          </div>

          {/* 1. Financial Weight */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-[#1F2933]">
              <span>Financial & Cost Anomaly Weight</span>
              <span className="font-mono text-[#183B56]">{finWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={finWeight}
              onChange={(e) => setFinWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
            <span className="text-[10px] text-[#667085] block">
              Evaluates cost outliers vs peer group median and high Modified Z-scores.
            </span>
          </div>

          {/* 2. Delay Weight */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-[#1F2933]">
              <span>Delay & Progress Divergence Weight</span>
              <span className="font-mono text-[#183B56]">{delayWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
            <span className="text-[10px] text-[#667085] block">
              Evaluates expenditure vs physical completion gaps and dormancy days.
            </span>
          </div>

          {/* 3. Duplicate Weight */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-[#1F2933]">
              <span>Geospatial Duplicate Overlap Weight</span>
              <span className="font-mono text-[#183B56]">{dupWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={dupWeight}
              onChange={(e) => setDupWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
            <span className="text-[10px] text-[#667085] block">
              Evaluates spatial proximity (&lt;150m) and TF-IDF semantic title similarity.
            </span>
          </div>

          {/* 4. Compliance Weight */}
          <div className="space-y-1">
            <div className="flex justify-between font-semibold text-[#1F2933]">
              <span>Compliance & Documentation Deficit</span>
              <span className="font-mono text-[#183B56]">{compWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={compWeight}
              onChange={(e) => setCompWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
            <span className="text-[10px] text-[#667085] block">
              Evaluates missing milestone dates, geotagging gaps, and sanction records.
            </span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E4E7EC] bg-[#F9FAFB] flex items-center justify-between">
          <button
            onClick={handleReset}
            className="btn-secondary text-xs flex items-center gap-1 py-1.5"
            title="Reset weights to default values"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#667085]" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={isSubmitting || !isValidTotal}
              className="btn-primary text-xs flex items-center gap-1.5 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Recalculating...' : 'Apply & Recalculate'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
