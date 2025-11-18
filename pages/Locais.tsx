import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import { Local, Equipamento } from '../types';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { PlusCircle, MapPin, HardDrive, Edit, Trash2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

const Locais: React.FC = () => {
  const { user } = useAuth();
  const [locais, setLocais] = useState<Local[]>([]);
  const [equipamentos, setEquipamentos] = useState<{[localId: string]: Equipamento[]}>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Partial<Local> | null>(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    api.getLocais().then(data => {
      setLocais(data);
      data.forEach(local => {
          api.getEquipamentosByLocal(local.id).then(equipData => {
              setEquipamentos(prev => ({...prev, [local.id]: equipData}));
          });
      })
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenModal = (local: Partial<Local> | null = null) => {
    setEditingLocal(local || { cidade: '', regiao: '', endereco: '' });
    setIsModalOpen(true);
  }

  const handleSaveLocal = async (e: React.FormEvent) => {
      e.preventDefault();
      if(user && editingLocal) {
        if (editingLocal.id) { // Update
          await api.updateLocal(editingLocal.id, editingLocal, user);
        } else { // Create
          await api.createLocal(editingLocal as Omit<Local, 'id'>, user);
        }
        setIsModalOpen(false);
        setEditingLocal(null);
        fetchData();
      }
  }
  
  const handleDeleteLocal = async (id: string) => {
      if (user && window.confirm("Tem certeza que deseja excluir este local?")) {
          await api.deleteLocal(id, user);
          fetchData();
      }
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Locais e Equipamentos</h1>
        <Button onClick={() => handleOpenModal()}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Local
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Locais Cadastrados</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando locais...</p>
          ) : (
             <div className="space-y-6">
              {locais.map(local => (
                <div key={local.id} className="bg-background p-4 rounded-lg border border-border">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3 mb-4">
                          <MapPin className="w-6 h-6 text-primary"/>
                          <div>
                              <h3 className="font-semibold text-lg">{local.cidade}</h3>
                              <p className="text-sm text-subtle">{local.endereco} - {local.regiao}</p>
                          </div>
                      </div>
                      <div className="flex space-x-2">
                          <Button variant="secondary" size="sm" onClick={() => handleOpenModal(local)}><Edit className="w-4 h-4"/></Button>
                          <Button variant="danger" size="sm" onClick={() => handleDeleteLocal(local.id)}><Trash2 className="w-4 h-4"/></Button>
                      </div>
                   </div>
                   <h4 className="font-semibold text-sm mb-2 text-text">Equipamentos no Local:</h4>
                   {equipamentos[local.id] && equipamentos[local.id].length > 0 ? (
                       <ul className="space-y-2 pl-5">
                          {equipamentos[local.id].map(eq => (
                              <li key={eq.id} className="flex items-center space-x-3 text-sm">
                                  <HardDrive className="w-4 h-4 text-subtle"/>
                                  <span>{eq.modelo} (S/N: {eq.serial}) - <span className="font-semibold">{eq.status}</span></span>
                              </li>
                          ))}
                       </ul>
                   ) : (
                       <p className="text-sm text-subtle pl-5">Nenhum equipamento neste local.</p>
                   )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {isModalOpen && editingLocal && (
        <Modal title={editingLocal.id ? "Editar Local" : "Novo Local"} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <form onSubmit={handleSaveLocal} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Cidade</label>
                    <input type="text" value={editingLocal.cidade || ''} onChange={(e) => setEditingLocal({...editingLocal, cidade: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Região</label>
                    <input type="text" value={editingLocal.regiao || ''} onChange={(e) => setEditingLocal({...editingLocal, regiao: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-subtle mb-1">Endereço</label>
                    <input type="text" value={editingLocal.endereco || ''} onChange={(e) => setEditingLocal({...editingLocal, endereco: e.target.value})} className="w-full bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary" required />
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit">Salvar Local</Button>
                </div>
            </form>
        </Modal>
      )}

    </div>
  );
};

export default Locais;