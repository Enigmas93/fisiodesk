import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  HelpCircle,
  Menu,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/prontuarios', icon: FileText, label: 'Prontuários' },
  { path: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
];

export function Sidebar({ isMobileOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-white border-r border-neutral-200 transform transition-transform duration-300 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-800">FisioDesk</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => onToggle()}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          <div className="my-4 border-t border-neutral-200" />

          <Link
            to="/configuracoes"
            onClick={() => onToggle()}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              location.pathname.startsWith('/configuracoes')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Configurações</span>
          </Link>

          <Link
            to="/ajuda"
            onClick={() => onToggle()}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-neutral-600 hover:bg-neutral-100"
          >
            <HelpCircle className="w-5 h-5" />
            <span>Ajuda</span>
          </Link>
        </nav>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white border border-neutral-200 rounded-lg shadow-sm"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
