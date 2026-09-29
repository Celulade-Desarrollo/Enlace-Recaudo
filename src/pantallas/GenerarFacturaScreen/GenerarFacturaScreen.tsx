import React from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../services/transportistaService';
import { obtenerPartesColombia } from '../../types/transaccion';

interface GenerarFacturaScreenProps {
  prefactura: PrefacturaCliente;
  onBack: () => void;
  onGenerarQr: () => void;
  className?: string;
}

export const GenerarFacturaScreen: React.FC<GenerarFacturaScreenProps> = ({
  prefactura,
  onBack,
  onGenerarQr,
  className = ''
}) => {
  // Asegurar fecha y hora oficial de Colombia
  const partesCol = obtenerPartesColombia(new Date());
  const fechaHoraActual = `${partesCol.dia} ${partesCol.mesTexto} ${partesCol.anio} ${partesCol.horaFormateada}`;

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
            Generar Factura
          </h2>

          <div className="w-8 shrink-0 pointer-events-none" />
        </header>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col items-center px-6 pt-7 pb-6 text-center">
          {/* Icono de factura recibo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25 }}
            className="w-14 h-14 flex items-center justify-center text-[#2F399B] mb-2"
          >
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#2F399B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
              <path d="M12 7v10" />
              <path d="M15 9.5a2.5 2.5 0 0 0-5 0c0 4 5 1.5 5 5a2.5 2.5 0 0 1-5 0" />
            </svg>
          </motion.div>

          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Factura Generada
          </h1>

          <span className="text-xs text-slate-500 font-medium mt-3">
            Valor
          </span>
          <div className="text-[34px] sm:text-[38px] font-black text-slate-900 tracking-tight leading-none mt-1 mb-6">
            {prefactura.saldoTotal}
          </div>

          {/* Tabla de detalles con líneas punteadas */}
          <div className="w-full flex flex-col text-sm border-t border-dashed border-slate-200 pt-3 mb-6">
            <div className="flex justify-between py-2.5 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Factura No.</span>
              <span className="text-slate-700">{prefactura.numeroPrefactura}</span>
            </div>

            <div className="flex justify-between py-2.5 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Pagador</span>
              <span className="text-slate-700">{prefactura.pagador}</span>
            </div>

            <div className="flex justify-between py-2.5 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Medio de Pago</span>
              <span className="text-slate-700">{prefactura.medioPago}</span>
            </div>

            <div className="flex justify-between py-2.5 border-b border-dashed border-slate-200">
              <span className="font-bold text-slate-900">Fecha y Hora</span>
              <span className="text-slate-700">{fechaHoraActual}</span>
            </div>
          </div>

          {/* Caja informativa */}
          <div className="w-full bg-[#EEF2FF] border border-[#C7D7FE] rounded-xl p-3.5 flex items-start gap-2.5 text-left mb-6">
            <div className="text-[#363CB1] mt-0.5 shrink-0">
              <Icon name="info-circle" size={18} stroke={2.2} />
            </div>
            <p className="text-xs text-[#1E293B] font-medium leading-relaxed">
              Escanea el QR en la app del tendero o espera a recibir la notificación de pago.
            </p>
          </div>

          {/* Botón Generar QR */}
          <div className="w-full mt-auto pt-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onGenerarQr}
              className="w-full h-12 rounded-full bg-[#363CB1] hover:bg-[#2e339b] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Generar QR</span>
            </motion.button>
          </div>
        </main>
      </div>
    </div>
  );
};
