import { Link, Outlet, useLocation } from 'react-router-dom'
import { BarChart3, ClipboardList, LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { appEnv, getSupportWhatsappLink } from '../../lib/env'

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/clientes', label: 'Clientes', icon: ClipboardList },
  { to: '/admin/logs', label: 'Logs', icon: BarChart3 }
]

export function AdminLayout() {
  const location = useLocation()
  const { logout, user } = useAuthStore()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-red-600">ADMIN</p>
                <h1 className="text-lg font-bold text-slate-900">{appEnv.appName}</h1>
              </div>
            </Link>
            <span className="hidden rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 md:inline-flex">
              Painel do proprietário
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={getSupportWhatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 md:inline-flex"
            >
              Suporte
            </a>
            <span className="hidden text-sm text-slate-500 md:inline">{user?.email}</span>
            <button
              onClick={() => void logout()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-8">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3">
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-700'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
