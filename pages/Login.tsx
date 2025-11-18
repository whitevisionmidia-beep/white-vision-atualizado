
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import { Zap, Shield, User } from 'lucide-react';

const Login: React.FC = () => {
  const { user, login } = useAuth();
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [loadingVendedor, setLoadingVendedor] = useState(false);

  const handleLogin = async (level: 'Admin' | 'Vendedor') => {
    if (level === 'Admin') {
      setLoadingAdmin(true);
    } else {
      setLoadingVendedor(true);
    }
    
    await login(level);

    if (level === 'Admin') {
      setLoadingAdmin(false);
    } else {
      setLoadingVendedor(false);
    }
  };

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <Zap className="w-16 h-16 text-primary" />
          <h1 className="text-3xl font-bold mt-4 text-text">CRM Visão Branca</h1>
          <p className="text-subtle">Selecione seu perfil para continuar</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-8 space-y-6 shadow-sm">
          <Button
            onClick={() => handleLogin('Admin')}
            className="w-full"
            isLoading={loadingAdmin}
            size="lg"
          >
            <Shield className="w-5 h-5 mr-2" />
            Entrar como Administrador
          </Button>
          <Button
            onClick={() => handleLogin('Vendedor')}
            variant="secondary"
            className="w-full"
            isLoading={loadingVendedor}
            size="lg"
          >
            <User className="w-5 h-5 mr-2" />
            Entrar como Vendedor
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Login;
