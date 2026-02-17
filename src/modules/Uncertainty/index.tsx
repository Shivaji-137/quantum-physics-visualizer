/**
 * Heisenberg Uncertainty Principle Module
 * Wave packet visualization with position/momentum uncertainty
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCanvasAnimation } from '../../hooks/useCanvasAnimation';
import { useQuantumStore } from '../../store/useQuantumStore';
import {
  clearCanvas,
  drawLabel,
} from '../../utils/canvasUtils';
import {
  uncertaintyMomentum,
  uncertaintyVelocity,
  REDUCED_PLANCK,
} from '../../physics';
import { LaTeX } from '../../components/ui/LaTeX';
import { Quiz, uncertaintyQuiz } from '../../components/ui/Quiz';

export const UncertaintyModule: React.FC = () => {
  const {
    uncertainty: { deltaX, showMomentumSpace, animatePacket },
    setDeltaX,
    toggleMomentumSpace,
    toggleAnimatePacket,
  } = useQuantumStore();

  const canvasWidth = 600;
  const canvasHeight = 400;

  // Calculate uncertainties
  const deltaP = useMemo(() => uncertaintyMomentum(deltaX), [deltaX]);
  const deltaV = useMemo(() => uncertaintyVelocity(deltaP), [deltaP]);

  // Sigma values for display
  const sigmaX = deltaX * 2; // Display width
  // sigmaP used for physics calculations shown in UI
  const sigmaP = REDUCED_PLANCK / (2 * sigmaX);
  void sigmaP; // Used in UI display

  // Dynamic scaling for visualization
  // Map the log range of deltaX (-15 to -8) to a pixel width range (20 to 200)
  const logDeltaX = Math.log10(deltaX);
  const minLog = -15;
  const maxLog = -8;
  const minPixels = 20;
  const maxPixels = 200;
  
  // Linear interpolation from log scale to pixel scale
  const t = (logDeltaX - minLog) / (maxLog - minLog);
  const displaySigmaX = minPixels + t * (maxPixels - minPixels);
  
  // For momentum, inverse relationship: when position is narrow, momentum is wide
  const displaySigmaP = minPixels + (1 - t) * (maxPixels - minPixels); 

  // Draw wave packets
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    clearCanvas(ctx, canvasWidth, canvasHeight, '#0a0a0f');

    const graphHeight = 100;
    
    // Title
    drawLabel(ctx, 'Heisenberg Uncertainty Principle', canvasWidth / 2, 25, {
      font: 'bold 18px Inter, system-ui, sans-serif',
      color: '#e2e8f0',
    });

    // Animation phase
    const phase = animatePacket ? frameCount * 0.02 : 0;

    // === Position Space Wave Packet ===
    // Position the baseline for position space graph
    const posGraphY = showMomentumSpace ? 160 : 220;
    
    // Draw x-axis for position space
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, posGraphY);
    ctx.lineTo(canvasWidth - 50, posGraphY);
    ctx.stroke();

    // Draw position space Gaussian
    const posCenter = canvasWidth / 2 + (animatePacket ? 50 * Math.sin(phase) : 0);

    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    let firstPoint = true;
    for (let x = 50; x < canvasWidth - 50; x++) {
      // Calculate normalized distance from center
      const distFromCenter = x - posCenter;
      // Use displaySigmaX as the standard deviation in pixels
      const normalizedDist = distFromCenter / displaySigmaX;
      // Gaussian: exp(-x^2 / 2)
      const amplitude = Math.exp(-normalizedDist * normalizedDist / 2);
      const y = posGraphY - amplitude * graphHeight;
      
      if (firstPoint) {
        ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Fill under the curve
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.beginPath();
    ctx.moveTo(50, posGraphY);
    for (let x = 50; x < canvasWidth - 50; x++) {
      const distFromCenter = x - posCenter;
      const normalizedDist = distFromCenter / displaySigmaX;
      const amplitude = Math.exp(-normalizedDist * normalizedDist / 2);
      const y = posGraphY - amplitude * graphHeight;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(canvasWidth - 50, posGraphY);
    ctx.closePath();
    ctx.fill();

    // Δx marker lines
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(posCenter - displaySigmaX, posGraphY + 5);
    ctx.lineTo(posCenter - displaySigmaX, posGraphY - graphHeight - 10);
    ctx.moveTo(posCenter + displaySigmaX, posGraphY + 5);
    ctx.lineTo(posCenter + displaySigmaX, posGraphY - graphHeight - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Δx label with arrow
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(posCenter - displaySigmaX, posGraphY - graphHeight - 5);
    ctx.lineTo(posCenter + displaySigmaX, posGraphY - graphHeight - 5);
    ctx.stroke();

    drawLabel(ctx, 'Δx', posCenter, posGraphY - graphHeight - 20, {
      font: 'bold 14px Inter, sans-serif',
      color: '#60a5fa',
    });

    drawLabel(ctx, 'Position Space |ψ(x)|²', canvasWidth / 2, posGraphY + 25, {
      font: '12px Inter, sans-serif',
      color: '#94a3b8',
    });

    // === Momentum Space Wave Packet ===
    if (showMomentumSpace) {
      const momGraphY = 340;

      // Draw x-axis for momentum space
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(50, momGraphY);
      ctx.lineTo(canvasWidth - 50, momGraphY);
      ctx.stroke();

      const momCenter = canvasWidth / 2;

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.beginPath();

      firstPoint = true;
      for (let x = 50; x < canvasWidth - 50; x++) {
        const distFromCenter = x - momCenter;
        const normalizedDist = distFromCenter / displaySigmaP;
        const amplitude = Math.exp(-normalizedDist * normalizedDist / 2);
        const y = momGraphY - amplitude * graphHeight;
        
        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Fill under the curve
      ctx.fillStyle = 'rgba(34, 197, 94, 0.3)';
      ctx.beginPath();
      ctx.moveTo(50, momGraphY);
      for (let x = 50; x < canvasWidth - 50; x++) {
        const distFromCenter = x - momCenter;
        const normalizedDist = distFromCenter / displaySigmaP;
        const amplitude = Math.exp(-normalizedDist * normalizedDist / 2);
        const y = momGraphY - amplitude * graphHeight;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(canvasWidth - 50, momGraphY);
      ctx.closePath();
      ctx.fill();

      // Δp marker lines
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(momCenter - displaySigmaP, momGraphY + 5);
      ctx.lineTo(momCenter - displaySigmaP, momGraphY - graphHeight - 10);
      ctx.moveTo(momCenter + displaySigmaP, momGraphY + 5);
      ctx.lineTo(momCenter + displaySigmaP, momGraphY - graphHeight - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Δp label
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(momCenter - displaySigmaP, momGraphY - graphHeight - 5);
      ctx.lineTo(momCenter + displaySigmaP, momGraphY - graphHeight - 5);
      ctx.stroke();

      drawLabel(ctx, 'Δp', momCenter, momGraphY - graphHeight - 20, {
        font: 'bold 14px Inter, sans-serif',
        color: '#4ade80',
      });

      drawLabel(ctx, 'Momentum Space |φ(p)|²', canvasWidth / 2, momGraphY + 25, {
        font: '12px Inter, sans-serif',
        color: '#94a3b8',
      });

      // Relationship indicator
      drawLabel(ctx, 'Δx · Δp ≥ ℏ/2', canvasWidth / 2, canvasHeight - 10, {
        font: 'bold 14px Inter, sans-serif',
        color: '#f59e0b',
      });
    }

  }, [canvasWidth, canvasHeight, displaySigmaX, displaySigmaP, showMomentumSpace, animatePacket]);

  const canvasRef = useCanvasAnimation({
    width: canvasWidth,
    height: canvasHeight,
    draw,
    isAnimating: animatePacket,
  });

  // Format scientific notation
  const formatSci = (val: number, precision: number = 2): string => {
    const exp = Math.floor(Math.log10(Math.abs(val)));
    const mantissa = val / Math.pow(10, exp);
    return `${mantissa.toFixed(precision)} × 10^${exp}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Heisenberg Uncertainty Simulator
        </h2>
        <p className="text-slate-400 mt-1">
          Wave packet visualization: ΔxΔp ≥ ℏ/2
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
              <li>In 1927, Werner Heisenberg formulated the <strong>Uncertainty Principle</strong>, a fundamental limit in quantum mechanics stating that certain pairs of physical properties cannot be simultaneously known with arbitrary precision.</li>
              <li>The position-momentum uncertainty relation is <strong>Δx·Δp ≥ ℏ/2</strong>, where ℏ = h/2π = 1.055 × 10⁻³⁴ J·s is the reduced Planck constant. This is not a limitation of measurement instruments but a fundamental property of nature arising from wave-particle duality.</li>
              <li>A <strong>wave packet</strong> (localized particle) requires superposition of many wavelengths, which means many momenta, hence uncertainty in momentum. Similarly, the energy-time uncertainty relation is <strong>ΔE·Δt ≥ ℏ/2</strong>.</li>
              <li>An important consequence is that electrons cannot exist inside the nucleus — confining them to such a small region (Δx ~ 10⁻¹⁵ m) would require enormous momentum uncertainty, giving kinetic energy far exceeding nuclear binding. This principle explains quantum tunneling and zero-point energy.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/Uncertainty_principle"
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

            {/* Position uncertainty slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Position Uncertainty (Δx)</span>
              </label>
              <input
                type="range"
                min={-15}
                max={-8}
                step={0.1}
                value={Math.log10(deltaX)}
                onChange={(e) => setDeltaX(Math.pow(10, parseFloat(e.target.value)))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>10⁻¹⁵ m</span>
                <span className="text-blue-400 font-mono">{formatSci(deltaX)} m</span>
                <span>10⁻⁸ m</span>
              </div>
            </div>

            {/* Toggle switches */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Show Momentum Space</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  showMomentumSpace ? 'bg-green-600' : 'bg-slate-600'
                }`}
                onClick={toggleMomentumSpace}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                  showMomentumSpace ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Animate Wave Packet</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  animatePacket ? 'bg-blue-600' : 'bg-slate-600'
                }`}
                onClick={toggleAnimatePacket}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                  animatePacket ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Calculated Values */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Calculated Values
            </h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-400">Δx =</span>
                <span className="text-white font-mono">{formatSci(deltaX)} m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-400">Δp ≥</span>
                <span className="text-white font-mono">{formatSci(deltaP)} kg·m/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-amber-400">Δv ≥</span>
                <span className="text-white font-mono">{formatSci(deltaV)} m/s</span>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <div className="flex justify-between">
                  <span className="text-purple-400">Δx · Δp =</span>
                  <span className="text-white font-mono">{formatSci(deltaX * deltaP)} J·s</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-400">ℏ/2 =</span>
                  <span className="text-slate-300 font-mono">{formatSci(REDUCED_PLANCK / 2)} J·s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Uncertainty Principle</h4>
            <div className="bg-slate-800 rounded p-3 text-center">
              <LaTeX 
                formula="\Delta x \cdot \Delta p \geq \frac{\hbar}{2}" 
                className="text-amber-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              The more precisely position is known, the less precisely momentum can be known, and vice versa.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Section - Full Width */}
      <div className="mt-8">
        <Quiz title="Test Your Knowledge - Uncertainty Principle" questions={uncertaintyQuiz} />
      </div>
    </motion.div>
  );
};

export default UncertaintyModule;
