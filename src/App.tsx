/**
 * Quantum Physics Visualizer
 * NEB Class 12 Physics - Quantization of Energy
 * 
 * Interactive simulation environment for teaching modern physics concepts
 */

import React, { Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useQuantumStore } from './store/useQuantumStore';
import Navigation from './components/Navigation';
import './index.css';

// Lazy load modules for performance
const BohrAtomModule = lazy(() => import('./modules/BohrAtom'));
const ElectronCloudModule = lazy(() => import('./modules/ElectronCloud'));
const SpectralSeriesModule = lazy(() => import('./modules/SpectralSeries'));
const DeBroglieModule = lazy(() => import('./modules/DeBroglie'));
const UncertaintyModule = lazy(() => import('./modules/Uncertainty'));
const XRayModule = lazy(() => import('./modules/XRay'));
const BraggModule = lazy(() => import('./modules/Bragg'));

// Loading fallback
const ModuleLoader: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-400">Loading module...</p>
    </div>
  </div>
);

function App() {
  const { activeModule, isFullscreen, toggleFullscreen } = useQuantumStore();

  // Render active module
  const renderModule = () => {
    switch (activeModule) {
      case 'bohrAtom':
        return <BohrAtomModule />;
      case 'electronCloud':
        return <ElectronCloudModule />;
      case 'spectralSeries':
        return <SpectralSeriesModule />;
      case 'deBroglie':
        return <DeBroglieModule />;
      case 'uncertainty':
        return <UncertaintyModule />;
      case 'xray':
        return <XRayModule />;
      case 'bragg':
        return <BraggModule />;
      default:
        return <BohrAtomModule />;
    }
  };

  return (
    <div className={`flex flex-col lg:flex-row h-screen bg-slate-950 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Navigation Sidebar */}
      {!isFullscreen && <Navigation />}
      
      {/* Fullscreen Exit Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="fixed top-4 right-4 z-50 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2 border border-slate-600 shadow-lg"
        >
          ⬜ Exit Fullscreen
        </button>
      )}
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 pb-4">
          <Suspense fallback={<ModuleLoader />}>
            <AnimatePresence mode="wait">
              {renderModule()}
            </AnimatePresence>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default App;
