/**
 * Navigation Sidebar Component
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useQuantumStore, type ModuleName } from '../store/useQuantumStore';

interface NavItem {
  id: ModuleName;
  label: string;
  icon: string;
  description: string;
}

const navItems: NavItem[] = [
  {
    id: 'bohrAtom',
    label: 'Bohr Atom',
    icon: '⚛️',
    description: 'Hydrogen atom model with electron transitions',
  },
  {
    id: 'electronCloud',
    label: 'Electron Cloud',
    icon: '☁️',
    description: '3D orbital visualization (bonus)',
  },
  {
    id: 'spectralSeries',
    label: 'Spectral Series',
    icon: '🌈',
    description: 'Hydrogen emission spectra explorer',
  },
  {
    id: 'deBroglie',
    label: 'de Broglie Wave',
    icon: '〰️',
    description: 'Electron standing wave visualization',
  },
  {
    id: 'uncertainty',
    label: 'Uncertainty',
    icon: '📊',
    description: 'Heisenberg uncertainty principle',
  },
  {
    id: 'xray',
    label: 'X-ray Tube',
    icon: '📡',
    description: 'Coolidge tube X-ray spectrum',
  },
  {
    id: 'bragg',
    label: 'Bragg Diffraction',
    icon: '💎',
    description: 'X-ray crystal diffraction',
  },
];

export const Navigation: React.FC = () => {
  const { activeModule, setActiveModule, isFullscreen, toggleFullscreen } = useQuantumStore();

  return (
    <nav className="w-64 bg-slate-900 border-r border-slate-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">
          ⚛️ Quantum Physics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          NEB Class 12 Physics
        </p>
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="space-y-1 px-2">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                w-full px-4 py-3 rounded-lg text-left transition-colors
                ${activeModule === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <div className="font-medium">{item.label}</div>
                  <div className={`text-xs ${
                    activeModule === item.id ? 'text-blue-200' : 'text-slate-500'
                  }`}>
                    {item.description}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-700 space-y-3">
        <button
          onClick={toggleFullscreen}
          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {isFullscreen ? '⬜ Exit Fullscreen' : '⬛ Fullscreen Mode'}
        </button>
        
        <div className="text-xs text-slate-500 text-center border-t border-slate-700 pt-3 mt-3">
          <div className="font-medium text-slate-400 mb-1">About</div>
          Quantum Physics Visualizer
          <br />
          NEB Class 12 Physics
          <br />
          <span className="text-slate-400">by Shivaji Chaulagain</span>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
