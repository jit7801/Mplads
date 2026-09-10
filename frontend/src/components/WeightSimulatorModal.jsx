import React, { useState } from 'react';
import { X, Sliders, RefreshCw, CheckCircle2, Sparkles, HelpCircle } from 'lucide-react';
import { recalculateRiskWeights } from '../api/client';

export default function WeightSimulatorModal({ isOpen, onClose, onWeightsApplied }) {
  const [finWeight, setFinWeight] = useState(30);
  const [delayWeight, setDelayWeight] = useState(30);
  const [dupWeight, setDupWeight] = useState(25);
  const [compWeight, setCompWeight] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const total = finWeight + delayWeight + dupWeight + compWeight;

  const handleApply = async () => {
    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      await recalculateRiskWeights({
        weight_financial: finWeight,
        weight_delay: delayWeight,
        weight_duplicate: dupWeight,
        weight_compliance: compWeight
      });
      setSuccessMsg("Risk weights recalculated across all 520 projects!");
      setTimeout(() => {
        onWeightsApplied();
        onClose();
      }, 1000);
    } catch (err) {
      alert("Failed to recalculate: " + err.message);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#111827] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Judge Interactive Policy Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Adjust module weights to test dynamic risk re-scoring.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders Container */}
        <div className="space-y-4">
          
          {/* Financial Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Financial & Cost Anomaly Weight</span>
              <span className="text-amber-400 font-mono">{finWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={finWeight}
              onChange={(e) => setFinWeight(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Delay Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Delay & Stagnation Weight</span>
              <span className="text-orange-400 font-mono">{delayWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={delayWeight}
              onChange={(e) => setDelayWeight(Number(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
          </div>

          {/* Duplicate Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Duplicate / Overlap Weight</span>
              <span className="text-purple-400 font-mono">{dupWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={dupWeight}
              onChange={(e) => setDupWeight(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
          </div>

          {/* Compliance Weight */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-300">Compliance & Certificates Weight</span>
              <span className="text-rose-400 font-mono">{compWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={compWeight}
              onChange={(e) => setCompWeight(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>

        </div>

        {/* Total & Feedback */}
        <div className="mt-5 p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">Total Normalized Weight:</span>
          <span className={`font-mono font-bold text-sm ${total === 100 ? "text-emerald-400" : "text-amber-400"}`}>
            {total}% {total === 100 ? "(Balanced)" : "(Scaled)"}
          </span>
        </div>

        {successMsg && (
          <div className="mt-3 p-2.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center flex items-center justify-center gap-1.5 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 mt-5">
          <button
            onClick={handleReset}
            className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Reset to Standard Defaults
          </button>
          <button
            disabled={isSubmitting}
            onClick={handleApply}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>Recalculate System</span>
          </button>
        </div>

      </div>
    </div>
  );
}
