import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';

const Usuarios: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

    const fetchUsers = useCallback(() => {
        if (user) {
            setLoading(true);
            api.getUsers(user).then(data => {
                setUsers(data);
                setLoading(false);
            });
        }
    }, [user]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const handleOpenModal = (userToEdit: Partial<User> | null = null) => {
        setEditingUser(userToEdit || { name: '', email: '', level: 'Vendedor', status: 'Ativo' });
        setIsModalOpen(true);
    }

    const handleSaveUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (user && editingUser) {
            if (editingUser.id) { // Update
                await api.updateUser(editingUser.id, editingUser, user);
            } else { // Create
                await api.createUser(editingUser as Omit<User, 'id'>, user);
            }
            setIsModalOpen(false);
            setEditingUser(null);
            fetchUsers();
        }
    }

    const handleDeleteUser = async (id: string) => {
        if (user && id !== user.id && window.confirm("Tem certeza que deseja excluir este usuário?")) {
            await api.deleteUser(id, user);
            fetchUsers();
        }
    }

    const statusColors: { [key: string]: string } = {
        'Ativo': 'bg-green-500/20 text-green-400',
        'Inativo': 'bg-gray-500/20 text-gray-400',
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <Button onClick={() => handleOpenModal()}>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Novo Usuário
                </Button>
            </div>

            <Card>
                <CardContent>
                    {loading ? <p>Carregando usuários...</p> : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-border">
                                        <th className="p-4 text-subtle font-semibold">Nome</th>
                                        <th className="p-4 text-subtle font-semibold">Email</th>
                                        <th className="p-4 text-subtle font-semibold">Nível</th>
                                        <th className="p-4 text-subtle font-semibold">Status</th>
                                        <th className="p-4 text-subtle font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id} className="border-b border-border hover:bg-surface transition-colors">
                                            <td className="p-4 font-medium">{u.name}</td>
                                            <td className="p-4 text-subtle">{u.email}</td>
                                            <td className="p-4 text-subtle">{u.level}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[u.status]}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex space-x-2">
                                                    <Button variant="secondary" size="sm" onClick={() => handleOpenModal(u)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    {u.id !== user?.id && u.level !== 'Admin' && (
                                                        <Button variant="danger" size="sm" onClick={() => handleDeleteUser(u.id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && editingUser && (
                <Modal title={editingUser.id ? "Editar Usuário" : "Novo Usuário"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-subtle mb-1">Nome</label>
                            <input type="text" value={editingUser.name || ''} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-background border border-border p-2 rounded" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-subtle mb-1">Email</label>
                            <input type="email" value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-background border border-border p-2 rounded" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-subtle mb-1">Nível</label>
                            <select value={editingUser.level} onChange={e => setEditingUser({...editingUser, level: e.target.value as User['level']})} className="w-full bg-background border border-border p-2 rounded">
                                <option value="Vendedor">Vendedor</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-subtle mb-1">Status</label>
                            <select value={editingUser.status} onChange={e => setEditingUser({...editingUser, status: e.target.value as User['status']})} className="w-full bg-background border border-border p-2 rounded">
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit">Salvar Usuário</Button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
};

export default Usuarios;
