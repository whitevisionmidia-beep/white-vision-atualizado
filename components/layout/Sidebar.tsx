
import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  FileSignature, 
  DollarSign, 
  ListTodo, 
  Award, 
  MapPin,
  Zap,
  Settings,
  Plug,
  UserCog,
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.level === 'Admin';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard', roles: ['Admin', 'Vendedor'] },
    { to: '/clientes', icon: Users, text: 'Clientes', roles: ['Admin', 'Vendedor'] },
    { to: '/contratos', icon: FileText, text: 'Contratos', roles: ['Admin', 'Vendedor'] },
    { to: '/propostas', icon: FileSignature, text: 'Propostas', roles: ['Admin', 'Vendedor'] },
    { to: '/financeiro', icon: DollarSign, text: 'Financeiro', roles: ['Admin', 'Vendedor'] },
    { to: '/tarefas', icon: ListTodo, text: 'Tarefas', roles: ['Admin', 'Vendedor'] },
    { to: '/comissoes', icon: Award, text: 'Comissões', roles: ['Admin', 'Vendedor'] },
    { to: '/locais', icon: MapPin, text: 'Locais', roles: ['Admin'] },
  ];

  const adminNavItems = [
     { to: '/usuarios', icon: UserCog, text: 'Usuários', roles: ['Admin'] },
     { to: '/integracoes', icon: Plug, text: 'Integrações', roles: ['Admin'] },
     { to: '/configuracoes', icon: Settings, text: 'Configurações', roles: ['Admin'] },
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  const NavItem: React.FC<{ to: string, icon: React.ElementType, text: string }> = ({ to, icon: Icon, text }) => (
    <li>
      <NavLink
        to={to}
        onClick={handleLinkClick}
        className={({ isActive }) => 
            `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 text-subtle hover:bg-surface hover:text-text ${isActive ? 'bg-secondary text-white' : ''}`
        }
      >
        <Icon className="w-5 h-5 mr-3" />
        <span className="font-medium">{text}</span>
      </NavLink>
    </li>
  );
  
  return (
    <aside className={`
      fixed inset-y-0 left-0 z-30 w-64 bg-surface border-r border-border flex flex-col transition-transform duration-300 ease-in-out
      lg:translate-x-0 lg:static lg:inset-auto h-full
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="flex items-center justify-between p-4 mb-2">
        <Link to="/dashboard" className="flex items-center" onClick={handleLinkClick}>
          <Zap className="w-8 h-8 text-primary" />
          <h1 className="text-xl font-bold ml-2 text-text">Visão Branca</h1>
        </Link>
        <button onClick={onClose} className="lg:hidden text-subtle hover:text-text p-1">
            <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-thin scrollbar-thumb-border">
        <p className="px-3 text-xs font-semibold text-subtle uppercase tracking-wider">Menu</p>
        <ul>
          {navItems.map(item =>
            item.roles.includes(user?.level || '') ? (
              <NavItem key={item.to} to={item.to} icon={item.icon} text={item.text} />
            ) : null
          )}
        </ul>
        {isAdmin && (
            <div className="mt-6">
                 <p className="px-3 text-xs font-semibold text-subtle uppercase tracking-wider">Admin</p>
                <ul>
                    {adminNavItems.map(item => <NavItem key={item.to} to={item.to} icon={item.icon} text={item.text} />)}
                </ul>
            </div>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
