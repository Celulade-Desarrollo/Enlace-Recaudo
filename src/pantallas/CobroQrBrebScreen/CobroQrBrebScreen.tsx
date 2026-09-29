import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../services/transportistaService';

interface CobroQrBrebScreenProps {
  prefactura: PrefacturaCliente;
  onBack: () => void;
  onConfirmarPago: () => void;
  className?: string;
  qrImageUrl?: string;
}

export const CobroQrBrebScreen: React.FC<CobroQrBrebScreenProps> = ({
  prefactura,
  onBack,
  onConfirmarPago,
  className = '',
  qrImageUrl = '/qr_breb_placeholder.svg'
}) => {
  const [procesando, setProcesando] = useState(false);

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
      <main className="flex-1 flex flex-col items-center px-6 pt-4 pb-4 text-center">
        {/* Encabezado con monto y datos del comercio */}
        <div className="flex flex-col items-center mb-3">
          <span className="text-xs text-slate-500 font-medium">
            Valor a cobrar
          </span>
          <div className="text-[32px] sm:text-[36px] font-black text-slate-900 tracking-tight leading-none mt-1">
            {prefactura.saldoTotal}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
            <span className="font-bold text-slate-800">{prefactura.pagador}</span>
            <span>•</span>
            <span>Factura #{prefactura.numeroPrefactura}</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ===== ESPACIO PARA QR BRE-B REAL DE UN BANCO REAL (LABEL CONFIGURABLE) ===== */}
        {/* ========================================================================= */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="relative p-4 bg-white rounded-3xl border border-slate-200/90 shadow-[0_8px_30px_rgba(0,0,0,0.08)] flex flex-col items-center my-auto"
        >
          {/* Label indicador solicitado para reemplazo del QR real */}
          <div className="mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2F3CB3] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F3CB3] animate-pulse"></span>
              Espacio para QR Bre-B Real
            </span>
          </div>

          {/* Imagen del código QR */}
          <div className="w-[220px] h-[220px] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
            <img
              src={qrImageUrl}
              alt="Código QR de Pago Bre-B"
              className="w-full h-full object-contain select-none"
            />
          </div>

          <div className="flex items-center gap-2 mt-2.5 text-xs font-semibold text-slate-700">
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

        {/* Texto explicativo para el tendero */}
        <p className="text-xs text-slate-500 font-medium max-w-[280px] leading-relaxed mt-3 mb-4">
          Pídele al tendero que escanee este código desde Bancolombia, Nequi, Daviplata o cualquier app bancaria con Bre-B.
        </p>

        {/* Botón de confirmación / simulación de recepción de pago */}
        <div className="w-full mt-auto pt-1 pb-2">
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={handleSimularConfirmacion}
            disabled={procesando}
            className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 select-none"
          >
            {procesando ? (
              <span>Confirmando pago recibido...</span>
            ) : (
              <>
                <Icon name="check" size={18} stroke={3} />
                <span>Confirmar Pago Recibido</span>
              </>
            )}
          </motion.button>
        </div>
      </main>

      {/* Barra de inicio móvil */}
      <MobileHomeBar theme="dark" />
    </div>
  );
};
