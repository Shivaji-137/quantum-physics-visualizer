/**
 * Energy Level Diagram Component
 * Synchronized visualization showing Bohr energy levels with photon animation
 */

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuantumStore } from '../../store/useQuantumStore';
import { bohrEnergy, rydbergWavelengthNm, wavelengthToColor, ENERGY_LEVEL_COLORS } from '../../physics';

interface EnergyLevelDiagramProps {
  width: number;
  height: number;
}

export const EnergyLevelDiagram: React.FC<EnergyLevelDiagramProps> = ({ width, height }) => {
  const {
    bohrAtom: { n, targetN, isTransitioning },
    setBohrTargetN,
    triggerTransition,
  } = useQuantumStore();

  // Track photon animation state
  const [showPhoton, setShowPhoton] = useState(false);
  const [photonColor, setPhotonColor] = useState('#f59e0b');
  const [isEmission, setIsEmission] = useState(true);

  // Calculate energy levels
  const levels = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(level => ({
      n: level,
      energy: bohrEnergy(level),
      color: ENERGY_LEVEL_COLORS[level - 1],
    }));
  }, []);

  // Calculate y position for energy level (inverted: n=1 at bottom, n=6 at top)
  // Use sqrt scaling to spread out higher energy levels more
  const getYPosition = (energy: number) => {
    const minE = -13.6;  // Ground state
    const maxE = -0.4;   // Near ionization (n=6 level)
    const padding = 70;
    const usableHeight = height - 2 * padding;
    
    // Use sqrt scaling for better visual distribution
    const normalized = Math.sqrt(Math.abs(energy - maxE) / Math.abs(minE - maxE));
    return padding + normalized * usableHeight;
  };

  // Handle photon animation when transition starts
  useEffect(() => {
    if (isTransitioning && n !== targetN) {
      const ni = Math.max(n, targetN);
      const nf = Math.min(n, targetN);
      const wavelength = rydbergWavelengthNm(ni, nf);
      const color = wavelengthToColor(wavelength);
      
      setIsEmission(n > targetN);
      setPhotonColor(color);
      setShowPhoton(true);
      
      // Hide photon after animation completes
      const timer = setTimeout(() => {
        setShowPhoton(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, n, targetN]);

  const handleLevelClick = (level: number) => {
    if (level !== n && !isTransitioning) {
      setBohrTargetN(level);
    }
  };

  const handleTransition = () => {
    if (n !== targetN) {
      triggerTransition();
    }
  };

  // Photon start and end positions
  const photonStartY = getYPosition(bohrEnergy(n));
  const photonEndY = getYPosition(bohrEnergy(targetN));
  const photonX = (40 + width - 70) / 2 - 20;

  return (
    <div 
      className="relative bg-slate-900 rounded-lg border border-slate-700 overflow-hidden"
      style={{ width, height }}
    >
      {/* Title */}
      <div className="absolute top-4 left-4 text-sm font-semibold text-slate-300">
        Energy Levels
      </div>

      {/* Y-axis label */}
      <div 
        className="absolute left-2 text-xs text-slate-400"
        style={{ top: '50%', transform: 'rotate(-90deg) translateX(-50%)', transformOrigin: 'left center' }}
      >
        Energy (eV)
      </div>

      {/* Reference lines */}
      <svg className="absolute inset-0" style={{ width, height }}>
        {/* Zero energy line (ionization) */}
        <line
          x1={50}
          y1={getYPosition(0)}
          x2={width - 20}
          y2={getYPosition(0)}
          stroke="#475569"
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        <text
          x={width - 15}
          y={getYPosition(0)}
          fill="#64748b"
          fontSize={10}
          textAnchor="end"
          dominantBaseline="middle"
        >
          0 (ionized)
        </text>

        {/* Energy level lines */}
        {levels.map((level) => (
          <g key={level.n}>
            {/* Level line */}
            <line
              x1={40}
              y1={getYPosition(level.energy)}
              x2={width - 70}
              y2={getYPosition(level.energy)}
              stroke={level.n === n ? level.color : `${level.color}60`}
              strokeWidth={level.n === n ? 3 : 2}
              className="cursor-pointer transition-all duration-200 hover:brightness-125"
              onClick={() => handleLevelClick(level.n)}
            />
            
            {/* Level label - positioned to the left */}
            <text
              x={35}
              y={getYPosition(level.energy)}
              fill={level.n === n ? level.color : '#94a3b8'}
              fontSize={10}
              fontWeight={level.n === n ? 'bold' : 'normal'}
              textAnchor="end"
              dominantBaseline="middle"
            >
              n={level.n}
            </text>
            
            {/* Energy value - positioned to the right */}
            <text
              x={width - 65}
              y={getYPosition(level.energy)}
              fill={level.n === n ? '#e2e8f0' : '#64748b'}
              fontSize={9}
              textAnchor="start"
              dominantBaseline="middle"
            >
              {level.energy.toFixed(1)}
            </text>

            {/* Electron indicator */}
            {level.n === n && (
              <circle
                cx={(40 + width - 70) / 2}
                cy={getYPosition(level.energy)}
                r={6}
                fill={level.color}
                className="animate-pulse"
              >
                <title>Electron at n={level.n}</title>
              </circle>
            )}

            {/* Target indicator */}
            {level.n === targetN && level.n !== n && (
              <circle
                cx={(40 + width - 70) / 2 + 15}
                cy={getYPosition(level.energy)}
                r={5}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="3,3"
              >
                <title>Target: n={level.n}</title>
              </circle>
            )}
          </g>
        ))}

        {/* Transition arrow */}
        {targetN !== n && !isTransitioning && (
          <g className="cursor-pointer" onClick={handleTransition}>
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" fill="#f59e0b" />
              </marker>
            </defs>
            <line
              x1={(40 + width - 70) / 2 + 30}
              y1={getYPosition(bohrEnergy(n)) + (targetN > n ? 10 : -10)}
              x2={(40 + width - 70) / 2 + 30}
              y2={getYPosition(bohrEnergy(targetN)) + (targetN > n ? -10 : 10)}
              stroke="#f59e0b"
              strokeWidth={2}
              markerEnd="url(#arrowhead)"
            />
            <text
              x={(40 + width - 70) / 2 + 40}
              y={(getYPosition(bohrEnergy(n)) + getYPosition(bohrEnergy(targetN))) / 2}
              fill="#f59e0b"
              fontSize={9}
              dominantBaseline="middle"
            >
              {n > targetN ? 'emit' : 'absorb'}
            </text>
          </g>
        )}
      </svg>

      {/* Animated Photon */}
      <AnimatePresence>
        {showPhoton && (
          <motion.div
            className="absolute pointer-events-none"
            initial={{ 
              x: photonX, 
              y: photonStartY - 10,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              x: isEmission ? [photonX, photonX - 30, -20] : [photonX - 60, photonX],
              y: isEmission ? [photonStartY - 10, (photonStartY + photonEndY) / 2 - 10, photonEndY - 10] : [photonEndY - 10, photonStartY - 10],
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.8]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 1.2,
              ease: "easeInOut"
            }}
            style={{
              left: 0,
              top: 0,
            }}
          >
            {/* Photon wave representation */}
            <svg width="40" height="20" viewBox="0 0 40 20">
              <defs>
                <filter id="photonGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              {/* Wavy photon line */}
              <path
                d="M 0 10 Q 5 5, 10 10 T 20 10 T 30 10 T 40 10"
                stroke={photonColor}
                strokeWidth="3"
                fill="none"
                filter="url(#photonGlow)"
              />
              {/* Photon particle */}
              <circle
                cx="20"
                cy="10"
                r="6"
                fill={photonColor}
                filter="url(#photonGlow)"
              />
            </svg>
            {/* Label */}
            <div 
              className="text-xs font-bold mt-1 text-center whitespace-nowrap"
              style={{ color: photonColor }}
            >
              {isEmission ? '📤 γ' : '📥 γ'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transition button */}
      {targetN !== n && !isTransitioning && (
        <button
          onClick={handleTransition}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Trigger Transition
        </button>
      )}

      {/* Transition indicator with photon info */}
      {isTransitioning && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
          <div className="text-amber-400 text-sm animate-pulse">
            {n > targetN ? 'Emitting photon...' : 'Absorbing photon...'}
          </div>
          <div className="text-xs mt-1" style={{ color: photonColor }}>
            λ = {rydbergWavelengthNm(Math.max(n, targetN), Math.min(n, targetN)).toFixed(1)} nm
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyLevelDiagram;
