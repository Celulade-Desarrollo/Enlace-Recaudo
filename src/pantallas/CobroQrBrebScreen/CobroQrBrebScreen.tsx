import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../services/transportistaService';

interface CobroQrBrebScreenProps {
  prefactura: PrefacturaCliente;
  montoCobro?: number;
  esParcial?: boolean;
  restanteEfectivo?: number;
  onBack: () => void;
  onConfirmarPago: () => void;
  className?: string;
  qrImageUrl?: string;
}

export const CobroQrBrebScreen: React.FC<CobroQrBrebScreenProps> = ({
  prefactura,
  montoCobro,
  esParcial = false,
  restanteEfectivo = 0,
  onBack,
  onConfirmarPago,
  className = '',
  qrImageUrl = '/qr_breb_placeholder.svg'
}) => {
  const [procesando, setProcesando] = useState(false);

  const valorMostrado = montoCobro !== undefined
    ? `$${montoCobro.toLocaleString('es-CO')}`
    : prefactura.saldoTotal;

  const handleSimularConfirmacion = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      onConfirmarPago();
    }, 600);
  };

  return (
    <div className={`w-full flex-1 flex flex-col bg-white relative pb-3 ${className}`}>
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
            Cobro con QR Bre-B
          </h2>

          <div className="w-9 shrink-0 pointer-events-none" />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-between px-6 pt-5 pb-4 text-center">
        {/* Encabezado con monto */}
        <div className="flex flex-col items-center">
          {esParcial && (
            <span className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-1">
              Paso 1 · Cobro digital
            </span>
          )}

          <div className="text-[34px] sm:text-[38px] font-black text-slate-900 font-sans tracking-tight leading-none mt-1">
            {valorMostrado}
          </div>

          <p className="text-[13px] text-slate-500 font-medium mt-1">
            {prefactura.pagador} · #{prefactura.numeroPrefactura}
          </p>

          {esParcial && (
            <p className="text-[13px] text-slate-500 font-medium mt-1.5">
              Restante en efectivo: <strong className="font-black text-slate-900 font-sans">${restanteEfectivo.toLocaleString('es-CO')}</strong>
            </p>
          )}
        </div>

        {/* Espacio para QR Bre-B */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="relative p-5 bg-white rounded-3xl border border-[#e5e5ea] shadow-sm flex flex-col items-center my-auto"
        >
          {/* Label indicador */}
          <div className="mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f2f2f7] text-[#1c1c1e] text-[11px] font-semibold">
              QR Bre-B
            </span>
          </div>

          {/* Imagen del código QR */}
          <div className="w-[210px] h-[210px] rounded-2xl overflow-hidden bg-[#f9f9fb] flex items-center justify-center p-2">
            <img
              src={qrImageUrl}
              alt="Código QR de Pago Bre-B"
              className="w-full h-full object-contain select-none"
            />
          </div>

          <div className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-slate-600">
            <img
              src="/enlacelogo.png"
              alt="Enlace"
              className="w-4 h-4 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <span>Interoperabilidad Bre-B</span>
          </div>
        </motion.div>

        {/* Botón de confirmación */}
        <div className="w-full pt-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSimularConfirmacion}
            disabled={procesando}
            className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 select-none"
          >
            {procesando ? (
              <span>Confirmando...</span>
            ) : (
              <span>
                {esParcial ? 'Confirmar y cobrar efectivo' : 'Confirmar pago recibido'}
              </span>
            )}
          </motion.button>
        </div>
      </main>

      {/* Barra de inicio móvil */}
      <MobileHomeBar theme="dark" />
    </div>
  );
};
