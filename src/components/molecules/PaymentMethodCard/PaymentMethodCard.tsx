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
        {method.tipo === 'bolsillo' ? (
          <div className="w-12 h-12 rounded-full bg-[#eaecfb] text-[#2F399B] flex items-center justify-center">
            <Icon name="wallet" size={24} stroke={2} />
          </div>
        ) : (
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-white border border-slate-100 shadow-2xs">
            <img
              src={method.icono}
              alt={method.nombre}
              className={`object-contain transition-transform ${method.bancoId === 'nequi' || method.icono.includes('nequi')
                  ? 'w-[58%] h-[58%]'
                  : 'w-full h-full p-1'
                }`}
              onError={(e) => {
                // Si la imagen falla, mostrar icono por defecto
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        )}
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
          ) : (
            <>
              <span className="text-slate-500 font-normal">Saldo</span>
              <span className="font-bold text-slate-900">{method.saldoDisponible}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
