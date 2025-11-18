
import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Cliente, Nota, Contrato, Equipamento } from '../types';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { ArrowLeft, Edit, MessageSquare, Phone, Mail, Building, FileText, Plus, Send, HardDrive, MapPin, User as UserIcon, Trash2, Download } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Modal from '../components/ui/Modal';

const ClienteDetalhe: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [notas, setNotas] = useState<Nota[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [novaNota, setNovaNota] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('detalhes');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Partial<Cliente>>({});

  const fetchData = useCallback(async () => {
    if (user && id) {
      setLoading(true);
      try {
        const [clienteData, notasData, contratosData, equipamentosData] = await Promise.all([
          api.getClienteById(id, user),
          api.getNotasByCliente(id),
          api.getContratosByCliente(id),
          api.getEquipamentosByCliente(id)
        ]);

        if (clienteData) {
          setCliente(clienteData);
          setEditingCliente(clienteData);
          setNotas(notasData);
          setContratos(contratosData);
          setEquipamentos(equipamentosData);
        } else {
          navigate('/clientes');
        }
      } catch (error) {
        console.error("Failed to fetch client details:", error);
      } finally {
        setLoading(false);
      }
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddNota = async () => {
    if (novaNota.trim() && cliente && user) {
      await api.addNota(cliente.id, novaNota, user);
      setNovaNota('');
      fetchData();
    }
  };

  const handleUpdateCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user && id && editingCliente) {
      await api.updateCliente(id, editingCliente, user);
      setIsEditModalOpen(false);
      fetchData();
    }
  }

  const handleDeleteCliente = async () => {
    if (user && id && window.confirm(`Tem certeza que deseja excluir o cliente ${cliente?.name}? Esta ação não pode ser desfeita.`)) {
      await api.deleteCliente(id, user);
      alert('Cliente excluído com sucesso.');
      navigate('/clientes');
    }
  }

  const generateWhatsAppLink = () => {
    if (!cliente) return '';
    const contratoPendente = contratos.find(c => c.status !== 'Ativo' && c.status !== 'Cancelado');
    const valor = contratoPendente?.valor || 'valor pendente';
    const vencimento = cliente.vencimentoContrato ? format(new Date(cliente.vencimentoContrato), 'dd/MM/yyyy') : 'data pendente';
    const message = encodeURIComponent(`Olá ${cliente.name}, sobre o seu contrato conosco no valor de R$${valor} com vencimento em ${vencimento}. Gostaríamos de confirmar o pagamento.`);
    return `https://wa.me/55${cliente.phone.replace(/\D/g, '')}?text=${message}`;
  }
  
  const TabButton: React.FC<{tabName: string; label: string}> = ({tabName, label}) => (
      <button 
        onClick={() => setActiveTab(tabName)}
        className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 ${activeTab === tabName ? 'border-primary text-primary' : 'border-transparent text-subtle hover:border-gray-300'}`}
      >
          {label}
      </button>
  );

  if (loading) return <div>Carregando detalhes do cliente...</div>;
  if (!cliente) return <div>Cliente não encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className='flex flex-col md:flex-row justify-between items-start gap-4'>
        <div>
          <Button variant="secondary" size="sm" onClick={() => navigate('/clientes')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">{cliente.name}</h1>
          <p className="text-subtle">{cliente.company}</p>
        </div>
        <div className='flex flex-wrap gap-2'>
           <a href={generateWhatsAppLink()} target="_blank" rel="noopener noreferrer">
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Enviar Cobrança</span>
            </Button>
          </a>
          <Button variant="secondary" onClick={() => setIsEditModalOpen(true)}><Edit className="w-4 h-4 mr-2" /> Editar</Button>
          {user?.level === 'Admin' && <Button variant="danger" onClick={handleDeleteCliente}><Trash2 className="w-4 h-4 mr-2" /> Excluir</Button>}
        </div>
      </div>
      
      <div className="border-b border-border overflow-x-auto">
          <nav className="-mb-px flex space-x-4 min-w-max">
              <TabButton tabName='detalhes' label='Detalhes'/>
              <TabButton tabName='contratos' label='Contratos'/>
              <TabButton tabName='equipamentos' label='Equipamentos'/>
              <TabButton tabName='anotacoes' label='Anotações'/>
          </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'detalhes' && (
             <Card>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-4">
                        <div className="flex items-center"><Mail className="w-4 h-4 mr-3 text-primary flex-shrink-0" /><span className="break-all">{cliente.email}</span></div>
                        <div className="flex items-center"><Phone className="w-4 h-4 mr-3 text-primary flex-shrink-0" /><span>{cliente.phone}</span></div>
                        <div className="flex items-center"><Building className="w-4 h-4 mr-3 text-primary flex-shrink-0" /><span>{cliente.cnpj || 'Não informado'}</span></div>
                         <div className="flex items-center"><MapPin className="w-4 h-4 mr-3 text-primary flex-shrink-0" /><span>{cliente.endereco || 'Não informado'}</span></div>
                    </div>
                     <div className="space-y-4">
                        <div className="flex items-center"><UserIcon className="w-4 h-4 mr-3 text-primary flex-shrink-0" /><span>{cliente.responsavel || 'Não informado'}</span></div>
                        <p><strong className="text-subtle font-normal">Status:</strong> {cliente.status}</p>
                        <p><strong className="text-subtle font-normal">Etapa:</strong> {cliente.etapa}</p>
                        {cliente.vencimentoContrato && <p><strong className="text-subtle font-normal">Venc. Contrato:</strong> {format(new Date(cliente.vencimentoContrato), 'dd/MM/yyyy')}</p>}
                    </div>
                </CardContent>
            </Card>
        )}
        {activeTab === 'contratos' && (
             <Card>
                <CardHeader><CardTitle>Contratos do Cliente</CardTitle></CardHeader>
                <CardContent>
                  {contratos.length > 0 ? (
                    <ul className="space-y-3">
                      {contratos.map(c => (
                        <li key={c.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm p-3 rounded-md bg-background border border-border gap-3">
                          <div className='flex items-center space-x-4'>
                            <div>
                                <p className="font-medium">Contrato #{c.id}</p>
                                <p className="text-subtle">Valor: R$ {c.valor.toLocaleString('pt-BR')}</p>
                            </div>
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-600">{c.status}</span>
                          </div>
                          {c.pdfUrl && (
                             <a href={c.pdfUrl} download={`contrato-${c.id}.pdf`}>
                                <Button variant='secondary' size='sm' className="w-full sm:w-auto">
                                    <Download className="w-4 h-4 mr-2" />
                                    Baixar PDF
                                </Button>
                             </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-subtle text-sm">Nenhum contrato encontrado.</p>}
                </CardContent>
            </Card>
        )}
        {activeTab === 'equipamentos' && (
             <Card>
                <CardHeader><CardTitle>Equipamentos Vinculados</CardTitle></CardHeader>
                <CardContent>
                  {equipamentos.length > 0 ? (
                    <ul className="space-y-3">
                      {equipamentos.map(e => (
                        <li key={e.id} className="flex justify-between items-center text-sm p-3 rounded-md bg-background border border-border">
                          <div className='flex items-center space-x-3'>
                            <HardDrive className='w-5 h-5 text-primary'/>
                            <div>
                                <p className="font-medium">{e.modelo}</p>
                                <p className="text-subtle text-xs">Serial: {e.serial}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${e.status === 'Operacional' ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>{e.status}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-subtle text-sm">Nenhum equipamento vinculado a este cliente.</p>}
                </CardContent>
            </Card>
        )}
        {activeTab === 'anotacoes' && (
            <Card>
                <CardHeader><CardTitle>Histórico e Anotações</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <textarea
                      className="w-full bg-background border border-border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Adicionar uma nova anotação..."
                      value={novaNota}
                      onChange={(e) => setNovaNota(e.target.value)}
                    ></textarea>
                    <Button onClick={handleAddNota} size="sm" disabled={!novaNota.trim()}>
                      <Plus className="w-4 h-4 mr-2" /> Salvar Anotação
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {notas.map(nota => (
                      <div key={nota.id} className="flex space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-white">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 bg-background p-3 rounded-lg border border-border">
                           <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-semibold text-text">{nota.author}</p>
                                <p className="text-xs text-subtle">
                                    {formatDistanceToNow(new Date(nota.createdAt), { addSuffix: true, locale: ptBR })}
                                </p>
                           </div>
                          <p className="text-sm">{nota.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
        )}
      </div>

      <Modal title="Editar Cliente" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <form onSubmit={handleUpdateCliente} className="space-y-4">
            <input name="name" value={editingCliente.name || ''} onChange={(e) => setEditingCliente({...editingCliente, name: e.target.value})} placeholder="Nome" className="w-full bg-background border border-border p-2 rounded" />
            <input name="company" value={editingCliente.company || ''} onChange={(e) => setEditingCliente({...editingCliente, company: e.target.value})} placeholder="Empresa" className="w-full bg-background border border-border p-2 rounded" />
            <input type="email" name="email" value={editingCliente.email || ''} onChange={(e) => setEditingCliente({...editingCliente, email: e.target.value})} placeholder="E-mail" className="w-full bg-background border border-border p-2 rounded" />
            <input name="phone" value={editingCliente.phone || ''} onChange={(e) => setEditingCliente({...editingCliente, phone: e.target.value})} placeholder="Telefone" className="w-full bg-background border border-border p-2 rounded" />
            <input name="responsavel" value={editingCliente.responsavel || ''} onChange={(e) => setEditingCliente({...editingCliente, responsavel: e.target.value})} placeholder="Responsável" className="w-full bg-background border border-border p-2 rounded" />
            <div className="flex justify-end pt-4">
                <Button type="submit">Salvar Alterações</Button>
            </div>
        </form>
      </Modal>

    </div>
  );
};

export default ClienteDetalhe;
