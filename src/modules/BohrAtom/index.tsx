/**
 * Bohr Atom Module - Main Component
 * Complete implementation of Bohr Hydrogen Atom Simulator
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import BohrAtomCanvas from './BohrAtomCanvas';
import EnergyLevelDiagram from './EnergyLevelDiagram';
import BohrAtomControls from './BohrAtomControls';
import BohrAtomDerivation from './BohrAtomDerivation';
import { useQuantumStore } from '../../store/useQuantumStore';
import { LaTeX } from '../../components/ui/LaTeX';
import { Quiz, bohrAtomQuiz } from '../../components/ui/Quiz';

export const BohrAtomModule: React.FC = () => {
  const { showDerivation, toggleDerivation } = useQuantumStore();
  const [canvasSize] = useState({ width: 450, height: 450 });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Module Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Bohr Hydrogen Atom Simulator
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1">
            Interactive visualization of Bohr's atomic model with energy transitions
          </p>
        </div>
        <button
          onClick={toggleDerivation}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showDerivation
              ? 'bg-blue-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          }`}
        >
          {showDerivation ? 'Hide Derivations' : 'Show Derivations'}
        </button>
      </div>

      {/* Main Content - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_auto_1fr] gap-6">
        {/* Canvas */}
        <div className="flex justify-center lg:justify-start">
          <BohrAtomCanvas width={canvasSize.width} height={canvasSize.height} />
        </div>
        
        {/* Energy Level Diagram */}
        <div className="flex justify-center lg:justify-start">
          <EnergyLevelDiagram width={200} height={380} />
        </div>

        {/* Controls */}
        <div className="w-full max-w-md mx-auto lg:mx-0 space-y-6">
          <BohrAtomControls />
        </div>
      </div>

      {/* Class 12 NEB Notes - Full Width */}
      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
        <h4 className="text-amber-400 font-semibold mb-2">📖 Class 12 NEB Notes</h4>
        <ul className="text-slate-300 text-xs leading-relaxed space-y-2 list-disc list-inside">
          <li>In 1913, Niels Bohr proposed a model for the hydrogen atom that successfully explained discrete spectral lines. According to Bohr's postulates, electrons revolve around the nucleus in certain fixed orbits called <strong>stationary states</strong> without radiating energy.</li>
          <li>The angular momentum of electrons is quantized: <strong>L = nh/2π</strong>, where n is the principal quantum number (1, 2, 3...). The energy of the nth orbit is given by <strong>Eₙ = -13.6/n² eV</strong>, where the negative sign indicates the electron is bound to the nucleus.</li>
          <li>The ground state (n=1) has the lowest energy (-13.6 eV) and smallest radius (0.529 Å, called Bohr radius). When an electron transitions from a higher to lower energy level, it emits a photon with energy <strong>ΔE = E₂ - E₁ = hf</strong>.</li>
          <li>The ionization energy of hydrogen (energy needed to completely remove an electron from ground state) is <strong>13.6 eV</strong>. This model accurately predicts hydrogen's spectral lines but fails for multi-electron atoms.</li>
        </ul>
        <a
          href="https://en.wikipedia.org/wiki/Bohr_model"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
        >
          📚 Learn more on Wikipedia →
        </a>
      </div>

      {/* Derivation Panel - Full Width */}
      {showDerivation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-6"
        >
          <BohrAtomDerivation />
        </motion.div>
      )}

      {/* Formula Display */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Key Formulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-slate-900 rounded-lg p-3">
            <LaTeX 
              formula="r_n = n^2 a_0" 
              className="text-blue-400"
            />
            <div className="text-xs text-slate-500 mt-1">Orbital Radius</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3">
            <LaTeX 
              formula="E_n = -\frac{13.6}{n^2} \text{ eV}" 
              className="text-green-400"
            />
            <div className="text-xs text-slate-500 mt-1">Energy Level</div>
          </div>
          <div className="bg-slate-900 rounded-lg p-3">
            <LaTeX 
              formula="\frac{1}{\lambda} = R_H \left( \frac{1}{n_f^{\,2}} - \frac{1}{n_i^{\,2}} \right)" 
              className="text-amber-400"
            />
            <div className="text-xs text-slate-500 mt-1">Rydberg Formula</div>
          </div>
        </div>
      </div>

      {/* Educational Notes */}
      <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
        <h4 className="text-sm font-semibold text-slate-300 mb-2">💡 Learning Points</h4>
        <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
          <li>Energy is quantized - only specific orbits are allowed (n = 1, 2, 3...)</li>
          <li>Lower n means smaller orbit but higher binding energy (more negative)</li>
          <li>Transitions emit/absorb photons with energy ΔE = hf = hc/λ</li>
          <li>The Balmer series (n_f=2) produces visible light; Lyman (n_f=1) is UV</li>
        </ul>
      </div>

      {/* Quiz Section */}
      <div className="mt-8">
        <Quiz title="Test Your Knowledge - Bohr Model" questions={bohrAtomQuiz} />
      </div>
    </motion.div>
  );
};

export default BohrAtomModule;
