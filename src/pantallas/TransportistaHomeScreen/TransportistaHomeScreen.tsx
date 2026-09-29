import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { EnlaceLogo } from '../../components/atoms/Logo/EnlaceLogo';
import { Avatar } from '../../components/atoms/Avatar/Avatar';
import { SearchBar } from '../../components/molecules/SearchBar/SearchBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import { TiendaRutaCard } from '../../components/molecules/TiendaRutaCard/TiendaRutaCard';
import {
  TransportistaBottomNav,
  type TransportistaTab
} from '../../components/organisms/TransportistaBottomNav/TransportistaBottomNav';
import {
  transportistaService,
  type TiendaRuta
} from '../../services/transportistaService';

interface TransportistaHomeScreenProps {
  onSelectTienda?: (tienda: TiendaRuta) => void;
  className?: string;
}

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const TransportistaHomeScreen: React.FC<TransportistaHomeScreenProps> = ({
  onSelectTienda,
  className = ''
}) => {
  const [activeNavTab, setActiveNavTab] = useState<TransportistaTab>('inicio');
  const [filtroRuta, setFiltroRuta] = useState<'pendientes' | 'visitados'>('pendientes');
  const [busqueda, setBusqueda] = useState('');

  const tiendas = useMemo(() => {
    return transportistaService.getTiendasRuta();
  }, [filtroRuta]);

  const pendientes = useMemo(() => tiendas.filter((t) => t.estado === 'pendiente'), [tiendas]);
  const visitados = useMemo(() => tiendas.filter((t) => t.estado === 'visitado'), [tiendas]);

  const totalARecaudar = useMemo(() => {
    return transportistaService.getTotalARecaudarHoy().formateado;
  }, [tiendas]);

  // Lista según filtro activo y búsqueda
  const tiendasFiltradas = useMemo(() => {
    const lista = filtroRuta === 'pendientes' ? pendientes : visitados;
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((t) => t.nombre.toLowerCase().includes(q));
  }, [filtroRuta, pendientes, visitados, busqueda]);

  return (
    <div className={`w-full flex-1 flex flex-col bg-white pb-[calc(5rem+env(safe-area-inset-bottom))] relative ${className}`}>

      {/* ============================================================== */}
      {/* TAB 1: INICIO (Ruta de hoy - Fiel a Figma / Screenshots 1 & 2) */}
      {/* ============================================================== */}
      {activeNavTab === 'inicio' && (
        <div className="w-full flex flex-col">
          {/* Header Azul con Total a Recaudar Hoy */}
          <div
            className="w-full bg-[#2F3CB3] text-white pt-1 pb-7 px-5 select-none relative shadow-xs"
            style={{
              borderBottomLeftRadius: '50% 24px',
              borderBottomRightRadius: '50% 24px'
            }}
          >
            {/* Barra de estado móvil nativa */}
            <MobileStatusBar theme="light" time="9:30" />

            {/* Top Bar: Logo + Avatar LM */}
            <div className="flex items-center justify-between pt-1.5 pb-2">
              <EnlaceLogo />
              <Avatar initials="LM" size="sm" />
            </div>

            {/* Total a recaudar */}
            <div className="flex flex-col items-center justify-center pt-2 pb-2 text-center">
              <span className="text-sm font-normal text-blue-100/90 tracking-wide">
                Total a recaudar hoy
              </span>
              <h1 className="text-[34px] sm:text-[36px] font-extrabold text-white tracking-tight mt-1">
                {totalARecaudar}
              </h1>
            </div>
          </div>

          {/* Contenido principal: Ruta de hoy */}
          <div className="px-5 py-4 flex flex-col gap-3.5">
            <h2 className="text-[18px] font-bold text-[#1B2075] tracking-tight">
              Ruta de hoy
            </h2>

            {/* Toggle Pills: Pendientes vs Visitados */}
            <div className="grid grid-cols-2 gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setFiltroRuta('pendientes')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                  filtroRuta === 'pendientes'
                    ? 'bg-[#2F3CB3] text-white shadow-xs'
                    : 'bg-[#F1F3F7] text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon name="clock" size={17} stroke={2.2} />
                <span>Pendientes ({pendientes.length})</span>
              </motion.button>

              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => setFiltroRuta('visitados')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-bold transition-all cursor-pointer select-none ${
                  filtroRuta === 'visitados'
                    ? 'bg-[#2F3CB3] text-white shadow-xs'
                    : 'bg-[#F1F3F7] text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon name="circle-check" size={17} stroke={2.2} />
                <span>Visitados ({visitados.length})</span>
              </motion.button>
            </div>

            {/* Barra de búsqueda de proveedor */}
            <SearchBar
              value={busqueda}
              onChange={setBusqueda}
              placeholder="Buscar proveedor"
            />

            {/* Lista animada de tiendas */}
            <AnimatePresence mode="wait">
              <motion.div
                key={filtroRuta}
                variants={listVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 mt-1"
              >
                {tiendasFiltradas.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
                    <p className="text-sm text-slate-500 font-medium">
                      {busqueda
                        ? `No hay clientes que coincidan con "${busqueda}"`
                        : filtroRuta === 'pendientes'
                        ? 'No hay cobros pendientes en la ruta de hoy'
                        : 'Aún no se han registrado cobros visitados'}
                    </p>
                  </div>
                ) : (
                  tiendasFiltradas.map((tienda) => (
                    <motion.div key={tienda.id} variants={itemVariants}>
                      <TiendaRutaCard
                        tienda={tienda}
                        onClick={onSelectTienda}
                      />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MOVIMIENTOS (Historial de recaudos del transportista)    */}
      {/* ============================================================== */}
      {activeNavTab === 'movimientos' && (
        <div className="w-full flex flex-col">
          <div className="w-full bg-[#2F3CB3] text-white pt-1 pb-4 px-5 select-none shadow-xs">
            <MobileStatusBar theme="light" time="9:30" />
            <div className="pt-2 pb-1 text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Mis Movimientos
              </h1>
              <p className="text-xs text-blue-100/90 mt-0.5">
                Recaudos realizados durante la jornada
              </p>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between bg-slate-50 border border-slate-100 p-3.5 rounded-2xl mb-1">
              <div>
                <span className="text-xs text-slate-500 font-medium">Total recaudado</span>
                <div className="text-xl font-black text-slate-900">$3.130.500</div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {visitados.length} visitas
              </div>
            </div>

            <h2 className="text-sm font-bold text-slate-800 mt-2">Detalle de cobranzas</h2>
            {visitados.map((tienda) => (
              <TiendaRutaCard key={`mov-${tienda.id}`} tienda={tienda} />
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: NOTIFICACIONES                                          */}
      {/* ============================================================== */}
      {activeNavTab === 'notificaciones' && (
        <div className="w-full flex flex-col">
          <div className="w-full bg-[#2F3CB3] text-white pt-1 pb-4 px-5 select-none shadow-xs">
            <MobileStatusBar theme="light" time="9:30" />
            <div className="pt-2 pb-1 text-center">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Notificaciones
              </h1>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[50vh]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2F3CB3] flex items-center justify-center mb-3">
              <Icon name="bell" size={26} stroke={2} />
            </div>
            <h2 className="text-base font-bold text-slate-800">Bandeja de avisos</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px] leading-relaxed">
              Aquí recibirás avisos de nuevos cobros asignados y confirmaciones de pago Bre-B.
            </p>
          </div>
        </div>
      )}

      {/* Barra de Navegación Inferior Móvil */}
      <TransportistaBottomNav
        activeTab={activeNavTab}
        onTabChange={setActiveNavTab}
      />
    </div>
  );
};
