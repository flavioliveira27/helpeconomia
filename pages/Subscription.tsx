
import React from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { CheckCircle, Lock, Monitor, Smartphone, TrendingUp, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';

export const Subscription: React.FC = () => {
    const { logout } = useFinancial();
    const navigate = useNavigate();

    // TO DO: Replace with real Kiwify checkout link provided by user
    const CHECKOUT_LINK = "https://pay.kiwify.com.br/fd1CH7l";

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col transition-colors duration-300 relative">
            <ThemeToggle />

            {/* Header */}
            <div className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
                <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-400">
                    HelpEconomia
                </div>
                <button
                    onClick={() => { logout(); navigate('/login'); }}
                    className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                >
                    Sair / Entrar com outra conta
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">

                    {/* Left: Value Prop */}
                    <div className="space-y-8">
                        <div>
                            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-full text-xs font-bold tracking-wider mb-4 border border-red-200 dark:border-red-500/20">
                                ACESSO BLOQUEADO
                            </span>
                            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 text-slate-900 dark:text-white">
                                Seu período de teste <span className="text-blue-600 dark:text-blue-400">acabou.</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Continue controlando suas finanças com a plataforma mais inteligente do mercado. Assine agora e desbloqueie tudo.
                            </p>
                        </div>

                        <ul className="space-y-4">
                            {[
                                "Dashboard Financeiro Completo",
                                "Inteligência Artificial (Consultor 24h/dia)",
                                "Relatórios em PDF e Excel",
                                "Controle de Investimentos",
                                "Acesso em todos os dispositivos"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Right: Pricing Card */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 relative shadow-2xl dark:shadow-slate-900/50 overflow-hidden transition-colors duration-300">
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl shadow-md">
                            OFERTA ESPECIAL
                        </div>

                        <div className="text-center mb-8">
                            <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium">Assinatura Mensal</p>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-lg text-slate-400 line-through font-medium">R$ 39,90</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl text-slate-400">R$</span>
                                    <span className="text-5xl font-bold text-slate-900 dark:text-white">14,90</span>
                                </div>
                                <span className="text-slate-500 self-end mb-2">/mês</span>
                            </div>
                        </div>

                        <a
                            href={CHECKOUT_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl text-center shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] mb-4"
                        >
                            Assinar Agora
                        </a>

                        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-6">
                            Cancelamento a qualquer momento. Compra segura via Kiwify.
                        </p>

                        <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                            <div className="text-center">
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Já realizou o pagamento?</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold flex items-center justify-center gap-2 w-full transition-colors"
                                >
                                    <CreditCard size={16} />
                                    Verificar Assinatura
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

