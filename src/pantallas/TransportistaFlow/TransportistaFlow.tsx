import React, { useState } from 'react';
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

  // 1. Al seleccionar una tienda pendiente desde "Ruta de hoy"
  const handleSelectTienda = (tienda: TiendaRuta) => {
    if (tienda.estado === 'pendiente') {
      setTiendaSeleccionada(tienda);
      setPaso('facturas');
    }
  };

  // 2. Al seleccionar una prefactura a recaudar
  const handleSelectPrefactura = (prefactura: PrefacturaCliente) => {
    setPrefacturaSeleccionada(prefactura);
    setPaso('generar');
  };

  // 3. Al pulsar "Generar QR"
  const handleGenerarQr = () => {
    setPaso('qr');
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
    setPaso('recibido');
  };

  // 5. Al regresar del comprobante a "Ruta de hoy"
  const handleRegresarAHome = () => {
    setPaso('home');
    setTiendaSeleccionada(null);
    setPrefacturaSeleccionada(null);
  };

  return (
    <AnimatePresence mode="wait">
      {paso === 'home' && (
        <motion.div
          key="flow-home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <TransportistaHomeScreen onSelectTienda={handleSelectTienda} />
        </motion.div>
      )}

      {paso === 'facturas' && tiendaSeleccionada && (
        <motion.div
          key="flow-facturas"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="w-full"
        >
          <FacturasARecaudarScreen
            tienda={tiendaSeleccionada}
            onBack={() => setPaso('home')}
            onSelectPrefactura={handleSelectPrefactura}
          />
        </motion.div>
      )}

      {paso === 'generar' && prefacturaSeleccionada && (
        <motion.div
          key="flow-generar"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="w-full"
        >
          <GenerarFacturaScreen
            prefactura={prefacturaSeleccionada}
            onBack={() => setPaso('facturas')}
            onGenerarQr={handleGenerarQr}
          />
        </motion.div>
      )}

      {paso === 'qr' && prefacturaSeleccionada && (
        <motion.div
          key="flow-qr"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
          className="w-full"
        >
          <CobroQrBrebScreen
            prefactura={prefacturaSeleccionada}
            onBack={() => setPaso('generar')}
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
          transition={{ duration: 0.25 }}
          className="w-full"
        >
          <TransportistaPagoRecibidoScreen
            prefactura={prefacturaSeleccionada}
            onRegresar={handleRegresarAHome}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
