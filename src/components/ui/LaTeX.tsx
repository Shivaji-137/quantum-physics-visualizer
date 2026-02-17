/**
 * LaTeX Formula Component
 * Renders mathematical formulas using KaTeX
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface LaTeXProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
  color?: string;
}

export const LaTeX: React.FC<LaTeXProps> = ({ 
  formula, 
  displayMode = true, 
  className = '',
  color
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode,
        trust: true,
      });
    } catch (e) {
      console.error('KaTeX error:', e);
      return formula;
    }
  }, [formula, displayMode]);

  return (
    <span 
      className={className}
      style={{ color }}
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

export default LaTeX;
