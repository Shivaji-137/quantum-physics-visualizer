/**
 * Spectral Series Explorer Module
 * Interactive visualization of hydrogen spectral lines
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuantumStore } from '../../store/useQuantumStore';
import {
  rydbergWavelengthNm,
  transitionEnergy,
  getSpectralSeries,
  getSpectralRegion,
  wavelengthToColor,
  transitionFrequency,
} from '../../physics';
import { LaTeX } from '../../components/ui/LaTeX';

// Spectral line data structure
interface SpectralLine {
  ni: number;
  nf: number;
  wavelengthNm: number;
  energyEv: number;
  frequencyHz: number;
  color: string;
  region: 'UV' | 'Visible' | 'IR';
  series: string;
}

export const SpectralSeriesModule: React.FC = () => {
  const {
    spectralSeries: { ni, nf, selectedSeries },
    setSpectralNi,
    setSpectralNf,
    setSelectedSeries,
  } = useQuantumStore();

  // Calculate current transition
  const currentLine = useMemo((): SpectralLine | null => {
    if (ni <= nf) return null;
    const wavelength = rydbergWavelengthNm(ni, nf);
    return {
      ni,
      nf,
      wavelengthNm: wavelength,
      energyEv: transitionEnergy(ni, nf),
      frequencyHz: transitionFrequency(ni, nf),
      color: wavelengthToColor(wavelength),
      region: getSpectralRegion(wavelength),
      series: getSpectralSeries(nf),
    };
  }, [ni, nf]);

  // Generate all spectral lines for selected series
  const seriesLines = useMemo((): SpectralLine[] => {
    const lines: SpectralLine[] = [];
    const seriesMap: Record<string, number> = {
      'Lyman': 1,
      'Balmer': 2,
      'Paschen': 3,
      'Brackett': 4,
      'Pfund': 5,
    };
    
    const targetNf = seriesMap[selectedSeries] || 2;
    
    for (let i = targetNf + 1; i <= 7; i++) {
      const wavelength = rydbergWavelengthNm(i, targetNf);
      lines.push({
        ni: i,
        nf: targetNf,
        wavelengthNm: wavelength,
        energyEv: transitionEnergy(i, targetNf),
        frequencyHz: transitionFrequency(i, targetNf),
        color: wavelengthToColor(wavelength),
        region: getSpectralRegion(wavelength),
        series: selectedSeries,
      });
    }
    
    return lines;
  }, [selectedSeries]);

  // Get wavelength range for display
  const wavelengthRange = useMemo(() => {
    if (seriesLines.length === 0) return { min: 100, max: 2000 };
    const wavelengths = seriesLines.map(l => l.wavelengthNm);
    const min = Math.min(...wavelengths) * 0.8;
    const max = Math.max(...wavelengths) * 1.2;
    return { min, max };
  }, [seriesLines]);

  // Convert wavelength to x position (logarithmic scale)
  const wavelengthToX = (wavelength: number, width: number): number => {
    const logMin = Math.log10(wavelengthRange.min);
    const logMax = Math.log10(wavelengthRange.max);
    const logWl = Math.log10(wavelength);
    return ((logWl - logMin) / (logMax - logMin)) * width;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          Hydrogen Spectral Series Explorer
        </h2>
        <p className="text-slate-400 mt-1">
          Calculate wavelengths using the Rydberg formula
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Spectral Visualization */}
        <div className="lg:col-span-2 space-y-6">
          {/* Class 12 NEB Notes */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-sm">
            <h4 className="text-amber-400 font-semibold mb-2">📖 Class 12 NEB Notes</h4>
            <ul className="text-slate-300 text-xs leading-relaxed space-y-2 list-disc list-inside">
              <li>The hydrogen emission spectrum consists of discrete spectral lines calculated using the <strong>Rydberg formula: 1/λ = R(1/nf² - 1/ni²)</strong>, where R = 1.097 × 10⁷ m⁻¹ is the Rydberg constant, nᵢ is the initial (higher) energy level, and nf is the final (lower) energy level.</li>
              <li>Different spectral series arise based on the final level: <strong>Lyman series</strong> (nf=1) lies in UV region (91-122 nm), <strong>Balmer series</strong> (nf=2) produces visible light (365-656 nm) with H-α red and H-β blue-green, and <strong>Paschen series</strong> (nf=3) falls in infrared.</li>
              <li>Each series has a <strong>series limit</strong> — the shortest wavelength obtained when nᵢ approaches infinity. The energy of the emitted photon equals the difference between energy levels: <strong>E = 13.6(1/nf² - 1/ni²) eV</strong>.</li>
              <li>These discrete lines provided key evidence for the quantized nature of atomic energy levels and helped establish quantum theory. The visible Balmer lines (H-α, H-β, H-γ, H-δ) are commonly observed in laboratory spectroscopy.</li>
            </ul>
            <a
              href="https://en.wikipedia.org/wiki/Hydrogen_spectral_series"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-xs"
            >
              📚 Learn more on Wikipedia →
            </a>
          </div>

          {/* Series Selection */}
          <div className="flex gap-2 flex-wrap">
            {['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'].map((series) => (
              <button
                key={series}
                onClick={() => setSelectedSeries(series)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSeries === series
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {series}
              </button>
            ))}
          </div>

          {/* Spectral Line Display */}
          <div className="bg-slate-900 rounded-lg p-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4">
              {selectedSeries} Series (n_f = {['Lyman', 'Balmer', 'Paschen', 'Brackett', 'Pfund'].indexOf(selectedSeries) + 1})
            </h3>
            
            {/* Spectrum visualization */}
            <div className="relative h-24 bg-gradient-to-r from-slate-800 to-slate-800 rounded-lg overflow-hidden">
              {/* Visible spectrum background for Balmer */}
              {selectedSeries === 'Balmer' && (
                <div 
                  className="absolute inset-y-0 opacity-30"
                  style={{
                    left: `${wavelengthToX(380, 100)}%`,
                    right: `${100 - wavelengthToX(750, 100)}%`,
                    background: 'linear-gradient(to right, violet, blue, cyan, green, yellow, orange, red)',
                  }}
                />
              )}
              
              {/* Spectral lines */}
              {seriesLines.map((line, index) => (
                <div
                  key={index}
                  className="absolute top-0 bottom-0 w-1 transform -translate-x-1/2"
                  style={{
                    left: `${wavelengthToX(line.wavelengthNm, 100)}%`,
                    backgroundColor: line.color,
                    boxShadow: `0 0 10px ${line.color}`,
                  }}
                  title={`n=${line.ni} → n=${line.nf}: ${line.wavelengthNm.toFixed(1)} nm`}
                />
              ))}
              
              {/* Current selection highlight */}
              {currentLine && (
                <div
                  className="absolute top-0 bottom-0 w-2 transform -translate-x-1/2 ring-2 ring-white"
                  style={{
                    left: `${wavelengthToX(currentLine.wavelengthNm, 100)}%`,
                    backgroundColor: currentLine.color,
                    boxShadow: `0 0 20px ${currentLine.color}`,
                  }}
                />
              )}

              {/* Region labels */}
              <div className="absolute bottom-1 left-2 text-xs text-purple-400">UV</div>
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-green-400">Visible</div>
              <div className="absolute bottom-1 right-2 text-xs text-red-400">IR</div>
            </div>

            {/* Wavelength axis */}
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>{wavelengthRange.min.toFixed(0)} nm</span>
              <span>Wavelength (log scale)</span>
              <span>{wavelengthRange.max.toFixed(0)} nm</span>
            </div>
          </div>

          {/* Line Table */}
          <div className="bg-slate-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">
              Spectral Lines
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 text-slate-400">Transition</th>
                    <th className="text-left py-2 text-slate-400">Wavelength</th>
                    <th className="text-left py-2 text-slate-400">Energy</th>
                    <th className="text-left py-2 text-slate-400">Region</th>
                    <th className="text-left py-2 text-slate-400">Color</th>
                  </tr>
                </thead>
                <tbody>
                  {seriesLines.map((line, index) => (
                    <tr 
                      key={index}
                      className={`border-b border-slate-700/50 cursor-pointer hover:bg-slate-700/50 ${
                        line.ni === ni && line.nf === nf ? 'bg-slate-700' : ''
                      }`}
                      onClick={() => {
                        setSpectralNi(line.ni);
                        setSpectralNf(line.nf);
                      }}
                    >
                      <td className="py-2 text-white">
                        n={line.ni} → n={line.nf}
                      </td>
                      <td className="py-2 text-slate-300 font-mono">
                        {line.wavelengthNm.toFixed(2)} nm
                      </td>
                      <td className="py-2 text-slate-300 font-mono">
                        {line.energyEv.toFixed(3)} eV
                      </td>
                      <td className={`py-2 ${
                        line.region === 'UV' ? 'text-purple-400' :
                        line.region === 'Visible' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {line.region}
                      </td>
                      <td className="py-2">
                        <div 
                          className="w-6 h-4 rounded"
                          style={{ backgroundColor: line.color }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="space-y-6">
          {/* Manual Input */}
          <div className="bg-slate-800 rounded-lg p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Transition Calculator
            </h3>

            {/* Initial level */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Initial Level (nᵢ)</span>
                <span className="font-mono text-blue-400">{ni}</span>
              </label>
              <input
                type="range"
                min={2}
                max={7}
                value={ni}
                onChange={(e) => setSpectralNi(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Final level */}
            <div className="space-y-2">
              <label className="flex justify-between text-sm text-slate-300">
                <span>Final Level (n_f)</span>
                <span className="font-mono text-green-400">{nf}</span>
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={nf}
                onChange={(e) => setSpectralNf(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>

            {/* Validation message */}
            {ni <= nf && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-sm text-red-400">
                ⚠️ nᵢ must be greater than n_f for emission
              </div>
            )}
          </div>

          {/* Results */}
          {currentLine && (
            <div className="bg-slate-800 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
                Results
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Series:</span>
                  <span className="text-white font-semibold">{currentLine.series}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Wavelength:</span>
                  <span className="text-white font-mono">{currentLine.wavelengthNm.toFixed(4)} nm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Energy:</span>
                  <span className="text-white font-mono">{currentLine.energyEv.toFixed(4)} eV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Frequency:</span>
                  <span className="text-white font-mono">{(currentLine.frequencyHz / 1e14).toFixed(3)} × 10¹⁴ Hz</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Region:</span>
                  <span className={`px-2 py-1 rounded text-sm ${
                    currentLine.region === 'UV' ? 'bg-purple-900/50 text-purple-300' :
                    currentLine.region === 'Visible' ? 'bg-green-900/50 text-green-300' :
                    'bg-red-900/50 text-red-300'
                  }`}>
                    {currentLine.region}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Color:</span>
                  <div 
                    className="w-12 h-6 rounded border border-slate-600"
                    style={{ backgroundColor: currentLine.color }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formula */}
          <div className="bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-400 mb-2">Rydberg Formula</h4>
            <div className="text-center py-3 bg-slate-800 rounded-lg">
              <LaTeX 
                formula="\frac{1}{\lambda} = R_H \left( \frac{1}{n_f^{\,2}} - \frac{1}{n_i^{\,2}} \right)" 
                className="text-green-400"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              R = 1.097 × 10⁷ m⁻¹
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SpectralSeriesModule;
