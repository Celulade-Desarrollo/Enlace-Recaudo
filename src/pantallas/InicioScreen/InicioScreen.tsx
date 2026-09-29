import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HeaderBanner } from '../../components/organisms/HeaderBanner/HeaderBanner';
import { QuickActionsRow } from '../../components/organisms/QuickActionsRow/QuickActionsRow';
import { PendingInvoicesSection } from '../../components/organisms/PendingInvoicesSection/PendingInvoicesSection';
import { BottomNavigation, type TabType } from '../../components/organisms/BottomNavigation/BottomNavigation';
import { PagarFacturaScreen } from '../PagarFacturaScreen';
import { MovimientosScreen } from '../MovimientosScreen';
import type { InvoiceItemData } from '../../components/molecules/InvoiceCard/InvoiceCard';

interface InicioScreenProps {
  initialTab?: TabType;
}

export const InicioScreen: React.FC<InicioScreenProps> = ({ initialTab = 'inicio' }) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [userName] = useState('Laura Martínez');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItemData | null>(null);

  const handleMisLlaves = () => {
    console.log('Mis Llaves click');
  };

  const handleInvoiceClick = (invoice: InvoiceItemData) => {
    setSelectedInvoice(invoice);
  };

  // Si se seleccionó una factura/comercio, mostrar el flujo de pago con transición
  if (selectedInvoice) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="flujo-pago"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 24 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="w-full"
        >
          <PagarFacturaScreen
            providerInvoice={selectedInvoice}
            onBackToHome={() => setSelectedInvoice(null)}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      {/* Marco de pantalla de teléfono móvil responsivo */}
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">

        <AnimatePresence mode="wait">
          {/* Pestaña: INICIO */}
          {activeTab === 'inicio' && (
            <motion.div
              key="inicio"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full flex flex-col"
            >
              {/* Organismo 1: Banner Azul Superior Curvado con Logo, Avatar y Saludo */}
              <HeaderBanner
                userName={userName}
                userInitials="LM"
                onAvatarClick={() => alert(`Perfil: ${userName}`)}
              />

              {/* Organismo 2: Fila de Acciones Rápidas ("Mis Llaves") */}
              <QuickActionsRow
                onMisLlaves={handleMisLlaves}
              />

              {/* Organismo 3: Sección de Facturas Pendientes con Buscador y Tarjetas */}
              <PendingInvoicesSection onInvoiceClick={handleInvoiceClick} />
            </motion.div>
          )}

          {/* Pestaña: MIS MOVIMIENTOS */}
          {activeTab === 'movimientos' && (
            <motion.div
              key="movimientos"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="w-full flex-1"
            >
              <MovimientosScreen
                onBackToHome={() => setActiveTab('inicio')}
              />
            </motion.div>
          )}

          {/* Pestaña: PARA TI */}
          {activeTab === 'para-ti' && (
            <motion.div
              key="para-ti"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#363CB1] flex items-center justify-center mb-4 shadow-xs border border-blue-100">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Beneficios y Promociones</h2>
              <p className="text-xs text-slate-500 mt-2 max-w-[260px] leading-relaxed">
                Muy pronto tendrás promociones exclusivas, descuentos por pronto pago y beneficios con tus comercios aliados.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('inicio')}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#363CB1] text-white text-xs font-bold hover:bg-[#2e339b] transition-all cursor-pointer shadow-xs active:scale-95"
              >
                Volver al inicio
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Organismo 4: Barra de Navegación Inferior Fija */}
        <BottomNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
    </div>
  );
};

