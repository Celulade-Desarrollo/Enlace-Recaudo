import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../atoms/Icon/Icon';
import type { TiendaRuta } from '../../../services/transportistaService';

interface TiendaRutaCardProps {
  tienda: TiendaRuta;
  onClick?: (tienda: TiendaRuta) => void;
  className?: string;
}

export const TiendaRutaCard: React.FC<TiendaRutaCardProps> = ({
  tienda,
  onClick,
  className = ''
}) => {
  const isVisitado = tienda.estado === 'visitado';

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(tienda)}
      className={`bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all cursor-pointer select-none ${className}`}
    >
      {/* Lado izquierdo: Icono de tienda y detalles */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <div className="w-12 h-12 rounded-full bg-[#EBF0FF] text-[#363CB1] flex items-center justify-center shrink-0 border border-blue-100/60">
          <Icon name="building-store" size={24} stroke={2} />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900 truncate leading-snug tracking-tight">
            {tienda.nombre}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isVisitado ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span>
              {isVisitado
                ? `Visitado ${tienda.horaVisita || '10:00'}`
                : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>

      {/* Lado derecho: Estado y Monto */}
      <div className="flex flex-col items-end shrink-0 text-right">
        <span className="text-[11px] text-slate-400 font-normal">
          {isVisitado ? 'Recaudado' : 'Saldo Total'}
        </span>
        <span className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-snug mt-0.5">
          {isVisitado ? (tienda.recaudado || tienda.saldoTotal) : tienda.saldoTotal}
        </span>
      </div>
    </motion.div>
  );
};
