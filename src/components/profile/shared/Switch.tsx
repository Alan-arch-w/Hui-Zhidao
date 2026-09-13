import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, size = 'md' }) => {
  const sizeClass = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11';
  const knobSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  const translate = checked ? (size === 'sm' ? 'translate-x-4' : 'translate-x-5') : 'translate-x-1';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex ${sizeClass} items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2e7066]/20 ${
        checked ? 'bg-[#2e7066]' : 'bg-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-block ${knobSize} transform rounded-full bg-white transition-transform ${translate}`}
      />
    </button>
  );
};
