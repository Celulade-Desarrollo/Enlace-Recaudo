import React, { useState, useRef, useEffect } from 'react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { PrefacturaCliente } from '../../services/transportistaService';

export interface DetallesConfirmacionEfectivo {
  montoRecibido: number;
  cambio: number;
  montoCobrado: number;
}

interface CobroEfectivoScreenProps {
  prefactura: PrefacturaCliente;
  montoACobrar: number;
  esParcial?: boolean;
  montoDigitalPagado?: number;
  onBack: () => void;
  onConfirmarPago: (detalles: DetallesConfirmacionEfectivo) => void;
  className?: string;
}

export const CobroEfectivoScreen: React.FC<CobroEfectivoScreenProps> = ({
  prefactura: _prefactura,
  montoACobrar,
  esParcial = false,
  montoDigitalPagado: _montoDigitalPagado = 0,
  onBack,
  onConfirmarPago,
  className = ''
}) => {
  const [montoRecibidoInput, setMontoRecibidoInput] = useState<string>('');
  const [procesando, setProcesando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const montoRecibidoNum = parseInt(montoRecibidoInput.replace(/\D/g, '') || '0', 10);
  const cambio = Math.max(0, montoRecibidoNum - montoACobrar);
  const faltante = Math.max(0, montoACobrar - montoRecibidoNum);
  const estaCompleto = montoRecibidoNum >= montoACobrar;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    setMontoRecibidoInput(rawVal);
  };

  const setValorRecibido = (valor: number) => {
    setMontoRecibidoInput(valor.toString());
  };

  const handleConfirmar = () => {
    if (!estaCompleto) return;
    setProcesando(true);
    setTimeout(() => {
      setProcesando(false);
      onConfirmarPago({
        montoRecibido: montoRecibidoNum,
        cambio,
        montoCobrado: montoACobrar
      });
    }, 400);
  };

  const sugerenciasBilletes = [
    montoACobrar,
    Math.ceil(montoACobrar / 10000) * 10000,
    Math.ceil(montoACobrar / 50000) * 50000,
    Math.ceil(montoACobrar / 100000) * 100000
  ].filter((v, idx, arr) => v >= montoACobrar && arr.indexOf(v) === idx);

  return (
    <div className={`w-full flex-1 flex flex-col bg-white relative pb-3 ${className}`}>
      {/* Header con status bar */}
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
            {esParcial ? 'Saldo en Efectivo' : 'Cobro en Efectivo'}
          </h2>

          <div className="w-9 shrink-0 pointer-events-none" />
        </div>
      </header>

      {/* Contenido Apple Style */}
      <main className="flex-1 flex flex-col items-center justify-between px-6 pt-7 pb-4 text-center">
        <div className="w-full flex flex-col items-center">
          {esParcial && (
            <span className="text-[12px] font-semibold text-[#8e8e93] uppercase tracking-wider mb-1">
              Paso 2 · Saldo restante
            </span>
          )}

          <h3 className="text-[22px] font-bold text-slate-900 tracking-tight">
            ¿Cuánto efectivo recibiste?
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Total a cobrar: <strong className="font-black text-slate-900 font-sans">${montoACobrar.toLocaleString('es-CO')}</strong>
          </p>

          {/* Monto Display con la tipografía por defecto (DM Sans font-black) */}
          <div className="my-8 flex flex-col items-center">
            <div className="inline-flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 mr-1 select-none">
                $
              </span>
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                placeholder="0"
                value={montoRecibidoNum > 0 ? montoRecibidoNum.toLocaleString('es-CO') : ''}
                onChange={handleInputChange}
                className="text-[38px] sm:text-[44px] font-black text-slate-900 font-sans tracking-tight bg-transparent text-center outline-none w-[240px] p-0 caret-[#2F3CB3]"
              />
            </div>

            {/* Feedback limpio sin cajas pastel */}
            <div className="mt-2 min-h-[26px] flex items-center justify-center">
              {montoRecibidoNum === 0 ? (
                <span className="text-[13px] text-slate-400 font-medium">
                  Ingresa el valor entregado por el tendero
                </span>
              ) : !estaCompleto ? (
                <span className="text-[13px] font-semibold text-[#ff3b30]">
                  Faltan ${faltante.toLocaleString('es-CO')}
                </span>
              ) : cambio > 0 ? (
                <span className="text-[14px] text-slate-500 font-medium">
                  Cambio a devolver: <strong className="font-black text-slate-900 font-sans">${cambio.toLocaleString('es-CO')}</strong>
                </span>
              ) : (
                <span className="text-[14px] font-bold text-slate-900">
                  Pago exacto
                </span>
              )}
            </div>
          </div>

          {/* Cápsulas Apple Gray */}
          <div className="flex flex-wrap justify-center gap-2 max-w-[320px]">
            {sugerenciasBilletes.map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setValorRecibido(sug)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all cursor-pointer active:scale-95 ${
                  montoRecibidoNum === sug
                    ? 'bg-black text-white'
                    : 'bg-[#f2f2f7] hover:bg-[#e5e5ea] text-black'
                }`}
              >
                {sug === montoACobrar ? 'Exacto ' : ''}${sug.toLocaleString('es-CO')}
              </button>
            ))}
            {montoRecibidoNum > 0 && (
              <button
                type="button"
                onClick={() => setMontoRecibidoInput('')}
                className="px-4 py-2 rounded-full text-[13px] font-medium bg-[#f2f2f7] hover:bg-[#e5e5ea] text-[#8e8e93] hover:text-black cursor-pointer active:scale-95 transition-all"
              >
                Borrar
              </button>
            )}
          </div>
        </div>

        {/* Botón inferior */}
        <div className="w-full pt-4">
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={!estaCompleto || procesando}
            className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] disabled:opacity-30 disabled:pointer-events-none text-white font-semibold text-[16px] transition-all cursor-pointer flex items-center justify-center select-none active:scale-[0.98]"
          >
            {procesando ? 'Confirmando...' : 'Confirmar cobro'}
          </button>
        </div>
      </main>

      <MobileHomeBar theme="dark" />
    </div>
  );
};
