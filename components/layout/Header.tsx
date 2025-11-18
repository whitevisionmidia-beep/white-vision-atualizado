
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, User as UserIcon, LogOut, ChevronDown, Building, FileText as FileTextIcon, Menu } from 'lucide-react';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ id: string, name: string, type: string, path: string }[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const handler = setTimeout(async () => {
        if (user) {
          setIsSearching(true);
          const results = await api.search(searchQuery, user);
          setSearchResults(results);
          setIsSearching(false);
        }
      }, 500);
      return () => clearTimeout(handler);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, user]);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
      <div className="flex items-center lg:hidden mr-4">
        <button onClick={onMenuClick} className="text-subtle hover:text-text p-1">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="relative flex-1 max-w-xl mr-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-subtle" />
        <input
          type="text"
          placeholder="Pesquisar..."
          className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onBlur={() => setTimeout(() => setSearchResults([]), 200)}
        />
        {searchResults.length > 0 && (
           <div className="absolute top-full mt-2 w-full bg-surface border border-border rounded-lg z-10 shadow-lg">
             <ul>
               {searchResults.map(result => (
                 <li key={result.id + result.type}>
                   <Link to={result.path} className="flex items-center p-3 hover:bg-background transition-colors">
                     {result.type === 'Cliente' ? <Building className="w-4 h-4 mr-3 text-subtle"/> : <FileTextIcon className="w-4 h-4 mr-3 text-subtle"/>}
                     <div>
                       <p className="font-medium text-text">{result.name}</p>
                       <p className="text-xs text-subtle">{result.type}</p>
                     </div>
                   </Link>
                 </li>
               ))}
             </ul>
           </div>
        )}
      </div>
      <div className="flex items-center space-x-2 sm:space-x-4">
        <button className="p-2 rounded-full hover:bg-background">
          <Bell className="w-5 h-5 text-subtle" />
        </button>
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-background"
          >
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="font-semibold text-sm">{user?.name}</p>
              <p className="text-xs text-subtle">{user?.level}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-subtle hidden md:block" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-surface border border-border rounded-lg shadow-lg z-10">
               <div className="md:hidden px-4 py-2 border-b border-border">
                    <p className="font-semibold text-sm text-text">{user?.name}</p>
                    <p className="text-xs text-subtle">{user?.level}</p>
               </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm text-danger hover:bg-background"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
