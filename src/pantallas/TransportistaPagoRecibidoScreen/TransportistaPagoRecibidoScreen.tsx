import React from 'react';
import { motion } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import type { PrefacturaCliente } from '../../services/transportistaService';
import { obtenerPartesColombia } from '../../types/transaccion';

interface TransportistaPagoRecibidoScreenProps {
  prefactura: PrefacturaCliente;
  onRegresar: () => void;
  className?: string;
}

export const TransportistaPagoRecibidoScreen: React.FC<TransportistaPagoRecibidoScreenProps> = ({
  prefactura,
  onRegresar,
  className = ''
}) => {
  // Fecha y hora oficial en vivo de Colombia
  const partesCol = obtenerPartesColombia(new Date());
  const fechaHoraActual = `${partesCol.dia} ${partesCol.mesTexto} ${partesCol.anio} ${partesCol.horaFormateada}`;

  return (
    <div className={`w-full flex-1 flex flex-col bg-white relative pb-3 font-sans ${className}`}>
      {/* Header con título Pago Recibido + Status Bar */}
      <header className="w-full bg-[#2F3CB3] text-white pt-1 px-4 pb-4.5 flex-shrink-0 text-center select-none shadow-xs">
        <MobileStatusBar theme="light" time="9:30" />
        <h1 className="text-[17px] font-bold text-white tracking-tight pt-1">
          Pago Recibido
        </h1>
      </header>

      {/* Borde Zigzag / Dientes de sierra idéntico a Image 5 */}
      <div
        className="w-full h-3 bg-[#2F3CB3] -mt-px flex-shrink-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12' viewBox='0 0 24 12'%3E%3Cpath d='M0 12 L12 0 L24 12 Z' fill='white'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat-x',
          backgroundSize: '24px 12px',
          backgroundPosition: 'center bottom'
        }}
      />

      {/* Contenido principal idéntico a Image 5 */}
      <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-4 text-center">
        {/* Círculo verde de verificación animado */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
          className="w-14 h-14 rounded-full border-[2.5px] border-[#0e9347] bg-white flex items-center justify-center mb-2.5 shrink-0"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0e9347"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </motion.div>

        {/* Estado y Monto */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
          className="w-full flex flex-col items-center"
        >
          <h2 className="text-lg font-bold text-slate-900 mb-1">
            Transacción Aprobada
          </h2>

          <span className="text-xs text-slate-500 font-medium">
            Valor
          </span>
          <div className="text-[32px] sm:text-[36px] font-black text-slate-950 tracking-tight leading-none mt-1 mb-2">
            {prefactura.saldoTotal}
          </div>

          <p className="text-[13px] font-bold text-slate-900 mb-4">
            {prefactura.empresa}
          </p>
        </motion.div>

        {/* Tabla de detalles con líneas punteadas idéntica a Image 5 */}
        <div className="w-full flex flex-col text-[13px] border-t border-dashed border-slate-200 pt-2 mb-5">
          <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-900 text-left">Factura No.</span>
            <span className="text-slate-800 font-medium text-right">{prefactura.numeroPrefactura}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-900 text-left">Ref. Pago</span>
            <span className="text-slate-800 font-medium text-right">{prefactura.refPago}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-900 text-left">Pagador</span>
            <span className="text-slate-800 font-medium text-right">{prefactura.pagador}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-900 text-left">Medio de Pago</span>
            <span className="text-slate-800 font-medium text-right">{prefactura.medioPago}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
            <span className="font-bold text-slate-900 text-left">Fecha y Hora</span>
            <span className="text-slate-800 font-medium text-right">{fechaHoraActual}</span>
          </div>
        </div>

        {/* Botón inferior: Regresar */}
        <div className="w-full mt-auto pt-1 pb-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={onRegresar}
            className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center select-none"
          >
            Regresar
          </motion.button>
        </div>
      </main>

      {/* Barra de inicio móvil */}
      <MobileHomeBar theme="dark" />
    </div>
  );
};
