import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../services/transportistaService';

interface CobroQrBrebScreenProps {
  prefactura: PrefacturaCliente;
  onBack: () => void;
  onConfirmarPago: () => void;
  className?: string;
}

export const CobroQrBrebScreen: React.FC<CobroQrBrebScreenProps> = ({
  prefactura,
  onBack,
  onConfirmarPago,
  className = ''
}) => {
  const [procesando, setProcesando] = useState(false);

  const handleSimularConfirmacion = () => {
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      onConfirmarPago();
    }, 700);
  };

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
            Cobro con QR Bre-B
          </h2>

          <div className="w-8 shrink-0 pointer-events-none" />
        </header>

        {/* Contenido principal */}
        <main className="flex-1 flex flex-col items-center px-6 pt-5 pb-6 text-center">
          {/* Encabezado con monto y datos del comercio */}
          <div className="flex flex-col items-center mb-4">
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
            <div className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                Espacio para QR Bre-B Real
              </span>
            </div>

            {/* Imagen del código QR */}
            <div className="w-[230px] h-[230px] rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center p-2 border border-slate-100">
              <img
                src="/qr_breb_placeholder.svg"
                alt="Código QR de Pago Bre-B"
                className="w-full h-full object-contain select-none"
              />
            </div>

            <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-slate-700">
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
          <p className="text-xs text-slate-500 font-medium max-w-[280px] leading-relaxed mt-4 mb-5">
            Pídele al tendero que escanee este código desde Bancolombia, Nequi, Daviplata o cualquier app bancaria con Bre-B.
          </p>

          {/* Botón de confirmación / simulación de recepción de pago */}
          <div className="w-full mt-auto pt-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleSimularConfirmacion}
              disabled={procesando}
              className="w-full h-12 rounded-full bg-[#363CB1] hover:bg-[#2e339b] text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
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
      </div>
    </div>
  );
};
