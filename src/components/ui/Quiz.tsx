/**
 * Quiz Component
 * Interactive quiz with multiple choice questions for each module
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LaTeX } from './LaTeX';

interface QuizQuestion {
  id: number;
  question: string;
  formula?: string;
  options: string[];
  optionFormulas?: string[];
  correctIndex: number;
  explanation: string;
  explanationFormula?: string;
}

interface QuizProps {
  title: string;
  questions: QuizQuestion[];
}

export const Quiz: React.FC<QuizProps> = ({ title, questions }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(new Array(questions.length).fill(false));

  const question = questions[currentQuestion];

  const handleSelectAnswer = (index: number) => {
    if (answered[currentQuestion]) return;
    
    setSelectedAnswer(index);
    const newAnswered = [...answered];
    newAnswered[currentQuestion] = true;
    setAnswered(newAnswered);
    
    if (index === question.correctIndex) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered(new Array(questions.length).fill(false));
  };

  const progress = useMemo(() => {
    return ((currentQuestion + 1) / questions.length) * 100;
  }, [currentQuestion, questions.length]);

  const getOptionStyle = (index: number) => {
    if (!answered[currentQuestion]) {
      return selectedAnswer === index 
        ? 'border-blue-500 bg-blue-500/20' 
        : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50';
    }
    
    if (index === question.correctIndex) {
      return 'border-green-500 bg-green-500/20';
    }
    
    if (selectedAnswer === index && index !== question.correctIndex) {
      return 'border-red-500 bg-red-500/20';
    }
    
    return 'border-slate-600 opacity-50';
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    const getMessage = () => {
      if (percentage >= 90) return { text: 'Excellent! 🎉', color: 'text-green-400', bg: 'from-green-500/20 to-emerald-500/10' };
      if (percentage >= 70) return { text: 'Good job! 👍', color: 'text-blue-400', bg: 'from-blue-500/20 to-cyan-500/10' };
      if (percentage >= 50) return { text: 'Keep practicing! 📚', color: 'text-amber-400', bg: 'from-amber-500/20 to-orange-500/10' };
      return { text: 'Review the concepts! 💪', color: 'text-red-400', bg: 'from-red-500/20 to-pink-500/10' };
    };
    const message = getMessage();

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-br ${message.bg} border border-slate-700 rounded-xl p-8 text-center`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
          <span className="text-3xl">🏆</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
        
        <div className="my-6">
          <div className={`text-6xl font-bold ${message.color} mb-2`}>
            {score}/{questions.length}
          </div>
          <div className="text-slate-400 text-lg">{percentage}% correct</div>
          <div className={`text-xl mt-3 ${message.color}`}>{message.text}</div>
        </div>

        <button
          onClick={handleRestart}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg"
        >
          🔄 Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧪</span>
            <h3 className="text-lg font-bold text-white">{title}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {/* Question */}
            <div className="pb-4">
              <p className="text-white text-lg font-medium mb-3">{question.question}</p>
              {question.formula && (
                <div className="bg-slate-900/80 rounded-lg p-4 inline-block border border-slate-700">
                  <LaTeX formula={question.formula} className="text-cyan-400" />
                </div>
              )}
            </div>

            {/* Options Grid */}
            <div className="grid gap-3">
              {question.options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={answered[currentQuestion]}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${getOptionStyle(index)}`}
                  whileHover={!answered[currentQuestion] ? { scale: 1.01, x: 4 } : {}}
                  whileTap={!answered[currentQuestion] ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      answered[currentQuestion] && index === question.correctIndex
                        ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                        : answered[currentQuestion] && selectedAnswer === index
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-slate-700 text-slate-300'
                    }`}>
                      {answered[currentQuestion] && index === question.correctIndex ? '✓' :
                       answered[currentQuestion] && selectedAnswer === index ? '✗' :
                       String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-slate-200 flex-1 text-base">
                      {question.optionFormulas && question.optionFormulas[index] ? (
                        <LaTeX 
                          formula={question.optionFormulas[index]} 
                          displayMode={false}
                          className="text-slate-200"
                        />
                      ) : (
                        option
                      )}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {answered[currentQuestion] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl p-5 border border-amber-500/30"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="text-slate-200 text-sm leading-relaxed">{question.explanation}</p>
                      {question.explanationFormula && (
                        <div className="mt-3 bg-slate-900/50 rounded-lg p-3 inline-block">
                          <LaTeX 
                            formula={question.explanationFormula} 
                            className="text-green-400"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex justify-between items-center px-6 py-4 bg-slate-900/50 border-t border-slate-700">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
            currentQuestion === 0
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          ← Previous
        </button>
        
        <div className="flex gap-1">
          {questions.map((_, idx) => (
            <div
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentQuestion
                  ? 'bg-blue-500 scale-125'
                  : answered[idx]
                    ? 'bg-green-500'
                    : 'bg-slate-600'
              }`}
            />
          ))}
        </div>
        
        <button
          onClick={handleNext}
          disabled={!answered[currentQuestion]}
          className={`px-5 py-2.5 rounded-lg transition-all flex items-center gap-2 font-semibold ${
            !answered[currentQuestion]
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
          }`}
        >
          {currentQuestion === questions.length - 1 ? '🏁 See Results' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

// Pre-defined quiz questions for each module - NEB Class 12 Board Exam focused
export const bohrAtomQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "What is the energy of an electron in the ground state (n=1) of hydrogen?",
    options: ["-13.6 eV", "-3.4 eV", "-1.51 eV", "-0.85 eV"],
    correctIndex: 0,
    explanation: "The ground state energy is E₁ = -13.6 eV. This is the most important value to remember for NEB exams.",
    explanationFormula: "E_1 = -\\frac{13.6}{1^2} = -13.6 \\text{ eV}"
  },
  {
    id: 2,
    question: "What is the energy of electron in the second orbit (n=2) of hydrogen atom?",
    options: ["-13.6 eV", "-3.4 eV", "-1.51 eV", "-0.85 eV"],
    correctIndex: 1,
    explanation: "Using Eₙ = -13.6/n² eV, for n=2: E₂ = -13.6/4 = -3.4 eV",
    explanationFormula: "E_2 = -\\frac{13.6}{2^2} = -\\frac{13.6}{4} = -3.4 \\text{ eV}"
  },
  {
    id: 3,
    question: "The radius of the first Bohr orbit (Bohr radius a₀) is:",
    options: ["0.53 Å", "1.06 Å", "2.12 Å", "0.265 Å"],
    correctIndex: 0,
    explanation: "The Bohr radius a₀ = 0.53 Å = 0.53 × 10⁻¹⁰ m = 5.3 × 10⁻¹¹ m. This is a frequently asked value in NEB.",
  },
  {
    id: 4,
    question: "The radius of nth orbit is given by:",
    options: ["rₙ = n²a₀", "rₙ = na₀", "rₙ = n³a₀", "rₙ = a₀/n²"],
    optionFormulas: ["r_n = n^2 a_0", "r_n = n a_0", "r_n = n^3 a_0", "r_n = \\frac{a_0}{n^2}"],
    correctIndex: 0,
    explanation: "The radius increases as the square of the principal quantum number: rₙ = n²a₀",
    explanationFormula: "r_n = n^2 a_0 = n^2 \\times 0.53 \\text{ Å}"
  },
  {
    id: 5,
    question: "If an electron jumps from n=3 to n=1, which spectral series does it belong to?",
    options: ["Lyman series", "Balmer series", "Paschen series", "Brackett series"],
    correctIndex: 0,
    explanation: "Lyman series: transitions ending at n=1 (UV region). Balmer: n=2 (visible). Paschen: n=3 (IR).",
  },
  {
    id: 6,
    question: "The wavelength of first line of Balmer series (Hα) is approximately:",
    options: ["656 nm", "486 nm", "434 nm", "410 nm"],
    correctIndex: 0,
    explanation: "Hα line (n=3→2) has λ = 656 nm (red). Hβ (4→2) = 486 nm (cyan). These are important for NEB.",
  },
  {
    id: 7,
    question: "According to Bohr's postulate, angular momentum of electron is quantized as:",
    options: ["mvr = nh/2π", "mvr = nh", "mvr = h/2π", "mvr = 2πnh"],
    optionFormulas: ["mvr = \\frac{nh}{2\\pi}", "mvr = nh", "mvr = \\frac{h}{2\\pi}", "mvr = 2\\pi nh"],
    correctIndex: 0,
    explanation: "Bohr's quantization condition: L = mvr = nℏ = nh/2π, where n = 1, 2, 3...",
    explanationFormula: "L = mvr = n\\hbar = \\frac{nh}{2\\pi}"
  },
  {
    id: 8,
    question: "The ionization energy of hydrogen atom is:",
    options: ["13.6 eV", "3.4 eV", "1.51 eV", "27.2 eV"],
    correctIndex: 0,
    explanation: "Ionization energy = Energy needed to remove electron from ground state = |E₁| = 13.6 eV",
  },
  {
    id: 9,
    question: "The velocity of electron in nth orbit is proportional to:",
    options: ["1/n", "n", "n²", "1/n²"],
    correctIndex: 0,
    explanation: "Velocity vₙ ∝ 1/n. In ground state, v₁ = 2.18 × 10⁶ m/s ≈ c/137",
    explanationFormula: "v_n = \\frac{v_1}{n} = \\frac{2.18 \\times 10^6}{n} \\text{ m/s}"
  },
  {
    id: 10,
    question: "The Rydberg constant R has the value:",
    options: ["1.097 × 10⁷ m⁻¹", "1.097 × 10⁻⁷ m⁻¹", "1.097 × 10⁷ m", "6.63 × 10⁻³⁴ J·s"],
    correctIndex: 0,
    explanation: "Rydberg constant R = 1.097 × 10⁷ m⁻¹. Used in Rydberg formula: 1/λ = R(1/nf² - 1/ni²)",
    explanationFormula: "R_H = 1.097 \\times 10^7 \\text{ m}^{-1}"
  },
];

export const deBroglieQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "The de Broglie wavelength of a particle is given by:",
    options: ["λ = h/p", "λ = p/h", "λ = hf", "λ = mc²/h"],
    optionFormulas: ["\\lambda = \\frac{h}{p}", "\\lambda = \\frac{p}{h}", "\\lambda = hf", "\\lambda = \\frac{mc^2}{h}"],
    correctIndex: 0,
    explanation: "de Broglie hypothesis: Every moving particle has an associated wave with λ = h/p = h/mv",
    explanationFormula: "\\lambda = \\frac{h}{p} = \\frac{h}{mv}"
  },
  {
    id: 2,
    question: "The de Broglie wavelength of an electron accelerated through potential V is:",
    options: ["λ = h/√(2meV)", "λ = √(2meV)/h", "λ = h·√(2meV)", "λ = 2meV/h"],
    optionFormulas: ["\\lambda = \\frac{h}{\\sqrt{2meV}}", "\\lambda = \\frac{\\sqrt{2meV}}{h}", "\\lambda = h\\sqrt{2meV}", "\\lambda = \\frac{2meV}{h}"],
    correctIndex: 0,
    explanation: "KE = eV = p²/2m, so p = √(2meV). Therefore λ = h/√(2meV)",
    explanationFormula: "\\lambda = \\frac{h}{\\sqrt{2meV}} = \\frac{12.27}{\\sqrt{V}} \\text{ Å}"
  },
  {
    id: 3,
    question: "For Bohr's stationary orbits, the standing wave condition is:",
    options: ["2πr = nλ", "πr = nλ", "r = nλ", "2r = nλ"],
    optionFormulas: ["2\\pi r = n\\lambda", "\\pi r = n\\lambda", "r = n\\lambda", "2r = n\\lambda"],
    correctIndex: 0,
    explanation: "For standing wave: circumference = integer × wavelength, i.e., 2πr = nλ",
    explanationFormula: "2\\pi r = n\\lambda"
  },
  {
    id: 4,
    question: "If the kinetic energy of a particle is doubled, its de Broglie wavelength:",
    options: ["Becomes 1/√2 times", "Becomes √2 times", "Doubles", "Halves"],
    correctIndex: 0,
    explanation: "λ = h/√(2mKE). If KE doubles, λ becomes 1/√2 times original.",
    explanationFormula: "\\lambda' = \\frac{h}{\\sqrt{2m(2KE)}} = \\frac{\\lambda}{\\sqrt{2}}"
  },
  {
    id: 5,
    question: "The de Broglie wavelength is significant for:",
    options: ["Electrons and subatomic particles", "Cricket balls", "Cars", "All objects equally"],
    correctIndex: 0,
    explanation: "Due to very small value of h, λ is significant only for microscopic particles like electrons.",
  },
  {
    id: 6,
    question: "An electron and a proton have same kinetic energy. Which has longer wavelength?",
    options: ["Electron", "Proton", "Both same", "Cannot be determined"],
    correctIndex: 0,
    explanation: "λ = h/√(2mKE). For same KE, lighter particle (electron) has longer wavelength.",
    explanationFormula: "\\lambda_e > \\lambda_p \\text{ since } m_e < m_p"
  },
  {
    id: 7,
    question: "The de Broglie wavelength of an electron accelerated through 100 V is approximately:",
    options: ["1.227 Å", "0.1227 Å", "12.27 Å", "122.7 Å"],
    correctIndex: 0,
    explanation: "Using λ = 12.27/√V Å, for V = 100V: λ = 12.27/10 = 1.227 Å",
    explanationFormula: "\\lambda = \\frac{12.27}{\\sqrt{100}} = \\frac{12.27}{10} = 1.227 \\text{ Å}"
  },
  {
    id: 8,
    question: "de Broglie waves are:",
    options: ["Matter waves", "Electromagnetic waves", "Sound waves", "Mechanical waves"],
    correctIndex: 0,
    explanation: "de Broglie waves are matter waves associated with moving particles. They are not electromagnetic.",
  },
  {
    id: 9,
    question: "The experimental verification of de Broglie hypothesis was done by:",
    options: ["Davisson and Germer", "Rutherford", "Bohr", "Planck"],
    correctIndex: 0,
    explanation: "Davisson and Germer (1927) experimentally verified electron diffraction, confirming de Broglie's hypothesis.",
  },
  {
    id: 10,
    question: "If the momentum of a particle is doubled, its de Broglie wavelength becomes:",
    options: ["Half", "Double", "Four times", "One-fourth"],
    correctIndex: 0,
    explanation: "λ = h/p. If p doubles, λ becomes half.",
    explanationFormula: "\\lambda' = \\frac{h}{2p} = \\frac{\\lambda}{2}"
  },
];

export const uncertaintyQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "Heisenberg's Uncertainty Principle states:",
    formula: "\\Delta x \\cdot \\Delta p \\geq ?",
    options: ["ℏ/2", "ℏ", "h", "h/2"],
    optionFormulas: ["\\frac{\\hbar}{2}", "\\hbar", "h", "\\frac{h}{2}"],
    correctIndex: 0,
    explanation: "The minimum uncertainty product is ℏ/2 = h/4π",
    explanationFormula: "\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2} = \\frac{h}{4\\pi}"
  },
  {
    id: 2,
    question: "The value of reduced Planck constant ℏ is:",
    options: ["1.055 × 10⁻³⁴ J·s", "6.63 × 10⁻³⁴ J·s", "1.055 × 10⁻³⁴ eV·s", "6.63 × 10⁻³⁴ eV·s"],
    correctIndex: 0,
    explanation: "ℏ = h/2π = 6.63×10⁻³⁴/(2π) = 1.055 × 10⁻³⁴ J·s",
    explanationFormula: "\\hbar = \\frac{h}{2\\pi} = 1.055 \\times 10^{-34} \\text{ J·s}"
  },
  {
    id: 3,
    question: "If Δx is the uncertainty in position, then uncertainty in momentum Δp is:",
    options: ["Δp ≥ ℏ/(2Δx)", "Δp ≥ 2ℏ/Δx", "Δp ≥ Δx/ℏ", "Δp ≥ ℏΔx"],
    optionFormulas: ["\\Delta p \\geq \\frac{\\hbar}{2\\Delta x}", "\\Delta p \\geq \\frac{2\\hbar}{\\Delta x}", "\\Delta p \\geq \\frac{\\Delta x}{\\hbar}", "\\Delta p \\geq \\hbar \\Delta x"],
    correctIndex: 0,
    explanation: "From ΔxΔp ≥ ℏ/2, we get Δp ≥ ℏ/(2Δx)",
  },
  {
    id: 4,
    question: "The uncertainty principle for energy and time is:",
    options: ["ΔE·Δt ≥ ℏ/2", "ΔE·Δt ≥ ℏ", "ΔE·Δt ≥ h", "ΔE·Δt = 0"],
    optionFormulas: ["\\Delta E \\cdot \\Delta t \\geq \\frac{\\hbar}{2}", "\\Delta E \\cdot \\Delta t \\geq \\hbar", "\\Delta E \\cdot \\Delta t \\geq h", "\\Delta E \\cdot \\Delta t = 0"],
    correctIndex: 0,
    explanation: "Energy-time uncertainty relation: ΔE·Δt ≥ ℏ/2",
  },
  {
    id: 5,
    question: "Why can't electrons exist inside the nucleus according to uncertainty principle?",
    options: ["Energy would be too high", "They would have negative mass", "They would become neutrons", "They can exist"],
    correctIndex: 0,
    explanation: "If Δx ≈ 10⁻¹⁴ m (nuclear size), Δp would be huge, giving KE >> nuclear binding energy.",
  },
  {
    id: 6,
    question: "The uncertainty principle is a consequence of:",
    options: ["Wave-particle duality", "Conservation of energy", "Newton's laws", "Coulomb's law"],
    correctIndex: 0,
    explanation: "The uncertainty principle arises from the wave nature of matter - wave-particle duality.",
  },
  {
    id: 7,
    question: "If position is measured with zero uncertainty, then momentum uncertainty is:",
    options: ["Infinite", "Zero", "ℏ/2", "h"],
    correctIndex: 0,
    explanation: "If Δx → 0, then Δp → ∞ to satisfy ΔxΔp ≥ ℏ/2",
  },
  {
    id: 8,
    question: "The uncertainty principle does NOT apply to:",
    options: ["Simultaneous measurement of position and momentum", "Measurement of position alone", "Simultaneous measurement of energy and time", "Conjugate variables"],
    correctIndex: 1,
    explanation: "Uncertainty principle applies to simultaneous measurement of conjugate pairs (x,p) or (E,t), not individual measurements.",
  },
  {
    id: 9,
    question: "An electron is confined to a box of 1 Å. The minimum uncertainty in velocity is approximately:",
    options: ["5.8 × 10⁵ m/s", "5.8 × 10⁶ m/s", "5.8 × 10⁷ m/s", "5.8 × 10⁴ m/s"],
    correctIndex: 1,
    explanation: "Δp ≥ ℏ/(2Δx), Δv = Δp/m = ℏ/(2mΔx) ≈ 5.8 × 10⁶ m/s",
    explanationFormula: "\\Delta v = \\frac{\\hbar}{2m\\Delta x} \\approx 5.8 \\times 10^6 \\text{ m/s}"
  },
  {
    id: 10,
    question: "The uncertainty principle was proposed by:",
    options: ["Werner Heisenberg", "Niels Bohr", "Max Planck", "Albert Einstein"],
    correctIndex: 0,
    explanation: "Werner Heisenberg proposed the uncertainty principle in 1927.",
  },
];

export const xrayQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "The minimum wavelength of X-rays produced at voltage V is given by:",
    options: ["λ_min = hc/(eV)", "λ_min = eV/(hc)", "λ_min = hV/(ec)", "λ_min = ec/(hV)"],
    optionFormulas: ["\\lambda_{\\min} = \\frac{hc}{eV}", "\\lambda_{\\min} = \\frac{eV}{hc}", "\\lambda_{\\min} = \\frac{hV}{ec}", "\\lambda_{\\min} = \\frac{ec}{hV}"],
    correctIndex: 0,
    explanation: "Duane-Hunt law: When all KE converts to X-ray photon energy, eV = hc/λ_min",
    explanationFormula: "\\lambda_{\\min} = \\frac{hc}{eV} = \\frac{12400}{V} \\text{ Å}"
  },
  {
    id: 2,
    question: "In a Coolidge tube operating at 50 kV, the minimum wavelength of X-rays is:",
    options: ["0.248 Å", "2.48 Å", "24.8 Å", "0.0248 Å"],
    correctIndex: 0,
    explanation: "λ_min = 12400/V(in volts) Å = 12400/50000 = 0.248 Å",
    explanationFormula: "\\lambda_{\\min} = \\frac{12400}{50000} = 0.248 \\text{ Å}"
  },
  {
    id: 3,
    question: "Continuous X-rays are produced due to:",
    options: ["Bremsstrahlung (deceleration of electrons)", "Electron transitions in atoms", "Nuclear reactions", "Photoelectric effect"],
    correctIndex: 0,
    explanation: "Continuous X-rays (Bremsstrahlung) are produced when high-speed electrons are decelerated by the target.",
  },
  {
    id: 4,
    question: "Characteristic X-rays are produced when:",
    options: ["Inner shell electrons are knocked out", "Electrons are decelerated", "Atoms are ionized", "Electrons gain energy"],
    correctIndex: 0,
    explanation: "Characteristic X-rays are emitted when outer electrons fill inner shell vacancies created by incident electrons.",
  },
  {
    id: 5,
    question: "In a Coolidge tube, electrons are produced by:",
    options: ["Thermionic emission", "Photoelectric emission", "Field emission", "Secondary emission"],
    correctIndex: 0,
    explanation: "In Coolidge tube, the heated tungsten filament (cathode) emits electrons by thermionic emission.",
  },
  {
    id: 6,
    question: "The target material in X-ray tube is usually:",
    options: ["Tungsten", "Copper", "Aluminum", "Iron"],
    correctIndex: 0,
    explanation: "Tungsten is preferred due to high melting point (3400°C), high atomic number, and good thermal conductivity.",
  },
  {
    id: 7,
    question: "Kα X-ray is emitted when an electron jumps from:",
    options: ["L shell to K shell", "M shell to K shell", "K shell to L shell", "N shell to K shell"],
    correctIndex: 0,
    explanation: "Kα: L→K transition. Kβ: M→K transition. These give characteristic X-ray lines.",
  },
  {
    id: 8,
    question: "X-rays are:",
    options: ["Electromagnetic waves", "Matter waves", "Sound waves", "Longitudinal waves"],
    correctIndex: 0,
    explanation: "X-rays are electromagnetic waves with wavelength 0.01 Å to 10 Å, between UV and gamma rays.",
  },
  {
    id: 9,
    question: "If the accelerating voltage is increased, the cutoff wavelength:",
    options: ["Decreases", "Increases", "Remains same", "First increases then decreases"],
    correctIndex: 0,
    explanation: "λ_min = hc/(eV). As V increases, λ_min decreases (inverse relationship).",
  },
  {
    id: 10,
    question: "Moseley's law relates the frequency of characteristic X-rays to:",
    options: ["Atomic number (Z)", "Mass number (A)", "Number of neutrons", "Number of electrons"],
    correctIndex: 0,
    explanation: "Moseley's law: √f = a(Z - b), where Z is atomic number. This helped arrange periodic table.",
    explanationFormula: "\\sqrt{f} = a(Z - b)"
  },
];

export const braggQuiz: QuizQuestion[] = [
  {
    id: 1,
    question: "Bragg's law for X-ray diffraction is:",
    options: ["2d sin θ = nλ", "d sin θ = nλ", "2d cos θ = nλ", "d sin θ = 2nλ"],
    optionFormulas: ["2d \\sin\\theta = n\\lambda", "d \\sin\\theta = n\\lambda", "2d \\cos\\theta = n\\lambda", "d \\sin\\theta = 2n\\lambda"],
    correctIndex: 0,
    explanation: "Bragg's law: 2d sin θ = nλ, where d = interplanar spacing, θ = glancing angle, n = order",
    explanationFormula: "2d \\sin\\theta = n\\lambda"
  },
  {
    id: 2,
    question: "The path difference between X-rays reflected from adjacent planes is:",
    options: ["2d sin θ", "d sin θ", "2d cos θ", "d cos θ"],
    optionFormulas: ["2d \\sin\\theta", "d \\sin\\theta", "2d \\cos\\theta", "d \\cos\\theta"],
    correctIndex: 0,
    explanation: "Path difference = 2d sin θ. For constructive interference, this equals nλ.",
  },
  {
    id: 3,
    question: "In Bragg's equation, θ is the angle between:",
    options: ["Incident ray and crystal plane", "Incident ray and normal", "Reflected ray and normal", "Two crystal planes"],
    correctIndex: 0,
    explanation: "θ is the glancing angle - angle between incident X-ray and the crystal plane surface.",
  },
  {
    id: 4,
    question: "For first order diffraction (n=1) with d = 2.82 Å and λ = 1.54 Å, the Bragg angle is:",
    options: ["15.8°", "30°", "45°", "60°"],
    correctIndex: 0,
    explanation: "sin θ = nλ/(2d) = 1.54/(2×2.82) = 0.273, θ = sin⁻¹(0.273) ≈ 15.8°",
    explanationFormula: "\\theta = \\sin^{-1}\\left(\\frac{n\\lambda}{2d}\\right) = \\sin^{-1}(0.273) \\approx 15.8°"
  },
  {
    id: 5,
    question: "X-ray diffraction is used to determine:",
    options: ["Crystal structure", "Atomic mass", "Atomic number", "Electron configuration"],
    correctIndex: 0,
    explanation: "X-ray diffraction (crystallography) reveals the arrangement of atoms in crystals.",
  },
  {
    id: 6,
    question: "The maximum value of sin θ in Bragg's law limits:",
    options: ["The observable orders of diffraction", "The crystal spacing", "The X-ray wavelength", "The intensity"],
    correctIndex: 0,
    explanation: "Since sin θ ≤ 1, nλ/(2d) ≤ 1, limiting observable diffraction orders to n ≤ 2d/λ.",
  },
  {
    id: 7,
    question: "Bragg's law was experimentally verified using:",
    options: ["X-ray spectrometer", "Optical microscope", "Electron microscope", "Mass spectrometer"],
    correctIndex: 0,
    explanation: "Bragg's X-ray spectrometer was used to verify the law and study crystal structures.",
  },
  {
    id: 8,
    question: "If wavelength is doubled, for same order diffraction, sin θ:",
    options: ["Doubles", "Halves", "Remains same", "Quadruples"],
    correctIndex: 0,
    explanation: "From 2d sin θ = nλ, sin θ = nλ/(2d). If λ doubles, sin θ doubles.",
  },
  {
    id: 9,
    question: "The interplanar spacing d can be calculated if we know:",
    options: ["λ, θ, and n", "Only λ", "Only θ", "Only n"],
    correctIndex: 0,
    explanation: "From 2d sin θ = nλ, we get d = nλ/(2 sin θ). All three quantities are needed.",
    explanationFormula: "d = \\frac{n\\lambda}{2\\sin\\theta}"
  },
  {
    id: 10,
    question: "Bragg diffraction occurs when X-rays are:",
    options: ["Scattered by crystal planes constructively", "Absorbed by crystals", "Refracted by crystals", "Polarized by crystals"],
    correctIndex: 0,
    explanation: "Bragg diffraction is constructive interference of X-rays scattered by parallel crystal planes.",
  },
];

export default Quiz;
