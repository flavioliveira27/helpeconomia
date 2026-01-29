import React, { useState } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { Wallet, LogIn, Lock, Mail } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useFinancial();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Credenciais inválidas. Verifique seu email e senha.');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-accent text-white mb-4">
            <Wallet size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">FinanSmart</h1>
          <p className="text-slate-500 mt-2">Acesse sua conta para continuar.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all bg-slate-600 text-white placeholder-slate-400"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-300">
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all bg-slate-600 text-white placeholder-slate-400"
                placeholder="Sua senha secreta"
              />
            </div>
          </div>

          {error && (
            <div className="text-rose-500 text-sm text-center bg-rose-50 py-2 rounded-lg border border-rose-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-accent hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-all transform active:scale-95 shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <LogIn size={20} />
            Entrar
          </button>

          <p className="text-xs text-center text-slate-400 mt-4">
            Esqueceu a senha? Contate o administrador.
          </p>
        </form>
      </div>
    </div>
  );
};