import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Comissao, User as Vendedor } from '../types';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import Button from '../components/ui/Button';

type ComissaoCompleta = Comissao & { vendedorName?: string };

const Comissoes: React.FC = () => {
  const { user } = useAuth();
  const [comissoes, setComissoes] = useState<ComissaoCompleta[]>([]);
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ vendedorId: '', periodo: '' });

  const fetchComissoes = () => {
      if (user) {
          api.getComissoes(user).then(data => {
              setComissoes(data);
              setLoading(false);
          });
      }
  }

  useEffect(() => {
    fetchComissoes();
    if(user?.level === 'Admin') {
        api.getVendedores().then(setVendedores);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  const handleMarcarPaga = async (comissaoId: string) => {
      if (user && window.confirm("Tem certeza que deseja marcar esta comissão como paga?")) {
          await api.marcarComissaoPaga(comissaoId, user);
          fetchComissoes();
      }
  }

  const filteredComissoes = useMemo(() => {
      return comissoes.filter(c => {
          const vendedorMatch = filters.vendedorId ? c.vendedorId === filters.vendedorId : true;
          // TODO: Add period filter logic
          return vendedorMatch;
      })
  }, [comissoes, filters]);

  const totalPago = useMemo(() => filteredComissoes.filter(c => c.pago).reduce((sum, c) => sum + c.valor, 0), [filteredComissoes]);
  const totalAPagar = useMemo(() => filteredComissoes.filter(c => !c.pago).reduce((sum, c) => sum + c.valor, 0), [filteredComissoes]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Comissões</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
            <CardHeader><CardTitle>Total a Pagar/Receber</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-warning">R$ {totalAPagar.toLocaleString('pt-BR')}</p></CardContent>
        </Card>
        <Card>
            <CardHeader><CardTitle>Total Pago/Recebido</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold text-success">R$ {totalPago.toLocaleString('pt-BR')}</p></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Histórico de Comissões</CardTitle>
            {user?.level === 'Admin' && (
              <div className="flex space-x-4">
                <select 
                    value={filters.vendedorId} 
                    onChange={e => setFilters({...filters, vendedorId: e.target.value})}
                    className="bg-background border border-border rounded-lg px-3 py-1 text-sm"
                >
                  <option value="">Todos Vendedores</option>
                  {vendedores.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando comissões...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    {user?.level === 'Admin' && <th className="p-4 text-subtle font-semibold">Vendedor</th>}
                    <th className="p-4 text-subtle font-semibold">Contrato ID</th>
                    <th className="p-4 text-subtle font-semibold">Valor</th>
                    <th className="p-4 text-subtle font-semibold">Status</th>
                    <th className="p-4 text-subtle font-semibold">Data Pagamento</th>
                    {user?.level === 'Admin' && <th className="p-4 text-subtle font-semibold">Ações</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredComissoes.map(comissao => (
                    <tr key={comissao.id} className="border-b border-border hover:bg-surface transition-colors">
                      {user?.level === 'Admin' && <td className="p-4 font-medium">{comissao.vendedorName}</td>}
                      <td className="p-4 font-mono text-sm">{comissao.contratoId}</td>
                      <td className="p-4">R$ {comissao.valor.toLocaleString('pt-BR')}</td>
                      <td className="p-4">
                        {comissao.pago ? (
                          <span className="flex items-center text-success text-sm"><CheckCircle className="w-4 h-4 mr-2" /> Pago</span>
                        ) : (
                          <span className="flex items-center text-warning text-sm"><XCircle className="w-4 h-4 mr-2" /> A Pagar</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-subtle">{comissao.dataPagamento ? format(new Date(comissao.dataPagamento), 'dd/MM/yyyy') : '-'}</td>
                      {user?.level === 'Admin' && (
                          <td className="p-4">
                              {!comissao.pago && (
                                  <Button size="sm" onClick={() => handleMarcarPaga(comissao.id)}>Marcar como Paga</Button>
                              )}
                          </td>
                      )}
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

export default Comissoes;