import React, { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { Link, useLocation } from 'react-router-dom';
import { MonthSelector } from '../ui/MonthSelector';
import { generateFinancialInsights } from '../../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { formatUserName } from '../../utils/formatters';


interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout, selectedMonth, selectedYear, setSelectedMonth, filteredTransactions } = useFinancial();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleGenerateInsight = async () => {
    setAiLoading(true);
    const result = await generateFinancialInsights(filteredTransactions);
    setAiInsight(result);
    setAiLoading(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 transition-colors duration-300 min-h-screen font-sans">

      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-30 gap-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
        >
          <span className="material-icons-round text-slate-600 dark:text-slate-300">
            {isMobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        {/* Mobile: Only MonthSelector in header to save space */}
        <div className="flex items-center gap-2">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
          />
        </div>
      </div>

      <div className="flex w-full relative">
        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 
          border-r border-slate-100 dark:border-slate-800 
          flex flex-col p-6 gap-8 z-40 overflow-y-auto no-print 
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
              <span className="material-icons-round text-white text-2xl">account_balance_wallet</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">HelpEconomia</h1>
          </div>

          <nav className="flex-1 space-y-2 mt-4 lg:mt-0">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/')
                ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-icons-round">dashboard</span>
              Dashboard
            </Link>

            <Link
              to="/transactions"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/transactions')
                ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-icons-round">grid_view</span>
              Planilhas
            </Link>

            <Link
              to="/reports"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/reports')
                ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-icons-round">insert_chart</span>
              Relatórios
            </Link>

            {/* Mobile Only: AI Assistant Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsAIModalOpen(true);
              }}
              className="lg:hidden flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 w-full text-left"
            >
              <span className="material-icons-round text-primary">auto_awesome</span>
              Assistente IA
            </button>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/users"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/admin/users')
                  ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="material-icons-round">group</span>
                Usuários
              </Link>
            )}

            <Link
              to="/settings"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/settings')
                ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-icons-round">settings</span>
              Configurações
            </Link>

            {/* Theme Toggle removed from here as moved to header */}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-colors">
              {user?.photo_url ? (
                <img src={user.photo_url} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 bg-pastel-mint dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold">
                  {user?.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{formatUserName(user?.name || '')}</p>
                <p className="text-xs text-slate-500">{user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-4 py-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 w-full rounded-xl transition-all font-medium"
            >
              <span className="material-icons-round">logout</span>
              Sair
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-10 print:ml-0 print:p-0 bg-background-light dark:bg-background-dark transition-colors duration-300 min-h-screen lg:w-[calc(100%-18rem)]">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in print:max-w-none">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile AI Modal */}
      {
        isAIModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in lg:hidden">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-pastel-sky/20 to-pastel-purple/20">
                <div className="flex items-center gap-2">
                  <span className="material-icons-round text-primary text-xl">auto_awesome</span>
                  <h3 className="font-bold text-lg">Consultor IA Smart</h3>
                </div>
                <button
                  onClick={() => setIsAIModalOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <span className="material-icons-round">close</span>
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {!aiInsight && !aiLoading && (
                  <div className="text-center py-8">
                    <div className="bg-blue-50 dark:bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      <span className="material-icons-round text-3xl">psychology</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2">Análise Financeira</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                      Gere insights inteligentes baseados nas suas transações de {months[selectedMonth]}.
                    </p>
                    <button
                      onClick={handleGenerateInsight}
                      className="bg-primary hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all w-full"
                    >
                      Gerar Análise
                    </button>
                  </div>
                )}

                {aiLoading && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <span className="material-icons-round text-4xl text-primary animate-spin">refresh</span>
                    <p className="text-slate-500 font-medium">Analisando suas finanças...</p>
                  </div>
                )}

                {aiInsight && !aiLoading && (
                  <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                    <ReactMarkdown>{aiInsight}</ReactMarkdown>

                    <button
                      onClick={handleGenerateInsight}
                      className="mt-8 w-full py-3 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-icons-round">refresh</span>
                      Regerar Análise
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

    </div >
  );
};