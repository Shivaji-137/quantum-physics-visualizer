/**
 * Physical Constants for Quantum Physics Calculations
 * All values in SI units unless otherwise specified
 * 
 * NEB Class 12 Physics - Quantization of Energy
 */

// Fundamental Constants
export const PLANCK_CONSTANT = 6.62607015e-34;           // J·s (Planck's constant h)
export const REDUCED_PLANCK = 1.054571817e-34;           // J·s (ℏ = h/2π)
export const SPEED_OF_LIGHT = 2.99792458e8;              // m/s
export const ELECTRON_MASS = 9.1093837015e-31;           // kg
export const ELECTRON_CHARGE = 1.602176634e-19;          // C (elementary charge e)
export const PERMITTIVITY = 8.8541878128e-12;            // F/m (ε₀)
export const BOLTZMANN_CONSTANT = 1.380649e-23;          // J/K

// Derived Constants
export const BOHR_RADIUS = 5.29177210903e-11;            // m (a₀ = 0.0529 nm)
export const RYDBERG_CONSTANT = 1.0973731568160e7;       // m⁻¹
export const RYDBERG_ENERGY = 13.605693122994;           // eV (ground state energy magnitude)
export const FINE_STRUCTURE_CONSTANT = 7.2973525693e-3;  // α (dimensionless)

// Conversion Factors
export const EV_TO_JOULES = 1.602176634e-19;             // 1 eV in Joules
export const JOULES_TO_EV = 6.241509074e18;              // 1 Joule in eV
export const NM_TO_METERS = 1e-9;                         // 1 nm in meters
export const METERS_TO_NM = 1e9;                          // 1 m in nm
export const ANGSTROM_TO_METERS = 1e-10;                  // 1 Å in meters

// Spectral Region Boundaries (in nm)
export const UV_MAX = 400;                                // UV-Visible boundary
export const VISIBLE_MIN = 400;                           // Visible light starts
export const VISIBLE_MAX = 700;                           // Visible light ends
export const IR_MIN = 700;                                // IR starts

// Hydrogen Spectral Series Names
export const SPECTRAL_SERIES = {
  1: 'Lyman',      // n_f = 1, UV region
  2: 'Balmer',     // n_f = 2, Visible region
  3: 'Paschen',    // n_f = 3, IR region
  4: 'Brackett',   // n_f = 4, Far IR
  5: 'Pfund',      // n_f = 5, Far IR
  6: 'Humphreys'   // n_f = 6, Far IR
} as const;

// Visible Balmer Lines (for color mapping)
export const BALMER_LINES = {
  'Hα': { wavelength: 656.3, color: '#FF0000', ni: 3, nf: 2 },  // Red
  'Hβ': { wavelength: 486.1, color: '#00FFFF', ni: 4, nf: 2 },  // Cyan
  'Hγ': { wavelength: 434.0, color: '#0000FF', ni: 5, nf: 2 },  // Blue
  'Hδ': { wavelength: 410.2, color: '#8B00FF', ni: 6, nf: 2 }   // Violet
} as const;

// Color palette for energy levels (n=1 to n=6)
export const ENERGY_LEVEL_COLORS = [
  '#FF4444',  // n=1, Ground state - Red (highest energy magnitude)
  '#FF8844',  // n=2 - Orange
  '#FFCC44',  // n=3 - Yellow
  '#44FF44',  // n=4 - Green
  '#4488FF',  // n=5 - Blue
  '#8844FF'   // n=6 - Purple (lowest energy magnitude)
] as const;

// X-ray characteristic peaks (approximate, for visualization)
export const XRAY_CHARACTERISTIC_PEAKS = {
  Kα: { relativeIntensity: 1.0, description: 'K-alpha transition' },
  Kβ: { relativeIntensity: 0.2, description: 'K-beta transition' }
} as const;

// Crystal lattice spacings for common materials (in meters)
export const CRYSTAL_SPACINGS = {
  'NaCl': 2.82e-10,       // Sodium Chloride
  'LiF': 2.01e-10,        // Lithium Fluoride
  'CsCl': 3.57e-10,       // Cesium Chloride
  'Diamond': 3.57e-10,    // Diamond (carbon)
  'Silicon': 5.43e-10     // Silicon
} as const;
