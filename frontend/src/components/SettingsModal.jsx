import React, { useState } from 'react';
import { X, Sliders, CheckCircle2, RotateCcw } from 'lucide-react';
import { recalculateRiskWeights } from '../api/client';

export default function SettingsModal({ isOpen, onClose, onWeightsApplied }) {
  const [finWeight, setFinWeight] = useState(30);
  const [delayWeight, setDelayWeight] = useState(30);
  const [dupWeight, setDupWeight] = useState(25);
  const [compWeight, setCompWeight] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const total = finWeight + delayWeight + dupWeight + compWeight;

  const handleApply = async () => {
    setIsSubmitting(true);
    setSuccessMsg('');
    try {
      await recalculateRiskWeights({
        weight_financial: finWeight,
        weight_delay: delayWeight,
        weight_duplicate: dupWeight,
        weight_compliance: compWeight
      });
      setSuccessMsg('Policy weights recalculated successfully across all records.');
      setTimeout(() => {
        onWeightsApplied();
        onClose();
      }, 900);
    } catch (err) {
      alert('Failed to recalculate: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFinWeight(30);
    setDelayWeight(30);
    setDupWeight(25);
    setCompWeight(15);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
      <div className="bg-white border border-[#E4E7EC] rounded-xl w-full max-w-lg shadow-xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E7EC] mb-5">
          <div>
            <h3 className="text-base font-semibold text-[#1F2933]">
              Risk Engine Policy Weights
            </h3>
            <p className="text-xs text-[#667085]">
              Configure risk module weights to calibrate the Unified Risk Scoring model.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#667085] hover:text-[#1F2933] hover:bg-[#F2F4F7]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 text-xs">
          
          <div>
            <div className="flex justify-between font-medium text-[#1F2933] mb-1">
              <span>Financial & Cost Anomaly Weight</span>
              <span className="font-mono text-[#183B56]">{finWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={finWeight}
              onChange={(e) => setFinWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#1F2933] mb-1">
              <span>Delay & Stagnation Weight</span>
              <span className="font-mono text-[#183B56]">{delayWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#1F2933] mb-1">
              <span>Duplicate / Overlap Weight</span>
              <span className="font-mono text-[#183B56]">{dupWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={dupWeight}
              onChange={(e) => setDupWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between font-medium text-[#1F2933] mb-1">
              <span>Compliance & Documentation Weight</span>
              <span className="font-mono text-[#183B56]">{compWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={compWeight}
              onChange={(e) => setCompWeight(Number(e.target.value))}
              className="w-full accent-[#183B56] cursor-pointer"
            />
          </div>

        </div>

        {/* Total Metric */}
        <div className="mt-5 p-3 rounded-lg bg-[#F9FAFB] border border-[#EAECF0] flex items-center justify-between text-xs">
          <span className="text-[#667085]">Total Weight Sum:</span>
          <span className={`font-mono font-bold ${total === 100 ? 'text-[#487A5E]' : 'text-[#B58532]'}`}>
            {total}% {total === 100 ? '(Balanced)' : '(Scaled)'}
          </span>
        </div>

        {successMsg && (
          <div className="mt-3 p-2 rounded bg-[#F2F8F4] border border-[#D8EADB] text-[#487A5E] text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E4E7EC]">
          <button
            onClick={handleReset}
            className="text-xs text-[#667085] hover:text-[#1F2933] flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              disabled={isSubmitting}
              onClick={handleApply}
              className="btn-primary text-xs"
            >
              {isSubmitting ? 'Recalculating...' : 'Apply & Recalculate'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
