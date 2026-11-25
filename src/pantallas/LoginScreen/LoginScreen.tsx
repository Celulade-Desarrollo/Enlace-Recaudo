import React, { useState } from 'react';
import { motion } from 'motion/react';
import { EnlaceLogo } from '../../components/atoms/Logo/EnlaceLogo';
import { Icon } from '../../components/atoms/Icon/Icon';
import { useAuth } from '../../context/AuthContext';

export const LoginScreen: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password.trim()) {
            setError('Ingresa usuario y contraseña');
            return;
        }

        setLoading(true);

        setTimeout(() => {
            const ok = login(username, password);
            if (!ok) {
                setError('Usuario o contraseña incorrectos');
            }
            setLoading(false);
        }, 600);
    };

    return (
        <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
            <div className="w-full max-w-[430px] min-h-dvh sm:min-h-[850px] bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-hidden sm:rounded-[36px] border-0 sm:border sm:border-slate-200">

                <div
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
                        <div className="text-center">
                            <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                Enlace Recaudo
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Formulario de login */}
                <div className="flex-1 flex flex-col px-6 pt-8 pb-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-[#1B2075] tracking-tight">
                            Iniciar Sesión
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Ingresa tus credenciales para continuar
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Campo Usuario */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 pl-1">
                                Usuario
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="user" size={18} stroke={2} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                                    placeholder="Ej: transportista"
                                    autoComplete="username"
                                    className="w-full bg-[#f3f4f6] text-[#1B2075] placeholder-slate-400 text-base rounded-xl py-3.5 pl-11 pr-4 outline-none focus:bg-white focus:ring-2 focus:ring-[#363CB1]/20 border border-transparent focus:border-[#363CB1]/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* Campo Contraseña */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-slate-600 pl-1">
                                Contraseña
                            </label>
                            <div className="relative flex items-center">
                                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Icon name="lock" size={18} stroke={2} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-[#f3f4f6] text-[#1B2075] placeholder-slate-400 text-base rounded-xl py-3.5 pl-11 pr-12 outline-none focus:bg-white focus:ring-2 focus:ring-[#363CB1]/20 border border-transparent focus:border-[#363CB1]/30 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                >
                                    <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} stroke={2} />
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-2 bg-red-50 text-red-600 text-xs font-medium px-4 py-2.5 rounded-xl border border-red-100"
                            >
                                <Icon name="alert-circle" size={16} stroke={2.2} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Botón Login */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className={`w-full h-13 rounded-full text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer select-none mt-2 ${loading
                                ? 'bg-[#2F3CB3]/70 cursor-not-allowed'
                                : 'bg-[#2F3CB3] hover:bg-[#252fa0] active:bg-[#1e2788]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Ingresando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Ingresar</span>
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Footer hint */}
                    <div className="mt-auto pt-8 text-center">
                        <p className="text-[11px] text-slate-400">
                            ¿Problemas para ingresar? Contacta al administrador
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

