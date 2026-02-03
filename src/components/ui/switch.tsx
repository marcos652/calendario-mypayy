import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, label }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <span className="text-xs text-slate-700">{label}</span>
    <span className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
        checked={checked}
        disabled={disabled}
        onChange={e => onChange(e.target.checked)}
        style={{ left: checked ? '1.25rem' : '0', transition: 'left 0.2s' }}
      />
      <span
        className={`block overflow-hidden h-6 rounded-full bg-gray-300 transition-colors duration-200 ease-in ${checked ? 'bg-green-400' : ''}`}
        style={{ width: '2.5rem' }}
      ></span>
      <span
        className={`absolute left-0 top-0 w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in ${checked ? 'translate-x-4 bg-green-500' : 'bg-white'}`}
      ></span>
    </span>
  </label>
);
