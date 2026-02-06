
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Gift } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

export const TrialSuccess: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex items-center justify-center p-4 relative">
            <ThemeToggle />

            <div className="max-w-lg w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 relative overflow-hidden animate-fade-in transition-colors duration-300">
                {/* Confetti effect background (simplified with CSS for now) */}
                <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100 via-white/0 to-white/0 dark:from-blue-900/30"></div>

                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/30 animate-bounce-slow">
                    <Gift size={48} className="text-white" />
                </div>

                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Parabéns!</h1>
                <h2 className="text-xl text-emerald-600 dark:text-emerald-400 font-semibold mb-6">Você ganhou 7 dias grátis!</h2>

                <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                    Sua conta foi criada com sucesso e seu período de teste premium já começou.
                    Aproveite todas as funcionalidades exclusivas do <span className="text-slate-900 dark:text-white font-bold">HelpEconomia</span>.
                </p>

                <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        <span>Acessar Dashboard Completo</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                        <span>Insights com Inteligência Artificial</span>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    Começar Agora
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};
