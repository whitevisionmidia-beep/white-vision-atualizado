export interface User {
  id: string;
  name: string;
  email: string;
  level: 'Admin' | 'Vendedor';
  status: 'Ativo' | 'Inativo';
}

export type ClienteStatus = 'Ativo' | 'Inativo' | 'Potencial' | 'Perdido';
export type ClienteEtapa = 'Prospecção' | 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechado';

export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  cnpj?: string;
  endereco?: string;
  responsavel?: string;
  status: ClienteStatus;
  etapa: ClienteEtapa;
  origem: string;
  vendedorId: string;
  localId: string;
  createdAt: string;
  vencimentoContrato?: string;
}

export interface Nota {
  id: string;
  clienteId: string;
  content: string;
  createdAt: string;
  author: string;
}

export interface Documento {
  id: string;
  clienteId: string;
  name:string;
  url: string; // Base64 or a link
  type: 'pdf' | 'doc' | 'img';
}

export type ContratoStatus = 'Criado' | 'Enviado' | 'Visualizado' | 'Assinado' | 'Ativo' | 'Cancelado';

export interface Contrato {
  id: string;
  clienteId: string;
  vendedorId: string;
  valor: number;
  status: ContratoStatus;
  createdAt: string;
  signedAt?: string;
  pdfUrl?: string; // Base64 encoded PDF
  descricaoServico: string;
  formaPagamento: string;
  diaVencimento: number;
  duracaoMeses: number;
}

export type PropostaStatus = 'Criada' | 'Enviada' | 'Aceita' | 'Recusada';

export interface Proposta {
  id: string;
  clienteId: string;
  vendedorId: string;
  valor: number;
  status: PropostaStatus;
  createdAt: string;
  validade: string;
}

export type TransactionType = 'Entrada' | 'Saida';

export interface Transacao {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  vendedorId?: string;
  clienteId?: string;
}

export interface Comissao {
  id: string;
  vendedorId: string;
  contratoId: string;
  valor: number;
  pago: boolean;
  dataPagamento?: string;
  dataGeracao: string;
}

export interface Local {
  id: string;
  cidade: string;
  regiao: string;
  endereco: string;
}

export type TarefaStatus = 'Pendente' | 'Em Andamento' | 'Concluída';

export interface Tarefa {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TarefaStatus;
  clienteId?: string;
  userId: string;
}

export type EquipamentoStatus = 'Operacional' | 'Manutenção' | 'Inativo';
export interface Equipamento {
  id: string;
  modelo: string;
  serial: string;
  localId: string;
  clienteId?: string; // Equipment can be linked to a client
  status: EquipamentoStatus;
  installDate: string;
}

export interface AuditoriaLog {
    id: string;
    userName: string;
    action: string;
    timestamp: string;
}

export interface EmpresaConfig {
    nome: string;
    cnpj: string;
    endereco: string;
    dadosBancarios: string;
}

export interface AppSettings {
    comissao: {
        taxaPadrao: number; // in percentage
    };
    permissoes: {
        vendedorPodeVerFinanceiro: boolean;
    };
    empresa: EmpresaConfig;
    contractTemplate?: string;
}