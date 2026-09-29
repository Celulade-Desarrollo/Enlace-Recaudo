import React from 'react';

interface MobileStatusBarProps {
  theme?: 'light' | 'dark';
  time?: string;
  className?: string;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  theme = 'light',
  time = '9:30',
  className = ''
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? 'text-white' : 'text-slate-800';
  const iconFill = isLight ? '#FFFFFF' : '#1E293B';

  return (
    <div
      className={`w-full flex items-center justify-between px-6 pt-2 pb-1.5 text-xs font-semibold select-none ${textColor} ${className}`}
      aria-hidden="true"
    >
      {/* Hora */}
      <span className="tracking-tight text-[13px] font-bold">{time}</span>

      {/* Iconos de red, wifi y batería */}
      <div className="flex items-center gap-1.5">
        {/* Señal móvil */}
        <svg width="15" height="13" viewBox="0 0 16 14" fill="none">
          <rect x="0" y="10" width="2.5" height="4" rx="0.5" fill={iconFill} />
          <rect x="4" y="7" width="2.5" height="7" rx="0.5" fill={iconFill} />
          <rect x="8" y="4" width="2.5" height="10" rx="0.5" fill={iconFill} />
          <rect x="12" y="1" width="2.5" height="13" rx="0.5" fill={iconFill} />
        </svg>

        {/* Wifi */}
        <svg width="14" height="13" viewBox="0 0 16 14" fill="none">
          <path
            d="M8 12.5C8.82843 12.5 9.5 11.8284 9.5 11C9.5 10.1716 8.82843 9.5 8 9.5C7.17157 9.5 6.5 10.1716 6.5 11C6.5 11.8284 7.17157 12.5 8 12.5Z"
            fill={iconFill}
          />
          <path
            d="M3.75 7.5C4.9 6.35 6.4 5.65 8 5.65C9.6 5.65 11.1 6.35 12.25 7.5"
            stroke={iconFill}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M1 4.5C2.9 2.6 5.35 1.5 8 1.5C10.65 1.5 13.1 2.6 15 4.5"
            stroke={iconFill}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>

        {/* Batería */}
        <svg width="19" height="11" viewBox="0 0 22 12" fill="none">
          <rect
            x="0.75"
            y="0.75"
            width="17.5"
            height="10.5"
            rx="2.5"
            stroke={iconFill}
            strokeWidth="1.5"
          />
          <rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill={iconFill} />
          <path
            d="M20 4.2C20.5 4.5 21 5.2 21 6C21 6.8 20.5 7.5 20 7.8"
            stroke={iconFill}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};
