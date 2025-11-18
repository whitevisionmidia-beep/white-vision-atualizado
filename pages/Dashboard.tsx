import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Users, FileText, BarChart2, DollarSign, Target, Activity, ListTodo } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Tarefa } from '../types';
import { format } from 'date-fns';

interface Stat {
  totalClientes: number;
  novosClientesMes: number;
  contratosAtivos: number;
  valorContratosAtivos: number;
  propostasEnviadas: number;
  faturamentoMes: number;
}

const StatCard: React.FC<{ title: string, value: string, icon: React.ReactNode, description: string }> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-subtle">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-subtle">{description}</p>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stat | null>(null);
  const [financeData, setFinanceData] = useState<{name: string, entradas: number, saidas: number}[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinance, setShowFinance] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const [statsData, financeOverview, tarefasData, settings] = await Promise.all([
            api.getDashboardStats(user),
            api.getFinancialOverview(user),
            api.getTarefas(user),
            api.getSettings()
          ]);
          setStats(statsData);
          setFinanceData(financeOverview.monthlyData);
          setTarefas(tarefasData.filter(t => t.status !== 'Concluída').slice(0, 5)); // Show 5 pending/ongoing tasks
          
          if (user.level === 'Admin' || settings.permissoes.vendedorPodeVerFinanceiro) {
              setShowFinance(true);
          }

        } catch (error) {
          console.error("Failed to fetch dashboard data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return <div>Carregando dashboard...</div>;
  }

  if (!stats) {
    return <div>Não foi possível carregar os dados.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard de {user?.name}</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Total de Clientes" 
          value={stats.totalClientes.toString()} 
          icon={<Users className="w-5 h-5 text-subtle"/>} 
          description={`+${stats.novosClientesMes} neste mês`}
        />
        <StatCard 
          title="Contratos Ativos" 
          value={stats.contratosAtivos.toString()} 
          icon={<FileText className="w-5 h-5 text-subtle"/>} 
          description={`R$ ${stats.valorContratosAtivos.toLocaleString('pt-BR')} em valor`}
        />
        {showFinance && (
          <StatCard 
            title="Faturamento do Mês" 
            value={`R$ ${stats.faturamentoMes.toLocaleString('pt-BR')}`} 
            icon={<DollarSign className="w-5 h-5 text-subtle"/>} 
            description="Total de entradas nos últimos 30 dias"
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {showFinance && (
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Visão Financeira (Últimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={financeData}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1}/>
                  <XAxis dataKey="name" stroke="#8B949E" fontSize={12} />
                  <YAxis stroke="#8B949E" fontSize={12} tickFormatter={(value) => `R$${Number(value)/1000}k`}/>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363D' }}
                    labelStyle={{ color: '#C9D1D9' }}
                  />
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Bar dataKey="entradas" fill="#3FB950" name="Entradas" />
                  <Bar dataKey="saidas" fill="#F85149" name="Saídas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
         <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Próximas Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            {tarefas.length > 0 ? (
                <ul className="space-y-3">
                    {tarefas.map(tarefa => (
                        <li key={tarefa.id} className="flex items-start space-x-3">
                            <ListTodo className="w-5 h-5 text-primary mt-1 flex-shrink-0"/>
                            <div>
                                <p className="font-medium text-text text-sm">{tarefa.title}</p>
                                <p className="text-xs text-subtle">Vencimento: {format(new Date(tarefa.dueDate), 'dd/MM/yyyy')}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            ): (
                 <p className="text-subtle text-sm">Nenhuma tarefa pendente.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;