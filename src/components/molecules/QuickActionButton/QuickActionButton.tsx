import React from 'react';
import { motion } from 'motion/react';
import { Icon, type IconName } from '../../atoms/Icon/Icon';
import { Typography } from '../../atoms/Typography/Typography';

interface QuickActionButtonProps {
  label: string;
  iconName?: IconName;
  customIcon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  label,
  iconName,
  customIcon,
  onClick,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <motion.button
        type="button"
        onClick={onClick}
        whileTap={{ scale: 0.93 }}
        whileHover={{ scale: 1.04 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className="w-[60px] h-[60px] rounded-full bg-[#eef0fc] hover:bg-[#e1e5f8] text-[#363CB1] flex items-center justify-center shadow-xs transition-colors cursor-pointer"
        aria-label={label}
      >
        {customIcon ? (
          customIcon
        ) : iconName === 'dollar' ? (
          <span className="text-2xl font-bold font-sans select-none leading-none">$</span>
        ) : iconName ? (
          <Icon name={iconName} size={24} stroke={2} />
        ) : null}
      </motion.button>

      <Typography variant="actionLabel" className="text-xs font-semibold text-[#1B2075]">
        {label}
      </Typography>
    </div>
  );
};
