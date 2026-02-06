import React, { useState, useRef } from 'react';
import { useFinancial } from '../contexts/FinancialContext';
import { Trash2, UserPlus, Shield, User as UserIcon, Lock, Edit2, X, Save } from 'lucide-react';
import { User } from '../types';

export const AdminUsers: React.FC = () => {
    const { usersList, addUser, updateUser, removeUser, user: currentUser } = useFinancial();
    const formRef = useRef<HTMLDivElement>(null);

    // Form State
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'ADMIN' | 'USER' | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!role) {
            alert("Por favor, selecione um perfil.");
            return;
        }

        if (editingId) {
            // Update existing user
            updateUser(editingId, {
                name,
                email,
                role: role as 'ADMIN' | 'USER',
                password
            });
            resetForm();
        } else {
            // Create new user
            if (name && email && password) {
                addUser(name, email, role as 'ADMIN' | 'USER', password);
                resetForm();
            }
        }
    };

    const handleEdit = (user: User) => {
        setEditingId(user.id);
        setName(user.name);
        setEmail(user.email);
        setPassword(user.password || '');
        setRole(user.role);

        // Scroll to form
        if (formRef.current) {
            formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setEmail('');
        setPassword('');
        setRole('');
    };

    const handleRenewTrial = (user: User) => {
        if (!confirm(`Deseja adicionar 7 dias de trial para ${user.name}?`)) return;

        const now = new Date();
        const currentTrial = user.trial_ends_at ? new Date(user.trial_ends_at) : now;

        // If expired, start from NOW. If active, extend from current end date.
        // We use a small buffer (e.g. 1 minute) to avoid edge cases where they are 'just' expiring
        const baseDate = currentTrial > now ? currentTrial : now;

        const nextWeek = new Date(baseDate);
        nextWeek.setDate(nextWeek.getDate() + 7);

        updateUser(user.id, {
            ...user,
            subscription_status: 'trial',
            trial_ends_at: nextWeek.toISOString()
        });
    };

    const handleRevokeTrial = (user: User) => {
        if (!confirm(`Deseja remover o acesso de teste de ${user.name}? Ele será redirecionado para o pagamento ao logar.`)) return;

        updateUser(user.id, {
            ...user,
            subscription_status: 'inactive',
            trial_ends_at: new Date(Date.now() - 86400000).toISOString() // Set date to yesterday
        });
    };

    const handleLifetimeAccess = (user: User) => {
        if (!confirm(`Deseja conceder acesso VITALÍCIO para ${user.name}?`)) return;

        updateUser(user.id, {
            ...user,
            subscription_status: 'active',
            trial_ends_at: null // No expiration
        });
    };

    const getDaysRemaining = (user: User) => {
        if (user.subscription_status === 'active') return '∞';
        if (!user.trial_ends_at) return '0';
        const now = new Date();
        const end = new Date(user.trial_ends_at);
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    if (currentUser?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-rose-600">Acesso Negado. Apenas administradores podem ver esta página.</div>;
    }

    const inputStyle = "w-full pl-3 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all bg-slate-600 text-white placeholder-slate-400";

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10" ref={formRef}>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-accent" /> Gestão de Usuários
                </h1>
                <p className="text-slate-500">Gerencie acessos, assinaturas e permissões.</p>
            </div>

            {/* User Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                {editingId && <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>}

                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-amber-500" /> : <UserPlus size={20} />}
                    {editingId ? 'Editar Usuário' : 'Novo Usuário Manual'}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Nome</label>
                        <input
                            type="text"
                            required
                            className={inputStyle}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Ex: João Silva"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className={inputStyle}
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Ex: joao@email.com"
                        />
                    </div>
                    {/* Password removed for display, only present for CREATE if needed, but handled backend side or default */}
                    {!editingId && (
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">Senha (Inicial)</label>
                            <input
                                type="text"
                                required
                                className={inputStyle}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Perfil</label>
                        <select
                            required
                            className={`${inputStyle} appearance-none cursor-pointer`}
                            value={role}
                            onChange={e => setRole(e.target.value as 'ADMIN' | 'USER')}
                        >
                            <option value="" disabled className="bg-slate-600 text-slate-400">Selecione...</option>
                            <option value="USER" className="bg-slate-600 text-white">Comum</option>
                            <option value="ADMIN" className="bg-slate-600 text-white">Admin</option>
                        </select>
                    </div>

                    <div className="lg:col-span-4 flex justify-end gap-2 mt-2">
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="h-[48px] px-4 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                            >
                                <X size={20} /> Cancelar
                            </button>
                        )}
                        <button
                            type="submit"
                            className={`px-6 h-[48px] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                        >
                            {editingId ? <Save size={18} /> : <UserPlus size={18} />}
                            {editingId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm whitespace-nowrap">Usuário</th>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm">Status</th>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm">Dias Restantes</th>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm text-center">Gestão Rápida</th>
                                <th className="px-6 py-3 text-right text-slate-500 font-medium text-sm">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usersList.map(user => {
                                const daysRemaining = getDaysRemaining(user);
                                const isExpired = user.subscription_status === 'trial' && parseInt(daysRemaining as string) === 0;

                                return (
                                    <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${editingId === user.id ? 'bg-amber-50' : ''}`}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                                    {user.photo_url ? <img src={user.photo_url} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-800">{user.name}</div>
                                                    <div className="text-xs text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col items-start gap-1">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${user.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    user.subscription_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                        user.subscription_status === 'trial' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                            'bg-rose-50 text-rose-700 border-rose-200'
                                                    }`}>
                                                    {user.role === 'ADMIN' ? 'ADMIN' :
                                                        user.subscription_status === 'active' ? 'ASSINANTE' :
                                                            user.subscription_status === 'trial' ? 'TESTE GRÁTIS' : 'EXPIRADO'}
                                                </span>
                                                {isExpired && <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wide">! Acesso Bloqueado</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-mono font-bold ${user.subscription_status === 'active' ? 'text-emerald-600' :
                                                    parseInt(daysRemaining as string) > 3 ? 'text-slate-700' : 'text-rose-600'
                                                    }`}>
                                                    {daysRemaining} dias
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-slate-400">
                                                {user.subscription_status === 'active' ? 'Vitalício / Pago' :
                                                    user.trial_ends_at ? new Date(user.trial_ends_at).toLocaleDateString('pt-BR') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleRenewTrial(user)}
                                                    className="px-2 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs hover:bg-blue-100 transition-colors"
                                                    title="Adicionar +7 dias de teste"
                                                >
                                                    +7 Dias
                                                </button>
                                                <button
                                                    onClick={() => handleRevokeTrial(user)}
                                                    className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded text-xs hover:bg-rose-100 transition-colors"
                                                    title="Revogar teste e bloquear acesso"
                                                >
                                                    Remover
                                                </button>
                                                <button
                                                    onClick={() => handleLifetimeAccess(user)}
                                                    className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-xs hover:bg-emerald-100 transition-colors"
                                                    title="Conceder acesso total sem validade"
                                                >
                                                    Vitalício
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                {user.id !== currentUser.id && (
                                                    <button
                                                        onClick={() => removeUser(user.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};