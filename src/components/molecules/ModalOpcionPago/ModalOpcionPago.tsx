import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Icon } from '../../atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../../services/transportistaService';

export interface ModalOpcionPagoProps {
  isOpen: boolean;
  onClose: () => void;
  prefactura: PrefacturaCliente;
  onSelectPagoCompletoDigital: () => void;
  onSelectPagoParcial: (montoDigital: number, restanteEfectivo: number) => void;
  onSelectPagoEfectivo: () => void;
}

export const ModalOpcionPago: React.FC<ModalOpcionPagoProps> = ({
  isOpen,
  onClose,
  prefactura,
  onSelectPagoCompletoDigital,
  onSelectPagoParcial,
  onSelectPagoEfectivo
}) => {
  const [subVista, setSubVista] = useState<'menu' | 'input-parcial'>('menu');
  const [montoDigitalInput, setMontoDigitalInput] = useState<string>('');
  const [errorParcial, setErrorParcial] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const totalNum = prefactura.saldoTotalNum || 0;

  useEffect(() => {
    if (isOpen) {
      setSubVista('menu');
      const sugerenciaMitad = Math.round(totalNum / 2);
      setMontoDigitalInput(sugerenciaMitad > 0 ? sugerenciaMitad.toString() : '');
      setErrorParcial('');
    }
  }, [isOpen, totalNum]);

  useEffect(() => {
    if (subVista === 'input-parcial') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [subVista]);

  if (!isOpen) return null;

  const montoDigitalNum = parseInt(montoDigitalInput.replace(/\D/g, '') || '0', 10);
  const restanteEfectivoNum = Math.max(0, totalNum - montoDigitalNum);

  const handleMontoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setMontoDigitalInput(rawVal);
    setErrorParcial('');
  };

  const handleConfirmarParcial = () => {
    if (montoDigitalNum <= 0) {
      setErrorParcial('Ingresa un monto mayor a $0');
      return;
    }
    if (montoDigitalNum >= totalNum) {
      setErrorParcial('Para pagar el total digital, elige QR Bre-B completo');
      return;
    }
    onSelectPagoParcial(montoDigitalNum, restanteEfectivoNum);
  };

  const setMontoPreset = (monto: number) => {
    setMontoDigitalInput(monto.toString());
    setErrorParcial('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
      />

      {/* iOS Action Sheet / Modal */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col px-6 pt-3 pb-8"
      >
        {/* iOS Grabber */}
        <div className="w-9 h-1 bg-[#d1d1d6] rounded-full mx-auto mb-4 mt-0.5" />

        <AnimatePresence mode="wait">
          {subVista === 'menu' ? (
            /* ========================================================
               VISTA 1: MENÚ DE OPCIONES (APPLE INSET GROUPED STYLE)
               ======================================================== */
            <motion.div
              key="vista-menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col"
            >
              {/* iOS Navigation Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-[22px] font-bold text-black tracking-tight leading-snug">
                    Opciones de pago
                  </h3>
                  <p className="text-[13px] text-[#8e8e93] font-normal mt-0.5">
                    Factura #{prefactura.numeroPrefactura} · {prefactura.saldoTotal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="w-7 h-7 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#8e8e93] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="x" size={16} stroke={2.5} />
                </button>
              </div>

              {/* iOS Inset Grouped List (Clean, monochrome, divided rows) */}
              <div className="bg-[#f2f2f7] rounded-2xl overflow-hidden divide-y divide-[#e5e5ea]">
                {/* 1. Digital completo */}
                <button
                  type="button"
                  onClick={onSelectPagoCompletoDigital}
                  className="w-full py-3.5 px-4 flex items-center gap-3.5 text-left hover:bg-[#e5e5ea]/50 active:bg-[#e5e5ea] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1c1c1e] shadow-2xs shrink-0">
                    <Icon name="qrcode" size={20} stroke={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-black leading-tight">
                      Pago completo por medios digitales
                    </div>
                    <div className="text-[12px] text-[#8e8e93] mt-0.5">
                      QR Bre-B por {prefactura.saldoTotal}
                    </div>
                  </div>
                  <Icon name="chevron-right" size={17} className="text-[#c7c7cc] shrink-0" stroke={2.5} />
                </button>

                {/* 2. Parcial: QR + Efectivo */}
                <button
                  type="button"
                  onClick={() => setSubVista('input-parcial')}
                  className="w-full py-3.5 px-4 flex items-center gap-3.5 text-left hover:bg-[#e5e5ea]/50 active:bg-[#e5e5ea] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1c1c1e] shadow-2xs shrink-0">
                    <Icon name="arrows-split" size={20} stroke={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-black leading-tight">
                      Pago parcial por medios digitales y efectivo
                    </div>
                    <div className="text-[12px] text-[#8e8e93] mt-0.5">
                      Dividir entre QR Bre-B y efectivo
                    </div>
                  </div>
                  <Icon name="chevron-right" size={17} className="text-[#c7c7cc] shrink-0" stroke={2.5} />
                </button>

                {/* 3. Solo efectivo */}
                <button
                  type="button"
                  onClick={onSelectPagoEfectivo}
                  className="w-full py-3.5 px-4 flex items-center gap-3.5 text-left hover:bg-[#e5e5ea]/50 active:bg-[#e5e5ea] transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#1c1c1e] shadow-2xs shrink-0">
                    <Icon name="cash" size={20} stroke={2.2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-black leading-tight">
                      Pago en efectivo
                    </div>
                    <div className="text-[12px] text-[#8e8e93] mt-0.5">
                      Cobro total con cálculo de cambio
                    </div>
                  </div>
                  <Icon name="chevron-right" size={17} className="text-[#c7c7cc] shrink-0" stroke={2.5} />
                </button>
              </div>
            </motion.div>
          ) : (
            /* ========================================================
               VISTA 2: INGRESO DE MONTO (APPLE CASH / SEND MONEY STYLE)
               ======================================================== */
            <motion.div
              key="vista-input-parcial"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-center text-center"
            >
              {/* Barra de navegación superior */}
              <div className="w-full flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setSubVista('menu')}
                  aria-label="Volver"
                  className="w-7 h-7 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="arrow-left" size={16} stroke={2.5} />
                </button>
                <span className="text-[13px] font-medium text-[#8e8e93]">
                  Pago parcial
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="w-7 h-7 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#8e8e93] hover:text-black flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Icon name="x" size={16} stroke={2.5} />
                </button>
              </div>

              {/* Título de la acción */}
              <h3 className="text-[22px] font-bold text-black tracking-tight mt-2">
                ¿Cuánto cobrarás por QR?
              </h3>
              <p className="text-[13px] text-[#8e8e93] mt-0.5">
                Total de la factura: {prefactura.saldoTotal}
              </p>

              {/* Monto Display con la tipografía por defecto del dashboard (DM Sans font-black) */}
              <div className="w-full my-6 flex flex-col items-center">
                <div className="inline-flex items-center justify-center">
                  <span className="text-3xl sm:text-4xl font-black text-slate-900 mr-1 select-none">
                    $
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    value={montoDigitalNum > 0 ? montoDigitalNum.toLocaleString('es-CO') : ''}
                    onChange={handleMontoInputChange}
                    placeholder="0"
                    className="text-[38px] sm:text-[44px] font-black text-slate-900 font-sans tracking-tight bg-transparent text-center outline-none w-[240px] p-0 caret-[#2F3CB3]"
                  />
                </div>

                {/* Subtítulo limpio con el saldo restante */}
                <p className="text-[14px] text-slate-500 font-medium mt-2">
                  Restante en efectivo: <strong className="font-black text-slate-900 font-sans">${restanteEfectivoNum.toLocaleString('es-CO')}</strong>
                </p>

                {errorParcial && (
                  <p className="text-[13px] font-semibold text-[#ff3b30] mt-2">
                    {errorParcial}
                  </p>
                )}
              </div>

              {/* Cápsulas rápidas (Apple Capsule Buttons) */}
              <div className="flex gap-2 mb-7">
                <button
                  type="button"
                  onClick={() => setMontoPreset(Math.round(totalNum * 0.5))}
                  className="px-4 py-2 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] active:scale-95 text-[13px] font-medium text-black transition-all cursor-pointer"
                >
                  Mitad (${Math.round(totalNum * 0.5).toLocaleString('es-CO')})
                </button>
                {totalNum > 100000 && (
                  <button
                    type="button"
                    onClick={() => setMontoPreset(100000)}
                    className="px-4 py-2 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] active:scale-95 text-[13px] font-medium text-black transition-all cursor-pointer"
                  >
                    $100.000
                  </button>
                )}
                {totalNum > 50000 && (
                  <button
                    type="button"
                    onClick={() => setMontoPreset(50000)}
                    className="px-4 py-2 rounded-full bg-[#f2f2f7] hover:bg-[#e5e5ea] active:scale-95 text-[13px] font-medium text-black transition-all cursor-pointer"
                  >
                    $50.000
                  </button>
                )}
              </div>

              {/* Botón Apple Style */}
              <button
                type="button"
                onClick={handleConfirmarParcial}
                disabled={montoDigitalNum <= 0 || montoDigitalNum >= totalNum}
                className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] disabled:opacity-30 disabled:pointer-events-none text-white font-semibold text-[16px] transition-all cursor-pointer flex items-center justify-center select-none active:scale-[0.98]"
              >
                Generar QR
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
