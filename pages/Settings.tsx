import React, { useState } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { Moon, Sun, User, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';

export const Settings: React.FC = () => {
    const { user, refreshUser } = useFinancial();
    const { darkMode, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'appearance'>('appearance');

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMsg(null);
        try {
            await apiService.updateProfile({ name });
            await refreshUser();
            setProfileMsg({ type: 'success', text: 'Nome atualizado com sucesso!' });
        } catch (error: any) {
            setProfileMsg({ type: 'error', text: error.message || 'Erro ao atualizar perfil' });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ type: 'error', text: 'As novas senhas não coincidem' });
            return;
        }
        setPasswordLoading(true);
        setPasswordMsg(null);
        try {
            await apiService.updateProfile({ currentPassword, newPassword });
            setPasswordMsg({ type: 'success', text: 'Senha alterada com sucesso!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setPasswordMsg({ type: 'error', text: error.message || 'Erro ao alterar senha' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Configurações</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Gerencie suas preferências e conta</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button
                        onClick={() => setActiveTab('appearance')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'appearance' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        <Sun size={20} /> Aparência
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'profile' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        <User size={20} /> Meu Perfil
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === 'security' ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                        <Lock size={20} /> Segurança
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'appearance' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Tema do Sistema</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setTheme(false)}
                                    className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${!darkMode
                                        ? 'border-primary bg-blue-50 text-primary'
                                        : 'border-slate-100 text-slate-600 hover:border-primary/50'}`}
                                >
                                    <Sun size={40} />
                                    <span className="font-semibold">Modo Claro</span>
                                </button>
                                <button
                                    onClick={() => setTheme(true)}
                                    className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 transition-all ${darkMode
                                        ? 'border-primary bg-slate-800 text-primary'
                                        : 'border-slate-800 text-slate-400 hover:border-primary/50 bg-slate-950'}`}
                                >
                                    <Moon size={40} />
                                    <span className="font-semibold">Modo Escuro</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profile' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Informações Pessoais</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nome Completo</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                {profileMsg && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {profileMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        {profileMsg.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {profileLoading ? 'Salvando...' : <><Save size={20} /> Salvar Alterações</>}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
                            <h2 className="text-xl font-bold mb-6">Alterar Senha</h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Senha Atual</label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Nova Senha</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            placeholder="Mínimo 6 caracteres"
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Confirmar Nova Senha</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                {passwordMsg && (
                                    <div className={`p-4 rounded-xl flex items-center gap-3 ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                        {passwordMsg.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                        {passwordMsg.text}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={passwordLoading}
                                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    {passwordLoading ? 'Atualizando...' : <><Lock size={20} /> Atualizar Senha</>}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
