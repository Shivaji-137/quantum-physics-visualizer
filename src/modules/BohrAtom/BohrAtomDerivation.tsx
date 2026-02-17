/**
 * Derivation Panel for Bohr Atom
 * Step-by-step derivation of Bohr model formulas
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LaTeX } from '../../components/ui/LaTeX';

interface DerivationStep {
  title: string;
  formula: string;
  explanation: string;
}

const derivationSteps: DerivationStep[] = [
  {
    title: "1. Bohr's Postulates",
    formula: "L = mvr = \\frac{nh}{2\\pi} = n\\hbar",
    explanation: "Angular momentum is quantized in units of ℏ. Electrons orbit without radiating energy in stationary orbits.",
  },
  {
    title: "2. Centripetal Force Balance",
    formula: "\\frac{mv^2}{r} = \\frac{ke^2}{r^2}",
    explanation: "The electrostatic attraction provides the centripetal force needed for circular motion.",
  },
  {
    title: "3. Orbital Radius Derivation",
    formula: "r_n = \\frac{n^2\\hbar^2}{mke^2} = n^2 a_0",
    explanation: "Combining quantization with force balance gives the allowed orbital radii, where a₀ = 0.0529 nm is the Bohr radius.",
  },
  {
    title: "4. Energy Expression",
    formula: "E_n = -\\frac{13.6}{n^2} \\text{ eV}",
    explanation: "Total energy (kinetic + potential) is negative for bound states. Ground state (n=1) has E = -13.6 eV.",
  },
  {
    title: "5. Rydberg Formula",
    formula: "\\frac{1}{\\lambda} = R_H \\left( \\frac{1}{n_f^{\\,2}} - \\frac{1}{n_i^{\\,2}} \\right)",
    explanation: "Wavelength of emitted photon during transition from nᵢ to n_f. R = 1.097×10⁷ m⁻¹ is the Rydberg constant.",
  },
  {
    title: "6. Photon Energy",
    formula: "\\Delta E = hf = \\frac{hc}{\\lambda} = E_i - E_f",
    explanation: "Energy is conserved: photon energy equals the energy difference between initial and final states.",
  },
];

export const BohrAtomDerivation: React.FC = () => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);

  return (
    <div className="bg-slate-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
        📐 Derivations - Bohr Model
      </h3>
      
      {/* Grid layout for derivation steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {derivationSteps.map((step, index) => (
          <motion.div
            key={index}
            className="bg-slate-900 rounded-lg overflow-hidden"
            initial={false}
          >
            <button
              onClick={() => setExpandedStep(expandedStep === index ? null : index)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-slate-800 transition-colors"
            >
              <span className="text-sm font-medium text-blue-400">{step.title}</span>
              <motion.span
                animate={{ rotate: expandedStep === index ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-slate-400"
              >
                ▼
              </motion.span>
            </button>
            
            <AnimatePresence>
              {expandedStep === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {/* Formula */}
                    <div className="bg-slate-800 rounded-lg p-3 text-center">
                      <LaTeX 
                        formula={step.formula}
                        className="text-green-400"
                      />
                    </div>
                    
                    {/* Explanation */}
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {step.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Key Constants */}
      <div className="mt-6 bg-slate-900 rounded-lg p-4">
        <h4 className="text-sm font-medium text-slate-400 mb-3">Key Constants</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <span className="text-slate-500">Bohr radius (a₀):</span>
          <span className="text-slate-300 font-mono">5.29 × 10⁻¹¹ m</span>
          
          <span className="text-slate-500">Rydberg (R):</span>
          <span className="text-slate-300 font-mono">1.097 × 10⁷ m⁻¹</span>
          
          <span className="text-slate-500">Ground state E:</span>
          <span className="text-slate-300 font-mono">-13.6 eV</span>
          
          <span className="text-slate-500">Planck (h):</span>
          <span className="text-slate-300 font-mono">6.626 × 10⁻³⁴ J·s</span>
        </div>
      </div>
    </div>
  );
};

export default BohrAtomDerivation;
