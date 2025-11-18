import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Transacao, Cliente, User as Vendedor } from '../types';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ArrowDownCircle, ArrowUpCircle, Download, TrendingUp, PlusCircle, MoreVertical, Edit, Trash2, Scale } from 'lucide-react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';

type TransacaoCompleta = Transacao & { clienteName?: string; vendedorName?: string };

const Financeiro: React.FC = () => {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<TransacaoCompleta[]>([]);
  const [overview, setOverview] = useState<{ entrou: number, vaiEntrar: number, saiu: number, lucro: number, monthlyData: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Partial<Transacao> | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    if (user) {
      setLoading(true);
      Promise.all([api.getTransacoes(user), api.getFinancialOverview(user), api.getAllClientes(), api.getVendedores()])
        .then(([transacoesData, overviewData, clientesData, vendedoresData]) => {
          setTransacoes(transacoesData);
          setOverview(overviewData);
          setClientes(clientesData);
          setVendedores(vendedoresData);
          setLoading(false);
        });
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredTransacoes = useMemo(() =>
    transacoes.filter(t =>
      t.description.toLowerCase().includes(filter.toLowerCase()) ||
      (t.clienteName && t.clienteName.toLowerCase().includes(filter.toLowerCase()))
    ), [transacoes, filter]);

  const handleExport = () => {
      if (user) {
        api.exportData('financeiro', user);
      }
  }

  const handleOpenModal = (transacao: Partial<Transacao> | null = null) => {
    setEditingTransacao(transacao || { description: '', amount: 0, type: 'Entrada', date: format(new Date(), 'yyyy-MM-dd') });
    setIsModalOpen(true);
  };
  
  const handleSaveTransacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && editingTransacao) {
        if (editingTransacao.id) { // Update
            await api.updateTransacao(editingTransacao.id, editingTransacao, user);
        } else { // Create
            await api.createTransacao(editingTransacao as Omit<Transacao, 'id'>, user);
        }
        setIsModalOpen(false);
        setEditingTransacao(null);
        fetchData();
    }
  }

  const handleDeleteTransacao = async (id: string) => {
      if (user && window.confirm("Tem certeza que deseja excluir esta transação?")) {
          await api.deleteTransacao(id, user);
          fetchData();
      }
  }

  if (loading || !overview) {
    return <div>Carregando dados financeiros...</div>;
  }
  
  if (user?.level === 'Vendedor' && transacoes.length === 0 && overview.entrou === 0) {
      return (
          <div>
              <h1 className="text-3xl font-bold">Financeiro</h1>
              <p className="mt-4 text-subtle">Você não tem permissão para visualizar os dados financeiros.</p>
          </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <div className="flex space-x-2">
            <Button onClick={handleExport} variant="secondary">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
            </Button>
            <Button onClick={() => handleOpenModal()}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nova Transação
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Quanto Entrou</CardTitle>
            <ArrowUpCircle className="w-5 h-5 text-success"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">R$ {overview.entrou.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-subtle">Total recebido</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Quanto Saiu</CardTitle>
            <ArrowDownCircle className="w-5 h-5 text-danger"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">R$ {overview.saiu.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-subtle">Total de despesas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-subtle">Disponível em Caixa (Lucro)</CardTitle>
            <Scale className="w-5 h-5 text-primary"/>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${overview.lucro >= 0 ? 'text-primary' : 'text-danger'}`}>
                R$ {overview.lucro.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-subtle">Entradas - Saídas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-subtle">A Receber</CardTitle>
            <TrendingUp className="w-5 h-5 text-warning"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">R$ {overview.vaiEntrar.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-subtle">Previsão de recebimentos</p>
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Balanço Mensal (Entradas vs Saídas)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                <XAxis dataKey="name" stroke="#8b949e"/>
                <YAxis stroke="#8b949e" tickFormatter={(value) => `R$${Number(value)/1000}k`}/>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }}
                  labelStyle={{ color: '#c9d1d9' }}
                />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="entradas" fill="#3FB950" name="Entradas" />
                <Bar dataKey="saidas" fill="#F85149" name="Saídas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>Histórico de Transações</CardTitle>
                <input 
                    type="text"
                    placeholder="Filtrar..."
                    className="bg-background border border-border rounded-lg px-3 py-1 text-sm"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-subtle font-semibold">Descrição</th>
                  <th className="p-4 text-subtle font-semibold">Valor</th>
                  <th className="p-4 text-subtle font-semibold">Data</th>
                  <th className="p-4 text-subtle font-semibold">Cliente/Vendedor</th>
                  <th className="p-4 text-subtle font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransacoes.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-surface transition-colors text-sm">
                    <td className="p-4">{t.description}</td>
                    <td className={`p-4 font-medium ${t.type === 'Entrada' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'Entrada' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR')}
                    </td>
                    <td className="p-4 text-subtle">{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                    <td className="p-4 text-subtle">{t.clienteName || t.vendedorName || 'N/A'}</td>
                    <td className="p-4">
                        <div className="relative">
                            <Button variant="secondary" size="sm" onClick={() => setOpenDropdown(openDropdown === t.id ? null : t.id)}>
                                <MoreVertical className="w-4 h-4"/>
                            </Button>
                            {openDropdown === t.id && (
                                <div className="absolute right-0 mt-2 w-32 bg-surface border border-border rounded-lg shadow-lg z-10" onMouseLeave={() => setOpenDropdown(null)}>
                                    <ul className='text-sm text-text'>
                                        <li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => {handleOpenModal(t); setOpenDropdown(null);}}><Edit className="w-4 h-4 mr-2" /> Editar</li>
                                        <li className='px-4 py-2 hover:bg-background cursor-pointer text-danger flex items-center' onClick={() => {handleDeleteTransacao(t.id); setOpenDropdown(null);}}><Trash2 className="w-4 h-4 mr-2" /> Excluir</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && editingTransacao && (
        <Modal title={editingTransacao.id ? "Editar Transação" : "Nova Transação"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSaveTransacao} className="space-y-4">
                <input type="text" placeholder="Descrição" value={editingTransacao.description} onChange={e => setEditingTransacao({...editingTransacao, description: e.target.value})} className="w-full bg-background border border-border p-2 rounded" required/>
                <input type="number" placeholder="Valor" value={editingTransacao.amount} onChange={e => setEditingTransacao({...editingTransacao, amount: Number(e.target.value)})} className="w-full bg-background border border-border p-2 rounded" required/>
                <input type="date" value={editingTransacao.date ? format(new Date(editingTransacao.date), 'yyyy-MM-dd') : ''} onChange={e => setEditingTransacao({...editingTransacao, date: e.target.value})} className="w-full bg-background border border-border p-2 rounded" required/>
                <select value={editingTransacao.type} onChange={e => setEditingTransacao({...editingTransacao, type: e.target.value as Transacao['type']})} className="w-full bg-background border border-border p-2 rounded">
                    <option value="Entrada">Entrada</option>
                    <option value="Saida">Saída</option>
                </select>
                {user?.level === 'Admin' && editingTransacao.type === 'Entrada' && (
                  <>
                    <select value={editingTransacao.clienteId} onChange={e => setEditingTransacao({...editingTransacao, clienteId: e.target.value})} className="w-full bg-background border border-border p-2 rounded">
                        <option value="">Vincular a um Cliente (opcional)</option>
                        {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select value={editingTransacao.vendedorId} onChange={e => setEditingTransacao({...editingTransacao, vendedorId: e.target.value})} className="w-full bg-background border border-border p-2 rounded">
                        <option value="">Vincular a um Vendedor (opcional)</option>
                        {vendedores.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                  </>
                )}
                 <div className="flex justify-end pt-4">
                    <Button type="submit">Salvar Transação</Button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default Financeiro;