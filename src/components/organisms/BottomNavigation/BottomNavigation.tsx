import React from 'react';
import { BottomNavItem } from '../../molecules/BottomNavItem/BottomNavItem';

export type TabType = 'inicio' | 'movimientos' | 'para-ti';

interface BottomNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  className?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 select-none pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="flex items-center justify-around pt-2 px-4 sm:px-6">
        <BottomNavItem
          label="Inicio"
          iconName="home"
          isActive={activeTab === 'inicio'}
          onClick={() => onTabChange('inicio')}
        />
        <BottomNavItem
          label="Mis Movimientos"
          iconName="coins"
          isActive={activeTab === 'movimientos'}
          onClick={() => onTabChange('movimientos')}
        />
        <BottomNavItem
          label="Para ti"
          iconName="star"
          isActive={activeTab === 'para-ti'}
          onClick={() => onTabChange('para-ti')}
        />
      </div>
    </nav>
  );
};
