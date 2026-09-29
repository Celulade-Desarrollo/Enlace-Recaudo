import React from 'react';
import { motion } from 'motion/react';

export interface InvoiceItemData {
  id: string;
  providerName: string;
  providerLogo: string;
  invoiceCount: number;
  totalBalance: string;
  logoBg?: string;
}

interface InvoiceCardProps {
  data: InvoiceItemData;
  onClick?: (item: InvoiceItemData) => void;
  className?: string;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  data,
  onClick,
  className = ''
}) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
      onClick={() => onClick?.(data)}
      className={`bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all cursor-pointer select-none ${className}`}
    >
      {/* Lado izquierdo: Logo del proveedor y datos principales */}
      <div className="flex items-center gap-3.5 min-w-0 pr-2">
        <div
          className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-2xs border border-slate-100/80 ${
            data.logoBg || 'bg-white'
          }`}
        >
          <img
            src={data.providerLogo}
            alt={data.providerName}
            className="w-full h-full object-contain p-1"
          />
        </div>

        <div className="flex flex-col min-w-0">
          <h3 className="text-[15px] font-bold text-slate-900 truncate leading-snug tracking-tight">
            {data.providerName}
          </h3>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>Facturas</span>
            <span className="font-bold text-slate-900">{data.invoiceCount}</span>
          </div>
        </div>
      </div>

      {/* Lado derecho: Saldo Total */}
      <div className="flex flex-col items-end shrink-0 text-right">
        <span className="text-[11px] text-slate-400 font-normal">
          Saldo Total
        </span>
        <span className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-snug mt-0.5">
          {data.totalBalance}
        </span>
      </div>
    </motion.div>
  );
};
