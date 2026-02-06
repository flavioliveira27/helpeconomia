
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, KeyRound } from 'lucide-react';
import { apiService } from '../services/apiService';
import { ThemeToggle } from '../components/ThemeToggle';

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }
        if (!token) {
            setError('Token inválido ou ausente.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await apiService.resetPassword(token, password);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha. Link inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center p-4 relative">
            <ThemeToggle />

            <div className="bg-white dark:bg-white/5 dark:backdrop-blur-lg border border-slate-200 dark:border-white/10 max-w-md w-full rounded-2xl shadow-xl dark:shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white mb-4 shadow-lg shadow-blue-500/30">
                        <KeyRound size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Nova Senha</h1>
                    <p className="text-slate-500 dark:text-slate-400">Crie uma nova senha segura para sua conta</p>
                </div>

                {success ? (
                    <div className="text-center space-y-6 relative z-10 animate-fade-in-up">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 flex flex-col items-center">
                            <CheckCircle size={48} className="text-emerald-400 mb-3" />
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sucesso!</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                Sua senha foi redefinida com sucesso. Você já pode fazer login.
                            </p>
                        </div>
                        <button
                            onClick={handleGoToLogin}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                        >
                            Ir para Login
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 relative z-10">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                        placeholder="Nova senha"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                        <Lock size={18} />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                        placeholder="Confirme a senha"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 text-sm bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg border border-rose-200 dark:border-rose-500/20">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? 'Processando...' : 'Redefinir Senha'}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

