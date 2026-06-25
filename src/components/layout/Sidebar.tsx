import { Link, useLocation } from 'react-router-dom'
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
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

interface SidebarProps {
  isMobileOpen: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/agenda', icon: Calendar, label: 'Agenda' },
  { path: '/pacientes', icon: Users, label: 'Pacientes' },
  { path: '/prontuarios', icon: FileText, label: 'Prontuários' },
  { path: '/financeiro', icon: DollarSign, label: 'Financeiro' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatórios' },
]

export function Sidebar({ isMobileOpen, onToggle }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

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
        className={`fixed left-0 top-0 z-50 h-full bg-white border-r border-neutral-200 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-60'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-800">FisioDesk</span>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 hover:bg-neutral-100 rounded-md"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname.startsWith(item.path)

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onToggle}
                className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          <div className="my-4 border-t border-neutral-200" />

          <Link
            to="/configuracoes"
            onClick={onToggle}
            className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
              location.pathname.startsWith('/configuracoes')
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Configurações</span>}
          </Link>

          <Link
            to="/ajuda"
            onClick={onToggle}
            className="flex items-center gap-3 px-3 py-3 rounded-md transition-colors text-neutral-600 hover:bg-neutral-100"
          >
            <HelpCircle className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span>Ajuda</span>}
          </Link>
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-neutral-200">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                  {user?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-2 text-danger hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-white border border-neutral-200 rounded-md shadow-sm"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>
    </>
  )
}
