import React, { useState } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { Lock, Mail, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { ThemeToggle } from '../components/ThemeToggle';


// IMPORTANT: Replace with your actual Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "338319745775-7opn7df88uvqd8suu35pul17qgttsp29.apps.googleusercontent.com";

const LoginForm = () => {
  const { login, googleLogin } = useFinancial();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/');
      } else {
        if (result.code === 'SUBSCRIPTION_REQUIRED') {
          navigate('/subscription');
        } else {
          setError(result.error || 'Credenciais inválidas.');
        }
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      setLoading(true);
      const result = await googleLogin(credentialResponse.credential);
      setLoading(false);

      if (result.success) {
        if ((result as any).isNewUser) {
          navigate('/trial-started');
        } else {
          navigate('/');
        }
      } else {
        if (result.code === 'SUBSCRIPTION_REQUIRED') {
          navigate('/subscription');
        } else {
          setError(result.error || 'Falha no Login Google');
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-slate-900">

      {/* Background Gradients */}
      <style>{`
        .bg-grid-pattern {
            background-size: 50px 50px;
            background-image: 
                linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
            mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
            -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 85%);
        }
        @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        @keyframes pulse-slow {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 6s ease-in-out 3s infinite; }
        .animate-pulse-slow { animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* New Background Structure */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 dark:from-[#020617] dark:via-[#0f172a] dark:to-[#1e1b4b]"></div>
        {/* Simplified Background for Mobile Performance */}
        <div className="absolute top-[-10%] left-[-10%] w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-3xl md:blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow will-change-transform"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[20rem] md:w-[40rem] h-[20rem] md:h-[40rem] bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-3xl md:blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse-slow will-change-transform" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 md:opacity-100"></div>
        {/* Reduced decorative elements */}
        <div className="hidden md:block absolute top-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
        <div className="hidden md:block absolute bottom-[20%] right-0 w-2/3 h-[1px] bg-gradient-to-l from-transparent via-purple-500/20 to-transparent rotate-12"></div>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-[380px] bg-white dark:bg-slate-800 border border-white dark:border-slate-700 rounded-[24px] shadow-2xl p-6 md:p-8 relative z-10 transition-colors duration-300">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
            <span className="material-icons-round text-white text-4xl">account_balance_wallet</span>
          </div>
          <h1 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Bem-vindo</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Faça login para gerenciar suas finanças</p>
        </div>

        <div className="space-y-5">
          {/* Google Login - Centered and Styled */}
          <div className="flex justify-center w-full">
            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Login failed')}
                theme="filled_blue"
                size="large"
                text="signin_with"
                shape="pill"
                logo_alignment="left"
              />
            </div>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <div className="border-t w-full border-slate-100 dark:border-slate-700"></div>
            <span className="bg-transparent px-3 text-[11px] uppercase tracking-wider font-medium absolute text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800">
              ou continue com email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              {/* Email Input */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  placeholder="seu@email.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <Link to="/forgot-password" className="text-xs font-medium hover:underline text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                    Esqueceu a senha?
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-xs bg-rose-50 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-100 dark:border-rose-500/20 animate-fade-in">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-all transform active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="text-center pt-1">
            <span className="text-xs text-slate-500 dark:text-slate-400">Não tem conta? </span>
            <Link to="/register" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold text-xs transition-colors hover:underline">Cadastre-se Grátis</Link>
          </div>
        </div>
      </div>

      {/* Theme Toggle Details */}
      <ThemeToggle />

    </div>
  );
};

export const Login: React.FC = () => {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginForm />
    </GoogleOAuthProvider>
  );
};