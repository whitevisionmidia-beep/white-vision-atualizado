
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Cliente } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const statusColors: { [key: string]: string } = {
  'Ativo': 'bg-green-500/20 text-green-400',
  'Inativo': 'bg-gray-500/20 text-gray-400',
  'Potencial': 'bg-yellow-500/20 text-yellow-400',
  'Perdido': 'bg-red-500/20 text-red-400',
};

const Clientes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) {
      api.getClientes(user).then(data => {
        setClientes(data);
        setLoading(false);
      });
    }
  }, [user]);

  const filteredClientes = useMemo(() =>
    clientes.filter(cliente =>
      cliente.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    ), [clientes, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <Button onClick={() => navigate('/clientes/novo')}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <input
            type="text"
            placeholder="Pesquisar por nome ou e-mail..."
            className="w-full md:w-1/3 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando clientes...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-subtle font-semibold">Nome</th>
                    <th className="p-4 text-subtle font-semibold">Contato</th>
                    <th className="p-4 text-subtle font-semibold">Status</th>
                    <th className="p-4 text-subtle font-semibold">Etapa</th>
                    <th className="p-4 text-subtle font-semibold">Criado em</th>
                    <th className="p-4 text-subtle font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.map(cliente => (
                    <tr key={cliente.id} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-text">{cliente.name}</div>
                        <div className="text-sm text-subtle">{cliente.company}</div>
                      </td>
                      <td className="p-4">
                         <div className="text-sm text-text">{cliente.email}</div>
                         <div className="text-sm text-subtle">{cliente.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[cliente.status]}`}>
                          {cliente.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-subtle">{cliente.etapa}</td>
                      <td className="p-4 text-sm text-subtle">{format(new Date(cliente.createdAt), 'dd/MM/yyyy')}</td>
                      <td className="p-4">
                        <Button variant="secondary" size="sm" onClick={() => navigate(`/clientes/${cliente.id}`)}>
                          Ver Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;
