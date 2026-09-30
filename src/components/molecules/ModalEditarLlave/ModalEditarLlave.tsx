import React, { useState, useEffect } from 'react';
import { bancosService, type Banco, type MedioDePago, type TipoLlave } from '../../../services/bancosService';
import { Icon } from '../../atoms/Icon/Icon';

interface ModalEditarLlaveProps {
  isOpen: boolean;
  llave: MedioDePago | null;
  onClose: () => void;
  onLlaveActualizada: (llaves: MedioDePago[]) => void;
}

export const ModalEditarLlave: React.FC<ModalEditarLlaveProps> = ({
  isOpen,
  llave,
  onClose,
  onLlaveActualizada
}) => {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);
  const [tipoLlave, setTipoLlave] = useState<TipoLlave>('celular');
  const [valorLlave, setValorLlave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !llave) return;

    bancosService.getBancos().then((data) => {
      setBancos(data);
      const bancoActual = data.find((b) => b.id === llave.bancoId) || null;
      setSelectedBanco(bancoActual);
    });

    setTipoLlave(llave.tipoLlave || 'celular');
    setValorLlave(llave.valorLlave || '');
    setError('');
  }, [isOpen, llave]);

  if (!isOpen || !llave) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valorLlave.trim()) {
      setError('Por favor ingresa el número o identificador de tu llave.');
      return;
    }

    setLoading(true);
    try {
      const updated = await bancosService.editarLlave(llave.id, {
        valorLlave: valorLlave.trim(),
        tipoLlave,
        banco: selectedBanco || undefined
      });
      onLlaveActualizada(updated);
      onClose();
    } catch {
      setError('Error al actualizar la llave. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (tipoLlave) {
      case 'celular':
        return 'Ej: 311 387 7395';
      case 'documento':
        return 'Ej: 1020345678';
      case 'correo':
        return 'Ej: mi.cuenta@correo.com';
      default:
        return 'Número o identificador';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Icon name="pencil" size={16} stroke={2.2} />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Editar llave</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Icon name="x" size={18} stroke={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Entidad Financiera */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Entidad financiera
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {bancos.map((banco) => (
                <button
                  key={banco.id}
                  type="button"
                  onClick={() => setSelectedBanco(banco)}
                  className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                    selectedBanco?.id === banco.id
                      ? 'border-[#1B2075] bg-[#eef0fc]/60 text-[#1B2075] font-bold ring-1 ring-[#1B2075]'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="w-5 h-5 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={banco.icono}
                      alt={banco.nombre}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <span className="text-xs truncate">{banco.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Tipo de Llave */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de llave
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setTipoLlave('celular')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  tipoLlave === 'celular'
                    ? 'bg-white text-[#1B2075] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon name="phone" size={13} stroke={2.5} />
                <span>Celular</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoLlave('documento')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  tipoLlave === 'documento'
                    ? 'bg-white text-[#1B2075] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon name="id" size={13} stroke={2.5} />
                <span>Cédula</span>
              </button>
              <button
                type="button"
                onClick={() => setTipoLlave('correo')}
                className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  tipoLlave === 'correo'
                    ? 'bg-white text-[#1B2075] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon name="mail" size={13} stroke={2.5} />
                <span>Correo</span>
              </button>
            </div>
          </div>

          {/* Input de llave */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {tipoLlave === 'celular'
                ? 'Número de celular'
                : tipoLlave === 'documento'
                ? 'Número de identificación'
                : 'Correo electrónico'}
            </label>
            <input
              type={tipoLlave === 'correo' ? 'email' : tipoLlave === 'celular' ? 'tel' : 'text'}
              value={valorLlave}
              onChange={(e) => setValorLlave(e.target.value)}
              placeholder={getPlaceholder()}
              className="w-full bg-[#f3f4f6] text-[#1B2075] placeholder-slate-400 text-sm rounded-xl py-2.5 px-3.5 border border-transparent focus:bg-white focus:ring-2 focus:ring-[#363CB1]/20 focus:border-[#363CB1]/30 outline-none transition-all font-medium"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#2F399B] hover:bg-[#252e80] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
