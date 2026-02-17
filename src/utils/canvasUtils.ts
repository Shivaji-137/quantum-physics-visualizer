/**
 * Canvas Rendering Utilities
 * Reusable drawing functions for physics visualizations
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface CanvasConfig {
  width: number;
  height: number;
  dpr: number;  // Device pixel ratio
}

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

/**
 * Setup canvas with proper scaling for high-DPI displays
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  return ctx;
}

/**
 * Clear canvas with optional background color
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = '#0a0a0f'
): void {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
}

// ============================================================================
// DRAWING PRIMITIVES
// ============================================================================

/**
 * Draw a circle
 */
export function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  options: {
    fill?: string;
    stroke?: string;
    lineWidth?: number;
    lineDash?: number[];
  } = {}
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  
  if (options.lineDash) {
    ctx.setLineDash(options.lineDash);
  }
  
  if (options.fill) {
    ctx.fillStyle = options.fill;
    ctx.fill();
  }
  
  if (options.stroke) {
    ctx.strokeStyle = options.stroke;
    ctx.lineWidth = options.lineWidth || 1;
    ctx.stroke();
  }
  
  ctx.setLineDash([]);
}

/**
 * Draw an orbital ring (ellipse or circle)
 */
export function drawOrbit(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  options: {
    color?: string;
    lineWidth?: number;
    alpha?: number;
    glow?: boolean;
  } = {}
): void {
  const { color = '#3b82f6', lineWidth = 1.5, alpha = 1, glow = false } = options;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
  }
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Draw electron particle with glow effect
 */
export function drawElectron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 6,
  options: {
    color?: string;
    glowColor?: string;
    glowSize?: number;
  } = {}
): void {
  const { color = '#60a5fa', glowColor = '#3b82f6', glowSize = 15 } = options;
  
  // Glow effect
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
  gradient.addColorStop(0, glowColor);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, glowSize, 0, Math.PI * 2);
  ctx.fill();
  
  // Core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw nucleus (proton cluster)
 */
export function drawNucleus(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number = 12,
  options: {
    color?: string;
    glowColor?: string;
  } = {}
): void {
  const { color = '#ef4444', glowColor = '#dc2626' } = options;
  
  // Glow
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
  gradient.addColorStop(0, glowColor);
  gradient.addColorStop(0.5, color);
  gradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fill();
  
  // Core
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner detail
  ctx.fillStyle = '#fca5a5';
  ctx.beginPath();
  ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw a photon (wavy line with arrow)
 */
export function drawPhoton(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  wavelengthNm: number,
  options: {
    color?: string;
    amplitude?: number;
    frequency?: number;
    animated?: boolean;
    animationPhase?: number;
  } = {}
): void {
  const { 
    color,
    amplitude = 8, 
    frequency = 0.1,
    animationPhase = 0 
  } = options;
  
  // Calculate direction
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx);
  
  // Determine color from wavelength if not specified
  const photonColor = color || wavelengthToColorSimple(wavelengthNm);
  
  ctx.save();
  ctx.translate(startX, startY);
  ctx.rotate(angle);
  
  // Draw wavy line
  ctx.beginPath();
  ctx.moveTo(0, 0);
  
  const steps = Math.floor(length / 2);
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * length;
    const y = amplitude * Math.sin(frequency * i * 10 + animationPhase);
    ctx.lineTo(x, y);
  }
  
  ctx.strokeStyle = photonColor;
  ctx.lineWidth = 2;
  ctx.shadowColor = photonColor;
  ctx.shadowBlur = 8;
  ctx.stroke();
  
  // Arrow head
  const arrowSize = 8;
  ctx.beginPath();
  ctx.moveTo(length, 0);
  ctx.lineTo(length - arrowSize, -arrowSize / 2);
  ctx.lineTo(length - arrowSize, arrowSize / 2);
  ctx.closePath();
  ctx.fillStyle = photonColor;
  ctx.fill();
  
  ctx.restore();
}

/**
 * Draw sine wave
 */
export function drawSineWave(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  length: number,
  options: {
    amplitude?: number;
    wavelength?: number;
    color?: string;
    lineWidth?: number;
    phase?: number;
    alpha?: number;
  } = {}
): void {
  const {
    amplitude = 20,
    wavelength = 50,
    color = '#60a5fa',
    lineWidth = 2,
    phase = 0,
    alpha = 1
  } = options;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  ctx.beginPath();
  ctx.moveTo(startX, startY);
  
  for (let x = 0; x <= length; x += 1) {
    const y = amplitude * Math.sin((2 * Math.PI * x) / wavelength + phase);
    ctx.lineTo(startX + x, startY + y);
  }
  
  ctx.stroke();
  ctx.restore();
}

/**
 * Draw circular standing wave on orbit
 */
export function drawStandingWave(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  radius: number,
  nWavelengths: number,
  options: {
    amplitude?: number;
    color?: string;
    lineWidth?: number;
    phase?: number;
    alpha?: number;
  } = {}
): void {
  const {
    amplitude = 10,
    color = '#60a5fa',
    lineWidth = 2,
    phase = 0,
    alpha = 1
  } = options;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  
  ctx.beginPath();
  
  const steps = 360;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const waveOffset = amplitude * Math.sin(nWavelengths * angle + phase);
    const r = radius + waveOffset;
    
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

// ============================================================================
// TEXT AND LABELS
// ============================================================================

/**
 * Draw text label with optional background
 */
export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    font?: string;
    color?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    background?: string;
    padding?: number;
  } = {}
): void {
  const {
    font = '14px Inter, system-ui, sans-serif',
    color = '#e2e8f0',
    align = 'center',
    baseline = 'middle',
    background,
    padding = 4
  } = options;
  
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  
  if (background) {
    const metrics = ctx.measureText(text);
    const width = metrics.width + padding * 2;
    const height = 20 + padding * 2;
    
    let bgX = x - width / 2;
    if (align === 'left') bgX = x - padding;
    if (align === 'right') bgX = x - width + padding;
    
    ctx.fillStyle = background;
    ctx.fillRect(bgX, y - height / 2, width, height);
  }
  
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/**
 * Draw energy level label
 */
export function drawEnergyLabel(
  ctx: CanvasRenderingContext2D,
  n: number,
  energy: number,
  x: number,
  y: number,
  color: string
): void {
  ctx.font = 'bold 12px Inter, system-ui, sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  const label = `n=${n}: ${energy.toFixed(2)} eV`;
  ctx.fillText(label, x, y);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Simple wavelength to color conversion (visible spectrum)
 */
function wavelengthToColorSimple(wavelengthNm: number): string {
  if (wavelengthNm < 380) return '#8B00FF';
  if (wavelengthNm > 780) return '#8B0000';
  
  if (wavelengthNm < 450) return '#8B00FF';      // Violet
  if (wavelengthNm < 495) return '#0000FF';      // Blue
  if (wavelengthNm < 570) return '#00FF00';      // Green
  if (wavelengthNm < 590) return '#FFFF00';      // Yellow
  if (wavelengthNm < 620) return '#FF8C00';      // Orange
  return '#FF0000';                               // Red
}

/**
 * Convert polar to cartesian coordinates
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleRadians: number
): Point {
  return {
    x: centerX + radius * Math.cos(angleRadians),
    y: centerY + radius * Math.sin(angleRadians)
  };
}

/**
 * Calculate point on orbit
 */
export function getOrbitPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number
): Point {
  return polarToCartesian(centerX, centerY, radius, angle);
}

/**
 * Draw arrow line
 */
export function drawArrow(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  options: {
    color?: string;
    lineWidth?: number;
    headSize?: number;
  } = {}
): void {
  const { color = '#e2e8f0', lineWidth = 2, headSize = 10 } = options;
  
  const angle = Math.atan2(toY - fromY, toX - fromX);
  
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  
  // Line
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  
  // Arrow head
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headSize * Math.cos(angle - Math.PI / 6),
    toY - headSize * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headSize * Math.cos(angle + Math.PI / 6),
    toY - headSize * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw grid lines
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  options: {
    spacing?: number;
    color?: string;
    alpha?: number;
  } = {}
): void {
  const { spacing = 50, color = '#1e293b', alpha = 0.5 } = options;
  
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  
  // Vertical lines
  for (let x = spacing; x < width; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  // Horizontal lines
  for (let y = spacing; y < height; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  ctx.restore();
}
