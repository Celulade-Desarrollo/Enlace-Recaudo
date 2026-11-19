import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { TransportistaHomeScreen } from '../TransportistaHomeScreen/TransportistaHomeScreen';
import { GenerarFacturaScreen } from '../GenerarFacturaScreen/GenerarFacturaScreen';
import { CobroQrBrebScreen } from '../CobroQrBrebScreen/CobroQrBrebScreen';
import { CobroEfectivoScreen, type DetallesConfirmacionEfectivo } from '../CobroEfectivoScreen/CobroEfectivoScreen';
import {
  TransportistaPagoRecibidoScreen,
  type DetallesPagoRealizado
} from '../TransportistaPagoRecibidoScreen/TransportistaPagoRecibidoScreen';
import { ResumenCierreRutaScreen } from '../ResumenCierreRutaScreen/ResumenCierreRutaScreen';
import {
  transportistaService,
  type TiendaRuta,
  type PrefacturaCliente
} from '../../services/transportistaService';

type TransportistaPaso =
  | 'home'
  | 'generar'
  | 'qr'
  | 'qr2'
  | 'efectivo'
  | 'recibido'
  | 'cierre';

export const TransportistaFlow: React.FC = () => {
  const reducirMovimiento = useReducedMotion();
  const [paso, setPaso] = useState<TransportistaPaso>('home');
  const [tiendaSeleccionada, setTiendaSeleccionada] = useState<TiendaRuta | null>(null);
  const [prefacturaSeleccionada, setPrefacturaSeleccionada] = useState<PrefacturaCliente | null>(null);

  // Estados del flujo de pago
  const [pagoInfo, setPagoInfo] = useState<DetallesPagoRealizado | null>(null);
  const [esPagoParcial, setEsPagoParcial] = useState<boolean>(false);
  const [montoParcialQr, setMontoParcialQr] = useState<number | undefined>(undefined);
  const [restanteEfectivo, setRestanteEfectivo] = useState<number>(0);
  const [esDosQr, setEsDosQr] = useState<boolean>(false);
  const [montoQr1, setMontoQr1] = useState<number>(0);
  const [montoQr2, setMontoQr2] = useState<number>(0);

  // Soporte nativo para botón 'Atrás' en celulares (Mobile First: PopState / Gestos de retroceso)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const p = event.state?.paso;
      if (p && ['home', 'generar', 'qr', 'qr2', 'efectivo', 'recibido', 'cierre'].includes(p)) {
        setPaso(p);
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

  // 1. Al seleccionar una tienda pendiente desde afuera: pasa DIRECTAMENTE a la factura
  const handleSelectTienda = (tienda: TiendaRuta) => {
    if (tienda.estado === 'pendiente') {
      const facturas = transportistaService.getPrefacturasByTienda(tienda.id);
      const factura = facturas[0];
      if (factura) {
        setTiendaSeleccionada(tienda);
        window.scrollTo(0, 0);
        setPrefacturaSeleccionada(factura);
        setPagoInfo(null);
        setEsPagoParcial(false);
        setEsDosQr(false);
        setMontoQr1(0);
        setMontoQr2(0);
        setMontoParcialQr(undefined);
        setRestanteEfectivo(0);
        transicionarA('generar');
      }
    }
  };

  // 3a. Opción 1: Pago completo por medios digitales
  const handlePagoCompletoDigital = () => {
    setEsPagoParcial(false);
    setEsDosQr(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(0);
    setPagoInfo({ tipo: 'digital_completo' });
    transicionarA('qr');
  };

  // 3b. Opción 2: Pago digital dividido (2 QR Bre-B)
  const handlePagoDosQr = (monto1: number, monto2: number) => {
    setEsDosQr(true);
    setEsPagoParcial(false);
    setMontoQr1(monto1);
    setMontoQr2(monto2);
    setMontoParcialQr(monto1);
    setRestanteEfectivo(0);
    setPagoInfo({
      tipo: 'dos_qr',
      montoQr1: monto1,
      montoQr2: monto2
    });
    transicionarA('qr');
  };

  // 3c. Opción 3: Pago parcial por medios digitales y efectivo
  const handlePagoParcial = (montoDigital: number, restante: number) => {
    setEsPagoParcial(true);
    setEsDosQr(false);
    setMontoParcialQr(montoDigital);
    setRestanteEfectivo(restante);
    setPagoInfo({
      tipo: 'parcial',
      montoDigital,
      montoEfectivo: restante
    });
    transicionarA('qr');
  };

  // 3d. Opción 4: Pago en efectivo
  const handlePagoEfectivo = () => {
    if (!prefacturaSeleccionada) return;
    setEsPagoParcial(false);
    setEsDosQr(false);
    setMontoParcialQr(undefined);
    setRestanteEfectivo(prefacturaSeleccionada.saldoTotalNum);
    setPagoInfo({
      tipo: 'efectivo',
      montoEfectivo: prefacturaSeleccionada.saldoTotalNum
    });
    transicionarA('efectivo');
  };

  // 4. Al confirmar el pago en la pantalla del 1er QR
  const handleConfirmarPagoQr = () => {
    if (esDosQr) {
      // Al confirmar el 1er QR, pasamos a generar el 2do QR
      transicionarA('qr2');
    } else if (esPagoParcial) {
      // En pago parcial, al marcar pago recibido por QR, pasamos a cobrar el restante en efectivo
      transicionarA('efectivo');
    } else {
      // En pago completo digital, registramos y finalizamos
      if (tiendaSeleccionada && prefacturaSeleccionada) {
        transportistaService.registrarPagoFacturaDetallado(
          tiendaSeleccionada.id,
          prefacturaSeleccionada.numeroPrefactura,
          prefacturaSeleccionada.saldoTotal,
          { tipo: 'digital_completo', montoDigital: prefacturaSeleccionada.saldoTotalNum }
        );
      }
      transicionarA('recibido');
    }
  };

  // 4b. Al confirmar el pago en el 2do QR (dos digitales)
  const handleConfirmarSegundoQr = () => {
    if (tiendaSeleccionada && prefacturaSeleccionada) {
      transportistaService.registrarPagoFacturaDetallado(
        tiendaSeleccionada.id,
        prefacturaSeleccionada.numeroPrefactura,
        prefacturaSeleccionada.saldoTotal,
        { tipo: 'dos_qr', montoDigital: prefacturaSeleccionada.saldoTotalNum }
      );
    }
    setPagoInfo({
      tipo: 'dos_qr',
      montoQr1,
      montoQr2
    });
    transicionarA('recibido');
  };

  // 5. Al confirmar el pago en efectivo (completo o restante)
  const handleConfirmarPagoEfectivo = (detalles: DetallesConfirmacionEfectivo) => {
    if (tiendaSeleccionada && prefacturaSeleccionada) {
      transportistaService.registrarPagoFacturaDetallado(
        tiendaSeleccionada.id,
        prefacturaSeleccionada.numeroPrefactura,
        prefacturaSeleccionada.saldoTotal,
        esPagoParcial
          ? {
              tipo: 'parcial',
              montoDigital: montoParcialQr,
              montoEfectivo: restanteEfectivo
            }
          : {
              tipo: 'efectivo',
              montoEfectivo: prefacturaSeleccionada.saldoTotalNum
            }
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

  // 6. Navegación a Resumen y Cierre de Ruta
  const handleVerResumenCierre = () => {
    transicionarA('cierre');
  };

  const handleSelectTiendaDesdeResumen = (tienda: TiendaRuta) => {
    handleSelectTienda(tienda);
  };

  // 7. Retroceso seguro e inmediato
  const handleBack = (pasoDestino: TransportistaPaso) => {
    setPaso(pasoDestino);
    try {
      window.history.pushState({ paso: pasoDestino }, '');
    } catch {
      // fallback
    }
  };

  // 7. Al regresar del comprobante a "Ruta de hoy"
  const handleRegresarAHome = () => {
    setPaso('home');
    setTiendaSeleccionada(null);
    setPrefacturaSeleccionada(null);
    setPagoInfo(null);
    setEsPagoParcial(false);
    setEsDosQr(false);
    setMontoQr1(0);
    setMontoQr2(0);
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
          {(paso === 'home' ||
            (paso !== 'cierre' && !prefacturaSeleccionada) ||
            !['cierre', 'generar', 'qr', 'qr2', 'efectivo', 'recibido'].includes(paso)) && (
            <motion.div
              key="flow-home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="w-full flex-1 flex flex-col"
            >
              <TransportistaHomeScreen
                onSelectTienda={handleSelectTienda}
                onVerResumenCierre={handleVerResumenCierre}
              />
            </motion.div>
          )}

          {paso === 'generar' && prefacturaSeleccionada && (
            <motion.div
              key="flow-generar"
              initial={reducirMovimiento ? { opacity: 0 } : { opacity: 1, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={reducirMovimiento ? { duration: 0.12 } : { type: 'spring', bounce: 0, duration: 0.35 }}
              className="w-full flex-1 flex flex-col"
            >
              <GenerarFacturaScreen
                prefactura={prefacturaSeleccionada}
                onPrefacturaChange={setPrefacturaSeleccionada}
                onGuardarFactura={(prefactura) => {
                  if (!tiendaSeleccionada) throw new Error('Selecciona una tienda.');
                  transportistaService.guardarPrefactura(tiendaSeleccionada.id, prefactura);
                  setTiendaSeleccionada(transportistaService.getTiendaById(tiendaSeleccionada.id) ?? tiendaSeleccionada);
                }}
                onBack={() => handleBack('home')}
                onPagoCompletoDigital={handlePagoCompletoDigital}
                onPagoDosQr={handlePagoDosQr}
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
                montoCobro={esDosQr ? montoQr1 : montoParcialQr}
                esParcial={esPagoParcial}
                esDosQr={esDosQr}
                pasoDosQr={1}
                montoOtroQr={esDosQr ? montoQr2 : undefined}
                restanteEfectivo={restanteEfectivo}
                onBack={() => handleBack('generar')}
                onConfirmarPago={handleConfirmarPagoQr}
              />
            </motion.div>
          )}

          {paso === 'qr2' && prefacturaSeleccionada && (
            <motion.div
              key="flow-qr2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <CobroQrBrebScreen
                prefactura={prefacturaSeleccionada}
                montoCobro={montoQr2}
                esDosQr={true}
                pasoDosQr={2}
                montoOtroQr={montoQr1}
                qrImageUrl="/qr_breb_placeholder_2.svg"
                onBack={() => handleBack('qr')}
                onConfirmarPago={handleConfirmarSegundoQr}
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

          {paso === 'cierre' && (
            <motion.div
              key="flow-cierre"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }}
              className="w-full flex-1 flex flex-col"
            >
              <ResumenCierreRutaScreen
                onBack={() => handleBack('home')}
                onSelectTienda={handleSelectTiendaDesdeResumen}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
