import React, { useState, useEffect } from 'react';
import { PaymentTopHeader } from '../../components/organisms/PaymentTopHeader/PaymentTopHeader';
import { InvoiceDetailCard, type InvoiceDetail } from '../../components/molecules/InvoiceDetailCard/InvoiceDetailCard';
import { PaymentMethodCard } from '../../components/molecules/PaymentMethodCard/PaymentMethodCard';
import { ModalInscribirLlave } from '../../components/molecules/ModalInscribirLlave/ModalInscribirLlave';
import { bancosService, type MedioDePago } from '../../services/bancosService';
import { Icon } from '../../components/atoms/Icon/Icon';
import type { InvoiceItemData } from '../../components/molecules/InvoiceCard/InvoiceCard';
import { useNavigate } from 'react-router-dom';
import type { DatosTransaccion } from '../../types/transaccion';

interface PagarFacturaScreenProps {
  providerInvoice: InvoiceItemData;
  onBackToHome: () => void;
}

// Datos de facturas detalladas por proveedor
const PROVIDER_INVOICES_MAP: Record<string, InvoiceDetail[]> = {
  'alpina-1': [
    { id: 'alp-1', invoiceNumber: '9868497', amount: '$125.632', numericAmount: 125632 },
    { id: 'alp-2', invoiceNumber: '9868498', amount: '$110.789', numericAmount: 110789 },
    { id: 'alp-3', invoiceNumber: '9868499', amount: '$109.257', numericAmount: 109257 },
  ],
  'nutresa-2': [
    { id: 'nut-1', invoiceNumber: '8721340', amount: '$145.200', numericAmount: 145200 },
    { id: 'nut-2', invoiceNumber: '8721341', amount: '$120.450', numericAmount: 120450 },
    { id: 'nut-3', invoiceNumber: '8721342', amount: '$105.000', numericAmount: 105000 },
    { id: 'nut-4', invoiceNumber: '8721343', amount: '$98.244', numericAmount: 98244 },
    { id: 'nut-5', invoiceNumber: '8721344', amount: '$95.000', numericAmount: 95000 },
  ],
  'postobon-3': [
    { id: 'pos-1', invoiceNumber: '5432101', amount: '$263.765', numericAmount: 263765 },
    { id: 'pos-2', invoiceNumber: '5432102', amount: '$200.000', numericAmount: 200000 },
  ]
};

export const PagarFacturaScreen: React.FC<PagarFacturaScreenProps> = ({
  providerInvoice,
  onBackToHome
}) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(null);

  // Paso 2: Selección de valor y medio de pago
  const [paymentType, setPaymentType] = useState<'total' | 'otro'>('total');
  const [customAmount, setCustomAmount] = useState('');
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [mediosDePago, setMediosDePago] = useState<MedioDePago[]>([]);
  const [isModalInscribirOpen, setIsModalInscribirOpen] = useState(false);

  // Obtener facturas disponibles para el proveedor seleccionado
  const availableInvoices: InvoiceDetail[] =
    PROVIDER_INVOICES_MAP[providerInvoice.id] || [
      {
        id: `${providerInvoice.id}-1`,
        invoiceNumber: '9868497',
        amount: providerInvoice.totalBalance,
        numericAmount: 125632
      }
    ];

  // Cargar medios de pago desde la SEMIAPI
  useEffect(() => {
    bancosService.getMediosDePago().then((data) => {
      setMediosDePago(data);
    });
  }, []);

  // Al seleccionar una factura en Paso 1
  const handleSelectInvoice = (invoice: InvoiceDetail) => {
    setSelectedInvoice(invoice);
    setPaymentType('total');
    setCustomAmount('');
    setSelectedMethodId('');
    setStep(2);
  };

  // Al inscribir una nueva llave desde el modal
  const handleNuevaLlaveInscrita = (nueva: MedioDePago) => {
    setMediosDePago((prev) => [nueva, ...prev]);
    setSelectedMethodId(nueva.id);
  };

  // Ejecutar el pago
  const handlePagarFactura = () => {
    if (!selectedMethodId || !selectedInvoice) return;

    const metodoSeleccionado = mediosDePago.find((m) => m.id === selectedMethodId);
    const valorFinal =
      paymentType === 'total'
        ? selectedInvoice.amount
        : `$${Number(customAmount || 0).toLocaleString('es-CO')}`;

    const now = new Date();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const dia = now.getDate();
    const mes = meses[now.getMonth()];
    const anio = now.getFullYear();
    const horas = String(now.getHours()).padStart(2, '0');
    const minutos = String(now.getMinutes()).padStart(2, '0');
    const fechaHora = `${dia} ${mes} ${anio} ${horas}:${minutos}`;

    const datosTransaccion: DatosTransaccion = {
      idFactura: selectedInvoice.invoiceNumber,
      valor: valorFinal,
      empresa: providerInvoice.providerName.includes('Alpina')
        ? 'Alpina Productos Alimenticios S.A.'
        : providerInvoice.providerName,
      pagador: 'Miscelanea Rin-Rin',
      medioPago: metodoSeleccionado?.nombre || 'Llave Bre-B',
      fechaHora: fechaHora
    };

    navigate('/transaccion', { state: { datos: datosTransaccion } });
  };

  // Total balance a mostrar en Paso 1 (e.g., "$345.678,00")
  const formattedProviderTotal = providerInvoice.totalBalance.includes(',00')
    ? providerInvoice.totalBalance
    : `${providerInvoice.totalBalance},00`;

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-8 overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
        
        {/* Cabecera superior con botón Volver y título */}
        <PaymentTopHeader
          title="Pagar  Factura"
          onBack={() => {
            if (step === 2) {
              setStep(1);
            } else {
              onBackToHome();
            }
          }}
        />

        {/* ========================================================
            PASO 1: Seleccionar qué factura pagar (Image 1)
        ======================================================== */}
        {step === 1 && (
          <div className="flex-1 flex flex-col px-5 pt-7 pb-6">
            {/* Saldo total del proveedor */}
            <div className="flex flex-col items-center text-center">
              <span className="text-sm sm:text-base font-medium text-slate-700">
                Saldo total
              </span>
              <h1 className="text-[34px] sm:text-[38px] font-black text-slate-900 tracking-tight leading-none mt-1 mb-5">
                {formattedProviderTotal}
              </h1>

              {/* Nombre y logo del proveedor */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-slate-100 shadow-2xs ${
                    providerInvoice.logoBg || 'bg-white'
                  }`}
                >
                  <img
                    src={providerInvoice.providerLogo}
                    alt={providerInvoice.providerName}
                    className="w-full h-full object-contain p-1"
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight text-left">
                  {providerInvoice.providerName.includes('Alpina')
                    ? 'Alpina Productos Alimenticios S.A.'
                    : providerInvoice.providerName}
                </h3>
              </div>
            </div>

            {/* Listado de Facturas Disponibles */}
            <div className="mt-8 flex flex-col gap-3">
              <h2 className="text-base sm:text-[17px] font-bold text-[#1B2075] tracking-tight">
                Facturas disponibles para pago ({availableInvoices.length})
              </h2>

              <div className="flex flex-col gap-3">
                {availableInvoices.map((inv) => (
                  <InvoiceDetailCard
                    key={inv.id}
                    invoice={inv}
                    onClick={handleSelectInvoice}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            PASO 2: Valor a pagar y selección de medio de pago (Images 2 & 3)
        ======================================================== */}
        {step === 2 && selectedInvoice && (
          <div className="flex-1 flex flex-col px-5 pt-6 pb-4">
            {/* Saldo total de la factura seleccionada */}
            <div className="flex flex-col items-center text-center mb-6">
              <span className="text-sm sm:text-base font-medium text-slate-700">
                Saldo total
              </span>
              <h1 className="text-[34px] sm:text-[38px] font-black text-slate-900 tracking-tight leading-none mt-1">
                {selectedInvoice.amount}
              </h1>
            </div>

            {/* Opciones de tipo de pago (Pago Total / Otro Valor) */}
            <div className="flex flex-col gap-3.5 mb-6">
              {/* Opción 1: Pago Total */}
              <div
                onClick={() => setPaymentType('total')}
                className="flex items-start gap-3 cursor-pointer select-none"
              >
                <div className="mt-0.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentType === 'total' ? 'border-[#2F399B]' : 'border-slate-300'
                  }`}>
                    {paymentType === 'total' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2F399B]" />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                    Pago Total
                  </span>
                  <span className="text-sm text-slate-700 font-normal mt-0.5">
                    {selectedInvoice.amount}
                  </span>
                </div>
              </div>

              {/* Opción 2: Otro Valor */}
              <div
                onClick={() => setPaymentType('otro')}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    paymentType === 'otro' ? 'border-[#2F399B]' : 'border-slate-300'
                  }`}>
                    {paymentType === 'otro' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#2F399B]" />
                    )}
                  </div>
                </div>
                <span className="font-medium text-slate-800 text-sm sm:text-base">
                  Otro Valor
                </span>
              </div>

              {/* Campo de texto cuando selecciona 'Otro Valor' */}
              {paymentType === 'otro' && (
                <div className="pl-8 pt-1 animate-in fade-in duration-200">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Ingresa el monto a pagar:
                  </label>
                  <div className="relative flex items-center max-w-[220px]">
                    <span className="absolute left-3 text-slate-500 font-bold text-sm">$</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-2 bg-[#f3f4f6] text-[#1B2075] font-bold text-sm rounded-xl border border-transparent focus:border-[#363CB1]/30 focus:bg-white outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sección: Medio de Pago */}
            <div className="flex-1 flex flex-col mb-8">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-[17px] font-bold text-[#1B2075] tracking-tight">
                  Medio de Pago
                </h2>
                {mediosDePago.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsModalInscribirOpen(true)}
                    className="text-xs text-[#2F399B] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="plus" size={14} stroke={2.5} />
                    <span>Inscribir otra</span>
                  </button>
                )}
              </div>

              {/* Lista de Medios de Pago inscritos */}
              {mediosDePago.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {mediosDePago.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      isSelected={selectedMethodId === method.id}
                      onSelect={(m) => setSelectedMethodId(m.id)}
                    />
                  ))}
                </div>
              ) : (
                /* Estado vacío si no hay llaves inscritas */
                <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[#eef0fc] text-[#363CB1] flex items-center justify-center mb-3">
                    <Icon name="key" size={24} stroke={2} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm mb-1">
                    No tienes llaves inscritas
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 max-w-xs">
                    Inscribe una llave o cuenta bancaria para pagar tus facturas de forma rápida y segura.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalInscribirOpen(true)}
                    className="px-5 py-2.5 bg-[#2F399B] hover:bg-[#252e80] text-white font-bold text-xs rounded-full shadow-xs transition-all cursor-pointer"
                  >
                    Inscribir tus llaves
                  </button>
                </div>
              )}
            </div>

            {/* Botones inferiores: Cancelar y Pagar Factura */}
            <div className="flex items-center gap-3 pt-2 mt-auto">
              {/* Botón Cancelar */}
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/2 py-3.5 rounded-full border-2 border-[#2F399B] text-[#2F399B] font-bold text-sm bg-white hover:bg-slate-50 active:scale-98 transition-all cursor-pointer text-center"
              >
                Cancelar
              </button>

              {/* Botón Pagar Factura */}
              <button
                type="button"
                onClick={handlePagarFactura}
                disabled={!selectedMethodId || (paymentType === 'otro' && !customAmount)}
                className="w-1/2 py-3.5 rounded-full bg-[#2F399B] text-white font-bold text-sm hover:bg-[#252e80] active:scale-98 shadow-sm transition-all cursor-pointer text-center disabled:opacity-40 disabled:pointer-events-none"
              >
                Pagar Factura
              </button>
            </div>
          </div>
        )}

        {/* Modal para inscribir nuevas llaves usando la SEMIAPI */}
        <ModalInscribirLlave
          isOpen={isModalInscribirOpen}
          onClose={() => setIsModalInscribirOpen(false)}
          onLlaveInscrita={handleNuevaLlaveInscrita}
        />

      </div>
    </div>
  );
};
