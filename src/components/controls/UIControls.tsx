/**
 * UI Control Components
 */

import React from 'react';

// Slider Component
interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  color?: 'blue' | 'green' | 'amber' | 'purple';
}

export const Slider: React.FC<SliderProps> = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = '',
  color = 'blue',
}) => {
  const colorClasses = {
    blue: 'accent-blue-500',
    green: 'accent-green-500',
    amber: 'accent-amber-500',
    purple: 'accent-purple-500',
  };

  const textColorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
  };

  return (
    <div className="space-y-2">
      <label className="flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className={`font-mono ${textColorClasses[color]}`}>
          {value}{unit}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className={`w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer ${colorClasses[color]}`}
      />
    </div>
  );
};

// Toggle Switch Component
interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  color?: 'blue' | 'green' | 'amber';
}

export const Toggle: React.FC<ToggleProps> = ({
  label,
  checked,
  onChange,
  color = 'blue',
}) => {
  const bgColorClass = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    amber: 'bg-amber-600',
  }[color];

  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-slate-300">{label}</span>
      <div 
        className={`w-12 h-6 rounded-full transition-colors ${
          checked ? bgColorClass : 'bg-slate-600'
        }`}
        onClick={onChange}
      >
        <div 
          className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform mt-0.5 ${
            checked ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </div>
    </label>
  );
};

// Button Component
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  size = 'md',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white',
    secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-300',
    danger: 'bg-red-600 hover:bg-red-500 text-white',
    success: 'bg-green-600 hover:bg-green-500 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        rounded-lg font-medium transition-colors
      `}
    >
      {children}
    </button>
  );
};

// Card Component
interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return (
    <div className={`bg-slate-800 rounded-lg p-6 ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2 mb-4">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};

// Info Box Component
interface InfoBoxProps {
  title: string;
  items: { label: string; value: string; color?: string }[];
}

export const InfoBox: React.FC<InfoBoxProps> = ({ title, items }) => {
  return (
    <div className="bg-slate-900 rounded-lg p-4 space-y-2">
      <h4 className="text-sm font-medium text-slate-400">{title}</h4>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span className="text-slate-400">{item.label}:</span>
            <span className={`font-mono ${item.color || 'text-white'}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
