import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { EnlaceLogo } from '../../components';

const CLAVE_RUTA = 'enlace-recaudo:ruta-recordada';

const rutas = [
    { id: 'ruta-1', nombre: 'Ruta 1' },
    { id: 'ruta-2', nombre: 'Ruta 2' },
    { id: 'ruta-3', nombre: 'Ruta 3' },
];

type Props = {
    onContinuar: (rutaId: string) => void;
};

export function SeleccionRutaScreen({ onContinuar }: Props) {
    const [rutaId, setRutaId] = useState(() => {
        const guardada = localStorage.getItem(CLAVE_RUTA);
        return rutas.find((ruta) => ruta.id === guardada)?.id ?? '';
    });
    const [recordar, setRecordar] = useState(Boolean(rutaId));
    const [cargando, setCargando] = useState(false);
    const temporizador = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (temporizador.current !== null) {
                window.clearTimeout(temporizador.current);
            }
        };
    }, []);

    const continuar: ComponentProps<'form'>['onSubmit'] = (event) => {
        event.preventDefault();
        if (!rutaId || temporizador.current !== null) return;

        setCargando(true);
        temporizador.current = window.setTimeout(() => {
            if (recordar) {
                localStorage.setItem(CLAVE_RUTA, rutaId);
            } else {
                localStorage.removeItem(CLAVE_RUTA);
            }

            onContinuar(rutaId);
        }, 4000);
    }

    return (
        <main className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
            <section className="w-full max-w-[430px] min-h-dvh sm:min-h-[850px] bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[36px] border-0 sm:border sm:border-slate-200">
                <header
                    className="w-full bg-[#2F3CB3] text-white pt-8 pb-14 px-5 select-none relative"
                    style={{
                        borderBottomLeftRadius: '50% 32px',
                        borderBottomRightRadius: '50% 32px',
                    }}
                >
                    <div className="flex flex-col items-center justify-center gap-4 pt-6">
                        <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
                            <EnlaceLogo className="h-[18px] brightness-0 invert" />
                        </div>
                        <p className="text-2xl font-extrabold text-white tracking-tight">
                            Enlace Recaudo
                        </p>
                    </div>
                </header>

                {cargando ? (
                    <div
                        role="status"
                        className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-[#1B2075]"
                    >
                        <span
                            aria-hidden="true"
                            className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-[#2F3CB3] motion-safe:animate-spin"
                        />
                        <p className="font-semibold">Cargando ruta…</p>
                    </div>
                ) : (
                    <form onSubmit={continuar} className="flex flex-col gap-4 px-6 py-8">
                        <h1 className="text-xl font-bold text-[#1B2075]">
                            Selecciona tu ruta
                        </h1>

                        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                            Ruta
                            <select
                                required
                                value={rutaId}
                                onChange={(event) => setRutaId(event.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-[#1B2075]"
                            >
                                <option value="">Selecciona una ruta</option>
                                {rutas.map((ruta) => (
                                    <option key={ruta.id} value={ruta.id}>
                                        {ruta.nombre}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input
                                type="checkbox"
                                checked={recordar}
                                onChange={(event) => setRecordar(event.target.checked)}
                                className="h-4 w-4 accent-[#2F3CB3]"
                            />
                            Recordar mi ruta
                        </label>

                        <button
                            type="submit"
                            disabled={!rutaId}
                            className="mt-2 rounded-full bg-[#2F3CB3] px-4 py-3.5 text-sm font-bold text-white disabled:opacity-50"
                        >
                            Continuar
                        </button>
                    </form>
                )}
            </section>
        </main>
    );
}