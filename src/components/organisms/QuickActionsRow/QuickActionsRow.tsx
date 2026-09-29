import React from 'react';
import { QuickActionButton } from '../../molecules/QuickActionButton/QuickActionButton';

interface QuickActionsRowProps {
  onMisLlaves?: () => void;
  className?: string;
}

export const QuickActionsRow: React.FC<QuickActionsRowProps> = ({
  onMisLlaves,
  className = ''
}) => {
  return (
    <div
      className={`w-full flex items-center justify-center px-4 pt-4 pb-2 bg-white ${className}`}
    >
      <QuickActionButton
        label="Mis Llaves"
        iconName="key"
        onClick={onMisLlaves}
      />
    </div>
  );
};
