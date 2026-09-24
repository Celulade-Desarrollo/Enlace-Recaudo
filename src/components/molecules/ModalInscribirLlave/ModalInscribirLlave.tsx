import React, { useState, useEffect } from 'react';
import { bancosService, type Banco, type MedioDePago } from '../../../services/bancosService';
import { Icon } from '../../atoms/Icon/Icon';

interface ModalInscribirLlaveProps {
  isOpen: boolean;
  onClose: () => void;
  onLlaveInscrita: (nueva: MedioDePago) => void;
}

export const ModalInscribirLlave: React.FC<ModalInscribirLlaveProps> = ({
  isOpen,
  onClose,
  onLlaveInscrita
}) => {
  const [bancos, setBancos] = useState<Banco[]>([]);
  const [selectedBanco, setSelectedBanco] = useState<Banco | null>(null);
  const [valorLlave, setValorLlave] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    bancosService.getBancos().then((data) => {
      setBancos(data);
      if (data.length > 0) {
        setSelectedBanco((prev) => prev || data[0]);
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBanco) {
      setError('Por favor selecciona una entidad financiera.');
      return;
    }
    if (!valorLlave.trim()) {
      setError('Por favor ingresa el número o identificador de tu llave.');
      return;
    }

    setLoading(true);
    try {
      const nueva = await bancosService.inscribirLlave(selectedBanco, valorLlave.trim());
      onLlaveInscrita(nueva);
      setValorLlave('');
      onClose();
    } catch {
      setError('Error al inscribir la llave. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-slate-900 text-lg">Inscribir nueva llave</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Icon name="x" size={20} stroke={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {/* Selección de Banco desde SEMIAPI */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Entidad financiera o billetera
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {bancos.map((banco) => (
                <button
                  key={banco.id}
                  type="button"
                  onClick={() => setSelectedBanco(banco)}
                  className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${selectedBanco?.id === banco.id
                    ? 'border-[#1B2075] bg-[#eef0fc]/60 text-[#1B2075] font-bold ring-1 ring-[#1B2075]'
                    : 'border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                >
                  <div className="w-6 h-6 rounded-md overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={banco.icono}
                      alt={banco.nombre}
                      className={`object-contain ${
                        banco.id === 'nequi' || banco.icono.includes('nequi')
                          ? 'w-4 h-4'
                          : 'w-full h-full'
                      }`}
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

          {/* Input de llave (celular o cédula) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Número de llave (Celular / Documento / Correo)
            </label>
            <input
              type="text"
              value={valorLlave}
              onChange={(e) => setValorLlave(e.target.value)}
              placeholder="Ej: 311 387 7395"
              className="w-full bg-[#f3f4f6] text-[#1B2075] placeholder-slate-400 text-sm rounded-xl py-3 px-3.5 border border-transparent focus:bg-white focus:ring-2 focus:ring-[#363CB1]/20 focus:border-[#363CB1]/30 outline-none transition-all"
            />
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-[#2F399B] hover:bg-[#252e80] text-white font-bold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Inscribir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
