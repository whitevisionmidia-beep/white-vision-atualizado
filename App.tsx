
import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import ClienteDetalhe from './pages/ClienteDetalhe';
import NovoCliente from './pages/NovoCliente';
import Contratos from './pages/Contratos';
import Propostas from './pages/Propostas';
import Financeiro from './pages/Financeiro';
import Tarefas from './pages/Tarefas';
import Comissoes from './pages/Comissoes';
import Locais from './pages/Locais';
import Login from './pages/Login';
import NotFound from './components/shared/NotFound';
import Integracoes from './pages/Integracoes';
import Configuracoes from './pages/Configuracoes';
import Usuarios from './pages/Usuarios';
import SuperAdmin from './pages/SuperAdmin';

const PrivateRoute = ({ children, roles }: { children: React.ReactNode, roles?: string[] }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
     return <div className="flex items-center justify-center h-screen bg-background"><Spinner size="lg" /></div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (roles && !roles.includes(user.level)) {
    // SuperAdmin can access Admin routes
    if (user.level === 'SuperAdmin' && roles.includes('Admin')) {
      return <>{children}</>;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

const MainLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        <Route path="/clientes/novo" element={<NovoCliente />} />
        <Route path="/clientes/:id" element={<ClienteDetalhe />} />
        <Route path="/clientes" element={<Clientes />} />
        
        <Route path="/contratos" element={<Contratos />} />
        <Route path="/propostas" element={<Propostas />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/tarefas" element={<Tarefas />} />
        <Route path="/comissoes" element={<Comissoes />} />
        
        <Route path="/super-admin" element={<PrivateRoute roles={['SuperAdmin']}><SuperAdmin /></PrivateRoute>} />
        <Route path="/locais" element={<PrivateRoute roles={['Admin', 'SuperAdmin']}><Locais /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute roles={['Admin', 'SuperAdmin']}><Usuarios /></PrivateRoute>} />
        <Route path="/integracoes" element={<PrivateRoute roles={['SuperAdmin']}><Integracoes /></PrivateRoute>} />
        <Route path="/configuracoes" element={<PrivateRoute roles={['Admin', 'SuperAdmin']}><Configuracoes /></PrivateRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
