/**
 * Navigation Sidebar Component
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleModuleSelect = (module: ModuleName) => {
    setActiveModule(module);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
          <div>
            <h1 className="text-base font-bold text-white">⚛️ Quantum Physics</h1>
          </div>
        </div>
        <button
          onClick={toggleFullscreen}
          className="text-white text-sm px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
        >
          {isFullscreen ? '⬜' : '⬛'}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
            />
            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 z-50 flex flex-col"
            >
              {/* Mobile Menu Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white">⚛️ Quantum Physics</h1>
                  <p className="text-xs text-slate-500 mt-1">NEB Class 12 Physics</p>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-400 hover:text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Mobile Navigation Items */}
              <div className="flex-1 overflow-y-auto py-4">
                <div className="space-y-1 px-2">
                  {navItems.map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => handleModuleSelect(item.id)}
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

              {/* Mobile Footer */}
              <div className="p-4 border-t border-slate-700">
                <div className="text-xs text-slate-500 text-center">
                  <div className="font-medium text-slate-400 mb-1">About</div>
                  Quantum Physics Visualizer<br />
                  NEB Class 12 Physics<br />
                  <span className="text-slate-400">by Shivaji Chaulagain</span>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex w-64 bg-slate-900 border-r border-slate-700 flex-col h-full">
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
    </>
  );
};

export default Navigation;
