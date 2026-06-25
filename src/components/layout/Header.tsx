import { Link, useLocation } from 'react-router-dom';
import {
  Plus,
  Bell,
  ChevronDown,
  User,
  LogOut,
} from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Breadcrumb
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path.startsWith('/agenda')) return 'Agenda';
    if (path.startsWith('/pacientes')) return 'Pacientes';
    if (path.startsWith('/prontuarios')) return 'Prontuários';
    if (path.startsWith('/financeiro')) return 'Financeiro';
    if (path.startsWith('/relatorios')) return 'Relatórios';
    if (path.startsWith('/configuracoes')) return 'Configurações';
    return 'Página';
  };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 lg:pl-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold text-neutral-800">{getBreadcrumb()}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <Link
          to="/agenda/novo"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo Agendamento</span>
        </Link>

        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-lg">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-lg"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium text-neutral-800 hidden sm:inline">Dr. João</span>
            <ChevronDown className="w-4 h-4 text-neutral-500" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 py-2">
                <Link
                  to="/perfil"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-red-50 w-full">
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
