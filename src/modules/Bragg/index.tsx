/**
 * Bragg Diffraction Module
 * X-ray diffraction from crystal planes
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCanvasAnimation } from '../../hooks/useCanvasAnimation';
import { useQuantumStore } from '../../store/useQuantumStore';
import { clearCanvas, drawLabel } from '../../utils/canvasUtils';
import { braggCondition, braggAngle, CRYSTAL_SPACINGS } from '../../physics';
import { LaTeX } from '../../components/ui/LaTeX';
import { Quiz, braggQuiz } from '../../components/ui/Quiz';

export const BraggModule: React.FC = () => {
  const {
    bragg: { crystalSpacing, angle, order, wavelength, showRays },
    setCrystalSpacing,
    setBraggAngle,
    setDiffractionOrder,
    setBraggWavelength,
    toggleBraggRays,
  } = useQuantumStore();

  const canvasWidth = 650;
  const canvasHeight = 450;

  // Check Bragg condition
  const bragg = useMemo(() => {
    return braggCondition(crystalSpacing, angle, order, wavelength);
  }, [crystalSpacing, angle, order, wavelength]);

  // Calculate expected angle for current wavelength
  const expectedAngle = useMemo(() => {
    return braggAngle(crystalSpacing, order, wavelength);
  }, [crystalSpacing, order, wavelength]);

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    clearCanvas(ctx, canvasWidth, canvasHeight, '#0a0a0f');

    // Crystal dimensions
    const crystalStartY = 180;
    const planeSpacing = 45;
    const crystalWidth = 500;
    const crystalStartX = (canvasWidth - crystalWidth) / 2;
    const numPlanes = 5;
    const numAtoms = 12;

    // Title
    drawLabel(ctx, 'Bragg X-ray Diffraction', canvasWidth / 2, 25, {
      font: 'bold 18px Inter, system-ui, sans-serif',
      color: '#e2e8f0',
    });

    // Draw crystal block background
    const crystalHeight = (numPlanes - 1) * planeSpacing + 40;
    const gradient = ctx.createLinearGradient(crystalStartX, crystalStartY - 20, crystalStartX, crystalStartY + crystalHeight);
    gradient.addColorStop(0, 'rgba(30, 58, 138, 0.3)');
    gradient.addColorStop(1, 'rgba(30, 58, 138, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(crystalStartX - 10, crystalStartY - 20, crystalWidth + 20, crystalHeight);
    
    // Crystal border
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(crystalStartX - 10, crystalStartY - 20, crystalWidth + 20, crystalHeight);

    // Draw crystal lattice planes with atoms
    for (let plane = 0; plane < numPlanes; plane++) {
      const planeY = crystalStartY + plane * planeSpacing;
      const isTopPlane = plane < 2;
      
      // Subtle plane line
      ctx.strokeStyle = isTopPlane ? 'rgba(148, 163, 184, 0.4)' : 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(crystalStartX, planeY);
      ctx.lineTo(crystalStartX + crystalWidth, planeY);
      ctx.stroke();

      // Draw atoms as 3D spheres
      for (let atom = 0; atom < numAtoms; atom++) {
        const atomX = crystalStartX + 25 + atom * (crystalWidth - 50) / (numAtoms - 1);
        const baseRadius = isTopPlane ? 12 : 8;
        const depthFade = 1 - plane * 0.15;
        
        // Outer glow
        if (isTopPlane) {
          const glowGradient = ctx.createRadialGradient(atomX, planeY, 0, atomX, planeY, baseRadius * 2);
          glowGradient.addColorStop(0, 'rgba(96, 165, 250, 0.3)');
          glowGradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(atomX, planeY, baseRadius * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // 3D sphere gradient
        const sphereGradient = ctx.createRadialGradient(
          atomX - baseRadius * 0.3, planeY - baseRadius * 0.3, 0,
          atomX, planeY, baseRadius
        );
        sphereGradient.addColorStop(0, `rgba(147, 197, 253, ${depthFade})`);
        sphereGradient.addColorStop(0.5, `rgba(59, 130, 246, ${depthFade})`);
        sphereGradient.addColorStop(1, `rgba(30, 64, 175, ${depthFade})`);
        
        ctx.fillStyle = sphereGradient;
        ctx.beginPath();
        ctx.arc(atomX, planeY, baseRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * depthFade})`;
        ctx.beginPath();
        ctx.arc(atomX - baseRadius * 0.3, planeY - baseRadius * 0.3, baseRadius * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw X-ray beams
    if (showRays) {
      const incidentAngle = angle;
      const wavePhase = frameCount * 0.15;
      
      // Hit points on crystal planes
      const hitPoint1X = canvasWidth / 2 - 30;
      const hitPoint1Y = crystalStartY;
      const hitPoint2X = canvasWidth / 2 + 50;
      const hitPoint2Y = crystalStartY + planeSpacing;
      
      const rayLength = 140;
      
      // Calculate start and end points
      const incident1StartX = hitPoint1X - rayLength * Math.cos(incidentAngle);
      const incident1StartY = hitPoint1Y - rayLength * Math.sin(incidentAngle);
      const reflected1EndX = hitPoint1X + rayLength * Math.cos(incidentAngle);
      const reflected1EndY = hitPoint1Y - rayLength * Math.sin(incidentAngle);
      
      const incident2StartX = hitPoint2X - rayLength * Math.cos(incidentAngle);
      const incident2StartY = hitPoint2Y - rayLength * Math.sin(incidentAngle);
      const reflected2EndX = hitPoint2X + rayLength * Math.cos(incidentAngle);
      const reflected2EndY = hitPoint2Y - rayLength * Math.sin(incidentAngle);

      // Draw X-ray wave function (sinusoidal wave along ray path)
      const drawXRayWave = (startX: number, startY: number, endX: number, endY: number, 
                           color: string, alpha: number, phaseOffset: number) => {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;
        const waveAmplitude = 6;
        const waveFrequency = 0.15;
        
        // Glow effect
        ctx.strokeStyle = color;
        ctx.lineWidth = 8;
        ctx.globalAlpha = alpha * 0.2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Main wave
        ctx.lineWidth = 2;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        
        for (let i = 0; i <= length; i += 2) {
          const t = i / length;
          const baseX = startX + dx * t;
          const baseY = startY + dy * t;
          const wave = Math.sin(i * waveFrequency + wavePhase + phaseOffset) * waveAmplitude;
          const x = baseX + perpX * wave;
          const y = baseY + perpY * wave;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      };

      // Draw incident rays (yellow/orange)
      drawXRayWave(incident1StartX, incident1StartY, hitPoint1X, hitPoint1Y, '#fbbf24', 1, 0);
      drawXRayWave(incident2StartX, incident2StartY, hitPoint2X, hitPoint2Y, '#fbbf24', 0.6, 0);
      
      // Draw reflected rays (green when constructive, red when destructive)
      const reflectedColor = bragg.isSatisfied ? '#4ade80' : '#f87171';
      const reflectedAlpha = bragg.isSatisfied ? 1 : 0.5 + 0.3 * Math.sin(frameCount * 0.1);
      
      // Phase shift for second ray based on path difference
      const pathDiffPhase = bragg.isSatisfied ? 0 : Math.PI;
      
      drawXRayWave(hitPoint1X, hitPoint1Y, reflected1EndX, reflected1EndY, reflectedColor, reflectedAlpha, 0);
      drawXRayWave(hitPoint2X, hitPoint2Y, reflected2EndX, reflected2EndY, reflectedColor, reflectedAlpha * 0.6, pathDiffPhase);

      // Scattering effect at hit points
      const drawScatterPoint = (x: number, y: number, intensity: number) => {
        const scatterGradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        scatterGradient.addColorStop(0, `rgba(251, 191, 36, ${0.6 * intensity})`);
        scatterGradient.addColorStop(0.5, `rgba(251, 191, 36, ${0.2 * intensity})`);
        scatterGradient.addColorStop(1, 'rgba(251, 191, 36, 0)');
        ctx.fillStyle = scatterGradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      };
      
      drawScatterPoint(hitPoint1X, hitPoint1Y, 1);
      drawScatterPoint(hitPoint2X, hitPoint2Y, 0.6);

      // Angle arc
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(hitPoint1X, hitPoint1Y, 35, Math.PI, Math.PI + incidentAngle, false);
      ctx.stroke();
      
      // Angle label
      drawLabel(ctx, `θ = ${(angle * 180 / Math.PI).toFixed(1)}°`, hitPoint1X - 70, hitPoint1Y - 25, {
        font: 'bold 12px Inter, sans-serif',
        color: '#fbbf24',
      });

      // d-spacing indicator
      const dIndicatorX = crystalStartX + crystalWidth - 30;
      ctx.strokeStyle = '#a78bfa';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(dIndicatorX, crystalStartY);
      ctx.lineTo(dIndicatorX, crystalStartY + planeSpacing);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // d-spacing arrows
      ctx.fillStyle = '#a78bfa';
      ctx.beginPath();
      ctx.moveTo(dIndicatorX, crystalStartY);
      ctx.lineTo(dIndicatorX - 5, crystalStartY + 8);
      ctx.lineTo(dIndicatorX + 5, crystalStartY + 8);
      ctx.closePath();
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(dIndicatorX, crystalStartY + planeSpacing);
      ctx.lineTo(dIndicatorX - 5, crystalStartY + planeSpacing - 8);
      ctx.lineTo(dIndicatorX + 5, crystalStartY + planeSpacing - 8);
      ctx.closePath();
      ctx.fill();
      
      drawLabel(ctx, 'd', dIndicatorX + 15, crystalStartY + planeSpacing / 2, {
        font: 'bold 14px Inter, sans-serif',
        color: '#a78bfa',
      });
    }

    // Status panel at bottom
    const panelY = canvasHeight - 90;
    const panelHeight = 80;
    
    // Panel background
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(20, panelY, canvasWidth - 40, panelHeight);
    ctx.strokeStyle = bragg.isSatisfied ? 'rgba(74, 222, 128, 0.5)' : 'rgba(248, 113, 113, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(20, panelY, canvasWidth - 40, panelHeight);

    // Path difference info
    const pathDiff = bragg.pathDifference * 1e12;
    const nLambda = order * wavelength * 1e12;

    drawLabel(ctx, `Path difference: 2d sin θ = ${pathDiff.toFixed(2)} pm`, canvasWidth / 2, panelY + 20, {
      font: '13px Inter, sans-serif',
      color: '#94a3b8',
    });

    drawLabel(ctx, `Required: nλ = ${order} × ${(wavelength * 1e12).toFixed(1)} pm = ${nLambda.toFixed(2)} pm`, canvasWidth / 2, panelY + 40, {
      font: '13px Inter, sans-serif',
      color: '#94a3b8',
    });

    // Status indicator
    const statusColor = bragg.isSatisfied ? '#4ade80' : '#f87171';
    const statusText = bragg.isSatisfied 
      ? '✓ CONSTRUCTIVE INTERFERENCE — Bragg condition satisfied!'
      : '✗ DESTRUCTIVE INTERFERENCE — waves cancel out';

    drawLabel(ctx, statusText, canvasWidth / 2, panelY + 62, {
      font: 'bold 14px Inter, sans-serif',
      color: statusColor,
    });

  }, [canvasWidth, canvasHeight, angle, showRays, bragg, order, wavelength]);

  const canvasRef = useCanvasAnimation({
    width: canvasWidth,
    height: canvasHeight,
    draw,
    isAnimating: false,
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
          Bragg Diffraction Simulator
        </h2>
        <p className="text-slate-400 mt-1">
          X-ray diffraction from crystal planes: 2d sin θ = nλ
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
              <li>When X-rays fall on a crystal, they are scattered by atoms in the crystal lattice. <strong>Bragg's Law</strong> describes the condition for constructive interference: <strong>2d sin θ = nλ</strong>, where d is the interplanar spacing, θ is the glancing angle, n is the diffraction order, and λ is the wavelength.</li>
              <li>Constructive interference occurs when the <strong>path difference</strong> between rays reflected from adjacent planes equals an integer multiple of the wavelength. At specific angles satisfying Bragg's condition, intense diffracted beams are observed.</li>
              <li>The glancing angle θ is measured between the incident ray and the crystal surface (not the normal). For first-order diffraction (n=1), knowing λ and measuring θ allows calculation of crystal spacing d.</li>
              <li>This principle is fundamental to <strong>X-ray crystallography</strong>, used to determine crystal structures including DNA's double helix by Watson and Crick. The technique is essential in materials science, chemistry, and biology.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/Bragg%27s_law"
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

            {/* Crystal spacing */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Crystal Material</label>
              <select
                value={crystalSpacing.toFixed(12)}
                onChange={(e) => setCrystalSpacing(parseFloat(e.target.value))}
                className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm"
              >
                {Object.entries(CRYSTAL_SPACINGS).map(([name, d]) => (
                  <option key={name} value={d.toFixed(12)}>
                    {name} (d = {(d * 1e10).toFixed(2)} Å)
                  </option>
                ))}
              </select>
            </div>

            {/* Angle slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Angle θ</span>
                <span className="font-mono text-blue-400">{(angle * 180 / Math.PI).toFixed(1)}°</span>
              </label>
              <input
                type="range"
                min={5}
                max={85}
                step={0.5}
                value={angle * 180 / Math.PI}
                onChange={(e) => setBraggAngle(parseFloat(e.target.value) * Math.PI / 180)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Diffraction order */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Order (n)</span>
                <span className="font-mono text-green-400">{order}</span>
              </label>
              <input
                type="range"
                min={1}
                max={5}
                value={order}
                onChange={(e) => setDiffractionOrder(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Wavelength */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>X-ray Wavelength</span>
                <span className="font-mono text-amber-400">{(wavelength * 1e12).toFixed(1)} pm</span>
              </label>
              <input
                type="range"
                min={10}
                max={200}
                step={1}
                value={wavelength * 1e12}
                onChange={(e) => setBraggWavelength(parseFloat(e.target.value) * 1e-12)}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Show rays toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Show X-ray Paths</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  showRays ? 'bg-blue-600' : 'bg-slate-600'
                }`}
                onClick={toggleBraggRays}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                  showRays ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Calculation Panel */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Calculations
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Crystal spacing d:</span>
                <span className="text-white font-mono">{(crystalSpacing * 1e10).toFixed(3)} Å</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">2d sin θ:</span>
                <span className="text-white font-mono">{(bragg.pathDifference * 1e12).toFixed(2)} pm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">nλ:</span>
                <span className="text-white font-mono">{(order * wavelength * 1e12).toFixed(2)} pm</span>
              </div>
              {expectedAngle && (
                <div className="flex justify-between pt-2 border-t border-slate-700">
                  <span className="text-green-400">Expected θ:</span>
                  <span className="text-green-300 font-mono">
                    {(expectedAngle * 180 / Math.PI).toFixed(2)}°
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Formula */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Bragg's Law</h4>
            <div className="bg-slate-800 rounded p-3 text-center">
              <LaTeX 
                formula="2d \sin\theta = n\lambda" 
                className="text-green-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Constructive interference occurs when path difference equals integer wavelengths.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Section - Full Width */}
      <div className="mt-8">
        <Quiz title="Test Your Knowledge - Bragg Diffraction" questions={braggQuiz} />
      </div>
    </motion.div>
  );
};

export default BraggModule;
