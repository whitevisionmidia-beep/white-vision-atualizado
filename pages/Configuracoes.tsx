import React, { useState, useEffect } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { AppSettings, AuditoriaLog, EmpresaConfig } from '../types';
import { SlidersHorizontal, ShieldCheck, Download, History, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Configuracoes: React.FC = () => {
    const { user } = useAuth();
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [auditLog, setAuditLog] = useState<AuditoriaLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.getSettings(),
            api.getAuditLog()
        ]).then(([settingsData, logData]) => {
            setSettings(settingsData);
            setAuditLog(logData);
            setLoading(false);
        })
    }, []);

    const handleSettingsChange = (part: keyof AppSettings, key: any, value: any) => {
        if(settings) {
            setSettings({
                ...settings,
                [part]: {
                    // @ts-ignore
                    ...settings[part],
                    [key]: value
                }
            });
        }
    }
    
    const handleEmpresaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if(settings) {
            setSettings({
                ...settings,
                empresa: {
                    ...settings.empresa,
                    [e.target.name]: e.target.value
                }
            })
        }
    }

    const handleSaveSettings = async () => {
        if (user && settings) {
            setLoading(true);
            await api.saveSettings(settings, user);
            setLoading(false);
            alert('Configurações salvas com sucesso!');
        }
    }

    const handleExport = (dataType: 'clientes' | 'contratos' | 'financeiro') => {
        if(user) {
            api.exportData(dataType, user);
        }
    }

    if(loading || !settings) return <p>Carregando configurações...</p>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Configurações</h1>

            {/*
                INSTRUÇÕES PARA O ADMINISTRADOR:
                1. Comissões: Defina a taxa padrão (em porcentagem) que será usada para calcular a comissão de um vendedor quando um contrato for ativado.
                2. Permissões: Controle se os vendedores podem ou não acessar a aba "Financeiro".
                3. Backup: Exporte os dados mais importantes do sistema (clientes, contratos, financeiro) para um arquivo CSV a qualquer momento.
                4. Logs de Auditoria: Monitore as ações mais recentes realizadas pelos usuários no sistema.
            */}
            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} isLoading={loading}>Salvar Todas as Configurações</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <Card>
                    <CardHeader>
                        <CardTitle className='flex items-center'><Building className="w-5 h-5 mr-2 text-primary" /> Dados da Empresa</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-4 space-y-4">
                        <p className="text-sm text-subtle">Essas informações serão usadas para gerar os contratos.</p>
                         <div>
                           <label className="block text-sm font-medium text-subtle mb-1">Nome da Empresa</label>
                            <input name="nome" value={settings.empresa.nome} onChange={handleEmpresaChange} className="w-full bg-background border border-border rounded-lg px-3 py-2"/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-subtle mb-1">CNPJ</label>
                            <input name="cnpj" value={settings.empresa.cnpj} onChange={handleEmpresaChange} className="w-full bg-background border border-border rounded-lg px-3 py-2"/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-subtle mb-1">Endereço Completo</label>
                            <input name="endereco" value={settings.empresa.endereco} onChange={handleEmpresaChange} className="w-full bg-background border border-border rounded-lg px-3 py-2"/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-subtle mb-1">Dados Bancários (para o contrato)</label>
                            <textarea name="dadosBancarios" value={settings.empresa.dadosBancarios} onChange={handleEmpresaChange} className="w-full bg-background border border-border rounded-lg px-3 py-2" rows={3}/>
                        </div>
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center'><SlidersHorizontal className="w-5 h-5 mr-2 text-primary" /> Configurações Gerais</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-4">
                            <div>
                               <label className="block text-sm font-medium text-subtle mb-1">Taxa Padrão de Comissão (%)</label>
                                <input 
                                    type="number"
                                    value={settings.comissao.taxaPadrao}
                                    onChange={(e) => handleSettingsChange('comissao', 'taxaPadrao', parseFloat(e.target.value))}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2"
                                />
                            </div>
                             <div>
                                <CardTitle className='flex items-center text-base mb-2'><ShieldCheck className="w-5 h-5 mr-2 text-primary" /> Permissões de Vendedor</CardTitle>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={settings.permissoes.vendedorPodeVerFinanceiro}
                                        onChange={(e) => handleSettingsChange('permissoes', 'vendedorPodeVerFinanceiro', e.target.checked)}
                                        className="form-checkbox h-4 w-4 text-primary bg-background border-border rounded focus:ring-primary"
                                    />
                                    <span className="text-sm">Pode visualizar a aba "Financeiro"</span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                            <CardTitle className='flex items-center'><Download className="w-5 h-5 mr-2 text-primary" /> Backup e Exportação</CardTitle>
                        </CardHeader>
                        <CardContent className="mt-4 space-y-3">
                            <p className="text-sm text-subtle">Exporte os dados do sistema em formato CSV.</p>
                            <div className="flex flex-wrap gap-2">
                                <Button variant="secondary" onClick={() => handleExport('clientes')}>Exportar Clientes</Button>
                                <Button variant="secondary" onClick={() => handleExport('contratos')}>Exportar Contratos</Button>
                                <Button variant="secondary" onClick={() => handleExport('financeiro')}>Exportar Financeiro</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center'><History className="w-5 h-5 mr-2 text-primary" /> Logs de Auditoria</CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                    <div className="max-h-80 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="p-2 text-subtle font-semibold text-sm">Usuário</th>
                                    <th className="p-2 text-subtle font-semibold text-sm">Ação</th>
                                    <th className="p-2 text-subtle font-semibold text-sm">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLog.map(log => (
                                    <tr key={log.id} className="border-b border-border hover:bg-surface transition-colors text-sm">
                                        <td className="p-2 font-medium">{log.userName}</td>
                                        <td className="p-2">{log.action}</td>
                                        <td className="p-2 text-subtle">{format(new Date(log.timestamp), "dd/MM/yy HH:mm", { locale: ptBR })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default Configuracoes;