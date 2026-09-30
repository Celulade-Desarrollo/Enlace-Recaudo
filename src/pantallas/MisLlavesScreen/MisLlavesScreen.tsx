import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { bancosService, type MedioDePago } from '../../services/bancosService';
import { PaymentTopHeader } from '../../components/organisms/PaymentTopHeader/PaymentTopHeader';
import { BottomNavigation, type TabType } from '../../components/organisms/BottomNavigation/BottomNavigation';
import { ModalInscribirLlave } from '../../components/molecules/ModalInscribirLlave/ModalInscribirLlave';
import { ModalEditarLlave } from '../../components/molecules/ModalEditarLlave/ModalEditarLlave';
import { Icon } from '../../components/atoms/Icon/Icon';

interface MisLlavesScreenProps {
  onBackToHome?: () => void;
  className?: string;
}

export const MisLlavesScreen: React.FC<MisLlavesScreenProps> = ({
  onBackToHome,
  className = ''
}) => {
  const navigate = useNavigate();
  const [llaves, setLlaves] = useState<MedioDePago[]>([]);
  const [isModalInscribirOpen, setIsModalInscribirOpen] = useState(false);
  const [llaveAEditar, setLlaveAEditar] = useState<MedioDePago | null>(null);
  const [llaveAEliminar, setLlaveAEliminar] = useState<MedioDePago | null>(null);
  const [llaveCopiadaId, setLlaveCopiadaId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [toastMensaje, setToastMensaje] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const menuRef = useRef<HTMLDivElement | null>(null);

  // Cargar llaves inscritas
  useEffect(() => {
    bancosService
      .getLlaves()
      .then((data) => {
        setLlaves(data);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Cerrar menú contextual al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const showToast = (mensaje: string) => {
    setToastMensaje(mensaje);
    setTimeout(() => {
      setToastMensaje((prev) => (prev === mensaje ? null : prev));
    }, 2400);
  };

  const handleBack = () => {
    if (onBackToHome) {
      onBackToHome();
    } else {
      navigate('/');
    }
  };

  // Copiar valor de la llave
  const handleCopiarLlave = (id: string, valor?: string) => {
    if (!valor) return;
    const cleanVal = valor.replace(/\s+/g, '');
    navigator.clipboard.writeText(cleanVal).catch(() => {});
    setLlaveCopiadaId(id);
    showToast('Llave copiada');
    setTimeout(() => {
      setLlaveCopiadaId((prev) => (prev === id ? null : prev));
    }, 2000);
  };

  // Establecer como llave principal
  const handleSetPrincipal = async (id: string) => {
    setOpenMenuId(null);
    try {
      const updated = await bancosService.setLlavePrincipal(id);
      setLlaves(updated);
      showToast('Llave principal actualizada');
    } catch {
      showToast('No se pudo actualizar la llave principal');
    }
  };

  // Desvincular / Eliminar llave
  const handleConfirmEliminar = async () => {
    if (!llaveAEliminar) return;
    try {
      const updated = await bancosService.eliminarLlave(llaveAEliminar.id);
      setLlaves(updated);
      showToast('Llave eliminada');
      setLlaveAEliminar(null);
    } catch {
      showToast('Error al eliminar la llave');
    }
  };

  // Nueva llave inscrita
  const handleNuevaLlaveInscrita = (nueva: MedioDePago) => {
    setLlaves((prev) => [nueva, ...prev.filter((k) => k.id !== nueva.id)]);
    showToast('Llave inscrita con éxito');
  };

  // Actualización tras edición
  const handleLlaveActualizada = (updatedList: MedioDePago[]) => {
    setLlaves(updatedList);
    showToast('Llave actualizada');
  };

  const handleTabChange = (tab: TabType) => {
    if (tab === 'inicio') {
      navigate('/');
    } else if (tab === 'movimientos') {
      navigate('/movimientos');
    }
  };

  return (
    <div className={`w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6 ${className}`}>
      {/* Marco de pantalla de teléfono móvil responsivo */}
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-[calc(5.5rem+env(safe-area-inset-bottom))] overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">

        {/* Cabecera superior simple con botón Volver */}
        <PaymentTopHeader
          title="Mis Llaves"
          onBack={handleBack}
        />

        {/* Toast flotante discreto */}
        <AnimatePresence>
          {toastMensaje && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.96 }}
              transition={{ duration: 0.18 }}
              className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
            >
              <Icon name="check" size={14} className="text-emerald-400" />
              <span>{toastMensaje}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 flex flex-col px-4 pt-4 pb-2">

          {/* Subtítulo limpio y directo */}
          <div className="mb-4">
            <h1 className="text-base font-bold text-slate-900">
              Tus llaves activas ({llaves.length})
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Usa tus llaves vinculadas para recibir transferencias directas a tus cuentas bancarias.
            </p>
          </div>

          {/* Contenido: Lista de Llaves */}
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-[#2F399B] border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Cargando...</span>
            </div>
          ) : llaves.length > 0 ? (
            <div className="flex flex-col gap-3">
              {llaves.map((llave) => {
                const esCopiada = llaveCopiadaId === llave.id;
                const isMenuOpen = openMenuId === llave.id;

                const tipoLabel =
                  llave.tipoLlave === 'celular'
                    ? 'Celular'
                    : llave.tipoLlave === 'documento'
                    ? 'Cédula'
                    : llave.tipoLlave === 'correo'
                    ? 'Correo'
                    : 'Llave';

                return (
                  <div
                    key={llave.id}
                    className="relative bg-white rounded-2xl p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col transition-all"
                  >
                    {/* Fila principal */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Logo y datos */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                          <img
                            src={llave.icono}
                            alt={llave.nombre}
                            className={`object-contain ${
                              llave.bancoId === 'nequi' || llave.icono.includes('nequi')
                                ? 'w-6 h-6'
                                : 'w-full h-full p-1'
                            }`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900 truncate">
                              {llave.nombre}
                            </span>
                            {llave.esPrincipal && (
                              <span className="text-[10px] font-semibold text-[#1B2075] bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                                Principal
                              </span>
                            )}
                          </div>

                          <span className="text-base font-bold text-slate-800 tracking-tight mt-0.5 font-sans">
                            {llave.valorLlave}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            Llave {tipoLabel}
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción a la derecha */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Botón de copiar por afuera (como solicitó el usuario) */}
                        <button
                          type="button"
                          onClick={() => handleCopiarLlave(llave.id, llave.valorLlave)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                            esCopiada
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                          title="Copiar llave"
                        >
                          <Icon
                            name={esCopiada ? 'check' : 'copy'}
                            size={14}
                            stroke={2.2}
                            className={esCopiada ? 'text-emerald-600' : 'text-slate-500'}
                          />
                          <span>{esCopiada ? 'Copiada' : 'Copiar'}</span>
                        </button>

                        {/* Menú de punticos para borrar o editar */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : llave.id);
                            }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                              isMenuOpen
                                ? 'bg-slate-100 text-slate-900'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                            title="Opciones"
                          >
                            <Icon name="dots-vertical" size={17} stroke={2.2} />
                          </button>

                          {/* Dropdown del menú de punticos */}
                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                ref={menuRef}
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-30 overflow-hidden"
                              >
                                {/* Editar */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setLlaveAEditar(llave);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Icon name="pencil" size={14} stroke={2} className="text-slate-500" />
                                  <span>Editar llave</span>
                                </button>

                                {/* Marcar como principal (si no lo es) */}
                                {!llave.esPrincipal && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleSetPrincipal(llave.id);
                                    }}
                                    className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
                                  >
                                    <Icon name="star" size={14} stroke={2} className="text-amber-500" />
                                    <span>Hacer principal</span>
                                  </button>
                                )}

                                <div className="my-1 border-t border-slate-100" />

                                {/* Borrar / Desvincular */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    setLlaveAEliminar(llave);
                                  }}
                                  className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Icon name="trash" size={14} stroke={2} className="text-rose-500" />
                                  <span>Desvincular</span>
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Estado vacío */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 my-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-3">
                <Icon name="key" size={24} stroke={2} />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                No tienes llaves inscritas
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-4">
                Inscribe tu número de celular o documento para recibir transferencias inmediatas.
              </p>
              <button
                type="button"
                onClick={() => setIsModalInscribirOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#2F399B] text-white text-xs font-bold hover:bg-[#252e80] cursor-pointer"
              >
                Inscribir primera llave
              </button>
            </div>
          )}

          {/* Botón simple para inscribir nueva llave */}
          {llaves.length > 0 && (
            <button
              type="button"
              onClick={() => setIsModalInscribirOpen(true)}
              className="mt-4 w-full py-3.5 rounded-full bg-[#2F399B] hover:bg-[#252e80] text-white font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
            >
              <Icon name="plus" size={16} stroke={2.5} />
              <span>Inscribir nueva llave</span>
            </button>
          )}

        </div>

        {/* Modal de Inscripción */}
        <ModalInscribirLlave
          isOpen={isModalInscribirOpen}
          onClose={() => setIsModalInscribirOpen(false)}
          onLlaveInscrita={handleNuevaLlaveInscrita}
        />

        {/* Modal de Edición */}
        <ModalEditarLlave
          isOpen={Boolean(llaveAEditar)}
          llave={llaveAEditar}
          onClose={() => setLlaveAEditar(null)}
          onLlaveActualizada={handleLlaveActualizada}
        />

        {/* Modal de Confirmación para Desvincular */}
        <AnimatePresence>
          {llaveAEliminar && (
            <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100"
              >
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <Icon name="trash" size={20} stroke={2} />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ¿Desvincular esta llave?
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  Se desvinculará la llave <strong className="text-slate-800">{llaveAEliminar.valorLlave}</strong> de {llaveAEliminar.nombre}. Podrás volver a agregarla cuando quieras.
                </p>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setLlaveAEliminar(null)}
                    className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmEliminar}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Desvincular
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Barra de navegación inferior */}
        <BottomNavigation
          activeTab="inicio"
          onTabChange={handleTabChange}
        />

      </div>
    </div>
  );
};
