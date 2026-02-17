/**
 * Control Panel for Bohr Atom Module
 */

import React from 'react';
import { useQuantumStore } from '../../store/useQuantumStore';
import { bohrEnergy, bohrRadius, bohrVelocity, rydbergWavelengthNm, transitionEnergy } from '../../physics';

export const BohrAtomControls: React.FC = () => {
  const {
    bohrAtom: { n, targetN, isAnimating, showOrbits, animationSpeed },
    setBohrN,
    setBohrTargetN,
    toggleBohrAnimation,
    toggleBohrOrbits,
    triggerTransition,
    resetBohrAtom,
    setAnimationSpeed,
  } = useQuantumStore();

  // Calculate transition data
  const canTransition = n !== targetN;
  const ni = Math.max(n, targetN);
  const nf = Math.min(n, targetN);
  const transitionWavelength = canTransition ? rydbergWavelengthNm(ni, nf) : 0;
  const transitionEnergyValue = canTransition ? transitionEnergy(ni, nf) : 0;

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-6">
      <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
        Controls
      </h3>

      {/* Principal Quantum Number Slider */}
      <div className="space-y-2">
        <label className="flex justify-between text-sm text-slate-300">
          <span>Principal Quantum Number (n)</span>
          <span className="font-mono text-blue-400">{n}</span>
        </label>
        <input
          type="range"
          min={1}
          max={6}
          value={n}
          onChange={(e) => setBohrN(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
          <span>6</span>
        </div>
      </div>

      {/* Target Level for Transition */}
      <div className="space-y-2">
        <label className="flex justify-between text-sm text-slate-300">
          <span>Target Level (for transition)</span>
          <span className="font-mono text-amber-400">{targetN}</span>
        </label>
        <input
          type="range"
          min={1}
          max={6}
          value={targetN}
          onChange={(e) => setBohrTargetN(parseInt(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Transition Button */}
      <button
        onClick={triggerTransition}
        disabled={!canTransition}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
          canTransition
            ? 'bg-amber-600 hover:bg-amber-500 text-white'
            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
        }`}
      >
        {canTransition
          ? `Emit Photon: n=${n} → n=${targetN}`
          : 'Select different target level'}
      </button>

      {/* Transition Info */}
      {canTransition && (
        <div className="bg-slate-900 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-amber-400">Transition Details</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <span className="text-slate-400">Wavelength:</span>
            <span className="text-white font-mono">{transitionWavelength.toFixed(2)} nm</span>
            <span className="text-slate-400">Energy:</span>
            <span className="text-white font-mono">{transitionEnergyValue.toFixed(3)} eV</span>
          </div>
        </div>
      )}

      {/* Toggle Switches */}
      <div className="space-y-3">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-300">Orbit Animation</span>
          <div 
            className={`w-12 h-6 rounded-full transition-colors ${isAnimating ? 'bg-blue-600' : 'bg-slate-600'}`}
            onClick={toggleBohrAnimation}
          >
            <div 
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                isAnimating ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-300">Show All Orbits</span>
          <div 
            className={`w-12 h-6 rounded-full transition-colors ${showOrbits ? 'bg-blue-600' : 'bg-slate-600'}`}
            onClick={toggleBohrOrbits}
          >
            <div 
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                showOrbits ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </div>
        </label>

        {/* Animation Speed Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Animation Speed</span>
          <div className="flex rounded-lg overflow-hidden border border-slate-600">
            <button
              onClick={() => setAnimationSpeed('slow')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                animationSpeed === 'slow'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Slow
            </button>
            <button
              onClick={() => setAnimationSpeed('normal')}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                animationSpeed === 'normal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Normal
            </button>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetBohrAtom}
        className="w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
      >
        Reset
      </button>

      {/* Current State Info */}
      <div className="bg-slate-900 rounded-lg p-4 space-y-2">
        <h4 className="text-sm font-medium text-blue-400">Current State (n={n})</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <span className="text-slate-400">Energy:</span>
          <span className="text-white font-mono">{bohrEnergy(n).toFixed(3)} eV</span>
          <span className="text-slate-400">Radius:</span>
          <span className="text-white font-mono">{(bohrRadius(n) * 1e10).toFixed(3)} Å</span>
          <span className="text-slate-400">Velocity:</span>
          <span className="text-white font-mono">{(bohrVelocity(n) / 1e6).toFixed(2)} Mm/s</span>
        </div>
      </div>
    </div>
  );
};

export default BohrAtomControls;
