/**
 * Electron Cloud Module
 * 3D visualization of hydrogen atom electron probability density
 */

import React, { useCallback, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { clearCanvas, drawLabel } from '../../utils/canvasUtils';
import { LaTeX } from '../../components/ui/LaTeX';

// Quantum numbers for hydrogen orbitals
interface OrbitalState {
  n: number;  // Principal quantum number
  l: number;  // Azimuthal quantum number
  m: number;  // Magnetic quantum number
}

// Orbital names
const getOrbitalName = (n: number, l: number): string => {
  const subshells = ['s', 'p', 'd', 'f'];
  return `${n}${subshells[l] || '?'}`;
};

// Calculate radial probability density R(r)^2 * r^2 for hydrogen
const radialProbability = (n: number, l: number, r: number): number => {
  const a0 = 1; // Normalized Bohr radius
  const rho = (2 * r) / (n * a0);
  
  // Simplified radial wave functions for common orbitals
  if (n === 1 && l === 0) {
    // 1s orbital
    return 4 * rho * rho * Math.exp(-rho);
  } else if (n === 2 && l === 0) {
    // 2s orbital
    const factor = (2 - rho) * (2 - rho);
    return (rho * rho / 8) * factor * Math.exp(-rho);
  } else if (n === 2 && l === 1) {
    // 2p orbital
    return (rho * rho * rho * rho / 24) * Math.exp(-rho);
  } else if (n === 3 && l === 0) {
    // 3s orbital
    const factor = (27 - 18 * rho + 2 * rho * rho);
    return (rho * rho / 729) * factor * factor * Math.exp(-rho);
  } else if (n === 3 && l === 1) {
    // 3p orbital
    const factor = (6 - rho) * (6 - rho);
    return (rho * rho * rho * rho / 11664) * factor * Math.exp(-rho);
  } else if (n === 3 && l === 2) {
    // 3d orbital
    return (rho * rho * rho * rho * rho * rho / 174960) * Math.exp(-rho);
  }
  
  // Generic fallback
  return Math.pow(rho, 2 * l + 2) * Math.exp(-rho) / Math.pow(n, 3);
};

// Angular probability density for different m values - enhanced for visual distinction
const angularProbability = (l: number, m: number, theta: number, _phi: number): number => {
  if (l === 0) {
    // s orbital - spherical (uniform in all directions)
    return 1.0;
  } else if (l === 1) {
    // p orbitals - dumbbell shape
    if (m === 0) {
      // pz - dumbbell along z axis
      const cosTheta = Math.cos(theta);
      return cosTheta * cosTheta * 3.0; // Enhanced for visibility
    } else {
      // px, py - dumbbell in xy plane
      const sinTheta = Math.sin(theta);
      return sinTheta * sinTheta * 3.0;
    }
  } else if (l === 2) {
    // d orbitals - cloverleaf shapes
    if (m === 0) {
      // dz² - dumbbell with ring
      const cosTheta = Math.cos(theta);
      const factor = 3 * cosTheta * cosTheta - 1;
      return factor * factor * 2.0;
    } else if (Math.abs(m) === 1) {
      // dxz, dyz
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      return sinTheta * sinTheta * cosTheta * cosTheta * 12.0;
    } else {
      // dx²-y², dxy - four lobes in xy plane
      const sinTheta = Math.sin(theta);
      return Math.pow(sinTheta, 4) * 4.0;
    }
  }
  return 1.0;
};

export const ElectronCloudModule: React.FC = () => {
  const [orbital, setOrbital] = useState<OrbitalState>({ n: 1, l: 0, m: 0 });
  const [rotationY, setRotationY] = useState(0.5);
  const [rotationX, setRotationX] = useState(0.3);
  const [zoom, setZoom] = useState(1.0);
  const [showCrossSection, setShowCrossSection] = useState(false);
  const [particleCount, setParticleCount] = useState(15000);
  
  const canvasWidth = 550;
  const canvasHeight = 500;
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  
  // Pre-generate particles based on probability distribution
  const particlesRef = useRef<Array<{ x: number; y: number; z: number; prob: number }>>([]);
  const lastOrbitalRef = useRef<string>('');
  
  const generateParticles = useCallback((n: number, l: number, m: number, count: number) => {
    const particles: Array<{ x: number; y: number; z: number; prob: number }> = [];
    const maxR = n * n * 5; // Maximum radius to sample
    
    let attempts = 0;
    const maxAttempts = count * 100;
    
    while (particles.length < count && attempts < maxAttempts) {
      attempts++;
      
      // Random spherical coordinates
      const r = Math.random() * maxR;
      const theta = Math.acos(2 * Math.random() - 1); // Uniform on sphere
      const phi = Math.random() * 2 * Math.PI;
      
      // Calculate probability at this point
      const radialProb = radialProbability(n, l, r);
      const angularProb = angularProbability(l, m, theta, phi);
      
      // Separate acceptance for radial and angular parts
      // This ensures orbital shapes are clearly visible
      const radialAccept = Math.random() < radialProb * 30;
      const angularAccept = Math.random() < angularProb;
      
      if (radialAccept && angularAccept) {
        // Convert to Cartesian
        const x = r * Math.sin(theta) * Math.cos(phi);
        const y = r * Math.sin(theta) * Math.sin(phi);
        const z = r * Math.cos(theta);
        
        particles.push({ x, y, z, prob: radialProb * angularProb });
      }
    }
    
    return particles;
  }, []);

  // Draw function
  // Draw function - static visualization (no animation)
  const draw = useCallback((ctx: CanvasRenderingContext2D, _frameCount: number) => {
    clearCanvas(ctx, canvasWidth, canvasHeight, '#050510');
    
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const scale = 15 * zoom; // Pixels per Bohr radius with zoom
    
    // Use current rotation values (no auto-rotate)
    const currentRotY = rotationY;
    const currentRotX = rotationX;
    
    // Regenerate particles if orbital changed
    const orbitalKey = `${orbital.n}-${orbital.l}-${orbital.m}-${particleCount}`;
    if (lastOrbitalRef.current !== orbitalKey) {
      particlesRef.current = generateParticles(orbital.n, orbital.l, orbital.m, particleCount);
      lastOrbitalRef.current = orbitalKey;
    }
    
    // Title
    drawLabel(ctx, `Hydrogen Electron Cloud: ${getOrbitalName(orbital.n, orbital.l)} orbital`, centerX, 25, {
      font: 'bold 18px Inter, system-ui, sans-serif',
      color: '#e2e8f0',
    });
    
    // Draw coordinate axes (subtle)
    const axisLength = 80 * zoom;
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.3)';
    ctx.lineWidth = 1;
    
    // X-axis (red)
    const xEnd = rotate3D(axisLength, 0, 0, currentRotX, currentRotY);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + xEnd.x, centerY + xEnd.y);
    ctx.stroke();
    
    // Y-axis (green)
    const yEnd = rotate3D(0, axisLength, 0, currentRotX, currentRotY);
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + yEnd.x, centerY + yEnd.y);
    ctx.stroke();
    
    // Z-axis (blue)
    const zEnd = rotate3D(0, 0, axisLength, currentRotX, currentRotY);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + zEnd.x, centerY + zEnd.y);
    ctx.stroke();
    
    // Draw nucleus
    const nucleusGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15);
    nucleusGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
    nucleusGlow.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
    nucleusGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = nucleusGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Sort particles by z for proper depth rendering
    const transformedParticles = particlesRef.current.map(p => {
      const rotated = rotate3D(p.x * scale, p.y * scale, p.z * scale, currentRotX, currentRotY);
      return { ...rotated, prob: p.prob };
    }).sort((a, b) => a.z - b.z);
    
    // Draw electron probability cloud
    for (const particle of transformedParticles) {
      // Skip if cross-section mode and not in slice
      if (showCrossSection && Math.abs(particle.z) > 20) continue;
      
      const screenX = centerX + particle.x;
      const screenY = centerY + particle.y;
      
      // Small particles for realistic cloud appearance
      const depthFactor = (particle.z + 200) / 400;
      const size = 0.8 + depthFactor * 0.6; // Particles: 0.8 to 1.4 px
      const alpha = 0.25 + depthFactor * 0.45; // Better visibility
      
      // Distinct colors for each orbital type
      let color: string;
      if (orbital.l === 0) {
        color = `rgba(100, 180, 255, ${alpha})`; // Bright blue for s (spherical)
      } else if (orbital.l === 1) {
        color = `rgba(200, 100, 255, ${alpha})`; // Vivid purple for p (dumbbell)
      } else {
        color = `rgba(255, 150, 50, ${alpha})`; // Bright orange for d (cloverleaf)
      }
      
      ctx.fillStyle = color;
      ctx.fillRect(screenX, screenY, size, size); // Use fillRect for speed with tiny particles
    }
    
    // Draw Bohr radius reference circle
    const bohrCircleRadius = scale;
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, bohrCircleRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Info panel
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.fillRect(10, canvasHeight - 80, 180, 70);
    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.strokeRect(10, canvasHeight - 80, 180, 70);
    
    // Shape description
    const shapeDesc = orbital.l === 0 ? 'Spherical' : orbital.l === 1 ? 'Dumbbell (2 lobes)' : 'Cloverleaf (4 lobes)';
    const shapeColor = orbital.l === 0 ? '#64b5f6' : orbital.l === 1 ? '#ce93d8' : '#ffb74d';
    
    drawLabel(ctx, `Orbital: ${getOrbitalName(orbital.n, orbital.l)}`, 100, canvasHeight - 60, {
      font: 'bold 14px Inter, sans-serif',
      color: '#e2e8f0',
    });
    drawLabel(ctx, `Shape: ${shapeDesc}`, 100, canvasHeight - 40, {
      font: '12px Inter, sans-serif',
      color: shapeColor,
    });
    drawLabel(ctx, `n=${orbital.n}, l=${orbital.l}, m=${orbital.m}`, 100, canvasHeight - 22, {
      font: '11px Inter, sans-serif',
      color: '#64748b',
    });
    
    // Zoom indicator
    drawLabel(ctx, `Zoom: ${(zoom * 100).toFixed(0)}%`, canvasWidth - 60, canvasHeight - 15, {
      font: '10px Inter, sans-serif',
      color: '#64748b',
    });
    
  }, [canvasWidth, canvasHeight, orbital, rotationY, rotationX, zoom,
      showCrossSection, particleCount, generateParticles]);

  // 3D rotation helper
  const rotate3D = (x: number, y: number, z: number, rotX: number, rotY: number) => {
    // Rotate around Y axis
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;
    
    // Rotate around X axis
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;
    
    return { x: x1, y: y1, z: z2 };
  };

  // Canvas ref and redraw on state changes
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
      draw(ctx, 0);
    }
  }, [draw, canvasWidth, canvasHeight]);

  // Mouse handlers for rotation (drag to rotate)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setRotationY(prev => prev + dx * 0.01);
    setRotationX(prev => Math.max(-Math.PI/2, Math.min(Math.PI/2, prev + dy * 0.01)));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Mouse wheel for zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3.0, prev + delta)));
  };

  // Available orbitals
  const orbitals: OrbitalState[] = [
    { n: 1, l: 0, m: 0 },  // 1s
    { n: 2, l: 0, m: 0 },  // 2s
    { n: 2, l: 1, m: 0 },  // 2p
    { n: 3, l: 0, m: 0 },  // 3s
    { n: 3, l: 1, m: 0 },  // 3p
    { n: 3, l: 2, m: 0 },  // 3d
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">
            Hydrogen Electron Cloud Visualizer
          </h2>
          <span className="px-2 py-1 bg-amber-600/20 text-amber-400 text-xs font-medium rounded-full border border-amber-600/30">
            Bonus Content
          </span>
        </div>
        <p className="text-slate-400 mt-1">
          3D probability density |ψ|² for hydrogen atomic orbitals (supplementary visualization for deeper understanding)
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <canvas
            ref={canvasRef}
            className="rounded-lg shadow-2xl border border-slate-700 cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Interaction hint */}
          <p className="text-xs text-slate-500 mt-2 text-center">
            🖱️ Drag to rotate • Scroll to zoom
          </p>
          
          {/* Class 12 NEB Notes */}
          <div className="mt-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
            <h4 className="text-amber-400 font-semibold mb-2">📖 Class 12 NEB Notes</h4>
            <ul className="text-slate-300 text-xs leading-relaxed space-y-2 list-disc list-inside">
              <li>Unlike Bohr's fixed orbits, quantum mechanics describes electrons as <strong>probability clouds</strong>. The wave function ψ gives the probability amplitude, and |ψ|² gives the probability density of finding the electron at any point.</li>
              <li>Each orbital is characterized by quantum numbers: <strong>n</strong> (principal, determines energy and size), <strong>l</strong> (azimuthal, determines shape: s=0 spherical, p=1 dumbbell, d=2 cloverleaf), and <strong>m</strong> (magnetic, determines orientation).</li>
              <li>The <strong>s orbitals</strong> are spherically symmetric. The <strong>p orbitals</strong> have two lobes along an axis. The <strong>d orbitals</strong> have four lobes or a dumbbell with a ring.</li>
              <li>The most probable radius for 1s electron is exactly <strong>one Bohr radius (a₀ = 0.529 Å)</strong>, matching Bohr's prediction, though the electron can be found at any distance with varying probability.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/Atomic_orbital"
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
              Orbital Selection
            </h3>

            {/* Orbital buttons */}
            <div className="grid grid-cols-3 gap-2">
              {orbitals.map((orb) => (
                <button
                  key={`${orb.n}${orb.l}${orb.m}`}
                  onClick={() => setOrbital(orb)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orbital.n === orb.n && orbital.l === orb.l
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {getOrbitalName(orb.n, orb.l)}
                </button>
              ))}
            </div>

            {/* Particle count */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Cloud Density</span>
                <span className="font-mono text-blue-400">{particleCount}</span>
              </label>
              <input
                type="range"
                min={5000}
                max={30000}
                step={1000}
                value={particleCount}
                onChange={(e) => setParticleCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Zoom slider */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Zoom</span>
                <span className="font-mono text-green-400">{(zoom * 100).toFixed(0)}%</span>
              </label>
              <input
                type="range"
                min={0.5}
                max={3.0}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Cross section toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-slate-300">Cross Section View</span>
              <div 
                className={`w-12 h-6 rounded-full transition-colors ${
                  showCrossSection ? 'bg-green-600' : 'bg-slate-600'
                }`}
                onClick={() => setShowCrossSection(!showCrossSection)}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
                  showCrossSection ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </div>
            </label>
          </div>

          {/* Orbital Info */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-3">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Orbital Properties
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Energy level (n):</span>
                <span className="text-white font-mono">{orbital.n}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Angular momentum (l):</span>
                <span className="text-white font-mono">{orbital.l}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Shape:</span>
                <span className="text-white">
                  {orbital.l === 0 ? 'Spherical' : orbital.l === 1 ? 'Dumbbell' : 'Cloverleaf'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max electrons:</span>
                <span className="text-white font-mono">{2 * (2 * orbital.l + 1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Energy:</span>
                <span className="text-white font-mono">{(-13.6 / (orbital.n * orbital.n)).toFixed(2)} eV</span>
              </div>
            </div>
          </div>

          {/* Formula */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Wave Function</h4>
            <div className="bg-slate-800 rounded p-3 text-center">
              <LaTeX 
                formula="\psi_{n,l,m}(r,\theta,\phi) = R_{n,l}(r) \cdot Y_l^m(\theta,\phi)" 
                className="text-green-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              The wave function is a product of radial R(r) and angular Y(θ,φ) parts.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ElectronCloudModule;
