
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Contrato, ContratoStatus } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { PlusCircle, Download, Send, Eye, PenSquare, Check, X, MoreVertical, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const statusConfig: { [key in ContratoStatus]: { color: string; icon: React.FC<any> } } = {
  'Criado': { color: 'bg-gray-500/20 text-gray-400', icon: PenSquare },
  'Enviado': { color: 'bg-blue-500/20 text-blue-400', icon: Send },
  'Visualizado': { color: 'bg-cyan-500/20 text-cyan-400', icon: Eye },
  'Assinado': { color: 'bg-purple-500/20 text-purple-400', icon: PenSquare },
  'Ativo': { color: 'bg-green-500/20 text-green-400', icon: Check },
  'Cancelado': { color: 'bg-red-500/20 text-red-400', icon: X },
};

type ContratoComNomes = Contrato & { clienteName: string; vendedorName: string; };

const Contratos: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contratos, setContratos] = useState<ContratoComNomes[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const fetchContratos = useCallback(() => {
     if (user) {
      setLoading(true);
      api.getContratos(user).then(data => {
        setContratos(data);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    fetchContratos();
  }, [fetchContratos]);

  const filteredContratos = useMemo(() =>
    contratos.filter(c =>
      c.clienteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
    ), [contratos, searchTerm]);
  
  const handleStatusChange = async (id: string, status: Contrato['status']) => {
    if (user) {
        setOpenDropdown(null);
        await api.updateContratoStatus(id, status, user);
        fetchContratos();
    }
  }

  const generateAndProcessPDF = async (contrato: ContratoComNomes, action: 'download' | 'save') => {
    if (!user) return;

    setIsGeneratingPdf(true);
    setOpenDropdown(null);
    const [cliente, settings] = await Promise.all([
        api.getClienteById(contrato.clienteId, user),
        api.getSettings()
    ]);

    if (!cliente || !settings) {
        alert("Não foi possível carregar os dados para gerar o PDF.");
        setIsGeneratingPdf(false);
        return;
    }
    const empresa = settings.empresa;
    const doc = new jsPDF();
    
    // --- CONTEÚDO DO PDF ---
    doc.setFontSize(18);
    doc.text("CONTRATO DE PRESTAÇÃO DE SERVIÇOS", 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Contrato Nº: ${contrato.id}`, 105, 26, { align: 'center' });

    (doc as any).autoTable({
        startY: 35,
        head: [['CONTRATANTE (CLIENTE)']],
        body: [[`Nome/Razão Social: ${cliente.name}\nCNPJ/CPF: ${cliente.cnpj || 'Não informado'}\nEndereço: ${cliente.endereco || 'Não informado'}\nEmail: ${cliente.email}`]],
        theme: 'striped',
        headStyles: { fontStyle: 'bold', fillColor: [22, 27, 34], textColor: 255 }
    });
    (doc as any).autoTable({
        startY: (doc as any).lastAutoTable.finalY + 5,
        head: [['CONTRATADA (EMPRESA)']],
        body: [[`Nome/Razão Social: ${empresa.nome}\nCNPJ: ${empresa.cnpj}\nEndereço: ${empresa.endereco}\nDados Bancários: ${empresa.dadosBancarios}`]],
        theme: 'striped',
        headStyles: { fontStyle: 'bold', fillColor: [22, 27, 34], textColor: 255 }
    });

    let finalY = (doc as any).lastAutoTable.finalY || 100;
    
    const addSection = (title: string, content: string | string[]) => {
      finalY += 10;
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(title, 14, finalY);
      finalY += 6;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      const textContent = Array.isArray(content) ? content.join('\n') : content;
      const splitContent = doc.splitTextToSize(textContent.replace('{{MODELO_CONTRATO}}', settings.contractTemplate || 'Serviços de publicidade digital e gestão de mídias.'), 180);
      doc.text(splitContent, 14, finalY);
      finalY += (splitContent.length * 5);
    }
    
    addSection("CLÁUSULA 1ª - DO OBJETO DO CONTRATO", `1.1. O presente contrato tem por objeto a prestação de serviços de: ${contrato.descricaoServico}. Detalhes adicionais: {{MODELO_CONTRATO}}`);
    addSection("CLÁUSULA 2ª - DO VALOR E DA FORMA DE PAGAMENTO", [
        `2.1. Pela prestação dos serviços, o CONTRATANTE pagará à CONTRATADA o valor de R$ ${contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
        `2.2. A forma de pagamento será: ${contrato.formaPagamento}.`,
        `2.3. O vencimento para pagamento ocorrerá todo dia ${contrato.diaVencimento} de cada mês.`
    ]);
    addSection("CLÁUSULA 3ª - DO PRAZO", `3.1. O presente contrato vigorará pelo prazo de ${contrato.duracaoMeses} meses, a contar da data de sua assinatura, podendo ser renovado mediante acordo entre as partes.`);
    addSection("CLÁUSULA 4ª - DO FORO", "4.1. Fica eleito o foro da comarca de " + empresa.endereco.split(',').slice(-2, -1).join('').trim() + " para dirimir quaisquer dúvidas oriundas do presente contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.");

    finalY = doc.internal.pageSize.height - 50;
    doc.text(`_________________________`, 30, finalY);
    doc.text(`_________________________`, 110, finalY);
    finalY += 5;
    doc.text(`${empresa.nome}`, 30, finalY);
    doc.text(`${cliente.name}`, 110, finalY);
    finalY += 5;
    doc.text(`CNPJ: ${empresa.cnpj}`, 30, finalY);
    doc.text(`CNPJ/CPF: ${cliente.cnpj || 'Não informado'}`, 110, finalY);

    // --- AÇÃO ---
    if (action === 'download') {
        doc.save(`contrato-${contrato.id}.pdf`);
    } else if (action === 'save') {
        const pdfDataUri = doc.output('datauristring');
        await api.saveContractPDF(contrato.id, pdfDataUri, user);
        alert('PDF anexado ao cliente com sucesso!');
        fetchContratos();
    }
    setIsGeneratingPdf(false);
  };

  const renderActions = (contrato: ContratoComNomes) => {
      const actions: {label: string, status: ContratoStatus}[] = [];
      switch (contrato.status) {
          case 'Criado': actions.push({label: 'Enviar p/ Assinatura', status: 'Enviado'}); break;
          case 'Enviado': actions.push({label: 'Marcar como Visualizado', status: 'Visualizado'}); break;
          case 'Visualizado': actions.push({label: 'Marcar como Assinado', status: 'Assinado'}); break;
          case 'Assinado': actions.push({label: 'Ativar Contrato', status: 'Ativo'}); break;
          case 'Ativo': actions.push({label: 'Cancelar Contrato', status: 'Cancelado'}); break;
      }

      return (
           <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => setOpenDropdown(openDropdown === contrato.id ? null : contrato.id)}>
                <MoreVertical className="w-4 h-4"/>
              </Button>
              {openDropdown === contrato.id && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg z-10" onMouseLeave={() => setOpenDropdown(null)}>
                      <ul className='text-sm text-text'>
                          {actions.map(action => (
                             <li key={action.status} className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => handleStatusChange(contrato.id, action.status)}>{action.label}</li>
                          ))}
                          <li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => generateAndProcessPDF(contrato, 'download')}>
                            <Download className='w-4 h-4 mr-2'/> Baixar PDF
                          </li>
                           <li className='px-4 py-2 hover:bg-background cursor-pointer flex items-center' onClick={() => generateAndProcessPDF(contrato, 'save')}>
                            <Paperclip className='w-4 h-4 mr-2'/> Anexar PDF ao Cliente
                          </li>
                      </ul>
                  </div>
              )}
           </div>
      )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Contratos</h1>
        <Button onClick={() => navigate('/clientes/novo')} disabled={isGeneratingPdf}>
          <PlusCircle className="w-5 h-5 mr-2" />
          Novo Contrato
        </Button>
      </div>

      <Card>
        <CardHeader>
          <input
            type="text"
            placeholder="Pesquisar por cliente ou ID..."
            className="w-full md:w-1/3 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando contratos...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th className="p-4 text-subtle font-semibold">Cliente</th>
                    <th className="p-4 text-subtle font-semibold">Valor</th>
                    <th className="p-4 text-subtle font-semibold">Status</th>
                    <th className="p-4 text-subtle font-semibold">Criado em</th>
                    <th className="p-4 text-subtle font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContratos.map(contrato => (
                    <tr key={contrato.id} className="border-b border-border hover:bg-surface transition-colors">
                      <td className="p-4">
                          <div className='font-medium'>{contrato.clienteName}</div>
                          <div className='text-xs font-mono text-subtle'>{contrato.id}</div>
                      </td>
                      <td className="p-4">R$ {contrato.valor.toLocaleString('pt-BR')}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${statusConfig[contrato.status].color}`}>
                          {React.createElement(statusConfig[contrato.status].icon, { className: 'w-3 h-3 mr-1.5' })}
                          {contrato.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-subtle">{format(new Date(contrato.createdAt), 'dd/MM/yyyy')}</td>
                      <td className="p-4 flex justify-end">
                         {renderActions(contrato)}
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

export default Contratos;
