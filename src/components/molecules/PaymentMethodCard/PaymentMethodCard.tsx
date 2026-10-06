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
      className={`rounded-2xl p-4 flex items-center gap-3.5 transition-all duration-150 cursor-pointer select-none active:scale-[0.99] ${isSelected
          ? 'border-2 border-black bg-white shadow-sm'
          : 'border border-[#e5e5ea] bg-white hover:border-[#d1d1d6]'
        } ${className}`}
    >
      {/* Icono del medio de pago */}
      <div className="shrink-0">
        {method.tipo === 'bolsillo' ? (
          <div className="w-11 h-11 rounded-xl bg-[#f2f2f7] text-black flex items-center justify-center">
            <Icon name="wallet" size={22} stroke={2} />
          </div>
        ) : (
          <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center bg-white border border-[#e5e5ea]">
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
