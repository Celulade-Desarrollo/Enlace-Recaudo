import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'motion/react';
import { facturasService, type DetalleFactura } from '../../services/facturasService';
import { Icon } from '../../components/atoms/Icon/Icon';
import { EnlaceLogo } from '../../components/atoms/Logo/EnlaceLogo';
import { Avatar } from '../../components/atoms/Avatar/Avatar';
import { SearchBar } from '../../components/molecules/SearchBar/SearchBar';
import type { DatosTransaccion } from '../../types/transaccion';

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
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

interface MovimientosScreenProps {
  onBackToHome?: () => void;
  onSelectMovimiento?: (datos: DatosTransaccion) => void;
  className?: string;
}

// Logotipos oficiales de proveedores establecidos en el proyecto base
const getLogoProveedor = (empresa: string): string => {
  const nombre = empresa.toLowerCase();
  if (nombre.includes('alpina')) return '/Alpina.png';
  if (nombre.includes('nutresa')) return '/Nutresa.png';
  if (nombre.includes('postob')) return '/postobon.svg';
  return '/enlacelogo.png';
};

export const MovimientosScreen: React.FC<MovimientosScreenProps> = ({
  onBackToHome,
  onSelectMovimiento,
  className = ''
}) => {
  const navigate = useNavigate();
  const [movimientos, setMovimientos] = useState<DetalleFactura[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEmpresa, setFiltroEmpresa] = useState<string>('todos');

  // Cargar lista de movimientos realizados
  useEffect(() => {
    const lista = facturasService.getMovimientosRealizados();
    setMovimientos(lista);
  }, []);

  // Calcular total pagado
  const totalPagadoNum = useMemo(() => {
    return movimientos.reduce((acc, m) => {
      const num = parseInt(m.valor.replace(/\D/g, ''), 10) || 0;
      return acc + num;
    }, 0);
  }, [movimientos]);

  const totalPagadoFormateado = useMemo(() => {
    return `$${totalPagadoNum.toLocaleString('es-CO')}`;
  }, [totalPagadoNum]);

  // Filtrado simple por texto o proveedor
  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const coincideBusqueda =
        m.empresa.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.idFactura.toLowerCase().includes(busqueda.toLowerCase()) ||
        m.referenciaPago.toLowerCase().includes(busqueda.toLowerCase());

      const coincideEmpresa =
        filtroEmpresa === 'todos' ||
        m.empresa.toLowerCase().includes(filtroEmpresa.toLowerCase());

      return coincideBusqueda && coincideEmpresa;
    });
  }, [movimientos, busqueda, filtroEmpresa]);

  const handleVerComprobante = (item: DetalleFactura) => {
    const datosTransaccion: DatosTransaccion = {
      idFactura: item.idFactura,
      valor: item.valor,
      subtotal: item.subtotal,
      iva: item.iva,
      empresa: item.empresa,
      nitEmpresa: item.nitEmpresa,
      pagador: item.pagador,
      nitPagador: item.nitPagador,
      medioPago: item.medioPago,
      fechaHora: item.fechaHora,
      referenciaPago: item.referenciaPago
    };

    if (onSelectMovimiento) {
      onSelectMovimiento(datosTransaccion);
    } else {
      navigate('/transaccion', { state: { datos: datosTransaccion, from: '/movimientos' } });
    }
  };

  return (
    <div className={`w-full flex flex-col bg-white min-h-full pb-8 ${className}`}>
      {/* Header Azul con Onda Curva idéntico al HeaderBanner del proyecto base */}
      <div className="relative w-full bg-[#363CB1] text-white pt-[calc(max(0.75rem,env(safe-area-inset-top))+0.5rem)] pb-8 px-5 sm:px-6 select-none">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                type="button"
                onClick={onBackToHome}
                className="w-8 h-8 rounded-full border border-white/80 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all cursor-pointer mr-1"
                title="Regresar a Inicio"
              >
                <Icon name="arrow-left" size={18} stroke={2.5} />
              </button>
            )}
            <EnlaceLogo />
          </div>
          <Avatar initials="LM" />
        </div>

        <div className="text-center pt-2 pb-5">
          <h1 className="text-2xl sm:text-[28px] font-bold text-white tracking-tight">
            Mis Movimientos
          </h1>
        </div>

        {/* Onda decorativa curva que conecta directamente con el fondo blanco */}
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

      {/* Contenido principal limpio sin cards anidadas */}
      <div className="px-5 py-3 flex flex-col gap-3.5">
        {/* Resumen simple de total pagado */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <span className="text-xs text-slate-400 font-normal">Total Pagado</span>
            <div className="text-2xl sm:text-[26px] font-bold text-[#1B2075] tracking-tight">
              {totalPagadoFormateado}
            </div>
          </div>
          <span className="text-xs text-slate-400 font-normal">
            {movimientos.length} {movimientos.length === 1 ? 'pago' : 'pagos'}
          </span>
        </div>

        {/* Barra de búsqueda reutilizando el componente estándar del proyecto */}
        <SearchBar
          value={busqueda}
          onChange={setBusqueda}
          placeholder="Buscar movimiento"
        />

        {/* Filtros sutiles sin saturación de colores */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'alpina', label: 'Alpina' },
            { id: 'nutresa', label: 'Nutresa' },
            { id: 'postob', label: 'Postobón' }
          ].map((filtro) => {
            const activo = filtroEmpresa === filtro.id;
            return (
              <motion.button
                key={filtro.id}
                type="button"
                whileTap={{ scale: 0.94 }}
                transition={{ duration: 0.12 }}
                onClick={() => setFiltroEmpresa(filtro.id)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-colors cursor-pointer select-none ${
                  activo
                    ? 'bg-[#1B2075] text-white'
                    : 'bg-[#f3f4f6] text-slate-600 hover:bg-slate-200'
                }`}
              >
                {filtro.label}
              </motion.button>
            );
          })}
        </div>

        {/* Lista de movimientos animada con el mismo estilo y tipografía de InvoiceCard */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3 mt-1"
        >
          {movimientosFiltrados.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-500 font-medium">
                {busqueda
                  ? `No se encontraron movimientos para "${busqueda}"`
                  : 'Aún no se han registrado pagos'}
              </p>
            </div>
          ) : (
            movimientosFiltrados.map((mov) => {
              const logoComercio = getLogoProveedor(mov.empresa);

              return (
                <motion.div
                  key={mov.idFactura}
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -1 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleVerComprobante(mov)}
                  className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-slate-200 transition-all cursor-pointer select-none"
                >
                  {/* Lado izquierdo: Logo circular y textos principales */}
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-2xs border border-slate-100/80 bg-white">
                      <img
                        src={logoComercio}
                        alt={mov.empresa}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <h3 className="text-[15px] font-bold text-slate-900 truncate leading-snug tracking-tight">
                        {mov.empresa}
                      </h3>
                      <div className="text-xs text-slate-500 truncate mt-0.5">
                        <span>Factura #{mov.idFactura}</span>
                        <span className="mx-1.5">•</span>
                        <span>{mov.fechaHora}</span>
                      </div>
                    </div>
                  </div>

                  {/* Lado derecho: Estado y Saldo */}
                  <div className="flex flex-col items-end shrink-0 text-right">
                    <span className="text-[11px] text-slate-400 font-normal">
                      Aprobado
                    </span>
                    <span className="text-base sm:text-[17px] font-extrabold text-[#1B2075] tracking-tight leading-snug mt-0.5">
                      {mov.valor}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};
