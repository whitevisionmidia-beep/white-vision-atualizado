import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Tarefa, TarefaStatus, Cliente } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PlusCircle, Calendar, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Modal from '../components/ui/Modal';

type TarefaCompleta = Tarefa & { clienteName?: string };

const Tarefas: React.FC = () => {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<TarefaCompleta[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarefa, setEditingTarefa] = useState<Partial<Tarefa> | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchTarefas = () => {
    if (user) {
      setLoading(true);
      Promise.all([
          api.getTarefas(user),
          api.getClientes(user)
      ]).then(([tarefasData, clientesData]) => {
        setTarefas(tarefasData);
        setClientes(clientesData);
        setLoading(false);
      });
    }
  };

  useEffect(() => {
    fetchTarefas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleStatusChange = async (id: string, status: TarefaStatus) => {
    if(user) {
        await api.updateTarefaStatus(id, status, user);
        fetchTarefas();
    }
  };
  
  const handleOpenModal = (tarefa: Partial<Tarefa> | null = null) => {
      setEditingTarefa(tarefa || { title: '', description: '', dueDate: '', clienteId: '' });
      setIsModalOpen(true);
  }

  const handleSaveTarefa = async (e: React.FormEvent) => {
    e.preventDefault();
    if(user && editingTarefa && editingTarefa.title && editingTarefa.dueDate) {
        if(editingTarefa.id) { // Update
            await api.updateTarefa(editingTarefa.id, editingTarefa, user);
        } else { // Create
            await api.createTarefa({
                title: editingTarefa.title!,
                description: editingTarefa.description,
                dueDate: editingTarefa.dueDate!,
                clienteId: editingTarefa.clienteId || undefined
            }, user);
        }
        setIsModalOpen(false);
        setEditingTarefa(null);
        fetchTarefas();
    } else {
        alert('Título e data de vencimento são obrigatórios.');
    }
  }

  const handleDeleteTarefa = async (id: string) => {
    if (user && window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
        await api.deleteTarefa(id, user);
        fetchTarefas();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tarefas e Lembretes</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Pendente', 'Em Andamento', 'Concluída'] as TarefaStatus[]).map(status => (
          <Card key={status}>
            <CardHeader>
              <CardTitle>{status} ({tarefas.filter(t => t.status === status).length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 h-[60vh] overflow-y-auto p-2">
              {loading ? <p>Carregando...</p> : tarefas.filter(t => t.status === status).map(tarefa => (
                <div key={tarefa.id} className="bg-background p-3 rounded-lg border border-border group">
                  <div className="flex justify-between items-start">
                    <p className="font-semibold pr-2">{tarefa.title}</p>
                    <div className="relative flex-shrink-0">
                        <button onClick={() => setOpenDropdown(openDropdown === tarefa.id ? null : tarefa.id)} className="text-subtle hover:text-text">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdown === tarefa.id && (
                            <div className="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-lg shadow-lg z-10" onMouseLeave={() => setOpenDropdown(null)}>
                                <ul className='text-sm text-text'>
                                    <li className='px-3 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => {handleOpenModal(tarefa); setOpenDropdown(null);}}><Edit className="w-4 h-4 mr-2" /> Editar</li>
                                    <li className='px-3 py-2 hover:bg-background cursor-pointer text-danger flex items-center' onClick={() => {handleDeleteTarefa(tarefa.id); setOpenDropdown(null);}}><Trash2 className="w-4 h-4 mr-2" /> Excluir</li>
                                </ul>
                            </div>
                        )}
                    </div>
                  </div>
                  {tarefa.description && <p className="text-sm text-subtle mt-1">{tarefa.description}</p>}
                  {tarefa.clienteName && <p className="text-xs text-primary mt-2">Cliente: {tarefa.clienteName}</p>}
                  <div className="flex justify-between items-center mt-3 text-xs text-subtle">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(tarefa.dueDate), 'dd/MM/yyyy')}
                    </div>
                    <div className="relative">
                        <select
                            value={tarefa.status}
                            onChange={(e) => handleStatusChange(tarefa.id, e.target.value as TarefaStatus)}
                            className="bg-surface text-xs rounded border border-border hover:border-primary cursor-pointer appearance-none p-1 pr-4"
                        >
                            <option value="Pendente">Pendente</option>
                            <option value="Em Andamento">Em Andamento</option>
                            <option value="Concluída">Concluída</option>
                        </select>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && editingTarefa && (
          <Modal title={editingTarefa.id ? "Editar Tarefa" : "Nova Tarefa"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSaveTarefa} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Título</label>
                    <input type="text" value={editingTarefa.title || ''} onChange={(e) => setEditingTarefa({...editingTarefa, title: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Descrição</label>
                    <textarea value={editingTarefa.description || ''} onChange={(e) => setEditingTarefa({...editingTarefa, description: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" rows={3} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Data de Vencimento</label>
                    <input type="date" value={editingTarefa.dueDate ? format(new Date(editingTarefa.dueDate), 'yyyy-MM-dd') : ''} onChange={(e) => setEditingTarefa({...editingTarefa, dueDate: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Vincular a Cliente (Opcional)</label>
                    <select value={editingTarefa.clienteId || ''} onChange={(e) => setEditingTarefa({...editingTarefa, clienteId: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">Nenhum</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit">Salvar Tarefa</Button>
                </div>
            </form>
        </Modal>
      )}
    </div>
  );
};

export default Tarefas;