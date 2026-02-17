/**
 * de Broglie Standing Wave Module
 * Visualize electron as a standing wave on circular orbit
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCanvasAnimation } from '../../hooks/useCanvasAnimation';
import { useQuantumStore } from '../../store/useQuantumStore';
import {
  clearCanvas,
  drawOrbit,
  drawNucleus,
  drawStandingWave,
  drawLabel,
} from '../../utils/canvasUtils';
import {
  bohrRadius,
  electronWavelengthInOrbit,
  standingWaveCondition,
  BOHR_RADIUS,
} from '../../physics';
import { LaTeX } from '../../components/ui/LaTeX';
import { Quiz, deBroglieQuiz } from '../../components/ui/Quiz';

export const DeBroglieModule: React.FC = () => {
  const {
    deBroglie: { n, wavelength, showWave, useCustomWavelength },
    setDeBroglieN,
    setDeBroglieWavelength,
    toggleCustomWavelength,
  } = useQuantumStore();

  const canvasWidth = 500;
  const canvasHeight = 500;
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Calculate actual electron wavelength for this orbit
  const actualWavelength = useMemo(() => {
    return electronWavelengthInOrbit(n);
  }, [n]);

  // Calculate orbit properties
  const orbitRadius = useMemo(() => {
    return bohrRadius(n);
  }, [n]);

  // Scale factor for display
  const maxDisplayRadius = 180;
  const scaleFactor = maxDisplayRadius / (bohrRadius(6) / BOHR_RADIUS);
  const displayRadius = (orbitRadius / BOHR_RADIUS) * scaleFactor;

  // Check standing wave condition
  const standingWave = useMemo(() => {
    const effectiveWavelength = useCustomWavelength 
      ? wavelength * 1e-11  // Convert custom slider value to meters
      : actualWavelength;
    return standingWaveCondition(orbitRadius, effectiveWavelength);
  }, [orbitRadius, actualWavelength, wavelength, useCustomWavelength]);

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    clearCanvas(ctx, canvasWidth, canvasHeight, '#0a0a0f');

    // Draw reference orbit
    drawOrbit(ctx, centerX, centerY, displayRadius, {
      color: '#1e40af',
      lineWidth: 1,
      alpha: 0.5,
    });

    // Draw nucleus
    drawNucleus(ctx, centerX, centerY, 12);

    // Calculate effective n for wave
    const effectiveN = useCustomWavelength 
      ? standingWave.nWavelengths 
      : n;

    // Draw standing wave
    if (showWave) {
      const isAllowed = standingWave.isAllowed;
      const waveColor = isAllowed ? '#22c55e' : '#ef4444';
      const waveAlpha = isAllowed ? 1 : 0.5 + 0.3 * Math.sin(frameCount * 0.1);

      drawStandingWave(ctx, centerX, centerY, displayRadius, effectiveN, {
        amplitude: 15,
        color: waveColor,
        lineWidth: 2,
        phase: frameCount * 0.02,
        alpha: waveAlpha,
      });
    }

    // Draw labels
    drawLabel(ctx, 'de Broglie Standing Wave', centerX, 30, {
      font: 'bold 18px Inter, system-ui, sans-serif',
      color: '#e2e8f0',
    });

    // State indicator
    const stateText = standingWave.isAllowed 
      ? '✓ ALLOWED STATE (Constructive Interference)' 
      : '✗ FORBIDDEN STATE (Destructive Interference)';
    const stateColor = standingWave.isAllowed ? '#22c55e' : '#ef4444';
    
    drawLabel(ctx, stateText, centerX, canvasHeight - 30, {
      font: 'bold 14px Inter, system-ui, sans-serif',
      color: stateColor,
    });

    // Wave count info
    drawLabel(
      ctx, 
      `Wavelengths in orbit: ${standingWave.nWavelengths.toFixed(2)}`, 
      centerX, 
      canvasHeight - 60,
      {
        font: '13px Inter, system-ui, sans-serif',
        color: '#94a3b8',
      }
    );

    // Phase mismatch
    if (!standingWave.isAllowed) {
      drawLabel(
        ctx,
        `Phase mismatch: ${(standingWave.phaseMismatch * 100).toFixed(1)}%`,
        centerX,
        canvasHeight - 80,
        {
          font: '12px Inter, system-ui, sans-serif',
          color: '#f87171',
        }
      );
    }

  }, [canvasWidth, canvasHeight, displayRadius, n, showWave, standingWave, 
      useCustomWavelength, centerX, centerY]);

  const canvasRef = useCanvasAnimation({
    width: canvasWidth,
    height: canvasHeight,
    draw,
    isAnimating: true,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          de Broglie Standing Wave Visualizer
        </h2>
        <p className="text-slate-400 mt-1">
          Electron as a standing wave on circular orbit: 2πr = nλ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl border border-slate-700"
          />
          {/* Class 12 NEB Notes */}
          <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
            <h4 className="text-amber-400 font-semibold mb-2">📖 Class 12 NEB Notes</h4>
            <ul className="text-slate-300 text-xs leading-relaxed space-y-2 list-disc list-inside">
              <li>In 1924, Louis de Broglie proposed that all matter exhibits wave-like properties, with wavelength given by <strong>λ = h/p = h/mv</strong>, where h is Planck's constant and p is momentum. This revolutionary idea unified the wave and particle nature of matter.</li>
              <li>For electrons in Bohr orbits, the standing wave condition <strong>2πr = nλ</strong> must be satisfied, meaning only orbits where an integer number of complete wavelengths fit around the circumference are allowed. This elegantly explains why electron orbits are quantized.</li>
              <li>For an electron accelerated through potential V, the de Broglie wavelength is <strong>λ = h/√(2meV)</strong>. The wavelength decreases as electron velocity increases.</li>
              <li>The wave nature of electrons was experimentally confirmed by <strong>Davisson and Germer</strong> in 1927 through electron diffraction from nickel crystals, earning de Broglie the Nobel Prize in 1929.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/Matter_wave"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
            >
              📚 Learn more on Wikipedia →
            </a>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Controls
            </h3>

            {/* Quantum number slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Quantum Number (n)</span>
                <span className="font-mono text-blue-400">{n}</span>
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={n}
                onChange={(e) => setDeBroglieN(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Custom wavelength toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Custom Wavelength Mode</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  useCustomWavelength ? 'bg-blue-600' : 'bg-slate-600'
                }`}
                onClick={toggleCustomWavelength}
              >
                <div 
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                    useCustomWavelength ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </label>

            {/* Custom wavelength slider */}
            {useCustomWavelength && (
              <div className="space-y-2">
                <label className="flex justify-between text-sm text-slate-300">
                  <span>Wavelength Factor</span>
                  <span className="font-mono text-amber-400">{wavelength.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.01}
                  value={wavelength}
                  onChange={(e) => setDeBroglieWavelength(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-500">
                  Adjust to see non-allowed states
                </p>
              </div>
            )}
          </div>

          {/* Info Panel */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Physics
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Orbit radius:</span>
                <span className="text-white font-mono">
                  {(orbitRadius * 1e10).toFixed(3)} Å
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">de Broglie λ:</span>
                <span className="text-white font-mono">
                  {(actualWavelength * 1e10).toFixed(3)} Å
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Circumference:</span>
                <span className="text-white font-mono">
                  {(2 * Math.PI * orbitRadius * 1e10).toFixed(2)} Å
                </span>
              </div>
            </div>
          </div>

          {/* Key Formula */}
          <div className="bg-slate-900 rounded-lg p-4 space-y-3">
            <h4 className="text-sm font-medium text-slate-400">Key Formulas</h4>
            <div className="space-y-2">
              <div className="bg-slate-800 rounded p-2 text-center">
                <LaTeX 
                  formula="\lambda = \frac{h}{p} = \frac{h}{mv}" 
                  className="text-green-400"
                />
              </div>
              <div className="bg-slate-800 rounded p-2 text-center">
                <LaTeX 
                  formula="2 \pi r = n \lambda" 
                  className="text-blue-400"
                />
              </div>
              <p className="text-xs text-slate-500">
                Standing wave condition: n complete wavelengths must fit in orbit circumference
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Section - Full Width */}
      <div className="mt-8">
        <Quiz title="Test Your Knowledge - de Broglie Waves" questions={deBroglieQuiz} />
      </div>
    </motion.div>
  );
};

export default DeBroglieModule;
