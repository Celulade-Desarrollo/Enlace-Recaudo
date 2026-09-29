import React from 'react';

interface MobileHomeBarProps {
  theme?: 'light' | 'dark';
  className?: string;
}

export const MobileHomeBar: React.FC<MobileHomeBarProps> = ({
  theme = 'dark',
  className = ''
}) => {
  const barBg = theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80';

  return (
    <div
      className={`w-full flex items-center justify-center pt-2 pb-1.5 select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <div className={`w-32 h-1 rounded-full ${barBg}`} />
    </div>
  );
};
