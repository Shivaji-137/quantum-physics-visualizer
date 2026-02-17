/**
 * X-ray Production Module (Coolidge Tube)
 * Visualization of continuous X-ray spectrum with cutoff
 */

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useCanvasAnimation } from '../../hooks/useCanvasAnimation';
import { useQuantumStore } from '../../store/useQuantumStore';
import { clearCanvas, drawLabel } from '../../utils/canvasUtils';
import { xrayMinWavelengthPm, xrayMaxEnergy } from '../../physics';
import { LaTeX } from '../../components/ui/LaTeX';
import { Quiz, xrayQuiz } from '../../components/ui/Quiz';

export const XRayModule: React.FC = () => {
  const {
    xray: { voltage, showCharacteristic, targetMaterial },
    setXRayVoltage,
    toggleCharacteristic,
    setTargetMaterial,
  } = useQuantumStore();

  const canvasWidth = 700;
  const canvasHeight = 500;

  // Calculate X-ray properties
  const lambdaMin = useMemo(() => xrayMinWavelengthPm(voltage), [voltage]);
  const maxEnergy = useMemo(() => xrayMaxEnergy(voltage), [voltage]);

  // Characteristic lines for different materials (approximate, in pm)
  const characteristicLines: Record<string, { Kalpha: number; Kbeta: number }> = {
    'Tungsten': { Kalpha: 21.4, Kbeta: 18.4 },
    'Copper': { Kalpha: 154.1, Kbeta: 139.2 },
    'Molybdenum': { Kalpha: 71.1, Kbeta: 63.2 },
  };

  // Draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number) => {
    clearCanvas(ctx, canvasWidth, canvasHeight, '#0a0a0f');

    // ========== COOLIDGE TUBE VISUALIZATION ==========
    const tubeY = 120;
    const tubeWidth = 400;
    const tubeHeight = 100;
    const tubeX = (canvasWidth - tubeWidth) / 2;

    // Title
    drawLabel(ctx, 'Coolidge X-ray Tube', canvasWidth / 2, 25, {
      font: 'bold 18px Inter, system-ui, sans-serif',
      color: '#e2e8f0',
    });

    // Glass tube outer glow
    const tubeGlow = ctx.createRadialGradient(
      canvasWidth / 2, tubeY + tubeHeight / 2, tubeHeight / 3,
      canvasWidth / 2, tubeY + tubeHeight / 2, tubeHeight
    );
    tubeGlow.addColorStop(0, 'rgba(147, 197, 253, 0.1)');
    tubeGlow.addColorStop(1, 'rgba(147, 197, 253, 0)');
    ctx.fillStyle = tubeGlow;
    ctx.fillRect(tubeX - 50, tubeY - 30, tubeWidth + 100, tubeHeight + 60);

    // Glass tube body (elliptical/rounded)
    ctx.save();
    
    // Tube glass gradient (translucent blue-gray)
    const glassGradient = ctx.createLinearGradient(tubeX, tubeY, tubeX, tubeY + tubeHeight);
    glassGradient.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
    glassGradient.addColorStop(0.3, 'rgba(203, 213, 225, 0.15)');
    glassGradient.addColorStop(0.7, 'rgba(148, 163, 184, 0.2)');
    glassGradient.addColorStop(1, 'rgba(100, 116, 139, 0.35)');
    
    // Draw rounded tube
    ctx.fillStyle = glassGradient;
    ctx.beginPath();
    ctx.moveTo(tubeX + 30, tubeY);
    ctx.lineTo(tubeX + tubeWidth - 30, tubeY);
    ctx.quadraticCurveTo(tubeX + tubeWidth + 10, tubeY, tubeX + tubeWidth + 10, tubeY + tubeHeight / 2);
    ctx.quadraticCurveTo(tubeX + tubeWidth + 10, tubeY + tubeHeight, tubeX + tubeWidth - 30, tubeY + tubeHeight);
    ctx.lineTo(tubeX + 30, tubeY + tubeHeight);
    ctx.quadraticCurveTo(tubeX - 10, tubeY + tubeHeight, tubeX - 10, tubeY + tubeHeight / 2);
    ctx.quadraticCurveTo(tubeX - 10, tubeY, tubeX + 30, tubeY);
    ctx.closePath();
    ctx.fill();
    
    // Glass tube outline
    ctx.strokeStyle = 'rgba(203, 213, 225, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Glass reflection highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(tubeX + 40, tubeY + 5);
    ctx.lineTo(tubeX + tubeWidth - 50, tubeY + 5);
    ctx.stroke();
    
    ctx.restore();

    // Cathode (heated filament) on the left
    const cathodeX = tubeX + 50;
    const cathodeY = tubeY + tubeHeight / 2;
    
    // Filament glow
    const filamentGlow = ctx.createRadialGradient(cathodeX, cathodeY, 0, cathodeX, cathodeY, 35);
    filamentGlow.addColorStop(0, 'rgba(251, 146, 60, 0.8)');
    filamentGlow.addColorStop(0.3, 'rgba(239, 68, 68, 0.4)');
    filamentGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = filamentGlow;
    ctx.beginPath();
    ctx.arc(cathodeX, cathodeY, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Filament coil
    ctx.strokeStyle = '#fb923c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const y = cathodeY - 15 + i * 7.5;
      ctx.moveTo(cathodeX - 10, y);
      ctx.quadraticCurveTo(cathodeX, y - 4, cathodeX + 10, y);
    }
    ctx.stroke();
    
    // Cathode label
    drawLabel(ctx, 'Cathode', cathodeX, tubeY + tubeHeight + 20, {
      font: '11px Inter, sans-serif',
      color: '#fb923c',
    });
    drawLabel(ctx, '(heated filament)', cathodeX, tubeY + tubeHeight + 32, {
      font: '9px Inter, sans-serif',
      color: '#94a3b8',
    });

    // Anode (target) on the right - angled surface
    const anodeX = tubeX + tubeWidth - 70;
    const anodeY = tubeY + tubeHeight / 2;
    
    // Anode block
    const anodeGradient = ctx.createLinearGradient(anodeX - 20, anodeY - 30, anodeX + 30, anodeY + 30);
    anodeGradient.addColorStop(0, '#78716c');
    anodeGradient.addColorStop(0.5, '#a8a29e');
    anodeGradient.addColorStop(1, '#57534e');
    
    ctx.fillStyle = anodeGradient;
    ctx.beginPath();
    ctx.moveTo(anodeX, anodeY - 35);
    ctx.lineTo(anodeX + 25, anodeY - 25);
    ctx.lineTo(anodeX + 25, anodeY + 25);
    ctx.lineTo(anodeX, anodeY + 35);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Heat glow on anode (based on voltage)
    const heatIntensity = Math.min(1, voltage / 80000);
    const anodeHeat = ctx.createRadialGradient(anodeX + 5, anodeY, 0, anodeX + 5, anodeY, 30);
    anodeHeat.addColorStop(0, `rgba(239, 68, 68, ${0.6 * heatIntensity})`);
    anodeHeat.addColorStop(0.5, `rgba(251, 146, 60, ${0.3 * heatIntensity})`);
    anodeHeat.addColorStop(1, 'rgba(251, 146, 60, 0)');
    ctx.fillStyle = anodeHeat;
    ctx.beginPath();
    ctx.arc(anodeX + 5, anodeY, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Anode label
    drawLabel(ctx, `Anode (${targetMaterial})`, anodeX + 10, tubeY + tubeHeight + 20, {
      font: '11px Inter, sans-serif',
      color: '#a8a29e',
    });

    // Electron beam animation
    const electronCount = 12;
    const beamStartX = cathodeX + 15;
    const beamEndX = anodeX - 5;
    
    for (let i = 0; i < electronCount; i++) {
      const progress = ((frameCount * 0.03 + i / electronCount) % 1);
      const x = beamStartX + progress * (beamEndX - beamStartX);
      const spreadY = Math.sin(progress * Math.PI) * 8 * (Math.random() - 0.5);
      const y = cathodeY + spreadY + (Math.sin(i * 1.5 + frameCount * 0.1) * 3);
      
      // Electron glow
      const electronGlow = ctx.createRadialGradient(x, y, 0, x, y, 6);
      electronGlow.addColorStop(0, 'rgba(96, 165, 250, 0.9)');
      electronGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
      electronGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = electronGlow;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      
      // Electron core
      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // X-ray emission from anode
    const xrayCount = 8;
    for (let i = 0; i < xrayCount; i++) {
      const angle = -Math.PI / 4 + (i / (xrayCount - 1)) * (-Math.PI / 2);
      const rayProgress = ((frameCount * 0.02 + i * 0.1) % 1);
      const rayLength = 60 * rayProgress;
      
      const startX = anodeX;
      const startY = anodeY;
      const endX = startX + Math.cos(angle) * rayLength;
      const endY = startY + Math.sin(angle) * rayLength;
      
      // X-ray beam
      ctx.strokeStyle = `rgba(167, 139, 250, ${0.8 * (1 - rayProgress)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      
      // Wavy pattern
      if (rayProgress > 0.3) {
        ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 * (1 - rayProgress)})`;
        ctx.lineWidth = 1;
        const waveX = startX + Math.cos(angle) * rayLength * 0.7;
        const waveY = startY + Math.sin(angle) * rayLength * 0.7;
        ctx.beginPath();
        ctx.arc(waveX, waveY, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    // X-ray label
    drawLabel(ctx, 'X-rays', anodeX - 50, tubeY - 15, {
      font: 'bold 11px Inter, sans-serif',
      color: '#a78bfa',
    });

    // Voltage indicator
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    
    // + terminal
    ctx.beginPath();
    ctx.moveTo(anodeX + 30, anodeY);
    ctx.lineTo(anodeX + 60, anodeY);
    ctx.lineTo(anodeX + 60, tubeY + tubeHeight + 45);
    ctx.stroke();
    
    // - terminal
    ctx.beginPath();
    ctx.moveTo(cathodeX - 15, cathodeY);
    ctx.lineTo(cathodeX - 45, cathodeY);
    ctx.lineTo(cathodeX - 45, tubeY + tubeHeight + 45);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Voltage label
    drawLabel(ctx, `${(voltage / 1000).toFixed(0)} kV`, canvasWidth / 2, tubeY + tubeHeight + 55, {
      font: 'bold 14px Inter, sans-serif',
      color: '#fbbf24',
    });
    
    drawLabel(ctx, '+', anodeX + 60, tubeY + tubeHeight + 35, {
      font: 'bold 16px Inter, sans-serif',
      color: '#ef4444',
    });
    
    drawLabel(ctx, '−', cathodeX - 45, tubeY + tubeHeight + 35, {
      font: 'bold 16px Inter, sans-serif',
      color: '#3b82f6',
    });

    // ========== SPECTRUM GRAPH ==========
    const graphTop = 260;
    const graphBottom = canvasHeight - 40;
    const graphLeft = 80;
    const graphRight = canvasWidth - 40;
    const graphWidth = graphRight - graphLeft;
    const graphHeight = graphBottom - graphTop;

    // Graph title
    drawLabel(ctx, 'X-ray Emission Spectrum', canvasWidth / 2, graphTop - 15, {
      font: 'bold 14px Inter, sans-serif',
      color: '#94a3b8',
    });

    // Wavelength range (pm)
    const lambdaRange = { min: 0, max: Math.max(150, lambdaMin * 3) };

    // Convert wavelength to x position
    const lambdaToX = (lambda: number): number => {
      return graphLeft + (lambda / lambdaRange.max) * graphWidth;
    };

    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(graphLeft, graphBottom);
    ctx.lineTo(graphRight, graphBottom);
    ctx.stroke();

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(graphLeft, graphBottom);
    ctx.lineTo(graphLeft, graphTop);
    ctx.stroke();

    // Axis labels
    drawLabel(ctx, 'Wavelength λ (pm)', (graphLeft + graphRight) / 2, canvasHeight - 15, {
      font: '11px Inter, sans-serif',
      color: '#64748b',
    });

    ctx.save();
    ctx.translate(25, (graphTop + graphBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    drawLabel(ctx, 'Intensity', 0, 0, {
      font: '11px Inter, sans-serif',
      color: '#64748b',
    });
    ctx.restore();

    // X-axis ticks
    ctx.fillStyle = '#475569';
    ctx.font = '9px Inter, sans-serif';
    ctx.textAlign = 'center';
    for (let lambda = 0; lambda <= lambdaRange.max; lambda += 25) {
      const x = lambdaToX(lambda);
      ctx.beginPath();
      ctx.moveTo(x, graphBottom);
      ctx.lineTo(x, graphBottom + 4);
      ctx.stroke();
      ctx.fillText(lambda.toString(), x, graphBottom + 14);
    }

    // Draw continuous spectrum (Bremsstrahlung)
    const cutoffX = lambdaToX(lambdaMin);

    // Continuous spectrum curve
    ctx.beginPath();
    ctx.moveTo(cutoffX, graphBottom);
    
    const peakLambda = lambdaMin * 1.5;
    const peakIntensity = graphHeight * 0.7;

    for (let x = cutoffX; x <= graphRight; x += 2) {
      const lambda = ((x - graphLeft) / graphWidth) * lambdaRange.max;
      
      if (lambda < lambdaMin) continue;
      
      let intensity = 0;
      if (lambda > lambdaMin) {
        const factor = (lambda - lambdaMin) / (lambda * lambda * lambda);
        const normalize = (peakLambda - lambdaMin) / (peakLambda * peakLambda * peakLambda);
        intensity = (factor / normalize) * peakIntensity;
        intensity = Math.min(intensity, peakIntensity);
        intensity = Math.max(0, intensity);
      }
      
      const y = graphBottom - intensity;
      ctx.lineTo(x, y);
    }
    
    ctx.lineTo(graphRight, graphBottom);
    ctx.closePath();

    // Fill continuous spectrum
    const gradient = ctx.createLinearGradient(cutoffX, graphTop, graphRight, graphTop);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cutoff line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cutoffX, graphBottom);
    ctx.lineTo(cutoffX, graphTop + 10);
    ctx.stroke();
    ctx.setLineDash([]);

    drawLabel(ctx, `λ_min = ${lambdaMin.toFixed(1)} pm`, cutoffX + 5, graphTop + 20, {
      font: 'bold 10px Inter, sans-serif',
      color: '#ef4444',
      align: 'left',
    });

    // Characteristic lines
    if (showCharacteristic) {
      const lines = characteristicLines[targetMaterial];
      if (lines && lines.Kalpha > lambdaMin) {
        const kAlphaX = lambdaToX(lines.Kalpha);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kAlphaX, graphBottom);
        ctx.lineTo(kAlphaX, graphTop + 25);
        ctx.stroke();
        
        drawLabel(ctx, `Kα`, kAlphaX, graphTop + 15, {
          font: 'bold 9px Inter, sans-serif',
          color: '#22c55e',
        });
      }

      if (lines && lines.Kbeta > lambdaMin) {
        const kBetaX = lambdaToX(lines.Kbeta);
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(kBetaX, graphBottom);
        ctx.lineTo(kBetaX, graphTop + 40);
        ctx.stroke();
        
        drawLabel(ctx, `Kβ`, kBetaX, graphTop + 30, {
          font: 'bold 9px Inter, sans-serif',
          color: '#3b82f6',
        });
      }
    }

  }, [canvasWidth, canvasHeight, voltage, lambdaMin, showCharacteristic, 
      targetMaterial, characteristicLines]);

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
          X-ray Production (Coolidge Tube)
        </h2>
        <p className="text-slate-400 mt-1">
          Continuous spectrum with minimum wavelength cutoff
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
              <li>X-rays are produced in a <strong>Coolidge tube</strong> when high-speed electrons from a heated cathode (filament) are accelerated by high voltage (10-100 kV) and strike a metal target (anode like tungsten, copper, or molybdenum).</li>
              <li>Two types of X-rays are produced: <strong>Continuous X-rays (Bremsstrahlung)</strong> form when electrons decelerate upon hitting the target, while <strong>characteristic X-rays</strong> (Kα, Kβ lines) occur when inner shell electrons are knocked out and outer electrons fill the vacancy.</li>
              <li>The <strong>Duane-Hunt law</strong> gives the minimum wavelength cutoff: <strong>λ_min = hc/eV = 12400/V Å</strong>, which occurs when all the electron's kinetic energy converts to a single photon. Increasing tube voltage decreases λ_min.</li>
              <li><strong>Moseley's law</strong> relates characteristic X-ray frequency to atomic number: √f = a(Z - b), which helped establish atomic number as the fundamental property of elements. X-rays are used in medical imaging, crystallography, and security scanning.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/X-ray"
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

            {/* Voltage slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Accelerating Voltage</span>
                <span className="font-mono text-blue-400">{(voltage / 1000).toFixed(0)} kV</span>
              </label>
              <input
                type="range"
                min={10000}
                max={100000}
                step={1000}
                value={voltage}
                onChange={(e) => setXRayVoltage(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>10 kV</span>
                <span>100 kV</span>
              </div>
            </div>

            {/* Target material */}
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Target Material</label>
              <div className="flex gap-2">
                {['Tungsten', 'Copper', 'Molybdenum'].map((material) => (
                  <button
                    key={material}
                    onClick={() => setTargetMaterial(material)}
                    className={`px-3 py-1 rounded text-sm ${
                      targetMaterial === material
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            {/* Show characteristic lines */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Show Characteristic Lines</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  showCharacteristic ? 'bg-green-600' : 'bg-slate-600'
                }`}
                onClick={toggleCharacteristic}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                  showCharacteristic ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Results */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Results
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">λ_min =</span>
                <span className="text-white font-mono">{lambdaMin.toFixed(4)} pm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">E_max =</span>
                <span className="text-white font-mono">{(maxEnergy / 1000).toFixed(2)} keV</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">f_max =</span>
                <span className="text-white font-mono">{(2.42e17 * voltage / 1e15).toFixed(2)} × 10¹⁸ Hz</span>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Duane-Hunt Law</h4>
            <div className="bg-slate-800 rounded p-3 text-center">
              <LaTeX 
                formula="\lambda_{\min} = \frac{hc}{eV}" 
                className="text-amber-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              The minimum wavelength occurs when all electron KE converts to photon energy.
            </p>
          </div>
        </div>
      </div>

      {/* Quiz Section - Full Width */}
      <div className="mt-8">
        <Quiz title="Test Your Knowledge - X-ray Production" questions={xrayQuiz} />
      </div>
    </motion.div>
  );
};

export default XRayModule;
