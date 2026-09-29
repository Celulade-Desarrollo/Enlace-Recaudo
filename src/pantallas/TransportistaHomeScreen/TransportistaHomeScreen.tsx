import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
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
    <div className={`w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6 ${className}`}>
      {/* Marco móvil responsivo */}
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">

        {/* Tab 1: INICIO (Ruta de hoy) */}
        {activeNavTab === 'inicio' && (
          <div className="w-full flex flex-col">
            {/* Header Azul con Total a Recaudar Hoy */}
            <div className="relative w-full bg-[#363CB1] text-white pt-[calc(max(0.75rem,env(safe-area-inset-top))+0.5rem)] pb-10 px-5 sm:px-6 select-none">
              <div className="flex items-center justify-between pb-4">
                <EnlaceLogo />
                <Avatar initials="LM" />
              </div>

              <div className="flex flex-col items-center justify-center pt-1 pb-5 text-center">
                <span className="text-sm sm:text-base font-normal text-blue-100/90 tracking-wide">
                  Total a recaudar hoy
                </span>
                <h1 className="text-3xl sm:text-[36px] font-extrabold text-white tracking-tight mt-1">
                  {totalARecaudar}
                </h1>
              </div>

              {/* Onda decorativa curva */}
              <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
                <svg
                  viewBox="0 0 500 48"
                  preserveAspectRatio="none"
                  className="relative block w-full h-7 sm:h-9 text-white fill-white"
                >
                  <path d="M0,0 C150,46 350,46 500,0 L500,48 L0,48 Z" />
                </svg>
              </div>
            </div>

            {/* Contenido principal: Ruta de hoy */}
            <div className="px-5 py-3 flex flex-col gap-3.5">
              <h2 className="text-lg font-bold text-[#1B2075] tracking-tight">
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
                      ? 'bg-[#363CB1] text-white shadow-xs'
                      : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200'
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
                      ? 'bg-[#363CB1] text-white shadow-xs'
                      : 'bg-[#f3f4f6] text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon name="circle-check" size={17} stroke={2.2} />
                  <span>Visitados ({visitados.length})</span>
                </motion.button>
              </div>

              {/* Barra de búsqueda estándar */}
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

        {/* Tab 2: MOVIMIENTOS */}
        {activeNavTab === 'movimientos' && (
          <div className="flex-1 flex flex-col p-5">
            <h1 className="text-xl font-bold text-[#1B2075] mb-2">Mis Recaudos</h1>
            <p className="text-xs text-slate-500 mb-4">
              Historial de cobros recaudados en la jornada
            </p>
            <div className="flex flex-col gap-3">
              {visitados.map((tienda) => (
                <TiendaRutaCard key={`mov-${tienda.id}`} tienda={tienda} />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: NOTIFICACIONES */}
        {activeNavTab === 'notificaciones' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#363CB1] flex items-center justify-center mb-3">
              <Icon name="bell" size={26} />
            </div>
            <h2 className="text-base font-bold text-slate-800">Notificaciones</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-[240px]">
              Aquí recibirás avisos de nuevos cobros asignados y confirmaciones de pago Bre-B.
            </p>
          </div>
        )}

        {/* Barra de Navegación Inferior */}
        <TransportistaBottomNav
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
        />
      </div>
    </div>
  );
};
