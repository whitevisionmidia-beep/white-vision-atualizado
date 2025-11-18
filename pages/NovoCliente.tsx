
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Cliente, Local, User as Vendedor } from '../types';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { ArrowLeft, UserPlus, FilePlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const NovoCliente: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { fromProposta?: any } || {};
    const { fromProposta } = state;

    const [vendedores, setVendedores] = useState<Vendedor[]>([]);
    const [locais, setLocais] = useState<Local[]>([]);
    const [loading, setLoading] = useState(false);
    
    const [criarContrato, setCriarContrato] = useState(!!fromProposta);
    
    const [clientData, setClientData] = useState({
        name: fromProposta?.clienteName || '',
        company: '',
        email: '',
        phone: '',
        cnpj: '',
        endereco: '',
        vendedorId: user?.level === 'Vendedor' ? user.id : (fromProposta?.vendedorId || ''),
        localId: '',
        status: 'Potencial' as Cliente['status'],
        etapa: 'Prospecção' as Cliente['etapa'],
        origem: '',
    });

    const [contractData, setContractData] = useState({
        valor: fromProposta?.valor || 0,
        descricaoServico: '',
        formaPagamento: 'Boleto Bancário',
        diaVencimento: 10,
        duracaoMeses: 12,
    });

    useEffect(() => {
        if(user?.level === 'Admin'){
            api.getVendedores().then(setVendedores);
        }
        api.getLocais().then(setLocais);
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, setState: React.Dispatch<React.SetStateAction<any>>) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!user) return;
        setLoading(true);

        try {
            const newClient = await api.createCliente(clientData, user);
            
            if (criarContrato) {
                await api.createContrato({
                    ...contractData,
                    clienteId: newClient.id,
                    vendedorId: clientData.vendedorId,
                    valor: Number(contractData.valor),
                    diaVencimento: Number(contractData.diaVencimento),
                    duracaoMeses: Number(contractData.duracaoMeses),
                }, user);
            }
            
            alert('Cliente criado com sucesso!');
            navigate(`/clientes/${newClient.id}`);
        } catch (error) {
            console.error("Failed to create client/contract:", error);
            alert('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Button>
            <h1 className="text-3xl font-bold">{fromProposta ? 'Converter Proposta em Contrato' : 'Novo Cliente'}</h1>

            <form onSubmit={handleSubmit}>
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Informações do Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <input name="name" value={clientData.name} onChange={(e) => handleChange(e, setClientData)} placeholder="Nome do Cliente/Contato" required className="bg-background border border-border p-2 rounded" />
                        <input name="company" value={clientData.company} onChange={(e) => handleChange(e, setClientData)} placeholder="Empresa" className="bg-background border border-border p-2 rounded" />
                        <input type="email" name="email" value={clientData.email} onChange={(e) => handleChange(e, setClientData)} placeholder="E-mail" required className="bg-background border border-border p-2 rounded" />
                        <input name="phone" value={clientData.phone} onChange={(e) => handleChange(e, setClientData)} placeholder="Telefone" required className="bg-background border border-border p-2 rounded" />
                        <input name="cnpj" value={clientData.cnpj} onChange={(e) => handleChange(e, setClientData)} placeholder="CNPJ / CPF" className="bg-background border border-border p-2 rounded" />
                        <input name="endereco" value={clientData.endereco} onChange={(e) => handleChange(e, setClientData)} placeholder="Endereço Completo" className="bg-background border border-border p-2 rounded" />
                        <input name="origem" value={clientData.origem} onChange={(e) => handleChange(e, setClientData)} placeholder="Origem do Cliente" className="bg-background border border-border p-2 rounded" />
                        <select name="localId" value={clientData.localId} onChange={(e) => handleChange(e, setClientData)} required className="bg-background border border-border p-2 rounded">
                            <option value="">Selecione um Local</option>
                            {locais.map(l => <option key={l.id} value={l.id}>{l.cidade}</option>)}
                        </select>
                        {user?.level === 'Admin' && (
                            <select name="vendedorId" value={clientData.vendedorId} onChange={(e) => handleChange(e, setClientData)} required className="bg-background border border-border p-2 rounded">
                                <option value="">Selecione um Vendedor</option>
                                {vendedores.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                            </select>
                        )}
                    </CardContent>
                </Card>

                <div className="my-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" checked={criarContrato} onChange={() => setCriarContrato(!criarContrato)} className="form-checkbox h-5 w-5 text-primary bg-background border-border rounded focus:ring-primary" />
                        <span>Criar Contrato junto com o Cliente</span>
                    </label>
                </div>

                {criarContrato && (
                    <Card>
                         <CardHeader>
                            <CardTitle className="flex items-center"><FilePlus className="w-5 h-5 mr-2" /> Informações do Contrato</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                             <textarea name="descricaoServico" value={contractData.descricaoServico} onChange={(e) => handleChange(e, setContractData)} placeholder="Descrição do Serviço" required className="bg-background border border-border p-2 rounded md:col-span-2" rows={3}></textarea>
                             <input type="number" name="valor" value={contractData.valor} onChange={(e) => handleChange(e, setContractData)} placeholder="Valor Mensal (R$)" required className="bg-background border border-border p-2 rounded" />
                             <select name="formaPagamento" value={contractData.formaPagamento} onChange={(e) => handleChange(e, setContractData)} required className="bg-background border border-border p-2 rounded">
                                <option>Boleto Bancário</option>
                                <option>Cartão de Crédito Recorrente</option>
                                <option>PIX</option>
                                <option>Transferência Bancária</option>
                             </select>
                             <input type="number" name="diaVencimento" value={contractData.diaVencimento} onChange={(e) => handleChange(e, setContractData)} placeholder="Dia do Vencimento" required min="1" max="31" className="bg-background border border-border p-2 rounded" />
                             <input type="number" name="duracaoMeses" value={contractData.duracaoMeses} onChange={(e) => handleChange(e, setContractData)} placeholder="Duração (meses)" required min="1" className="bg-background border border-border p-2 rounded" />
                        </CardContent>
                    </Card>
                )}

                <div className="mt-6 flex justify-end">
                    <Button type="submit" isLoading={loading}>
                        Salvar Cliente {criarContrato && "+ Contrato"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default NovoCliente;
