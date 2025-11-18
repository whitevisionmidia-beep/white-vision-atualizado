
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <AlertTriangle className="w-24 h-24 text-warning mb-4" />
      <h1 className="text-4xl font-bold mb-2">404 - Página Não Encontrada</h1>
      <p className="text-subtle mb-6">A página que você está procurando não existe ou foi movida.</p>
      <Link to="/dashboard" className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-secondary transition-colors">
        Voltar para o Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
