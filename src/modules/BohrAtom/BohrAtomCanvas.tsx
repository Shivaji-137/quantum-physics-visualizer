/**
 * Bohr Atom Canvas Component
 * Interactive visualization of Bohr's hydrogen atom model
 * Enhanced with realistic 3D-like effects
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { useCanvasAnimation } from '../../hooks/useCanvasAnimation';
import { useQuantumStore, type BohrAtomState } from '../../store/useQuantumStore';
// Note: polarToCartesian moved to inline calculations for 3D tilted orbits
import {
  bohrRadius,
  bohrEnergy,
  rydbergWavelengthNm,
  transitionEnergy,
  ENERGY_LEVEL_COLORS,
} from '../../physics';

interface BohrAtomCanvasProps {
  width: number;
  height: number;
}

// Helper function to draw realistic 3D nucleus with proton
const drawRealisticNucleus = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number
) => {
  // Outer glow
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 3);
  glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
  glowGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
  glowGradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
  ctx.fill();

  // Main nucleus sphere with 3D gradient
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius
  );
  gradient.addColorStop(0, '#ff6b6b');
  gradient.addColorStop(0.3, '#ef4444');
  gradient.addColorStop(0.7, '#dc2626');
  gradient.addColorStop(1, '#991b1b');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Highlight for 3D effect
  const highlightGradient = ctx.createRadialGradient(
    x - radius * 0.4,
    y - radius * 0.4,
    0,
    x - radius * 0.4,
    y - radius * 0.4,
    radius * 0.6
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Proton label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('p⁺', x, y);
};

// Helper function to draw realistic electron with orbital trail
const drawRealisticElectron = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  trail: Array<{x: number, y: number, alpha: number}>
) => {
  // Draw trail (motion blur effect)
  for (let i = 0; i < trail.length; i++) {
    const point = trail[i];
    const trailRadius = radius * (0.3 + 0.7 * point.alpha);
    ctx.fillStyle = `rgba(96, 165, 250, ${point.alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, trailRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Outer glow
  const glowGradient = ctx.createRadialGradient(x, y, radius * 0.5, x, y, radius * 2.5);
  glowGradient.addColorStop(0, `${color}80`);
  glowGradient.addColorStop(0.5, `${color}30`);
  glowGradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Main electron sphere
  const gradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.1,
    x,
    y,
    radius
  );
  gradient.addColorStop(0, '#93c5fd');
  gradient.addColorStop(0.4, '#60a5fa');
  gradient.addColorStop(0.8, '#3b82f6');
  gradient.addColorStop(1, '#1d4ed8');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  const highlightGradient = ctx.createRadialGradient(
    x - radius * 0.3,
    y - radius * 0.3,
    0,
    x - radius * 0.3,
    y - radius * 0.3,
    radius * 0.5
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // e⁻ label
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 9px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('e⁻', x, y);
};

// Helper function to draw 3D-like orbit
const drawRealisticOrbit = (
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  isActive: boolean,
  color: string,
  tilt: number = 0.15
) => {
  ctx.save();
  
  // Draw elliptical orbit for 3D effect
  const scaleY = 1 - tilt;
  
  if (isActive) {
    // Glow for active orbit
    ctx.strokeStyle = `${color}60`;
    ctx.lineWidth = 6;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius * scaleY, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Main orbit line
  ctx.strokeStyle = isActive ? color : `${color}50`;
  ctx.lineWidth = isActive ? 2 : 1;
  ctx.setLineDash(isActive ? [] : [4, 4]);
  ctx.beginPath();
  ctx.ellipse(centerX, centerY, radius, radius * scaleY, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
};

// Draw photon wave animation
const drawPhotonWave = (
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  wavelengthNm: number,
  phase: number,
  progress: number
) => {
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);

  // Get color from wavelength
  const getWavelengthColor = (wl: number): string => {
    if (wl < 380) return '#8b5cf6'; // UV - purple
    if (wl < 450) return '#6366f1'; // Violet
    if (wl < 495) return '#3b82f6'; // Blue
    if (wl < 570) return '#22c55e'; // Green
    if (wl < 590) return '#eab308'; // Yellow
    if (wl < 620) return '#f97316'; // Orange
    if (wl < 750) return '#ef4444'; // Red
    return '#991b1b'; // IR - dark red
  };

  const color = getWavelengthColor(wavelengthNm);
  const waveLength = Math.max(10, Math.min(30, wavelengthNm / 20));
  const amplitude = 8;

  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);

  // Draw wave
  const actualLength = length * progress;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  for (let x = 0; x < actualLength; x += 2) {
    const y = Math.sin((x / waveLength) * Math.PI * 2 + phase) * amplitude;
    ctx.lineTo(x, y);
  }

  // Glow effect
  ctx.strokeStyle = `${color}60`;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Main wave
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Photon particle at end
  const endPosX = actualLength;
  const endPosY = Math.sin((actualLength / waveLength) * Math.PI * 2 + phase) * amplitude;
  
  const photonGlow = ctx.createRadialGradient(endPosX, endPosY, 0, endPosX, endPosY, 12);
  photonGlow.addColorStop(0, color);
  photonGlow.addColorStop(0.5, `${color}80`);
  photonGlow.addColorStop(1, `${color}00`);
  ctx.fillStyle = photonGlow;
  ctx.beginPath();
  ctx.arc(endPosX, endPosY, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
};

export const BohrAtomCanvas: React.FC<BohrAtomCanvasProps> = ({ width, height }) => {
  const {
    bohrAtom: { n, targetN, isAnimating, showOrbits, showLabels, isTransitioning, animationSpeed },
    setBohrN,
  } = useQuantumStore();

  // Speed multiplier: slow = 0.3x, normal = 1x
  const speedMultiplier = animationSpeed === 'slow' ? 0.3 : 1;

  // Animation state
  const electronAngleRef = useRef(0);
  const transitionProgressRef = useRef(0);
  const electronTrailRef = useRef<Array<{x: number, y: number, alpha: number}>>([]);

  // Calculate scale factor to fit orbits in canvas
  const centerX = width / 2;
  const centerY = height / 2;
  const maxOrbitRadius = Math.min(width, height) / 2 - 70;
  
  // Scale so n=6 orbit fits, and n=1 has minimum visible radius
  // bohrRadius returns n² × BOHR_RADIUS, so for n=6: 36 × BOHR_RADIUS
  const scaleFactor = maxOrbitRadius / 36; // n=6 gives radius = 36 * scaleFactor

  // Get scaled radius for level n (r_n = n² × a₀, scaled for display)
  const getScaledRadius = useCallback((level: number) => {
    // Minimum radius of 25px for n=1 to keep electron away from nucleus
    const minRadius = 25;
    const baseRadius = level * level * scaleFactor;
    return Math.max(minRadius, baseRadius);
  }, [scaleFactor]);

  // Photon properties for current transition
  const photonData = useMemo(() => {
    if (n === targetN) return null;
    const ni = Math.max(n, targetN);
    const nf = Math.min(n, targetN);
    return {
      wavelengthNm: rydbergWavelengthNm(ni, nf),
      energyEv: transitionEnergy(ni, nf),
      isEmission: n > targetN,
    };
  }, [n, targetN]);

  // Main draw function
  const draw = useCallback((ctx: CanvasRenderingContext2D, frameCount: number, _deltaTime: number) => {
    // Clear canvas with space-like gradient background
    const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
    bgGradient.addColorStop(0, '#0f172a');
    bgGradient.addColorStop(0.5, '#0a0a1a');
    bgGradient.addColorStop(1, '#050510');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle stars in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const starX = (Math.sin(i * 567.89) * 0.5 + 0.5) * width;
      const starY = (Math.cos(i * 123.45) * 0.5 + 0.5) * height;
      const starSize = Math.abs(Math.sin(i * 34.56)) * 1.5 + 0.5;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update electron position (speed varies with n - faster for lower orbits)
    const angularSpeed = (0.03 / Math.sqrt(n)) * speedMultiplier;
    electronAngleRef.current += angularSpeed;
    if (electronAngleRef.current > Math.PI * 2) {
      electronAngleRef.current -= Math.PI * 2;
    }

    // Calculate electron position
    const electronRadius = getScaledRadius(n);
    const tilt = 0.15;
    const electronX = centerX + electronRadius * Math.cos(electronAngleRef.current);
    const electronY = centerY + electronRadius * (1 - tilt) * Math.sin(electronAngleRef.current);

    // Update electron trail
    electronTrailRef.current.unshift({ x: electronX, y: electronY, alpha: 1 });
    electronTrailRef.current = electronTrailRef.current.slice(0, 15).map((p, i) => ({
      ...p,
      alpha: 1 - (i / 15)
    }));

    // Draw all orbits
    if (showOrbits) {
      for (let level = 1; level <= 6; level++) {
        const radius = getScaledRadius(level);
        const isActive = level === n;
        const color = ENERGY_LEVEL_COLORS[level - 1];
        
        drawRealisticOrbit(ctx, centerX, centerY, radius, isActive, color, tilt);

        // Draw energy labels
        if (showLabels && radius > 25) {
          const labelAngle = -Math.PI / 2 - 0.3;
          const labelRadius = radius + 5;
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * (1 - tilt) * Math.sin(labelAngle) - 8;
          
          // Background for label
          const labelText = `n=${level}`;
          ctx.font = isActive ? 'bold 11px Inter, system-ui, sans-serif' : '10px Inter, system-ui, sans-serif';
          const textWidth = ctx.measureText(labelText).width;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(labelX - textWidth/2 - 4, labelY - 8, textWidth + 8, 16);
          
          ctx.fillStyle = isActive ? color : '#94a3b8';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, labelX, labelY);
        }
      }
    }

    // Draw nucleus
    drawRealisticNucleus(ctx, centerX, centerY, 18);

    // Draw electron
    drawRealisticElectron(
      ctx,
      electronX,
      electronY,
      10,
      ENERGY_LEVEL_COLORS[n - 1],
      electronTrailRef.current
    );

    // Handle transition animation
    if (isTransitioning && photonData) {
      transitionProgressRef.current += 0.015 * speedMultiplier;
      
      if (transitionProgressRef.current >= 1) {
        // Transition complete
        transitionProgressRef.current = 0;
        setBohrN(targetN);
        useQuantumStore.setState((state: { bohrAtom: BohrAtomState }) => ({
          bohrAtom: { ...state.bohrAtom, isTransitioning: false, photonEmitted: false }
        }));
      } else {
        // Draw photon animation
        const photonAngle = electronAngleRef.current + Math.PI / 3;
        const currentOrbitRadius = getScaledRadius(n);
        
        if (photonData.isEmission) {
          // Emission: photon travels outward from electron
          const photonStartX = centerX + currentOrbitRadius * Math.cos(photonAngle);
          const photonStartY = centerY + currentOrbitRadius * (1 - tilt) * Math.sin(photonAngle);
          const photonEndX = photonStartX + 100 * Math.cos(photonAngle);
          const photonEndY = photonStartY + 100 * Math.sin(photonAngle);
          
          drawPhotonWave(
            ctx,
            photonStartX,
            photonStartY,
            photonEndX,
            photonEndY,
            photonData.wavelengthNm,
            frameCount * 0.3,
            transitionProgressRef.current
          );
        } else {
          // Absorption: photon travels inward towards the electron in its current orbit
          const outsideRadius = currentOrbitRadius + 100;
          const photonStartX = centerX + outsideRadius * Math.cos(photonAngle);
          const photonStartY = centerY + outsideRadius * (1 - tilt) * Math.sin(photonAngle);
          const photonEndX = centerX + currentOrbitRadius * Math.cos(photonAngle);
          const photonEndY = centerY + currentOrbitRadius * (1 - tilt) * Math.sin(photonAngle);
          
          drawPhotonWave(
            ctx,
            photonStartX,
            photonStartY,
            photonEndX,
            photonEndY,
            photonData.wavelengthNm,
            frameCount * 0.3,
            transitionProgressRef.current
          );
        }
        
        // Draw transition info panel
        const panelX = width - 160;
        const panelY = height - 100;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(panelX - 10, panelY - 15, 160, 80, 8);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 13px Inter, system-ui, sans-serif';
        ctx.textAlign = 'left';
        const transitionText = photonData.isEmission 
          ? `Emission: n=${n} → ${targetN}` 
          : `Absorption: n=${n} → ${targetN}`;
        ctx.fillText(transitionText, panelX, panelY + 5);
        
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Inter, system-ui, sans-serif';
        ctx.fillText(`λ = ${photonData.wavelengthNm.toFixed(1)} nm`, panelX, panelY + 25);
        ctx.fillText(`ΔE = ${photonData.energyEv.toFixed(3)} eV`, panelX, panelY + 45);
      }
    }

    // Draw title with background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, width, 45);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Bohr Hydrogen Atom Model', centerX, 25);

    // Draw current state info panel
    const currentEnergy = bohrEnergy(n);
    const currentRadius = bohrRadius(n);
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = ENERGY_LEVEL_COLORS[n - 1];
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(10, height - 95, 170, 85, 8);
    ctx.fill();
    ctx.stroke();
    
    ctx.fillStyle = ENERGY_LEVEL_COLORS[n - 1];
    ctx.font = 'bold 14px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Current State: n = ${n}`, 20, height - 75);
    
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.fillText(`Energy: ${currentEnergy.toFixed(3)} eV`, 20, height - 52);
    ctx.fillText(`Radius: ${(currentRadius * 1e10).toFixed(3)} Å`, 20, height - 32);
    
    // Velocity info
    const velocity = 2.18e6 / n; // v_n = v_1 / n
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`Velocity: ${(velocity / 1e6).toFixed(2)} Mm/s`, 20, height - 12);

  }, [width, height, n, targetN, showOrbits, showLabels, isTransitioning, photonData, 
      centerX, centerY, getScaledRadius, setBohrN, speedMultiplier]);

  const canvasRef = useCanvasAnimation({
    width,
    height,
    draw,
    isAnimating,
  });

  return (
    <canvas
      ref={canvasRef}
      className="rounded-xl shadow-2xl border border-slate-700"
      style={{ background: '#050510' }}
    />
  );
};

export default BohrAtomCanvas;
