import React from 'react';
import { motion } from 'motion/react';
import { Icon, type IconName } from '../../atoms/Icon/Icon';

interface BottomNavItemProps {
  label: string;
  iconName: IconName;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export const BottomNavItem: React.FC<BottomNavItemProps> = ({
  label,
  iconName,
  isActive = false,
  onClick,
  className = ''
}) => {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={{ duration: 0.12 }}
      className={`flex flex-col items-center justify-center py-1.5 px-3 transition-colors select-none cursor-pointer group ${className}`}
      aria-label={label}
    >
      <div
        className={`transition-transform duration-200 group-hover:scale-110 ${
          isActive ? 'text-[#363CB1]' : 'text-slate-600 group-hover:text-[#1B2075]'
        }`}
      >
        {iconName === 'coins' ? (
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs leading-none ${
              isActive ? 'border-[#363CB1] text-[#363CB1]' : 'border-slate-600 text-slate-600'
            }`}
          >
            $
          </div>
        ) : (
          <Icon name={iconName} size={24} stroke={isActive ? 2.3 : 1.8} />
        )}
      </div>

      <span
        className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
          isActive ? 'text-[#363CB1] font-semibold' : 'text-slate-600 group-hover:text-[#1B2075]'
        }`}
      >
        {label}
      </span>
    </motion.button>
  );
};
