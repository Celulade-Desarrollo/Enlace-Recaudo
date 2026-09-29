import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../atoms/Icon/Icon';

export type TransportistaTab = 'inicio' | 'movimientos' | 'notificaciones';

interface TransportistaBottomNavProps {
  activeTab: TransportistaTab;
  onTabChange: (tab: TransportistaTab) => void;
  className?: string;
}

export const TransportistaBottomNav: React.FC<TransportistaBottomNavProps> = ({
  activeTab,
  onTabChange,
  className = ''
}) => {
  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 select-none pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className}`}
    >
      <div className="flex items-center justify-around pt-2 px-4 sm:px-6">
        {/* Inicio */}
        <motion.button
          type="button"
          onClick={() => onTabChange('inicio')}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col items-center justify-center py-1.5 px-4 cursor-pointer group"
          aria-label="Inicio"
        >
          <div
            className={`transition-colors duration-200 ${
              activeTab === 'inicio' ? 'text-[#363CB1]' : 'text-slate-600 group-hover:text-[#1B2075]'
            }`}
          >
            <Icon name="home" size={24} stroke={activeTab === 'inicio' ? 2.3 : 1.8} />
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
              activeTab === 'inicio' ? 'text-[#363CB1] font-semibold' : 'text-slate-600'
            }`}
          >
            Inicio
          </span>
        </motion.button>

        {/* Movimientos */}
        <motion.button
          type="button"
          onClick={() => onTabChange('movimientos')}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col items-center justify-center py-1.5 px-4 cursor-pointer group"
          aria-label="Movimientos"
        >
          <div
            className={`transition-colors duration-200 ${
              activeTab === 'movimientos' ? 'text-[#363CB1]' : 'text-slate-600 group-hover:text-[#1B2075]'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center font-bold text-xs leading-none ${
                activeTab === 'movimientos' ? 'border-[#363CB1] text-[#363CB1]' : 'border-slate-600 text-slate-600'
              }`}
            >
              $
            </div>
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
              activeTab === 'movimientos' ? 'text-[#363CB1] font-semibold' : 'text-slate-600'
            }`}
          >
            Movimientos
          </span>
        </motion.button>

        {/* Notificaciones */}
        <motion.button
          type="button"
          onClick={() => onTabChange('notificaciones')}
          whileTap={{ scale: 0.92 }}
          transition={{ duration: 0.12 }}
          className="flex flex-col items-center justify-center py-1.5 px-4 cursor-pointer group"
          aria-label="Notificaciones"
        >
          <div
            className={`transition-colors duration-200 ${
              activeTab === 'notificaciones' ? 'text-[#363CB1]' : 'text-slate-600 group-hover:text-[#1B2075]'
            }`}
          >
            <Icon name="bell" size={24} stroke={activeTab === 'notificaciones' ? 2.3 : 1.8} />
          </div>
          <span
            className={`text-[11px] font-medium tracking-tight mt-1 transition-colors duration-200 ${
              activeTab === 'notificaciones' ? 'text-[#363CB1] font-semibold' : 'text-slate-600'
            }`}
          >
            Notificaciones
          </span>
        </motion.button>
      </div>
    </nav>
  );
};
