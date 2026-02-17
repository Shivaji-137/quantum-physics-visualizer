# Quantum Physics Visualizer

**NEB Class 12 Physics - Quantization of Energy**

Interactive, graduate-level physics visualization web application for teaching quantum mechanics concepts. Built with React + TypeScript + Vite.

## 📚 Physics Modules

### 1. Bohr Hydrogen Atom Simulator
- Interactive orbit visualization with electron animation
- Energy level diagram synchronized with atom view
- Photon emission visualization on transitions
- Rydberg formula calculations

**Key Formulas:**
- Orbital radius: `rₙ = n²a₀`
- Energy levels: `Eₙ = -13.6/n² eV`
- Rydberg formula: `1/λ = R(1/n_f² - 1/n_i²)`

### 2. Hydrogen Spectral Series Explorer
- Calculate wavelengths using Rydberg formula
- Visualize Lyman, Balmer, Paschen, Brackett, Pfund series
- Dynamic spectral line plot with logarithmic scale
- UV/Visible/IR region indicators

### 3. de Broglie Standing Wave Visualizer
- Electron as standing wave on circular orbit
- Demonstrates quantization condition: `2πr = nλ`
- Shows allowed vs forbidden states

### 4. Heisenberg Uncertainty Simulator
- Gaussian wave packet visualization
- Position-momentum uncertainty: `ΔxΔp ≥ ℏ/2`
- Interactive sigma adjustment

### 5. X-ray Production (Coolidge Tube)
- Continuous Bremsstrahlung spectrum
- Minimum wavelength cutoff: `λ_min = hc/eV`
- Characteristic line peaks

### 6. Bragg Diffraction Simulator
- Crystal plane visualization
- Bragg condition: `2d sin θ = nλ`

## 🚀 Getting Started

```bash
# Navigate to project directory
cd quantum-physics-visualizer

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── physics/           # Physics calculation engine
│   ├── constants.ts   # Physical constants (SI units)
│   └── quantum.ts     # Pure physics functions
├── store/             # Zustand state management
├── hooks/             # Custom React hooks
├── utils/             # Canvas drawing utilities
├── components/        # Reusable UI components
├── modules/           # Physics simulation modules
│   ├── BohrAtom/
│   ├── SpectralSeries/
│   ├── DeBroglie/
│   ├── Uncertainty/
│   ├── XRay/
│   └── Bragg/
└── App.tsx
```

## 🔬 Physics Engine API

```typescript
import {
  bohrRadius,           // rₙ = a₀n² (meters)
  bohrEnergy,           // Eₙ = -13.6/n² (eV)
  rydbergWavelengthNm,  // Rydberg formula
  deBroglieWavelength,  // λ = h/p
  uncertaintyMomentum,  // Δp ≥ ℏ/(2Δx)
  xrayMinWavelength,    // λ_min = hc/(eV)
  braggCondition,       // 2d sin θ = nλ
} from './physics';
```

## 📐 Physical Constants

| Constant | Symbol | Value |
|----------|--------|-------|
| Planck constant | h | 6.626 × 10⁻³⁴ J·s |
| Bohr radius | a₀ | 5.292 × 10⁻¹¹ m |
| Rydberg constant | R | 1.097 × 10⁷ m⁻¹ |
| Ground state energy | | -13.6 eV |

## 📖 NEB Class 12 Physics Topics

1. Bohr's Atomic Model
2. Hydrogen Spectral Series
3. de Broglie Matter Waves
4. Heisenberg Uncertainty Principle
5. X-ray Production & Spectra
6. Bragg's Law (X-ray Diffraction)

## 📄 License

Educational use permitted. Created for NEB Class 12 Physics curriculum.

## 👨‍💻 Author

**Shivaji Chaulagain**

---
© 2026 Shivaji Chaulagain. All rights reserved.
