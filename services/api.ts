import { User, Cliente, Contrato, Proposta, Transacao, Comissao, Local, Tarefa, Nota, ClienteEtapa, AuditoriaLog, AppSettings, Equipamento, Documento, ContratoStatus, EmpresaConfig } from '../types';
import { format, addMonths, subDays, addDays, subMinutes } from 'date-fns';
import Papa from 'papaparse';

const today = new Date();

// ================== MOCK DATABASE ==================
let mockAdmin: User = { id: 'admin1', name: 'Admin Geral', level: 'Admin', email: 'admin@visaobranca.com', status: 'Ativo' };
let mockVendedor: User = { id: 'vendedor1', name: 'João Vendedor', level: 'Vendedor', email: 'joao@visaobranca.com', status: 'Ativo' };
let mockVendedor2: User = { id: 'vendedor2', name: 'Maria Silva', level: 'Vendedor', email: 'maria@visaobranca.com', status: 'Inativo' };
let mockUsers: User[] = [mockAdmin, mockVendedor, mockVendedor2];

let mockLocais: Local[] = [
    { id: 'loc1', cidade: 'São Paulo', regiao: 'Sudeste', endereco: 'Av. Paulista, 1000' },
    { id: 'loc2', cidade: 'Rio de Janeiro', regiao: 'Sudeste', endereco: 'Av. Atlântica, 2000' },
    { id: 'loc3', cidade: 'Salvador', regiao: 'Nordeste', endereco: 'Av. Oceânica, 3000' },
];

let mockClientes: Cliente[] = [
    { id: 'cli1', name: 'Tech Solutions Ltda', email: 'contato@techsolutions.com', phone: '11987654321', company: 'Tech Solutions', cnpj: '12.345.678/0001-99', endereco: 'Rua das Flores, 123, São Paulo', responsavel: 'Carlos Pereira', status: 'Ativo', etapa: 'Fechado', origem: 'Indicação', vendedorId: 'vendedor1', localId: 'loc1', createdAt: subDays(today, 30).toISOString(), vencimentoContrato: addMonths(today, 11).toISOString() },
    { id: 'cli2', name: 'Inova Marketing', email: 'comercial@inovamarketing.com', phone: '21912345678', company: 'Inova Marketing', cnpj: '98.765.432/0001-11', endereco: 'Praça da Sé, 456, Rio de Janeiro', responsavel: 'Ana Souza', status: 'Ativo', etapa: 'Fechado', origem: 'Google Ads', vendedorId: 'vendedor2', localId: 'loc2', createdAt: subDays(today, 60).toISOString(), vencimentoContrato: addMonths(today, 10).toISOString() },
    { id: 'cli3', name: 'Global Logistics', email: 'suporte@globallogistics.com', phone: '71999998888', company: 'Global Logistics', status: 'Potencial', etapa: 'Proposta', origem: 'Feira de Negócios', vendedorId: 'vendedor1', localId: 'loc3', createdAt: subDays(today, 15).toISOString() },
    { id: 'cli4', name: 'Creative Design Studio', email: 'criativo@creativedesign.com', phone: '11988887777', company: 'Creative Design', status: 'Inativo', etapa: 'Fechado', origem: 'Website', vendedorId: 'vendedor2', localId: 'loc1', createdAt: subDays(today, 90).toISOString() },
];

let mockNotas: Nota[] = [
    { id: 'nota1', clienteId: 'cli1', content: 'Cliente solicitou reunião de alinhamento para o próximo mês.', createdAt: subDays(today, 5).toISOString(), author: 'João Vendedor' },
    { id: 'nota2', clienteId: 'cli1', content: 'Pagamento efetuado com sucesso.', createdAt: subDays(today, 25).toISOString(), author: 'Admin Geral' },
    { id: 'nota3', clienteId: 'cli3', content: 'Enviada proposta inicial. Aguardando feedback.', createdAt: subDays(today, 10).toISOString(), author: 'João Vendedor' },
]

let mockContratos: Contrato[] = [
    { id: 'con1', clienteId: 'cli1', vendedorId: 'vendedor1', valor: 5000, status: 'Ativo', createdAt: subDays(today, 30).toISOString(), signedAt: subDays(today, 28).toISOString(), descricaoServico: 'Gestão de Mídias Sociais - Plano Padrão', formaPagamento: 'Boleto Bancário', diaVencimento: 10, duracaoMeses: 12, pdfUrl: '' },
    { id: 'con2', clienteId: 'cli2', vendedorId: 'vendedor2', valor: 7500, status: 'Ativo', createdAt: subDays(today, 60).toISOString(), signedAt: subDays(today, 55).toISOString(), descricaoServico: 'Desenvolvimento de Website e SEO', formaPagamento: 'Cartão de Crédito Recorrente', diaVencimento: 15, duracaoMeses: 6, pdfUrl: '' },
    { id: 'con3', clienteId: 'cli4', vendedorId: 'vendedor2', valor: 3000, status: 'Cancelado', createdAt: subDays(today, 90).toISOString(), signedAt: subDays(today, 88).toISOString(), descricaoServico: 'Criação de Logo e Identidade Visual', formaPagamento: 'PIX', diaVencimento: 5, duracaoMeses: 1, pdfUrl: '' },
];

let mockPropostas: Proposta[] = [
    { id: 'prop1', clienteId: 'cli3', vendedorId: 'vendedor1', valor: 4000, status: 'Enviada', createdAt: subDays(today, 10).toISOString(), validade: addDays(today, 20).toISOString() },
];

let mockTransacoes: Transacao[] = [
    { id: 'tr1', description: 'Recebimento Contrato #con1', amount: 5000, type: 'Entrada', date: subDays(today, 25).toISOString(), clienteId: 'cli1', vendedorId: 'vendedor1' },
    { id: 'tr2', description: 'Recebimento Contrato #con2', amount: 7500, type: 'Entrada', date: subDays(today, 50).toISOString(), clienteId: 'cli2', vendedorId: 'vendedor2' },
    { id: 'tr3', description: 'Software de Gestão', amount: 300, type: 'Saida', date: subDays(today, 15).toISOString() },
    { id: 'tr4', description: 'Marketing Digital', amount: 1200, type: 'Saida', date: subDays(today, 5).toISOString() },
];

let mockComissoes: Comissao[] = [
    { id: 'com1', vendedorId: 'vendedor1', contratoId: 'con1', valor: 500, pago: true, dataPagamento: subDays(today, 20).toISOString(), dataGeracao: subDays(today, 28).toISOString() },
    { id: 'com2', vendedorId: 'vendedor2', contratoId: 'con2', valor: 750, pago: true, dataPagamento: subDays(today, 45).toISOString(), dataGeracao: subDays(today, 55).toISOString() },
];

let mockTarefas: Tarefa[] = [
    { id: 'tar1', title: 'Follow-up com Global Logistics', description: 'Ligar para verificar o status da proposta.', dueDate: addDays(today, 2).toISOString(), status: 'Pendente', userId: 'vendedor1', clienteId: 'cli3' },
    { id: 'tar2', title: 'Preparar relatório mensal', dueDate: addDays(today, 5).toISOString(), status: 'Em Andamento', userId: 'admin1' },
    { id: 'tar3', title: 'Renovar contrato Tech Solutions', description: 'Contrato vence em breve.', dueDate: addMonths(today, 10).toISOString(), status: 'Pendente', userId: 'vendedor1', clienteId: 'cli1' },
];

let mockEquipamentos: Equipamento[] = [
    { id: 'eq1', modelo: 'Tela LED 55"', serial: 'SN12345', localId: 'loc1', clienteId: 'cli1', status: 'Operacional', installDate: subDays(today, 30).toISOString() },
    { id: 'eq2', modelo: 'Painel Interativo 70"', serial: 'SN67890', localId: 'loc2', clienteId: 'cli2', status: 'Operacional', installDate: subDays(today, 60).toISOString() },
    { id: 'eq3', modelo: 'Tela LED 42"', serial: 'SN54321', localId: 'loc1', status: 'Inativo', installDate: subDays(today, 120).toISOString() },
]

let mockAuditoria: AuditoriaLog[] = [
    { id: 'log1', userName: 'Admin Geral', action: 'Login no sistema.', timestamp: new Date().toISOString() },
    { id: 'log2', userName: 'João Vendedor', action: 'Visualizou cliente Tech Solutions Ltda.', timestamp: subMinutes(new Date(), 5).toISOString() },
];

let mockSettings: AppSettings = {
    comissao: { taxaPadrao: 10 },
    permissoes: { vendedorPodeVerFinanceiro: false },
    empresa: {
        nome: 'Sua Empresa de Publicidade LTDA',
        cnpj: '11.222.333/0001-44',
        endereco: 'Rua Exemplo, 123, Bairro, Cidade - UF, CEP 00000-000',
        dadosBancarios: 'Banco Exemplo (001), Ag: 1234, C/C: 56789-0'
    },
    contractTemplate: 'MODELO PADRÃO INICIAL...',
}

let mockDocumentos: Documento[] = [];

// ================== HELPERS ==================
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const logAction = (userName: string, action: string) => {
    mockAuditoria.unshift({
        id: `log${mockAuditoria.length + 1}`,
        userName,
        action,
        timestamp: new Date().toISOString()
    });
};

const filterByUser = <T extends { vendedorId?: string; userId?: string }>(data: T[], user: User): T[] => {
    if (user.level === 'Admin') return data;
    return data.filter(item => (item.vendedorId === user.id || item.userId === user.id));
};

const generateCsv = (data: any[], filename: string) => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// ================== API OBJECT ==================
export const api = {
    getMockUser: async (level: 'Admin' | 'Vendedor'): Promise<User> => {
        await delay(300);
        const user = level === 'Admin' ? mockAdmin : mockVendedor;
        logAction(user.name, 'Fez login no sistema.');
        return user;
    },

    // Dashboard
    getDashboardStats: async (user: User) => {
        await delay(500);
        const userClientes = filterByUser(mockClientes, user);
        const userContratos = filterByUser(mockContratos, user);
        const userPropostas = filterByUser(mockPropostas, user);
        const userTransacoes = filterByUser(mockTransacoes, user);

        return {
            totalClientes: userClientes.length,
            novosClientesMes: userClientes.filter(c => new Date(c.createdAt) > subDays(today, 30)).length,
            contratosAtivos: userContratos.filter(c => c.status === 'Ativo').length,
            valorContratosAtivos: userContratos.filter(c => c.status === 'Ativo').reduce((sum, c) => sum + c.valor, 0),
            propostasEnviadas: userPropostas.filter(p => p.status === 'Enviada').length,
            faturamentoMes: userTransacoes.filter(t => t.type === 'Entrada' && new Date(t.date) > subDays(today, 30)).reduce((sum, t) => sum + t.amount, 0),
        };
    },
    
    // Clientes
    getClientes: async (user: User) => (await delay(500), filterByUser(mockClientes, user)),
    getClienteById: async (id: string, user: User) => {
        await delay(300);
        const cliente = mockClientes.find(c => c.id === id);
        if (!cliente) return null;
        if (user.level === 'Vendedor' && cliente.vendedorId !== user.id) return null;
        logAction(user.name, `Visualizou o cliente ${cliente.name}.`);
        return cliente;
    },
    createCliente: async (data: Omit<Cliente, 'id' | 'createdAt'>, user: User) => {
        await delay(400);
        const newCliente: Cliente = {
            id: `cli${mockClientes.length + 1}`,
            createdAt: new Date().toISOString(),
            ...data
        }
        mockClientes.push(newCliente);
        logAction(user.name, `Criou o cliente ${newCliente.name}.`);
        return newCliente;
    },
    updateCliente: async (id: string, data: Partial<Cliente>, user: User) => {
        await delay(400);
        mockClientes = mockClientes.map(c => c.id === id ? { ...c, ...data } : c);
        const cliente = mockClientes.find(c => c.id === id);
        logAction(user.name, `Atualizou o cliente ${cliente?.name}.`);
        return cliente;
    },
    deleteCliente: async (id: string, user: User) => {
        await delay(500);
        const cliente = mockClientes.find(c => c.id === id);
        if (cliente) {
            mockClientes = mockClientes.filter(c => c.id !== id);
            // Cascade delete
            mockNotas = mockNotas.filter(n => n.clienteId !== id);
            mockContratos = mockContratos.filter(c => c.clienteId !== id);
            mockPropostas = mockPropostas.filter(p => p.clienteId !== id);
            mockTransacoes = mockTransacoes.filter(t => t.clienteId !== id);
            mockTarefas = mockTarefas.filter(t => t.clienteId !== id);
            logAction(user.name, `Excluiu o cliente ${cliente.name}.`);
        }
        return true;
    },
    getNotasByCliente: async(clienteId: string) => (await delay(200), mockNotas.filter(n => n.clienteId === clienteId).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())),
    addNota: async(clienteId: string, content: string, user: User) => {
        await delay(300);
        const newNota: Nota = {
            id: `nota${mockNotas.length + 1}`,
            clienteId,
            content,
            createdAt: new Date().toISOString(),
            author: user.name,
        };
        mockNotas.push(newNota);
        logAction(user.name, `Adicionou nota ao cliente ID ${clienteId}.`);
        return newNota;
    },

    // Contratos
    getContratos: async (user: User) => {
        await delay(500);
        const userContratos = filterByUser(mockContratos, user);
        return userContratos.map(c => ({
            ...c,
            clienteName: mockClientes.find(cli => cli.id === c.clienteId)?.name || 'N/A',
            vendedorName: mockUsers.find(u => u.id === c.vendedorId)?.name || 'N/A',
        }));
    },
    createContrato: async (data: Omit<Contrato, 'id' | 'createdAt' | 'status' | 'pdfUrl'>, user: User) => {
        await delay(400);
        const newContrato: Contrato = {
            id: `con${mockContratos.length + 1}`,
            createdAt: new Date().toISOString(),
            status: 'Criado',
            pdfUrl: '',
            ...data
        }
        mockContratos.push(newContrato);
        logAction(user.name, `Criou o contrato ${newContrato.id} para o cliente ID ${data.clienteId}.`);
        return newContrato;
    },
    updateContratoStatus: async(id: string, status: ContratoStatus, user: User) => {
        await delay(300);
        let updatedContrato: Contrato | undefined;
        mockContratos = mockContratos.map(c => {
            if (c.id === id) {
                updatedContrato = { ...c, status, signedAt: status === 'Assinado' || status === 'Ativo' ? new Date().toISOString() : c.signedAt };
                return updatedContrato;
            }
            return c;
        });

        if (updatedContrato && status === 'Ativo') {
            const contrato = updatedContrato;
            // Update client status
            mockClientes = mockClientes.map(cli => cli.id === contrato.clienteId ? {...cli, status: 'Ativo', etapa: 'Fechado', vencimentoContrato: addMonths(new Date(), contrato.duracaoMeses).toISOString()} : cli);
            // Auto-generate commission
            const comissaoValor = (contrato.valor * mockSettings.comissao.taxaPadrao) / 100;
            const newComissao: Comissao = {
                id: `com${mockComissoes.length + 1}`,
                vendedorId: contrato.vendedorId,
                contratoId: contrato.id,
                valor: comissaoValor,
                pago: false,
                dataGeracao: new Date().toISOString()
            };
            mockComissoes.push(newComissao);
            logAction('SISTEMA', `Gerou comissão de R$ ${comissaoValor} para o contrato ${contrato.id}.`);
        }
        logAction(user.name, `Atualizou status do contrato ${id} para ${status}.`);
        return mockContratos.find(c => c.id === id);
    },
    saveContractPDF: async(contractId: string, pdfData: string, user: User) => {
        await delay(400);
        mockContratos = mockContratos.map(c => c.id === contractId ? { ...c, pdfUrl: pdfData } : c);
        logAction(user.name, `Salvou o PDF do contrato ${contractId}.`);
        return true;
    },
    getContratosByCliente: async(clienteId: string) => (await delay(300), mockContratos.filter(c => c.clienteId === clienteId)),

    // Propostas
    getPropostas: async (user: User) => {
        await delay(500);
        return filterByUser(mockPropostas, user).map(p => ({
            ...p,
            clienteName: mockClientes.find(cli => cli.id === p.clienteId)?.name || 'N/A',
        }));
    },
    createProposta: async (data: Omit<Proposta, 'id' | 'createdAt' | 'status'>, user: User) => {
        await delay(400);
        const newProposta: Proposta = {
            id: `prop${mockPropostas.length + 1}`,
            createdAt: new Date().toISOString(),
            status: 'Criada',
            ...data
        }
        mockPropostas.push(newProposta);
        logAction(user.name, `Criou proposta para o cliente ID ${data.clienteId}.`);
        return newProposta;
    },
    updateProposta: async (id: string, data: Partial<Proposta>, user: User) => {
        await delay(400);
        mockPropostas = mockPropostas.map(p => p.id === id ? { ...p, ...data } : p);
        logAction(user.name, `Atualizou a proposta ${id}.`);
        return mockPropostas.find(p => p.id === id);
    },
    deleteProposta: async (id: string, user: User) => {
        await delay(400);
        mockPropostas = mockPropostas.filter(p => p.id !== id);
        logAction(user.name, `Excluiu a proposta ${id}.`);
        return true;
    },
    updatePropostaStatus: async(id: string, status: Proposta['status'], user: User) => {
        await delay(300);
        mockPropostas = mockPropostas.map(p => p.id === id ? { ...p, status } : p);
        logAction(user.name, `Atualizou status da proposta ${id} para ${status}.`);
        return mockPropostas.find(p => p.id === id);
    },
    
    // Financeiro
    getTransacoes: async (user: User) => {
        await delay(500);
        if(user.level === 'Vendedor' && !mockSettings.permissoes.vendedorPodeVerFinanceiro) return [];
        const transacoes = filterByUser(mockTransacoes, user);
        return transacoes.map(t => ({
            ...t,
            clienteName: mockClientes.find(cli => cli.id === t.clienteId)?.name,
            vendedorName: mockUsers.find(u => u.id === t.vendedorId)?.name,
        })).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    createTransacao: async (data: Omit<Transacao, 'id'>, user: User) => {
        await delay(400);
        const newTransacao: Transacao = { id: `tr${mockTransacoes.length + 1}`, ...data };
        mockTransacoes.unshift(newTransacao);
        logAction(user.name, `Registrou transação: ${data.description}.`);
        return newTransacao;
    },
    updateTransacao: async(id: string, data: Partial<Transacao>, user: User) => {
        await delay(400);
        mockTransacoes = mockTransacoes.map(t => t.id === id ? { ...t, ...data } : t);
        logAction(user.name, `Atualizou a transação ${id}.`);
        return mockTransacoes.find(t => t.id === id);
    },
    deleteTransacao: async(id: string, user: User) => {
        await delay(400);
        mockTransacoes = mockTransacoes.filter(t => t.id !== id);
        logAction(user.name, `Excluiu a transação ${id}.`);
        return true;
    },
    getFinancialOverview: async(user: User) => {
        await delay(600);
        if(user.level === 'Vendedor' && !mockSettings.permissoes.vendedorPodeVerFinanceiro) return { entrou: 0, vaiEntrar: 0, saiu: 0, lucro: 0, monthlyData: [] };
        
        const userTransacoes = filterByUser(mockTransacoes, user);
        const now = new Date();

        const entrou = userTransacoes.filter(t => t.type === 'Entrada' && new Date(t.date) <= now).reduce((sum, t) => sum + t.amount, 0);
        const vaiEntrar = userTransacoes.filter(t => t.type === 'Entrada' && new Date(t.date) > now).reduce((sum, t) => sum + t.amount, 0);
        const saiu = userTransacoes.filter(t => t.type === 'Saida').reduce((sum, t) => sum + t.amount, 0);
        const lucro = entrou - saiu;
        
        const monthlyData = Array.from({ length: 6 }).map((_, i) => {
            const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const monthName = format(monthDate, 'MMM');
            const entradas = userTransacoes.filter(t => t.type === 'Entrada' && new Date(t.date).getMonth() === monthDate.getMonth() && new Date(t.date).getFullYear() === monthDate.getFullYear()).reduce((sum, t) => sum + t.amount, 0);
            const saidas = userTransacoes.filter(t => t.type === 'Saida' && new Date(t.date).getMonth() === monthDate.getMonth() && new Date(t.date).getFullYear() === monthDate.getFullYear()).reduce((sum, t) => sum + t.amount, 0);
            return { name: monthName, entradas, saidas };
        });

        return { entrou, vaiEntrar, saiu, lucro, monthlyData };
    },
    
    // Comissões
    getComissoes: async (user: User) => {
        await delay(500);
        return filterByUser(mockComissoes, user).map(c => ({
            ...c,
            vendedorName: mockUsers.find(u => u.id === c.vendedorId)?.name || 'N/A'
        }));
    },
    marcarComissaoPaga: async (comissaoId: string, user: User) => {
        await delay(300);
        mockComissoes = mockComissoes.map(c => c.id === comissaoId ? { ...c, pago: true, dataPagamento: new Date().toISOString() } : c);
        logAction(user.name, `Marcou a comissão ${comissaoId} como paga.`);
        return mockComissoes.find(c => c.id === comissaoId);
    },
    
    // Locais & Equipamentos
    getLocais: async () => (await delay(300), mockLocais),
    createLocal: async (data: Omit<Local, 'id'>, user: User) => {
        await delay(400);
        const newLocal: Local = { id: `loc${mockLocais.length + 1}`, ...data };
        mockLocais.push(newLocal);
        logAction(user.name, `Criou o local em ${data.cidade}.`);
        return newLocal;
    },
    updateLocal: async (id: string, data: Partial<Local>, user: User) => {
        await delay(400);
        mockLocais = mockLocais.map(l => l.id === id ? { ...l, ...data } : l);
        logAction(user.name, `Atualizou o local ${id}.`);
        return mockLocais.find(l => l.id === id);
    },
    deleteLocal: async (id: string, user: User) => {
        await delay(400);
        mockLocais = mockLocais.filter(l => l.id !== id);
        logAction(user.name, `Excluiu o local ${id}.`);
        return true;
    },
    getEquipamentosByLocal: async(localId: string) => (await delay(300), mockEquipamentos.filter(e => e.localId === localId)),
    getEquipamentosByCliente: async(clienteId: string) => (await delay(300), mockEquipamentos.filter(e => e.clienteId === clienteId)),

    // Tarefas
    getTarefas: async (user: User) => (await delay(500), filterByUser(mockTarefas, user).map(t => ({...t, clienteName: mockClientes.find(c => c.id === t.clienteId)?.name}))),
    createTarefa: async (data: Omit<Tarefa, 'id'| 'status'| 'userId'>, user: User) => {
        await delay(400);
        const newTarefa: Tarefa = { id: `tar${mockTarefas.length + 1}`, status: 'Pendente', userId: user.id, ...data };
        mockTarefas.unshift(newTarefa);
        logAction(user.name, `Criou a tarefa "${data.title}".`);
        return newTarefa;
    },
    updateTarefa: async(id: string, data: Partial<Tarefa>, user: User) => {
        await delay(300);
        mockTarefas = mockTarefas.map(t => t.id === id ? { ...t, ...data } : t);
        logAction(user.name, `Atualizou a tarefa ${id}.`);
        return mockTarefas.find(t => t.id === id);
    },
    deleteTarefa: async(id: string, user: User) => {
        await delay(300);
        mockTarefas = mockTarefas.filter(t => t.id !== id);
        logAction(user.name, `Excluiu a tarefa ${id}.`);
        return true;
    },
    updateTarefaStatus: async(id: string, status: Tarefa['status'], user: User) => {
        await delay(300);
        mockTarefas = mockTarefas.map(t => t.id === id ? { ...t, status } : t);
        logAction(user.name, `Atualizou a tarefa ${id} para ${status}.`);
        return mockTarefas.find(t => t.id === id);
    },

    // Users
    getUsers: async(user: User): Promise<User[]> => {
        await delay(300);
        if (user.level !== 'Admin') return [];
        return mockUsers;
    },
    createUser: async(data: Omit<User, 'id'>, adminUser: User): Promise<User> => {
        await delay(400);
        const newUser: User = { id: `user${mockUsers.length + 1}`, ...data };
        mockUsers.push(newUser);
        logAction(adminUser.name, `Criou o usuário ${newUser.name}.`);
        return newUser;
    },
    updateUser: async(id: string, data: Partial<User>, adminUser: User): Promise<User|undefined> => {
        await delay(400);
        mockUsers = mockUsers.map(u => u.id === id ? { ...u, ...data } : u);
        const user = mockUsers.find(u => u.id === id);
        logAction(adminUser.name, `Atualizou o usuário ${user?.name}.`);
        return user;
    },
    deleteUser: async(id: string, adminUser: User): Promise<boolean> => {
        await delay(500);
        if (id === 'admin1') return false; // Cannot delete main admin
        const user = mockUsers.find(u => u.id === id);
        if (user) {
            mockUsers = mockUsers.filter(u => u.id !== id);
            logAction(adminUser.name, `Excluiu o usuário ${user.name}.`);
        }
        return true;
    },
    getVendedores: async () => (await delay(200), mockUsers.filter(u => u.level === 'Vendedor' && u.status === 'Ativo')),
    getAllClientes: async () => (await delay(200), mockClientes),

    // Universal search
    search: async (term: string, user: User) => {
        await delay(400);
        if (!term) return [];
        const lowerTerm = term.toLowerCase();
        const clientes = filterByUser(mockClientes, user).filter(c => c.name.toLowerCase().includes(lowerTerm) || c.email.toLowerCase().includes(lowerTerm)).map(c => ({ id: c.id, name: c.name, type: 'Cliente', path: `/clientes/${c.id}` }));
        const contratos = filterByUser(mockContratos, user).filter(c => c.id.toLowerCase().includes(lowerTerm)).map(c => ({ id: c.id, name: `Contrato #${c.id}`, type: 'Contrato', path: `/contratos` }));
        return [...clientes, ...contratos];
    },

    // Settings, Integrations, Audit
    getSettings: async() => (await delay(200), mockSettings),
    saveSettings: async(settings: AppSettings, user: User) => {
        await delay(400);
        mockSettings = settings;
        logAction(user.name, 'Atualizou as configurações do sistema.');
        return mockSettings;
    },
    uploadContractTemplate: async (templateContent: string, user: User) => {
        await delay(500);
        mockSettings.contractTemplate = templateContent;
        logAction(user.name, 'Atualizou o modelo de contrato.');
        return true;
    },
    getIntegrationKeys: async() => (await delay(200), {
        firebase: localStorage.getItem('crm_firebase_key') || '',
        autentique: localStorage.getItem('crm_autentique_key') || '',
        contractGenerator: localStorage.getItem('crm_contract_gen_key') || ''
    }),
    saveIntegrationKeys: async(keys: {firebase: string, autentique: string, contractGenerator: string}, user: User) => {
        await delay(400);
        localStorage.setItem('crm_firebase_key', keys.firebase);
        localStorage.setItem('crm_autentique_key', keys.autentique);
        localStorage.setItem('crm_contract_gen_key', keys.contractGenerator);
        logAction(user.name, 'Atualizou as chaves de integração.');
        return true;
    },
    getAuditLog: async() => (await delay(500), mockAuditoria),
    
    // EXPORT
    exportData: async (dataType: 'clientes' | 'contratos' | 'financeiro', user: User) => {
        logAction(user.name, `Exportou dados de ${dataType}.`);
        switch(dataType) {
            case 'clientes':
                generateCsv(filterByUser(mockClientes, user), 'clientes.csv');
                break;
            case 'contratos':
                generateCsv(filterByUser(mockContratos, user), 'contratos.csv');
                break;
            case 'financeiro':
                generateCsv(filterByUser(mockTransacoes, user), 'financeiro.csv');
                break;
        }
        return true;
    }
};