import { useLocation, Link } from 'react-router-dom'
import {
  Plus,
  Bell,
  User,
  LogOut,
  Settings,
} from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { toast } from 'sonner'

const breadcrumbNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/agenda': 'Agenda',
  '/pacientes': 'Pacientes',
  '/prontuarios': 'Prontuários',
  '/financeiro': 'Financeiro',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
}

export function Header() {
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, logout } = useAuthStore()

  const getCurrentPage = () => {
    for (const path in breadcrumbNames) {
      if (location.pathname.startsWith(path)) {
        return breadcrumbNames[path]
      }
    }
    return 'Página'
  }

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Logout realizado com sucesso!')
    } catch (error) {
      toast.error('Erro ao fazer logout')
    }
  }

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8">
      <div className="flex items-center gap-4">
        <div className="lg:hidden">
          {/* Placeholder for mobile menu, handled in Sidebar */}
        </div>
        <h1 className="text-xl font-semibold text-neutral-800">
          {getCurrentPage()}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/agenda/novo"
          className="hidden md:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Agendamento
        </Link>
        <Link
          to="/agenda/novo"
          className="md:hidden p-2 bg-primary hover:bg-primary-dark text-white rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
        </Link>

        <button className="relative p-2 text-neutral-600 hover:bg-neutral-100 rounded-md transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 hover:bg-neutral-100 rounded-md transition-colors"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium text-sm">
              {user?.name.charAt(0)}
            </div>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-neutral-200 rounded-md shadow-lg z-50 py-1">
                <Link
                  to="/perfil"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <User className="w-4 h-4" />
                  Meu Perfil
                </Link>
                <Link
                  to="/configuracoes"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
                >
                  <Settings className="w-4 h-4" />
                  Configurações
                </Link>
                <div className="my-1 border-t border-neutral-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-danger hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
