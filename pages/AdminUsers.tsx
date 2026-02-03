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

    if (currentUser?.role !== 'ADMIN') {
        return <div className="p-8 text-center text-rose-600">Acesso Negado. Apenas administradores podem ver esta página.</div>;
    }

    const inputStyle = "w-full pl-3 pr-4 py-3 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-accent transition-all bg-slate-600 text-white placeholder-slate-400";

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10" ref={formRef}>
            <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <Shield className="text-accent" /> Gestão de Usuários
                </h1>
                <p className="text-slate-500">Adicione, edite ou remova usuários do sistema.</p>
            </div>

            {/* User Form */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                {editingId && <div className="absolute top-0 left-0 w-1 h-full bg-amber-400"></div>}

                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    {editingId ? <Edit2 size={20} className="text-amber-500" /> : <UserPlus size={20} />}
                    {editingId ? 'Editar Usuário' : 'Novo Usuário'}
                </h2>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
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
                    <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Senha</label>
                        <div className="relative">
                            <input
                                type="text"
                                required
                                className={inputStyle}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="********"
                            />
                            <Lock size={14} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
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
                        <div className="flex items-end gap-2">
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="h-[48px] px-4 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300 transition-colors"
                                    title="Cancelar Edição"
                                >
                                    <X size={20} />
                                </button>
                            )}
                            <button
                                type="submit"
                                className={`flex-1 px-6 h-[48px] text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                            >
                                {editingId ? <Save size={18} /> : <UserPlus size={18} />}
                                {editingId ? 'Salvar' : 'Cadastrar'}
                            </button>
                        </div>
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
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm">Email</th>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm">Senha</th>
                                <th className="px-6 py-3 text-slate-500 font-medium text-sm">Perfil</th>
                                <th className="px-6 py-3 text-right text-slate-500 font-medium text-sm">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {usersList.map(user => (
                                <tr key={user.id} className={`hover:bg-slate-50 transition-colors ${editingId === user.id ? 'bg-amber-50' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-500 ${editingId === user.id ? 'bg-amber-200 text-amber-700' : 'bg-slate-100'}`}>
                                                <UserIcon size={16} />
                                            </div>
                                            <span className="font-medium text-slate-800">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-400 text-sm font-mono text-center">
                                        {user.password ? '••••••' : '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {user.role === 'ADMIN' ? 'Admin' : 'Comum'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(user)}
                                                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded transition-colors"
                                                title="Editar Usuário"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            {user.id !== currentUser.id && (
                                                <button
                                                    onClick={() => removeUser(user.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                                    title="Remover Usuário"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};