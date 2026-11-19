import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Icon } from '../../components/atoms/Icon/Icon';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import {
  transportistaService,
  type TiendaRuta,
  type ResumenRutaDetallado
} from '../../services/transportistaService';

interface ResumenCierreRutaScreenProps {
  onBack: () => void;
  onSelectTienda?: (tienda: TiendaRuta) => void;
  className?: string;
}

export const ResumenCierreRutaScreen: React.FC<ResumenCierreRutaScreenProps> = ({
  onBack,
  onSelectTienda,
  className = ''
}) => {
  const [resumen, setResumen] = useState<ResumenRutaDetallado>(() =>
    transportistaService.getResumenRutaDetallado()
  );
  const [filtro, setFiltro] = useState<'todas' | 'visitadas' | 'pendientes'>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [paradaExpandida, setParadaExpandida] = useState<string | null>(null);

  // Modales
  const [isModalCerrarOpen, setIsModalCerrarOpen] = useState(false);
  const [isModalComprobanteOpen, setIsModalComprobanteOpen] = useState(false);
  const [observacionesInput, setObservacionesInput] = useState('');
  const [mensajeCopiado, setMensajeCopiado] = useState(false);

  const recargarResumen = () => {
    setResumen(transportistaService.getResumenRutaDetallado());
  };

  const handleCerrarRuta = () => {
    transportistaService.realizarCierreRuta(observacionesInput.trim() || undefined);
    recargarResumen();
    setIsModalCerrarOpen(false);
    setIsModalComprobanteOpen(true);
  };

  const handleReabrirRuta = () => {
    if (window.confirm('¿Deseas reabrir la ruta para continuar registrando cobranzas?')) {
      transportistaService.reabrirRuta();
      recargarResumen();
      setIsModalComprobanteOpen(false);
    }
  };

  const handleCompartirResumen = () => {
    const texto = `CIERRE DE RUTA - ENLACE CRM
Folio: ${resumen.cierre?.id || 'En curso'}
Transportista: Leonardo Moreno (Móvil TSK-892)
Fecha: ${resumen.cierre?.fechaHora || 'Hoy'}
-------------------------------
Total Recaudado: $${resumen.totalRecaudado.toLocaleString('es-CO')}
- Efectivo a entregar: $${resumen.totalEfectivo.toLocaleString('es-CO')}
- Transferencias Bre-B: $${resumen.totalDigital.toLocaleString('es-CO')}
Saldo pendiente: $${resumen.totalPendiente.toLocaleString('es-CO')}
-------------------------------
Clientes atendidos: ${resumen.tiendasVisitadas} de ${resumen.totalTiendas} (${resumen.porcentajeVisitadas}%)
Facturas cobradas: ${resumen.facturasCobradas} de ${resumen.facturasTotal}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto);
      setMensajeCopiado(true);
      setTimeout(() => setMensajeCopiado(false), 2000);
    }
  };

  const tiendasFiltradas = useMemo(() => {
    return resumen.tiendas.filter((t) => {
      if (filtro === 'visitadas' && t.estado !== 'visitado') return false;
      if (filtro === 'pendientes' && t.estado !== 'pendiente') return false;
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase();
        const coincideNombre = t.nombre.toLowerCase().includes(q);
        const coincideDir = t.direccion?.toLowerCase().includes(q);
        const coincideFactura = t.facturasDetalle?.some((f) => f.numero.includes(q));
        return coincideNombre || coincideDir || coincideFactura;
      }
      return true;
    });
  }, [resumen.tiendas, filtro, busqueda]);

  const estaCerrada = Boolean(resumen.cierre?.cerrada);

  return (
    <div className={`w-full flex-1 flex flex-col bg-white relative pb-28 font-sans ${className}`}>
      {/* ============================================================== */}
      {/* 1. HEADER AZUL CON ARCO CURVO (ADN VISUAL DE LA APP)           */}
      {/* ============================================================== */}
      <div
        className="w-full bg-[#2F3CB3] text-white pt-3 pb-6 px-5 select-none relative shadow-xs"
        style={{
          borderBottomLeftRadius: '50% 24px',
          borderBottomRightRadius: '50% 24px'
        }}
      >
        {/* Barra superior: Volver + Título + Compartir */}
        <div className="flex items-center justify-between pt-1 pb-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver a la ruta"
            className="w-9 h-9 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon name="arrow-left" size={19} stroke={2.5} />
          </button>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-wide text-center px-2">
            Cierre de Ruta
          </h1>

          <button
            type="button"
            onClick={handleCompartirResumen}
            aria-label="Compartir resumen"
            className="w-9 h-9 rounded-full border border-white/90 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Icon name="share" size={18} stroke={2.2} />
          </button>
        </div>

        {/* Total Recaudado Grande */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1 text-center">
          <span className="text-xs font-normal text-blue-100 tracking-wide">
            Total recaudado hoy
          </span>
          <h2 className="text-[34px] sm:text-[38px] font-black text-white tracking-tight mt-0.5">
            ${resumen.totalRecaudado.toLocaleString('es-CO')}
          </h2>
          <span className="text-xs text-blue-200 mt-0.5 font-medium">
            {resumen.tiendasVisitadas} de {resumen.totalTiendas} clientes visitados ({resumen.porcentajeVisitadas}%)
          </span>
        </div>
      </div>

      {/* Alerta flotante copiado */}
      <AnimatePresence>
        {mensajeCopiado && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg flex items-center gap-2"
          >
            <Icon name="circle-check" size={15} stroke={2.5} className="text-emerald-400" />
            <span>Resumen copiado al portapapeles</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 2. CONTENIDO PRINCIPAL FLUIDO (ESTILO RECIBO / MOBILE NATIVE)  */}
      {/* ============================================================== */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Sección de Arqueo de Valores */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-0.5">
            Arqueo de Liquidación
          </h3>

          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            {/* Fila 1: Efectivo Físico */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#EBF0FF] text-[#2F3CB3] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <Icon name="cash" size={20} stroke={2} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    Efectivo en mano
                  </span>
                  <span className="text-xs text-slate-400">
                    Billetes para entregar en caja
                  </span>
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-900 shrink-0">
                ${resumen.totalEfectivo.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Fila 2: Digital Bre-B */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#EBF0FF] text-[#2F3CB3] flex items-center justify-center shrink-0 border border-blue-100/60">
                  <Icon name="qrcode" size={20} stroke={2} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-slate-900 leading-snug">
                    Transferencias Bre-B
                  </span>
                  <span className="text-xs text-slate-400">
                    Acreditado en cuenta bancaria
                  </span>
                </div>
              </div>
              <span className="text-base font-extrabold text-slate-900 shrink-0">
                ${resumen.totalDigital.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="w-full h-px bg-slate-100" />

            {/* Fila 3: Saldo Pendiente */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-slate-500 font-medium">
                Saldo pendiente por recaudar:
              </span>
              <span className="font-bold text-amber-600 text-sm">
                ${resumen.totalPendiente.toLocaleString('es-CO')}
              </span>
            </div>
          </div>
        </div>

        {/* Sección de Detalle de Rutas y Comercios */}
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-0.5">
              Detalle de Paradas ({resumen.totalTiendas})
            </h3>
            <span className="text-xs text-slate-500">
              {resumen.facturasCobradas} de {resumen.facturasTotal} facturas
            </span>
          </div>

          {/* Toggle Pills idénticos a los del Home */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFiltro('todas')}
              className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filtro === 'todas'
                  ? 'bg-[#2F3CB3] text-white shadow-xs'
                  : 'bg-[#F1F3F7] text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todas ({resumen.totalTiendas})
            </button>
            <button
              type="button"
              onClick={() => setFiltro('visitadas')}
              className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filtro === 'visitadas'
                  ? 'bg-[#2F3CB3] text-white shadow-xs'
                  : 'bg-[#F1F3F7] text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cobradas ({resumen.tiendasVisitadas})
            </button>
            <button
              type="button"
              onClick={() => setFiltro('pendientes')}
              className={`py-2 px-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                filtro === 'pendientes'
                  ? 'bg-[#2F3CB3] text-white shadow-xs'
                  : 'bg-[#F1F3F7] text-slate-700 hover:bg-slate-200'
              }`}
            >
              Pendientes ({resumen.tiendasPendientes})
            </button>
          </div>

          {/* Buscador idéntico al SearchBar del Home */}
          <div className="relative w-full">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar comercio o dirección..."
              className="w-full bg-[#F1F3F7] border border-transparent rounded-full py-2.5 pl-10 pr-9 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#2F3CB3] transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon name="search" size={17} stroke={2} />
            </div>
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <Icon name="x" size={15} stroke={2.5} />
              </button>
            )}
          </div>

          {/* Lista de comercios idéntica a TiendaRutaCard de la app */}
          <div className="flex flex-col gap-2.5 mt-1">
            {tiendasFiltradas.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200 p-4">
                <p className="text-sm text-slate-500 font-medium">
                  No hay comercios que coincidan con la búsqueda.
                </p>
              </div>
            ) : (
              tiendasFiltradas.map((tienda) => {
                const isVisitado = tienda.estado === 'visitado';
                const expandida = paradaExpandida === tienda.id;

                return (
                  <motion.div
                    key={tienda.id}
                    layout
                    className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:border-slate-200 transition-all overflow-hidden"
                  >
                    <div
                      onClick={() => setParadaExpandida(expandida ? null : tienda.id)}
                      className="p-4 flex items-center justify-between cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 pr-2">
                        <div className="w-12 h-12 rounded-full bg-[#EBF0FF] text-[#2F3CB3] flex items-center justify-center shrink-0 border border-blue-100/60">
                          <Icon name="building-store" size={24} stroke={2} />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <h4 className="text-[15px] font-bold text-slate-900 truncate leading-snug tracking-tight">
                            {tienda.nombre}
                          </h4>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isVisitado ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                            />
                            <span>
                              {isVisitado
                                ? `Visitado ${tienda.horaVisita || '10:00'}`
                                : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex flex-col items-end text-right">
                          <span className="text-[11px] text-slate-400 font-normal">
                            {isVisitado ? 'Recaudado' : 'Saldo Total'}
                          </span>
                          <span className="text-base sm:text-[17px] font-extrabold text-slate-900 tracking-tight leading-snug mt-0.5">
                            {isVisitado ? (tienda.recaudado || tienda.saldoTotal) : tienda.saldoTotal}
                          </span>
                        </div>

                        <div className="text-[#1B2075] pl-1">
                          <Icon
                            name={expandida ? 'minus' : 'chevron-right'}
                            size={18}
                            stroke={2.5}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Desglose Expandible */}
                    <AnimatePresence>
                      {expandida && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.16 }}
                          className="px-4 pb-4 pt-1 border-t border-slate-100 bg-slate-50/60 flex flex-col gap-2.5 text-xs"
                        >
                          <div className="flex items-center justify-between text-slate-500 pt-1 text-xs">
                            <span>{tienda.direccion || 'Medellín, Antioquia'}</span>
                            <span>Tel: {tienda.telefono || '300 000 0000'}</span>
                          </div>

                          {isVisitado && (
                            <div className="flex items-center justify-between py-2 px-3 bg-white rounded-xl border border-slate-100">
                              <span className="text-slate-600 font-medium">Medio de pago:</span>
                              <span className="font-bold text-slate-900">
                                {tienda.metodoPago || 'QR Bre-B'}
                              </span>
                            </div>
                          )}

                          {/* Facturas */}
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-slate-700 text-[11px]">Facturas asociadas:</span>
                            {tienda.facturasDetalle && tienda.facturasDetalle.length > 0 ? (
                              tienda.facturasDetalle.map((fac) => (
                                <div
                                  key={fac.numero}
                                  className="flex items-center justify-between py-1.5 px-3 bg-white rounded-xl border border-slate-100 text-xs"
                                >
                                  <span className="font-medium text-slate-800">Factura #{fac.numero}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{fac.saldo}</span>
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        isVisitado || fac.estado === 'cobrada'
                                          ? 'bg-emerald-50 text-emerald-700'
                                          : 'bg-amber-50 text-amber-700'
                                      }`}
                                    >
                                      {isVisitado || fac.estado === 'cobrada' ? 'Cobrada' : 'Pendiente'}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex items-center justify-between py-1.5 px-3 bg-white rounded-xl border border-slate-100 text-xs">
                                <span className="font-medium text-slate-800">Factura Principal</span>
                                <span className="font-bold text-slate-900">{tienda.saldoTotal}</span>
                              </div>
                            )}
                          </div>

                          {!isVisitado && onSelectTienda && (
                            <button
                              type="button"
                              onClick={() => onSelectTienda(tienda)}
                              className="w-full mt-1 py-2.5 rounded-full bg-[#2F3CB3] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                            >
                              <span>Cobrar esta factura</span>
                              <Icon name="chevron-right" size={16} stroke={2.5} />
                            </button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BARRA INFERIOR FIJA CON EL BOTÓN DE ACCIÓN (MOBILE STICKY) */}
      {/* ============================================================== */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/95 backdrop-blur-md border-t border-slate-100 px-5 pt-3 pb-6 z-30 flex flex-col gap-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {estaCerrada ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModalComprobanteOpen(true)}
              className="flex-1 h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer select-none"
            >
              <Icon name="receipt" size={19} stroke={2.2} />
              <span>Ver Comprobante de Cierre</span>
            </button>
            <button
              type="button"
              onClick={handleReabrirRuta}
              className="px-4 h-12 rounded-full border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Reabrir
            </button>
          </div>
        ) : (
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalCerrarOpen(true)}
            className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer select-none"
          >
            <Icon name="lock" size={18} stroke={2.2} />
            <span>Cerrar Ruta del Día</span>
          </motion.button>
        )}
      </div>

      <MobileHomeBar theme="dark" />

      {/* ============================================================== */}
      {/* MODAL 1: CONFIRMAR CIERRE DIARIO (SHEET NATIVO)                */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalCerrarOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalCerrarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="w-full max-w-[430px] bg-white rounded-t-[28px] shadow-2xl relative z-10 overflow-hidden flex flex-col px-6 pt-3 pb-8"
            >
              <div className="w-9 h-1 bg-[#D1D1D6] rounded-full mx-auto mb-4" />

              <h3 className="text-xl font-bold text-slate-900 tracking-tight text-center mb-1">
                ¿Deseas cerrar la ruta de hoy?
              </h3>
              <p className="text-xs text-slate-500 text-center mb-5">
                Se generará el comprobante oficial de entrega de valores.
              </p>

              <div className="w-full flex flex-col text-xs border-t border-dashed border-slate-200 pt-2 mb-4">
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-600 font-medium">Efectivo a entregar:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${resumen.totalEfectivo.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-600 font-medium">Transferencias Bre-B:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ${resumen.totalDigital.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex justify-between py-2.5 font-black text-slate-900 text-base">
                  <span>Total Liquidado:</span>
                  <span className="text-[#2F3CB3]">${resumen.totalRecaudado.toLocaleString('es-CO')}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-xs font-semibold text-slate-700">
                  Observaciones (opcional)
                </label>
                <input
                  type="text"
                  value={observacionesInput}
                  onChange={(e) => setObservacionesInput(e.target.value)}
                  placeholder="Ej: Jornada finalizada con éxito"
                  className="w-full bg-[#F1F3F7] rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:bg-white focus:border-[#2F3CB3] border border-transparent"
                />
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalCerrarOpen(false)}
                  className="flex-1 h-12 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCerrarRuta}
                  className="flex-1 h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Confirmar y Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: COMPROBANTE OFICIAL (DIENTES DE SIERRA IDÉNTICO APP) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isModalComprobanteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalComprobanteOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="w-full max-w-[390px] max-h-[90dvh] overflow-y-auto bg-white rounded-3xl shadow-2xl relative z-10 flex flex-col overflow-hidden"
            >
              {/* Header azul del recibo */}
              <div className="w-full bg-[#2F3CB3] text-white pt-4 px-5 pb-3 text-center">
                <span className="text-[10px] font-bold text-blue-200 uppercase tracking-widest block">
                  Enlace CRM
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  Comprobante de Cierre de Ruta
                </h3>
              </div>

              {/* Dientes de sierra zigzag idénticos a TransportistaPagoRecibidoScreen */}
              <div
                className="w-full h-3 bg-[#2F3CB3] -mt-px flex-shrink-0"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12' viewBox='0 0 24 12'%3E%3Cpath d='M0 12 L12 0 L24 12 Z' fill='white'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat-x',
                  backgroundSize: '24px 12px',
                  backgroundPosition: 'center bottom'
                }}
              />

              {/* Contenido del Recibo */}
              <div className="p-6 flex flex-col items-center text-center">
                {/* Checkmark verde */}
                <div className="w-13 h-13 rounded-full border-[2.5px] border-[#0e9347] bg-white flex items-center justify-center mb-2 shrink-0">
                  <Icon name="check" size={26} stroke={3} className="text-[#0e9347]" />
                </div>

                <h4 className="text-lg font-bold text-slate-900">
                  Cierre de Ruta Exitoso
                </h4>
                <span className="text-xs text-slate-500 mt-0.5 mb-1">
                  Total liquidado
                </span>
                <div className="text-[32px] font-black text-slate-950 tracking-tight leading-none mb-4">
                  ${resumen.totalRecaudado.toLocaleString('es-CO')}
                </div>

                {/* Líneas punteadas tipo recibo */}
                <div className="w-full flex flex-col text-xs border-t border-dashed border-slate-200 pt-2 mb-4">
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Folio</span>
                    <span className="text-slate-800 font-medium text-right">{resumen.cierre?.id}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Transportista</span>
                    <span className="text-slate-800 font-medium text-right">{resumen.cierre?.transportista}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Vehículo</span>
                    <span className="text-slate-800 font-medium text-right">Placa {resumen.cierre?.placaVehiculo}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Efectivo en caja</span>
                    <span className="text-slate-800 font-bold text-right">${resumen.totalEfectivo.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Transferencias Bre-B</span>
                    <span className="text-slate-800 font-bold text-right">${resumen.totalDigital.toLocaleString('es-CO')}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-dashed border-slate-200">
                    <span className="font-bold text-slate-900 text-left">Fecha y Hora</span>
                    <span className="text-slate-800 font-medium text-right">{resumen.cierre?.fechaHora}</span>
                  </div>
                </div>

                {/* Botones */}
                <div className="w-full flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleCompartirResumen}
                    className="w-full h-12 rounded-full bg-[#2F3CB3] hover:bg-[#2532a1] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
                  >
                    <Icon name="share" size={16} stroke={2.2} />
                    <span>Compartir Comprobante</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalComprobanteOpen(false)}
                    className="w-full h-11 rounded-full border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
