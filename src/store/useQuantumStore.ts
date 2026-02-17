/**
 * Global Quantum Physics Store
 * Manages application state using Zustand
 */

import { create } from 'zustand';

// ============================================================================
// TYPES
// ============================================================================

export type ModuleName = 
  | 'bohrAtom' 
  | 'spectralSeries' 
  | 'deBroglie' 
  | 'uncertainty' 
  | 'xray' 
  | 'bragg'
  | 'electronCloud';

export type AnimationSpeed = 'slow' | 'normal';

export interface BohrAtomState {
  n: number;
  targetN: number;
  isAnimating: boolean;
  showOrbits: boolean;
  showLabels: boolean;
  isTransitioning: boolean;
  photonEmitted: boolean;
  animationSpeed: AnimationSpeed;
}

export interface SpectralSeriesState {
  ni: number;
  nf: number;
  showAllLines: boolean;
  selectedSeries: string;
}

export interface DeBroglieState {
  n: number;
  wavelength: number;
  showWave: boolean;
  useCustomWavelength: boolean;
}

export interface UncertaintyState {
  deltaX: number;
  showMomentumSpace: boolean;
  animatePacket: boolean;
}

export interface XRayState {
  voltage: number;
  showCharacteristic: boolean;
  targetMaterial: string;
}

export interface BraggState {
  crystalSpacing: number;
  angle: number;
  order: number;
  wavelength: number;
  showRays: boolean;
}

export interface QuantumState {
  // Active module
  activeModule: ModuleName;
  
  // Module states
  bohrAtom: BohrAtomState;
  spectralSeries: SpectralSeriesState;
  deBroglie: DeBroglieState;
  uncertainty: UncertaintyState;
  xray: XRayState;
  bragg: BraggState;
  
  // UI state
  isFullscreen: boolean;
  showDerivation: boolean;
  showProblemMode: boolean;
  
  // Actions
  setActiveModule: (module: ModuleName) => void;
  toggleFullscreen: () => void;
  toggleDerivation: () => void;
  toggleProblemMode: () => void;
  
  // Bohr Atom actions
  setBohrN: (n: number) => void;
  setBohrTargetN: (n: number) => void;
  toggleBohrAnimation: () => void;
  toggleBohrOrbits: () => void;
  triggerTransition: () => void;
  resetBohrAtom: () => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  
  // Spectral Series actions
  setSpectralNi: (ni: number) => void;
  setSpectralNf: (nf: number) => void;
  setSelectedSeries: (series: string) => void;
  toggleShowAllLines: () => void;
  
  // de Broglie actions
  setDeBroglieN: (n: number) => void;
  setDeBroglieWavelength: (wavelength: number) => void;
  toggleDeBroglieWave: () => void;
  toggleCustomWavelength: () => void;
  
  // Uncertainty actions
  setDeltaX: (deltaX: number) => void;
  toggleMomentumSpace: () => void;
  toggleAnimatePacket: () => void;
  
  // X-Ray actions
  setXRayVoltage: (voltage: number) => void;
  toggleCharacteristic: () => void;
  setTargetMaterial: (material: string) => void;
  
  // Bragg actions
  setCrystalSpacing: (d: number) => void;
  setBraggAngle: (angle: number) => void;
  setDiffractionOrder: (order: number) => void;
  setBraggWavelength: (wavelength: number) => void;
  toggleBraggRays: () => void;
  
  // Global reset
  resetModule: (module: ModuleName) => void;
}

// ============================================================================
// INITIAL STATES
// ============================================================================

const initialBohrAtom: BohrAtomState = {
  n: 2,
  targetN: 1,
  isAnimating: true,
  showOrbits: true,
  showLabels: true,
  isTransitioning: false,
  photonEmitted: false,
  animationSpeed: 'normal',
};

const initialSpectralSeries: SpectralSeriesState = {
  ni: 3,
  nf: 2,
  showAllLines: false,
  selectedSeries: 'Balmer',
};

const initialDeBroglie: DeBroglieState = {
  n: 3,
  wavelength: 1,
  showWave: true,
  useCustomWavelength: false,
};

const initialUncertainty: UncertaintyState = {
  deltaX: 1e-10,
  showMomentumSpace: true,
  animatePacket: false,
};

const initialXRay: XRayState = {
  voltage: 50000,
  showCharacteristic: true,
  targetMaterial: 'Tungsten',
};

const initialBragg: BraggState = {
  crystalSpacing: 2.82e-10,  // NaCl d-spacing: 2.82 Å
  angle: Math.PI / 6,        // 30°
  order: 1,
  wavelength: 1.41e-10,      // λ = 2d sin θ / n = 2 × 2.82Å × sin(30°) = 2.82Å × 0.5 = 1.41 Å
  showRays: true,
};

// ============================================================================
// STORE
// ============================================================================

export const useQuantumStore = create<QuantumState>((set) => ({
  // Initial state
  activeModule: 'bohrAtom',
  bohrAtom: initialBohrAtom,
  spectralSeries: initialSpectralSeries,
  deBroglie: initialDeBroglie,
  uncertainty: initialUncertainty,
  xray: initialXRay,
  bragg: initialBragg,
  isFullscreen: false,
  showDerivation: false,
  showProblemMode: false,
  
  // Module navigation
  setActiveModule: (module) => set({ activeModule: module }),
  toggleFullscreen: () => set((state) => ({ isFullscreen: !state.isFullscreen })),
  toggleDerivation: () => set((state) => ({ showDerivation: !state.showDerivation })),
  toggleProblemMode: () => set((state) => ({ showProblemMode: !state.showProblemMode })),
  
  // Bohr Atom actions
  setBohrN: (n) => set((state) => ({
    bohrAtom: { ...state.bohrAtom, n: Math.max(1, Math.min(6, n)) }
  })),
  setBohrTargetN: (targetN) => set((state) => ({
    bohrAtom: { ...state.bohrAtom, targetN: Math.max(1, Math.min(6, targetN)) }
  })),
  toggleBohrAnimation: () => set((state) => ({
    bohrAtom: { ...state.bohrAtom, isAnimating: !state.bohrAtom.isAnimating }
  })),
  toggleBohrOrbits: () => set((state) => ({
    bohrAtom: { ...state.bohrAtom, showOrbits: !state.bohrAtom.showOrbits }
  })),
  triggerTransition: () => set((state) => ({
    bohrAtom: { 
      ...state.bohrAtom, 
      isTransitioning: true, 
      photonEmitted: true 
    }
  })),
  resetBohrAtom: () => set({ bohrAtom: initialBohrAtom }),
  setAnimationSpeed: (speed) => set((state) => ({
    bohrAtom: { ...state.bohrAtom, animationSpeed: speed }
  })),
  
  // Spectral Series actions
  setSpectralNi: (ni) => set((state) => ({
    spectralSeries: { ...state.spectralSeries, ni: Math.max(2, Math.min(7, ni)) }
  })),
  setSpectralNf: (nf) => set((state) => ({
    spectralSeries: { ...state.spectralSeries, nf: Math.max(1, Math.min(6, nf)) }
  })),
  setSelectedSeries: (series) => set((state) => ({
    spectralSeries: { ...state.spectralSeries, selectedSeries: series }
  })),
  toggleShowAllLines: () => set((state) => ({
    spectralSeries: { ...state.spectralSeries, showAllLines: !state.spectralSeries.showAllLines }
  })),
  
  // de Broglie actions
  setDeBroglieN: (n) => set((state) => ({
    deBroglie: { ...state.deBroglie, n: Math.max(1, Math.min(6, n)) }
  })),
  setDeBroglieWavelength: (wavelength) => set((state) => ({
    deBroglie: { ...state.deBroglie, wavelength }
  })),
  toggleDeBroglieWave: () => set((state) => ({
    deBroglie: { ...state.deBroglie, showWave: !state.deBroglie.showWave }
  })),
  toggleCustomWavelength: () => set((state) => ({
    deBroglie: { ...state.deBroglie, useCustomWavelength: !state.deBroglie.useCustomWavelength }
  })),
  
  // Uncertainty actions
  setDeltaX: (deltaX) => set((state) => ({
    uncertainty: { ...state.uncertainty, deltaX: Math.max(1e-15, deltaX) }
  })),
  toggleMomentumSpace: () => set((state) => ({
    uncertainty: { ...state.uncertainty, showMomentumSpace: !state.uncertainty.showMomentumSpace }
  })),
  toggleAnimatePacket: () => set((state) => ({
    uncertainty: { ...state.uncertainty, animatePacket: !state.uncertainty.animatePacket }
  })),
  
  // X-Ray actions
  setXRayVoltage: (voltage) => set((state) => ({
    xray: { ...state.xray, voltage: Math.max(10000, Math.min(100000, voltage)) }
  })),
  toggleCharacteristic: () => set((state) => ({
    xray: { ...state.xray, showCharacteristic: !state.xray.showCharacteristic }
  })),
  setTargetMaterial: (material) => set((state) => ({
    xray: { ...state.xray, targetMaterial: material }
  })),
  
  // Bragg actions
  setCrystalSpacing: (d) => set((state) => ({
    bragg: { ...state.bragg, crystalSpacing: d }
  })),
  setBraggAngle: (angle) => set((state) => ({
    bragg: { ...state.bragg, angle: Math.max(0, Math.min(Math.PI / 2, angle)) }
  })),
  setDiffractionOrder: (order) => set((state) => ({
    bragg: { ...state.bragg, order: Math.max(1, Math.min(5, order)) }
  })),
  setBraggWavelength: (wavelength) => set((state) => ({
    bragg: { ...state.bragg, wavelength }
  })),
  toggleBraggRays: () => set((state) => ({
    bragg: { ...state.bragg, showRays: !state.bragg.showRays }
  })),
  
  // Global reset
  resetModule: (module) => {
    switch (module) {
      case 'bohrAtom':
        set({ bohrAtom: initialBohrAtom });
        break;
      case 'spectralSeries':
        set({ spectralSeries: initialSpectralSeries });
        break;
      case 'deBroglie':
        set({ deBroglie: initialDeBroglie });
        break;
      case 'uncertainty':
        set({ uncertainty: initialUncertainty });
        break;
      case 'xray':
        set({ xray: initialXRay });
        break;
      case 'bragg':
        set({ bragg: initialBragg });
        break;
    }
  },
}));
