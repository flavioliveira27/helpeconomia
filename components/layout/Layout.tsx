import React, { useState } from 'react';
import { useFinancial } from '../../contexts/FinancialContext';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useFinancial();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200 transition-colors duration-300 min-h-screen font-sans">
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 flex flex-col p-6 gap-8 fixed top-0 left-0 h-full z-20 overflow-y-auto no-print transition-colors duration-300">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-primary p-2 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
              <span className="material-icons-round text-white text-2xl">account_balance_wallet</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">HelpEconomia</h1>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              to="/"
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
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/reports')
                ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
            >
              <span className="material-icons-round">insert_chart</span>
              Relatórios
            </Link>

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/users"
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-semibold ${isActive('/admin/users')
                  ? 'bg-pastel-sky dark:bg-slate-800 text-primary'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="material-icons-round">group</span>
                Usuários
              </Link>
            )}
          </nav>

          <div className="mt-auto space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-colors">
              <div className="w-10 h-10 bg-pastel-mint dark:bg-teal-900 rounded-full flex items-center justify-center text-teal-600 dark:text-teal-300 font-bold">
                {user?.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold truncate">{user?.name}</p>
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
        <main className="flex-1 ml-72 p-10 print:ml-0 print:p-0 bg-background-light dark:bg-background-dark transition-colors duration-300 min-h-screen">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in print:max-w-none">
            {children}
          </div>
        </main>
      </div>


    </div>
  );
};