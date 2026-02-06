
import React, { useState } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { Wallet, UserPlus, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const Register: React.FC = () => {
    const { register } = useFinancial();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password);
            navigate('/trial-started');
        } catch (err: any) {
            console.error(err);
            // handle API errors
            setError(err.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center p-4 relative">
            <ThemeToggle />

            <div className="bg-white dark:bg-white/5 dark:backdrop-blur-lg border border-slate-200 dark:border-white/10 max-w-md w-full rounded-2xl shadow-xl dark:shadow-2xl p-8 relative overflow-hidden transition-all duration-300">
                {/* Decorative Elements - Adjusted for both themes */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-accent/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="text-center mb-8 relative z-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 text-white mb-4 shadow-lg shadow-blue-500/30">
                        <Wallet size={28} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Crie sua Conta</h1>
                    <p className="text-slate-500 dark:text-slate-400">Comece seus 7 dias grátis hoje.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <UserIcon size={18} />
                            </div>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                placeholder="Nome Completo"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                placeholder="seu@email.com"
                            />
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
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                                placeholder="Senha"
                            />
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
                                placeholder="Confirme a Senha"
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
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold py-3.5 rounded-xl transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <UserPlus size={20} />
                                Criar Conta Grátis
                            </>
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <span className="text-slate-500 dark:text-slate-400 text-sm">Já tem uma conta? </span>
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 font-medium text-sm transition-colors">Fazer Login</Link>
                    </div>

                </form>
            </div>
        </div>
    );
};

