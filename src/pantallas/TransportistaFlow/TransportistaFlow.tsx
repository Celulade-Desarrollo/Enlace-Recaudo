import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TransportistaHomeScreen } from '../TransportistaHomeScreen/TransportistaHomeScreen';
import { FacturasARecaudarScreen } from '../FacturasARecaudarScreen/FacturasARecaudarScreen';
import { GenerarFacturaScreen } from '../GenerarFacturaScreen/GenerarFacturaScreen';
import { CobroQrBrebScreen } from '../CobroQrBrebScreen/CobroQrBrebScreen';
import { TransportistaPagoRecibidoScreen } from '../TransportistaPagoRecibidoScreen/TransportistaPagoRecibidoScreen';
import {
  transportistaService,
  type TiendaRuta,
  type PrefacturaCliente
} from '../../services/transportistaService';

type TransportistaPaso =
  | 'home'
  | 'facturas'
  | 'generar'
  | 'qr'
  | 'recibido';

export const TransportistaFlow: React.FC = () => {
  const [paso, setPaso] = useState<TransportistaPaso>('home');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<TiendaRuta | null>(null);
  const [prefacturaSeleccionada, setPrefacturaSeleccionada] = useState<PrefacturaCliente | null>(null);

  // Soporte nativo para botón 'Atrás' en celulares (Mobile First: PopState / Gestos de retroceso)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.paso) {
        setPaso(event.state.paso);
      } else {
        setPaso('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const transicionarA = (nuevoPaso: TransportistaPaso) => {
    setPaso(nuevoPaso);
    try {
      window.history.pushState({ paso: nuevoPaso }, '');
    } catch {
      // Ignorar en entornos sin pushState
    }
  };

  // 1. Al seleccionar una tienda pendiente desde "Ruta de hoy"
  const handleSelectTienda = (tienda: TiendaRuta) => {
    if (tienda.estado === 'pendiente') {
      setTiendaSeleccionada(tienda);
      transicionarA('facturas');
    }
  };

  // 2. Al seleccionar una prefactura a recaudar
  const handleSelectPrefactura = (prefactura: PrefacturaCliente) => {
    setPrefacturaSeleccionada(prefactura);
    transicionarA('generar');
  };

  // 3. Al pulsar "Generar QR"
  const handleGenerarQr = () => {
    transicionarA('qr');
  };

  // 4. Al confirmar el pago en la pantalla del QR
  const handleConfirmarPago = () => {
    if (tiendaSeleccionada && prefacturaSeleccionada) {
      transportistaService.registrarPagoPrefactura(
        tiendaSeleccionada.id,
        prefacturaSeleccionada.numeroPrefactura,
        prefacturaSeleccionada.saldoTotal
      );
    }
    transicionarA('recibido');
  };

  // 5. Retroceso seguro
  const handleBack = (pasoDestino: TransportistaPaso) => {
    if (window.history.state && window.history.state.paso) {
      window.history.back();
    } else {
      setPaso(pasoDestino);
    }
  };

  // 6. Al regresar del comprobante a "Ruta de hoy"
  const handleRegresarAHome = () => {
    setPaso('home');
    setTiendaSeleccionada(null);
    setPrefacturaSeleccionada(null);
    try {
      window.history.replaceState({ paso: 'home' }, '');
    } catch {
      // fallback
    }
  };

  return (
    /* Contenedor First-Mobile:
       - En celular (<480px): Ocupa el 100% de la pantalla nativa sin márgenes ni bordes.
       - En escritorio: Se centra como un smartphone elegante con sombra y radio para pruebas de pair-programming. */
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh sm:min-h-[850px] bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[36px] border-0 sm:border sm:border-slate-200">
        <AnimatePresence mode="wait">
          {paso === 'home' && (
            <motion.div
              key="flow-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full flex-1 flex flex-col"
            >
              <TransportistaHomeScreen onSelectTienda={handleSelectTienda} />
            </motion.div>
          )}

          {paso === 'facturas' && tiendaSeleccionada && (
            <motion.div
              key="flow-facturas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <FacturasARecaudarScreen
                tienda={tiendaSeleccionada}
                onBack={() => handleBack('home')}
                onSelectPrefactura={handleSelectPrefactura}
              />
            </motion.div>
          )}

          {paso === 'generar' && prefacturaSeleccionada && (
            <motion.div
              key="flow-generar"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <GenerarFacturaScreen
                prefactura={prefacturaSeleccionada}
                onBack={() => handleBack('facturas')}
                onGenerarQr={handleGenerarQr}
              />
            </motion.div>
          )}

          {paso === 'qr' && prefacturaSeleccionada && (
            <motion.div
              key="flow-qr"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <CobroQrBrebScreen
                prefactura={prefacturaSeleccionada}
                onBack={() => handleBack('generar')}
                onConfirmarPago={handleConfirmarPago}
              />
            </motion.div>
          )}

          {paso === 'recibido' && prefacturaSeleccionada && (
            <motion.div
              key="flow-recibido"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="w-full flex-1 flex flex-col"
            >
              <TransportistaPagoRecibidoScreen
                prefactura={prefacturaSeleccionada}
                onRegresar={handleRegresarAHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
