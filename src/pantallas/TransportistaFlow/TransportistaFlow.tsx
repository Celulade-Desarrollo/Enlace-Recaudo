import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TransportistaHomeScreen } from '../TransportistaHomeScreen/TransportistaHomeScreen';
import { FacturasARecaudarScreen } from '../FacturasARecaudarScreen/FacturasARecaudarScreen';
import { GenerarFacturaScreen } from '../GenerarFacturaScreen/GenerarFacturaScreen';
import { CobroQrBrebScreen } from '../CobroQrBrebScreen/CobroQrBrebScreen';
import { CobroEfectivoScreen, type DetallesConfirmacionEfectivo } from '../CobroEfectivoScreen/CobroEfectivoScreen';
import {
  TransportistaPagoRecibidoScreen,
  type DetallesPagoRealizado
} from '../TransportistaPagoRecibidoScreen/TransportistaPagoRecibidoScreen';
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
  | 'efectivo'
  | 'recibido';

export const TransportistaFlow: React.FC = () => {
  const [paso, setPaso] = useState<TransportistaPaso>('home');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<TiendaRuta | null>(null);
  const [prefacturaSeleccionada, setPrefacturaSeleccionada] = useState<PrefacturaCliente | null>(null);

  // Estados del flujo de pago
  const [pagoInfo, setPagoInfo] = useState<DetallesPagoRealizado | null>(null);
  const [esPagoParcial, setEsPagoParcial] = useState<boolean>(false);
  const [montoParcialQr, setMontoParcialQr] = useState<number | undefined>(undefined);
  const [restanteEfectivo, setRestanteEfectivo] = useState<number>(0);

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
    setPagoInfo(null);
    setEsPagoParcial(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(0);
    transicionarA('generar');
  };

  // 3a. Opción 1: Pago completo por medios digitales
  const handlePagoCompletoDigital = () => {
    setEsPagoParcial(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(0);
    setPagoInfo({ tipo: 'digital_completo' });
    transicionarA('qr');
  };

  // 3b. Opción 2: Pago parcial por medios digitales y efectivo
  const handlePagoParcial = (montoDigital: number, restante: number) => {
    setEsPagoParcial(true);
    setMontoParcialQr(montoDigital);
    setRestanteEfectivo(restante);
    setPagoInfo({
      tipo: 'parcial',
      montoDigital,
      montoEfectivo: restante
    });
    transicionarA('qr');
  };

  // 3c. Opción 3: Pago en efectivo
  const handlePagoEfectivo = () => {
    if (!prefacturaSeleccionada) return;
    setEsPagoParcial(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(prefacturaSeleccionada.saldoTotalNum);
    setPagoInfo({
      tipo: 'efectivo',
      montoEfectivo: prefacturaSeleccionada.saldoTotalNum
    });
    transicionarA('efectivo');
  };

  // 4. Al confirmar el pago en la pantalla del QR
  const handleConfirmarPagoQr = () => {
    if (esPagoParcial) {
      // En pago parcial, al marcar pago recibido por QR, pasamos a cobrar el restante en efectivo
      transicionarA('efectivo');
    } else {
      // En pago completo digital, registramos y finalizamos
      if (tiendaSeleccionada && prefacturaSeleccionada) {
        transportistaService.registrarPagoPrefactura(
          tiendaSeleccionada.id,
          prefacturaSeleccionada.numeroPrefactura,
          prefacturaSeleccionada.saldoTotal
        );
      }
      transicionarA('recibido');
    }
  };

  // 5. Al confirmar el pago en efectivo (completo o restante)
  const handleConfirmarPagoEfectivo = (detalles: DetallesConfirmacionEfectivo) => {
    if (tiendaSeleccionada && prefacturaSeleccionada) {
      transportistaService.registrarPagoPrefactura(
        tiendaSeleccionada.id,
        prefacturaSeleccionada.numeroPrefactura,
        prefacturaSeleccionada.saldoTotal
      );
    }

    if (esPagoParcial) {
      setPagoInfo({
        tipo: 'parcial',
        montoDigital: montoParcialQr,
        montoEfectivo: restanteEfectivo,
        efectivoRecibido: detalles.montoRecibido,
        cambio: detalles.cambio
      });
    } else {
      setPagoInfo({
        tipo: 'efectivo',
        montoEfectivo: prefacturaSeleccionada?.saldoTotalNum,
        efectivoRecibido: detalles.montoRecibido,
        cambio: detalles.cambio
      });
    }

    transicionarA('recibido');
  };

  // 6. Retroceso seguro
  const handleBack = (pasoDestino: TransportistaPaso) => {
    if (window.history.state && window.history.state.paso) {
      window.history.back();
    } else {
      setPaso(pasoDestino);
    }
  };

  // 7. Al regresar del comprobante a "Ruta de hoy"
  const handleRegresarAHome = () => {
    setPaso('home');
    setTiendaSeleccionada(null);
    setPrefacturaSeleccionada(null);
    setPagoInfo(null);
    setEsPagoParcial(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(0);
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
                onPagoCompletoDigital={handlePagoCompletoDigital}
                onPagoParcial={handlePagoParcial}
                onPagoEfectivo={handlePagoEfectivo}
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
                montoCobro={montoParcialQr}
                esParcial={esPagoParcial}
                restanteEfectivo={restanteEfectivo}
                onBack={() => handleBack('generar')}
                onConfirmarPago={handleConfirmarPagoQr}
              />
            </motion.div>
          )}

          {paso === 'efectivo' && prefacturaSeleccionada && (
            <motion.div
              key="flow-efectivo"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <CobroEfectivoScreen
                prefactura={prefacturaSeleccionada}
                montoACobrar={esPagoParcial ? restanteEfectivo : prefacturaSeleccionada.saldoTotalNum}
                esParcial={esPagoParcial}
                montoDigitalPagado={montoParcialQr}
                onBack={() => handleBack(esPagoParcial ? 'qr' : 'generar')}
                onConfirmarPago={handleConfirmarPagoEfectivo}
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
                detallesPago={pagoInfo}
                onRegresar={handleRegresarAHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
