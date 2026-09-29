import React from 'react';
import { motion, type Variants } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import { PrefacturaCard } from '../../components/molecules/PrefacturaCard/PrefacturaCard';
import {
  transportistaService,
  type TiendaRuta,
  type PrefacturaCliente
} from '../../services/transportistaService';

interface FacturasARecaudarScreenProps {
  tienda: TiendaRuta;
  onBack: () => void;
  onSelectPrefactura: (prefactura: PrefacturaCliente) => void;
  className?: string;
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const FacturasARecaudarScreen: React.FC<FacturasARecaudarScreenProps> = ({
  tienda,
  onBack,
  onSelectPrefactura,
  className = ''
}) => {
  const prefacturas = transportistaService.getPrefacturasByTienda(tienda.id);

  return (
    <div className={`w-full flex-1 flex flex-col bg-white relative pb-4 ${className}`}>
      {/* Top Header con Status Bar */}
      <header className="w-full bg-[#2F3CB3] text-white pt-1 pb-3 px-4 select-none sticky top-0 z-20 shadow-xs">
        <MobileStatusBar theme="light" time="9:30" />

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="w-9 h-9 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon name="arrow-left" size={19} stroke={2.5} />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide text-center truncate px-2">
            Facturas a Recaudar
          </h2>

          <div className="w-9 shrink-0 pointer-events-none" />
        </div>
      </header>

      {/* Contenido principal idéntico a Image 3 */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-6">
        {/* Saldo total del cliente */}
        <div className="flex flex-col items-center text-center mb-5">
          <span className="text-sm font-medium text-slate-700">
            Saldo total
          </span>
          <h1 className="text-[34px] sm:text-[38px] font-black text-slate-900 tracking-tight leading-none mt-1">
            {tienda.saldoTotal}
          </h1>
        </div>

        {/* Comercio seleccionado (alineado a la izquierda según Screenshot 3) */}
        <div className="flex items-center gap-3.5 mb-7 px-1">
          <div className="w-12 h-12 rounded-2xl bg-[#EEF0FF] text-[#2F3CB3] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
            <Icon name="building-store" size={24} stroke={2} />
          </div>
          <h3 className="font-bold text-slate-900 text-base tracking-tight text-left">
            {tienda.nombre}
          </h3>
        </div>

        {/* Listado de Facturas Disponibles */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[17px] font-bold text-[#1B2075] tracking-tight">
            Facturas disponibles para pago ({prefacturas.length})
          </h2>

          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {prefacturas.map((pref) => (
              <motion.div key={pref.id} variants={itemVariants}>
                <PrefacturaCard
                  prefactura={pref}
                  onClick={onSelectPrefactura}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Barra de inicio móvil */}
      <MobileHomeBar theme="dark" className="mt-auto" />
    </div>
  );
};
