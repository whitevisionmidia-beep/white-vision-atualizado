
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Proposta, Cliente } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PlusCircle, MessageSquare, FileCheck2, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/ui/Modal';

const statusColors: { [key: string]: string } = {
  'Criada': 'bg-gray-500/10 text-gray-600',
  'Enviada': 'bg-blue-500/10 text-blue-600',
  'Aceita': 'bg-green-500/10 text-green-600',
  'Recusada': 'bg-red-500/10 text-red-600',
};

type PropostaComNomes = Proposta & { clienteName: string };

const Propostas: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [propostas, setPropostas] = useState<PropostaComNomes[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProposta, setEditingProposta] = useState<Partial<Proposta> | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchPropostas = useCallback(() => {
    if (user) {
      setLoading(true);
      Promise.all([api.getPropostas(user), api.getClientes(user)]).then(([propostasData, clientesData]) => {
        setPropostas(propostasData);
        setClientes(clientesData.filter(c => c.status === 'Potencial'));
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchPropostas();
  }, [fetchPropostas]);

  const filteredPropostas = useMemo(() =>
    propostas.filter(p =>
      p.clienteName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [propostas, searchTerm]);

  const handleConvertToContract = (proposta: PropostaComNomes) => {
    navigate('/clientes/novo', { state: { fromProposta: proposta } });
  };

  const handleOpenModal = (proposta: Partial<Proposta> | null = null) => {
    setEditingProposta(proposta || { clienteId: '', valor: 0, validade: ''});
    setIsModalOpen(true);
  }

  const handleSaveProposta = async (e: React.FormEvent) => {
      e.preventDefault();
      if(user && editingProposta) {
          if (editingProposta.id) { // Editing existing
              await api.updateProposta(editingProposta.id, {
                  ...editingProposta,
                  valor: Number(editingProposta.valor)
              }, user);
          } else { // Creating new
              await api.createProposta({
                  clienteId: editingProposta.clienteId!,
                  valor: Number(editingProposta.valor),
                  validade: editingProposta.validade!,
                  vendedorId: user.id
              }, user);
          }
          setIsModalOpen(false);
          setEditingProposta(null);
          fetchPropostas();
      } else {
          alert('Por favor, preencha todos os campos.');
      }
  }

  const handleDeleteProposta = async (id: string) => {
      if (user && window.confirm("Tem certeza que deseja excluir esta proposta?")) {
          await api.deleteProposta(id, user);
          fetchPropostas();
      }
  }
  
  const generateWhatsAppLink = (proposta: PropostaComNomes) => {
     const message = encodeURIComponent(`Olá, segue o link para a sua proposta: http://meucrm.com/proposta/${proposta.id}`);
     const phone = clientes.find(c => c.id === proposta.clienteId)?.phone || '';
     return `https://wa.me/55${phone.replace(/\D/g, '')}?text=${message}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Propostas</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Nova Proposta
        </Button>
      </div>

      <Card>
        <CardHeader>
          <input
            type="text"
            placeholder="Pesquisar por cliente..."
            className="w-full md:w-1/3 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando propostas...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-subtle font-semibold">Cliente</th>
                    <th className="p-4 text-subtle font-semibold">Valor</th>
                    <th className="p-4 text-subtle font-semibold">Status</th>
                    <th className="p-4 text-subtle font-semibold">Validade</th>
                    <th className="p-4 text-subtle font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPropostas.map(proposta => (
                    <tr key={proposta.id} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="p-4 font-medium">{proposta.clienteName}</td>
                      <td className="p-4">R$ {proposta.valor.toLocaleString('pt-BR')}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[proposta.status]}`}>
                          {proposta.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-subtle">{format(new Date(proposta.validade), 'dd/MM/yyyy')}</td>
                      <td className="p-4">
                        <div className="relative">
                            <Button variant="secondary" size="sm" onClick={() => setOpenDropdown(openDropdown === proposta.id ? null : proposta.id)}>
                                <MoreVertical className="w-4 h-4"/>
                            </Button>
                            {openDropdown === proposta.id && (
                                <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-10" onMouseLeave={() => setOpenDropdown(null)}>
                                    <ul className='text-sm text-text'>
                                        <li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => handleConvertToContract(proposta)}><FileCheck2 className="w-4 h-4 mr-2" /> Converter em Contrato</li>
                                        <a href={generateWhatsAppLink(proposta)} target="_blank" rel="noopener noreferrer"><li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center'><MessageSquare className="w-4 h-4 mr-2" /> Enviar WhatsApp</li></a>
                                        <li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => handleOpenModal(proposta)}><Edit className="w-4 h-4 mr-2" /> Editar</li>
                                        <li className='px-4 py-2 hover:bg-background cursor-pointer text-danger flex items-center' onClick={() => handleDeleteProposta(proposta.id)}><Trash2 className="w-4 h-4 mr-2" /> Excluir</li>
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
          )}
        </CardContent>
      </Card>
        
      <Modal title={editingProposta?.id ? "Editar Proposta" : "Nova Proposta"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleSaveProposta} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-subtle mb-1">Cliente</label>
                  <select
                      value={editingProposta?.clienteId}
                      onChange={(e) => setEditingProposta({...editingProposta, clienteId: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                      disabled={!!editingProposta?.id}
                  >
                      <option value="">Selecione um cliente potencial</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
              </div>
               <div>
                  <label className="block text-sm font-medium text-subtle mb-1">Valor</label>
                  <input
                      type="number"
                      value={editingProposta?.valor || ''}
                      onChange={(e) => setEditingProposta({...editingProposta, valor: Number(e.target.value)})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                  />
              </div>
              <div>
                  <label className="block text-sm font-medium text-subtle mb-1">Validade</label>
                  <input
                      type="date"
                      value={editingProposta?.validade ? format(new Date(editingProposta.validade), 'yyyy-MM-dd') : ''}
                      onChange={(e) => setEditingProposta({...editingProposta, validade: e.target.value})}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                  />
              </div>
              <div className="flex justify-end pt-4">
                  <Button type="submit">Salvar Proposta</Button>
              </div>
          </form>
      </Modal>

    </div>
  );
};

export default Propostas;
