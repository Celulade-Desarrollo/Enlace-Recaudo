import React from 'react';
import { motion, type Variants } from 'motion/react';
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
    <div className={`w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6 ${className}`}>
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-8 overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">

        {/* Top Header con botón de regreso */}
        <header className="w-full bg-[#2F399B] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shadow-xs select-none sticky top-0 z-20">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="w-8 h-8 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon name="arrow-left" size={18} stroke={2.5} />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide text-center truncate px-2">
            Facturas a Recaudar
          </h2>

          <div className="w-8 shrink-0 pointer-events-none" />
        </header>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col px-5 pt-7 pb-6">
          {/* Saldo total del cliente */}
          <div className="flex flex-col items-center text-center">
            <span className="text-sm sm:text-base font-medium text-slate-700">
              Saldo total
            </span>
            <h1 className="text-[34px] sm:text-[38px] font-black text-slate-900 tracking-tight leading-none mt-1 mb-5">
              {tienda.saldoTotal}
            </h1>

            {/* Nombre e icono de la tienda */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#EBF0FF] text-[#363CB1] flex items-center justify-center shrink-0 border border-blue-100 shadow-2xs">
                <Icon name="building-store" size={22} stroke={2} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight text-left">
                {tienda.nombre}
              </h3>
            </div>
          </div>

          {/* Listado de Facturas Disponibles */}
          <div className="mt-8 flex flex-col gap-3">
            <h2 className="text-base sm:text-[17px] font-bold text-[#1B2075] tracking-tight">
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
      </div>
    </div>
  );
};
