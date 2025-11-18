import React, { useState, useEffect, useRef } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { KeyRound, CheckCircle, XCircle, FileText, Upload } from 'lucide-react';

const Integracoes: React.FC = () => {
    const { user } = useAuth();
    const [keys, setKeys] = useState({ firebase: '', autentique: '', contractGenerator: '' });
    const [testStatus, setTestStatus] = useState<{ [key: string]: 'ok' | 'fail' | null }>({ firebase: null, autentique: null, contractGenerator: null });
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        api.getIntegrationKeys().then(setKeys);
    }, []);

    const handleSave = async () => {
        if (user) {
            setLoading(true);
            await api.saveIntegrationKeys(keys, user);
            setLoading(false);
            alert('Chaves salvas com sucesso!');
        }
    };

    const handleTest = async (type: 'firebase' | 'autentique' | 'contractGenerator') => {
        setTestStatus(prev => ({ ...prev, [type]: null }));
        // Simulating API call
        await new Promise(res => setTimeout(res, 1000));
        if (keys[type]) {
            setTestStatus(prev => ({ ...prev, [type]: 'ok' }));
        } else {
            setTestStatus(prev => ({ ...prev, [type]: 'fail' }));
        }
    }

    const handleTemplateUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && user) {
            // In a real app, you would read the file content. Here we simulate it.
            const fakeContent = `Conteúdo do arquivo ${file.name}`;
            await api.uploadContractTemplate(fakeContent, user);
            alert(`Modelo de contrato "${file.name}" salvo com sucesso!`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Integrações</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center'><KeyRound className="w-5 h-5 mr-2 text-primary" /> Chaves de API</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-subtle mb-1">Chave da API do Firebase</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="password" 
                                value={keys.firebase} 
                                onChange={(e) => setKeys({...keys, firebase: e.target.value})}
                                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Cole sua chave aqui"
                            />
                            <Button variant="secondary" onClick={() => handleTest('firebase')}>Testar Conexão</Button>
                            {testStatus.firebase === 'ok' && <CheckCircle className="w-5 h-5 text-success" />}
                            {testStatus.firebase === 'fail' && <XCircle className="w-5 h-5 text-danger" />}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-subtle mb-1">Token da API Autentique</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="password" 
                                value={keys.autentique} 
                                onChange={(e) => setKeys({...keys, autentique: e.target.value})}
                                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Cole seu token aqui"
                            />
                             <Button variant="secondary" onClick={() => handleTest('autentique')}>Testar Conexão</Button>
                             {testStatus.autentique === 'ok' && <CheckCircle className="w-5 h-5 text-success" />}
                             {testStatus.autentique === 'fail' && <XCircle className="w-5 h-5 text-danger" />}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} isLoading={loading}>Salvar Chaves</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className='flex items-center'><FileText className="w-5 h-5 mr-2 text-primary" /> Geração de Contratos</CardTitle>
                </CardHeader>
                <CardContent className="mt-4 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-subtle mb-1">Chave de API do Gerador de Contratos (ex: Docmosis, Carbone)</label>
                        <div className="flex items-center space-x-2">
                            <input 
                                type="password" 
                                value={keys.contractGenerator} 
                                onChange={(e) => setKeys({...keys, contractGenerator: e.target.value})}
                                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Cole sua chave de API aqui"
                            />
                             <Button variant="secondary" onClick={() => handleTest('contractGenerator')}>Testar</Button>
                             {testStatus.contractGenerator === 'ok' && <CheckCircle className="w-5 h-5 text-success" />}
                             {testStatus.contractGenerator === 'fail' && <XCircle className="w-5 h-5 text-danger" />}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-subtle mb-1">Modelo de Contrato Padrão (.docx)</label>
                        <p className="text-xs text-subtle mb-2">Faça o upload do seu modelo de contrato. O sistema usará este arquivo para gerar novos contratos, substituindo as tags (ex: {"{{CLIENTE_NOME}}"}) pelos dados do cliente.</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleTemplateUpload}
                            className="hidden"
                            accept=".docx"
                        />
                        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Carregar Modelo de Contrato
                        </Button>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSave} isLoading={loading}>Salvar Configurações de Contrato</Button>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
};

export default Integracoes;