/**
 * Quantum Physics Calculations Module
 * Pure functions for physics calculations - NEB Class 12 Physics
 * 
 * All inputs and outputs in SI units unless noted
 */

import {
  PLANCK_CONSTANT,
  REDUCED_PLANCK,
  SPEED_OF_LIGHT,
  ELECTRON_MASS,
  ELECTRON_CHARGE,
  BOHR_RADIUS,
  RYDBERG_CONSTANT,
  RYDBERG_ENERGY,
  EV_TO_JOULES,
  JOULES_TO_EV,
  METERS_TO_NM,
  NM_TO_METERS,
  UV_MAX,
  VISIBLE_MAX,
  SPECTRAL_SERIES
} from './constants';

// ============================================================================
// BOHR HYDROGEN ATOM
// ============================================================================

/**
 * Calculate the radius of nth Bohr orbit
 * Formula: rₙ = a₀ × n²
 * 
 * @param n - Principal quantum number (1, 2, 3, ...)
 * @returns Orbit radius in meters
 */
export function bohrRadius(n: number): number {
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error('Principal quantum number n must be a positive integer');
  }
  return BOHR_RADIUS * n * n;
}

/**
 * Calculate the energy of nth Bohr orbit
 * Formula: Eₙ = -13.6/n² eV
 * 
 * @param n - Principal quantum number (1, 2, 3, ...)
 * @returns Energy in eV (negative value indicating bound state)
 */
export function bohrEnergy(n: number): number {
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error('Principal quantum number n must be a positive integer');
  }
  return -RYDBERG_ENERGY / (n * n);
}

/**
 * Calculate the energy of nth Bohr orbit in Joules
 * 
 * @param n - Principal quantum number
 * @returns Energy in Joules
 */
export function bohrEnergyJoules(n: number): number {
  return bohrEnergy(n) * EV_TO_JOULES;
}

/**
 * Calculate velocity of electron in nth Bohr orbit
 * Formula: vₙ = e²/(2ε₀nh)
 * 
 * @param n - Principal quantum number
 * @returns Velocity in m/s
 */
export function bohrVelocity(n: number): number {
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error('Principal quantum number n must be a positive integer');
  }
  // v = αc/n where α is fine structure constant
  const alpha = 7.2973525693e-3;
  return (alpha * SPEED_OF_LIGHT) / n;
}

/**
 * Calculate orbital period of electron in nth Bohr orbit
 * 
 * @param n - Principal quantum number
 * @returns Period in seconds
 */
export function bohrPeriod(n: number): number {
  const r = bohrRadius(n);
  const v = bohrVelocity(n);
  return (2 * Math.PI * r) / v;
}

/**
 * Calculate angular momentum in nth Bohr orbit
 * Formula: L = nℏ = nh/2π
 * 
 * @param n - Principal quantum number
 * @returns Angular momentum in J·s
 */
export function bohrAngularMomentum(n: number): number {
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error('Principal quantum number n must be a positive integer');
  }
  return n * REDUCED_PLANCK;
}

// ============================================================================
// HYDROGEN SPECTRAL SERIES
// ============================================================================

/**
 * Calculate wavelength of emitted photon using Rydberg formula
 * Formula: 1/λ = R(1/n_f² - 1/n_i²)
 * 
 * @param ni - Initial quantum number (higher energy level)
 * @param nf - Final quantum number (lower energy level)
 * @returns Wavelength in meters
 */
export function rydbergWavelength(ni: number, nf: number): number {
  if (ni <= nf) {
    throw new Error('Initial level ni must be greater than final level nf for emission');
  }
  if (nf < 1 || ni < 1 || !Number.isInteger(ni) || !Number.isInteger(nf)) {
    throw new Error('Quantum numbers must be positive integers');
  }
  
  const invLambda = RYDBERG_CONSTANT * (1 / (nf * nf) - 1 / (ni * ni));
  return 1 / invLambda;
}

/**
 * Calculate wavelength in nanometers
 * 
 * @param ni - Initial quantum number
 * @param nf - Final quantum number
 * @returns Wavelength in nm
 */
export function rydbergWavelengthNm(ni: number, nf: number): number {
  return rydbergWavelength(ni, nf) * METERS_TO_NM;
}

/**
 * Calculate photon energy for transition
 * Formula: ΔE = hf = hc/λ = 13.6(1/n_f² - 1/n_i²) eV
 * 
 * @param ni - Initial quantum number
 * @param nf - Final quantum number
 * @returns Energy in eV
 */
export function transitionEnergy(ni: number, nf: number): number {
  return Math.abs(bohrEnergy(nf) - bohrEnergy(ni));
}

/**
 * Calculate photon frequency for transition
 * Formula: f = c/λ = ΔE/h
 * 
 * @param ni - Initial quantum number
 * @param nf - Final quantum number
 * @returns Frequency in Hz
 */
export function transitionFrequency(ni: number, nf: number): number {
  const wavelength = rydbergWavelength(ni, nf);
  return SPEED_OF_LIGHT / wavelength;
}

/**
 * Determine spectral series name based on final quantum number
 * 
 * @param nf - Final quantum number
 * @returns Series name
 */
export function getSpectralSeries(nf: number): string {
  return SPECTRAL_SERIES[nf as keyof typeof SPECTRAL_SERIES] || `n=${nf} series`;
}

/**
 * Determine spectral region based on wavelength
 * 
 * @param wavelengthNm - Wavelength in nm
 * @returns Region name (UV, Visible, or IR)
 */
export function getSpectralRegion(wavelengthNm: number): 'UV' | 'Visible' | 'IR' {
  if (wavelengthNm < UV_MAX) return 'UV';
  if (wavelengthNm <= VISIBLE_MAX) return 'Visible';
  return 'IR';
}

/**
 * Convert wavelength to approximate visible color (hex)
 * 
 * @param wavelengthNm - Wavelength in nm
 * @returns Hex color string
 */
export function wavelengthToColor(wavelengthNm: number): string {
  // Outside visible range
  if (wavelengthNm < 380) return '#8B00FF';  // UV - show as violet
  if (wavelengthNm > 780) return '#8B0000';  // IR - show as dark red
  
  let r = 0, g = 0, b = 0;
  
  if (wavelengthNm >= 380 && wavelengthNm < 440) {
    r = (440 - wavelengthNm) / (440 - 380);
    b = 1;
  } else if (wavelengthNm >= 440 && wavelengthNm < 490) {
    g = (wavelengthNm - 440) / (490 - 440);
    b = 1;
  } else if (wavelengthNm >= 490 && wavelengthNm < 510) {
    g = 1;
    b = (510 - wavelengthNm) / (510 - 490);
  } else if (wavelengthNm >= 510 && wavelengthNm < 580) {
    r = (wavelengthNm - 510) / (580 - 510);
    g = 1;
  } else if (wavelengthNm >= 580 && wavelengthNm < 645) {
    r = 1;
    g = (645 - wavelengthNm) / (645 - 580);
  } else if (wavelengthNm >= 645 && wavelengthNm <= 780) {
    r = 1;
  }
  
  // Intensity correction at spectrum edges
  let intensity = 1;
  if (wavelengthNm >= 700) {
    intensity = 0.3 + 0.7 * (780 - wavelengthNm) / (780 - 700);
  } else if (wavelengthNm < 420) {
    intensity = 0.3 + 0.7 * (wavelengthNm - 380) / (420 - 380);
  }
  
  r = Math.round(255 * Math.pow(r * intensity, 0.8));
  g = Math.round(255 * Math.pow(g * intensity, 0.8));
  b = Math.round(255 * Math.pow(b * intensity, 0.8));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ============================================================================
// DE BROGLIE WAVE
// ============================================================================

/**
 * Calculate de Broglie wavelength
 * Formula: λ = h/p = h/(mv)
 * 
 * @param momentum - Momentum in kg·m/s
 * @returns Wavelength in meters
 */
export function deBroglieWavelength(momentum: number): number {
  if (momentum <= 0) {
    throw new Error('Momentum must be positive');
  }
  return PLANCK_CONSTANT / momentum;
}

/**
 * Calculate de Broglie wavelength from velocity
 * 
 * @param mass - Particle mass in kg
 * @param velocity - Particle velocity in m/s
 * @returns Wavelength in meters
 */
export function deBroglieWavelengthFromVelocity(mass: number, velocity: number): number {
  return deBroglieWavelength(mass * velocity);
}

/**
 * Calculate electron de Broglie wavelength in nth Bohr orbit
 * 
 * @param n - Principal quantum number
 * @returns Wavelength in meters
 */
export function electronWavelengthInOrbit(n: number): number {
  const v = bohrVelocity(n);
  return PLANCK_CONSTANT / (ELECTRON_MASS * v);
}

/**
 * Check if standing wave condition is satisfied
 * Condition: 2πr = nλ (n complete wavelengths fit in orbit)
 * 
 * @param orbitRadius - Orbit radius in meters
 * @param wavelength - de Broglie wavelength in meters
 * @returns Object with isAllowed and number of wavelengths
 */
export function standingWaveCondition(
  orbitRadius: number,
  wavelength: number
): { isAllowed: boolean; nWavelengths: number; phaseMismatch: number } {
  const circumference = 2 * Math.PI * orbitRadius;
  const nWavelengths = circumference / wavelength;
  const roundedN = Math.round(nWavelengths);
  const phaseMismatch = Math.abs(nWavelengths - roundedN);
  
  return {
    isAllowed: phaseMismatch < 0.01,  // Allow small tolerance
    nWavelengths,
    phaseMismatch
  };
}

// ============================================================================
// HEISENBERG UNCERTAINTY PRINCIPLE
// ============================================================================

/**
 * Calculate minimum momentum uncertainty from position uncertainty
 * Formula: ΔpΔx ≥ ℏ/2
 * 
 * @param deltaX - Position uncertainty in meters
 * @returns Minimum momentum uncertainty in kg·m/s
 */
export function uncertaintyMomentum(deltaX: number): number {
  if (deltaX <= 0) {
    throw new Error('Position uncertainty must be positive');
  }
  return REDUCED_PLANCK / (2 * deltaX);
}

/**
 * Calculate minimum position uncertainty from momentum uncertainty
 * 
 * @param deltaP - Momentum uncertainty in kg·m/s
 * @returns Minimum position uncertainty in meters
 */
export function uncertaintyPosition(deltaP: number): number {
  if (deltaP <= 0) {
    throw new Error('Momentum uncertainty must be positive');
  }
  return REDUCED_PLANCK / (2 * deltaP);
}

/**
 * Calculate velocity uncertainty from momentum uncertainty
 * 
 * @param deltaP - Momentum uncertainty in kg·m/s
 * @param mass - Particle mass in kg (default: electron mass)
 * @returns Velocity uncertainty in m/s
 */
export function uncertaintyVelocity(deltaP: number, mass: number = ELECTRON_MASS): number {
  return deltaP / mass;
}

/**
 * Generate Gaussian wave packet amplitude
 * 
 * @param x - Position
 * @param x0 - Center position
 * @param sigma - Width parameter (related to Δx)
 * @returns Amplitude at position x
 */
export function gaussianWavePacket(x: number, x0: number, sigma: number): number {
  return Math.exp(-((x - x0) ** 2) / (2 * sigma ** 2));
}

/**
 * Generate momentum distribution (Fourier transform of Gaussian)
 * 
 * @param p - Momentum
 * @param p0 - Central momentum
 * @param sigmaX - Position space width
 * @returns Amplitude in momentum space
 */
export function momentumDistribution(p: number, p0: number, sigmaX: number): number {
  const sigmaP = REDUCED_PLANCK / (2 * sigmaX);
  return Math.exp(-((p - p0) ** 2) / (2 * sigmaP ** 2));
}

// ============================================================================
// X-RAY PRODUCTION (Coolidge Tube)
// ============================================================================

/**
 * Calculate minimum X-ray wavelength (short wavelength limit)
 * Formula: λ_min = hc/(eV)
 * 
 * @param voltage - Accelerating voltage in Volts
 * @returns Minimum wavelength in meters
 */
export function xrayMinWavelength(voltage: number): number {
  if (voltage <= 0) {
    throw new Error('Voltage must be positive');
  }
  return (PLANCK_CONSTANT * SPEED_OF_LIGHT) / (ELECTRON_CHARGE * voltage);
}

/**
 * Calculate minimum X-ray wavelength in nanometers
 * 
 * @param voltage - Accelerating voltage in Volts
 * @returns Minimum wavelength in nm
 */
export function xrayMinWavelengthNm(voltage: number): number {
  return xrayMinWavelength(voltage) * METERS_TO_NM;
}

/**
 * Calculate minimum X-ray wavelength in picometers
 * Convenient for typical X-ray ranges
 * 
 * @param voltage - Accelerating voltage in Volts
 * @returns Minimum wavelength in pm
 */
export function xrayMinWavelengthPm(voltage: number): number {
  return xrayMinWavelength(voltage) * 1e12;
}

/**
 * Calculate maximum photon energy from accelerating voltage
 * Formula: E_max = eV
 * 
 * @param voltage - Accelerating voltage in Volts
 * @returns Maximum energy in eV
 */
export function xrayMaxEnergy(voltage: number): number {
  return voltage;  // Energy in eV equals voltage in V
}

// ============================================================================
// BRAGG DIFFRACTION
// ============================================================================

/**
 * Check Bragg diffraction condition
 * Formula: 2d sin(θ) = nλ
 * 
 * @param d - Crystal spacing in meters
 * @param theta - Angle in radians
 * @param n - Diffraction order (positive integer)
 * @param lambda - X-ray wavelength in meters
 * @returns Object with condition check and path difference
 */
export function braggCondition(
  d: number,
  theta: number,
  n: number,
  lambda: number
): { isSatisfied: boolean; pathDifference: number; requiredLambda: number; mismatch: number } {
  if (d <= 0 || lambda <= 0) {
    throw new Error('Crystal spacing and wavelength must be positive');
  }
  if (n < 1 || !Number.isInteger(n)) {
    throw new Error('Diffraction order must be a positive integer');
  }
  
  const pathDifference = 2 * d * Math.sin(theta);
  const requiredLambda = pathDifference / n;
  const mismatch = Math.abs(pathDifference - n * lambda);
  
  return {
    isSatisfied: mismatch < lambda * 0.05,  // 5% tolerance
    pathDifference,
    requiredLambda,
    mismatch
  };
}

/**
 * Calculate Bragg angle for given conditions
 * Formula: θ = arcsin(nλ / 2d)
 * 
 * @param d - Crystal spacing in meters
 * @param n - Diffraction order
 * @param lambda - X-ray wavelength in meters
 * @returns Angle in radians, or null if impossible
 */
export function braggAngle(d: number, n: number, lambda: number): number | null {
  const sinTheta = (n * lambda) / (2 * d);
  if (sinTheta > 1) return null;  // Physically impossible
  return Math.asin(sinTheta);
}

/**
 * Calculate required wavelength for given Bragg angle
 * 
 * @param d - Crystal spacing in meters
 * @param theta - Angle in radians
 * @param n - Diffraction order
 * @returns Wavelength in meters
 */
export function braggWavelength(d: number, theta: number, n: number): number {
  return (2 * d * Math.sin(theta)) / n;
}

// ============================================================================
// PHOTOELECTRIC EFFECT
// ============================================================================

/**
 * Calculate maximum kinetic energy of photoelectron
 * Formula: KE_max = hf - φ = hc/λ - φ
 * 
 * @param wavelengthNm - Incident light wavelength in nm
 * @param workFunctionEv - Work function in eV
 * @returns Maximum KE in eV (negative if below threshold)
 */
export function photoelectricKE(wavelengthNm: number, workFunctionEv: number): number {
  const wavelength = wavelengthNm * NM_TO_METERS;
  const photonEnergyJ = (PLANCK_CONSTANT * SPEED_OF_LIGHT) / wavelength;
  const photonEnergyEv = photonEnergyJ * JOULES_TO_EV;
  return photonEnergyEv - workFunctionEv;
}

/**
 * Calculate threshold frequency
 * Formula: f₀ = φ/h
 * 
 * @param workFunctionEv - Work function in eV
 * @returns Threshold frequency in Hz
 */
export function thresholdFrequency(workFunctionEv: number): number {
  return (workFunctionEv * EV_TO_JOULES) / PLANCK_CONSTANT;
}

/**
 * Calculate threshold wavelength
 * Formula: λ₀ = hc/φ
 * 
 * @param workFunctionEv - Work function in eV
 * @returns Threshold wavelength in nm
 */
export function thresholdWavelength(workFunctionEv: number): number {
  const wavelength = (PLANCK_CONSTANT * SPEED_OF_LIGHT) / (workFunctionEv * EV_TO_JOULES);
  return wavelength * METERS_TO_NM;
}

/**
 * Calculate stopping potential
 * Formula: V₀ = KE_max / e = (hf - φ) / e
 * 
 * @param wavelengthNm - Incident light wavelength in nm
 * @param workFunctionEv - Work function in eV
 * @returns Stopping potential in Volts
 */
export function stoppingPotential(wavelengthNm: number, workFunctionEv: number): number {
  return photoelectricKE(wavelengthNm, workFunctionEv);  // KE in eV equals V₀ in Volts
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert energy from eV to Joules
 */
export function evToJoules(eV: number): number {
  return eV * EV_TO_JOULES;
}

/**
 * Convert energy from Joules to eV
 */
export function joulesToEv(joules: number): number {
  return joules * JOULES_TO_EV;
}

/**
 * Convert frequency to wavelength
 */
export function frequencyToWavelength(frequency: number): number {
  return SPEED_OF_LIGHT / frequency;
}

/**
 * Convert wavelength to frequency
 */
export function wavelengthToFrequency(wavelength: number): number {
  return SPEED_OF_LIGHT / wavelength;
}

/**
 * Calculate photon energy from wavelength
 * 
 * @param wavelength - Wavelength in meters
 * @returns Energy in eV
 */
export function photonEnergy(wavelength: number): number {
  const energyJ = (PLANCK_CONSTANT * SPEED_OF_LIGHT) / wavelength;
  return energyJ * JOULES_TO_EV;
}

/**
 * Format scientific notation for display
 */
export function formatScientific(value: number, precision: number = 3): string {
  if (value === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const mantissa = value / Math.pow(10, exponent);
  return `${mantissa.toFixed(precision)} × 10^${exponent}`;
}
