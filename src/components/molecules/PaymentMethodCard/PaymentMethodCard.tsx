import React from 'react';
import { Icon } from '../../atoms/Icon/Icon';
import type { MedioDePago } from '../../../services/bancosService';

interface PaymentMethodCardProps {
  method: MedioDePago;
  isSelected: boolean;
  onSelect: (method: MedioDePago) => void;
  className?: string;
}

export const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  isSelected,
  onSelect,
  className = ''
}) => {
  const [imgError, setImgError] = React.useState(false);

  const isEfectivo =
    method.tipo === 'efectivo' ||
    method.bancoId === 'efectivo' ||
    method.nombre.toLowerCase().includes('efectivo');

  const iconSrc = isEfectivo
    ? (method.icono && !method.icono.includes('bancow') ? method.icono : '/billete_icon.svg')
    : (method.tipo === 'bolsillo' || method.tipo === 'microcredito' || method.bancoId === 'bolsillo' || method.bancoId === 'bancow')
    ? (!method.icono || method.icono === 'wallet' ? '/bancow_icon.png' : method.icono)
    : method.icono;

  return (
    <div
      onClick={() => onSelect(method)}
      className={`rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-200 cursor-pointer select-none active:scale-[0.99] ${isSelected
        ? 'border-2 border-[#1B2075] bg-[#eef0fc]/60 shadow-sm ring-1 ring-[#1B2075]/10'
        : 'border border-slate-100 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-200 hover:shadow-md'
        } ${className}`}
    >
      {/* Icono del medio de pago */}
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-2xs">
          {!imgError ? (
            <img
              src={iconSrc}
              alt={method.nombre}
              className={`object-contain transition-transform ${
                method.bancoId === 'nequi' || iconSrc.includes('nequi')
                  ? 'w-[58%] h-[58%]'
                  : isEfectivo
                  ? 'w-full h-full'
                  : 'w-full h-full p-1'
                }`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if ((method.tipo === 'bolsillo' || method.tipo === 'microcredito') && !target.src.includes('bancow_icon.png')) {
                  target.src = '/bancow_icon.png';
                } else if (isEfectivo && !target.src.includes('billete_icon.svg')) {
                  target.src = '/billete_icon.svg';
                } else {
                  setImgError(true);
                }
              }}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${
              isEfectivo ? 'bg-[#ecfdf5] text-[#059669]' : 'bg-[#eaecfb] text-[#2F399B]'
            }`}>
              <Icon name={isEfectivo ? 'cash' : 'wallet'} size={24} stroke={2} />
            </div>
          )}
        </div>
      </div>

      {/* Información del medio de pago */}
      <div className="flex flex-col min-w-0">
        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug truncate">
          {method.nombre}
        </h4>
        <div className="text-xs sm:text-sm mt-0.5 flex items-center gap-1.5">
          {method.tipo === 'llave' ? (
            <>
              <span className="text-slate-500 font-normal">Llave</span>
              <span className="font-bold text-slate-900">{method.valorLlave}</span>
            </>
          ) : method.tipo === 'bolsillo' ? (
            <>
              <span className="text-slate-500 font-normal">Saldo</span>
              <span className="font-bold text-slate-900">{method.saldoDisponible}</span>
            </>
          ) : method.tipo === 'microcredito' ? (
            <>
              <span className="text-slate-500 font-normal">{method.cupoLabel || 'Cupo'}</span>
              <span className="font-bold text-slate-900">{method.saldoDisponible || method.cupoDisponible || '$2,500,000.00'}</span>
            </>
          ) : (
            <span className="text-slate-500 font-normal">
              {method.descripcion || 'Pago directo en efectivo'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
