import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../../services/transportistaService';

interface PrefacturaCardProps {
  prefactura: PrefacturaCliente;
  onClick?: (prefactura: PrefacturaCliente) => void;
  className?: string;
}

export const PrefacturaCard: React.FC<PrefacturaCardProps> = ({
  prefactura,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(prefactura)}
      className={`bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all cursor-pointer select-none ${className}`}
    >
      {/* Lado izquierdo: No. Prefactura */}
      <div className="flex flex-col min-w-0 pr-2">
        <span className="text-[13px] font-bold text-slate-900 leading-snug">
          No. Prefactura
        </span>
        <span className="text-sm font-medium text-slate-700 mt-0.5">
          {prefactura.numeroPrefactura}
        </span>
      </div>

      {/* Lado derecho: Saldo Total y Chevron */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end text-right">
          <span className="text-[11px] text-slate-400 font-normal">
            Saldo Total
          </span>
          <span className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-snug mt-0.5">
            {prefactura.saldoTotal}
          </span>
        </div>

        <div className="text-[#1B2075] pl-1">
          <Icon name="chevron-right" size={20} stroke={2.5} />
        </div>
      </div>
    </motion.div>
  );
};
