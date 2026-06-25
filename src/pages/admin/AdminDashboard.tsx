import { AlertTriangle, CircleDollarSign, Loader2, Users, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link } from 'react-router-dom'
import { useAdminStats, useAdminSubscriptions } from '../../hooks/useAdmin'

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
})

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminStats()
  const { data: subscriptions, isLoading: loadingSubscriptions } = useAdminSubscriptions()

  const pending = subscriptions?.filter((item) => item.status === 'pending').slice(0, 5) ?? []
  const expiringSoon =
    subscriptions?.filter((item) => {
      if (!item.current_period_end) return false
      const end = new Date(item.current_period_end).getTime()
      return end > Date.now() && end - Date.now() <= 7 * 24 * 60 * 60 * 1000
    }).slice(0, 5) ?? []

  const kpis: Array<{ label: string; value: string | number; icon: LucideIcon }> = [
    { label: 'Total de clientes', value: stats?.totalClients ?? 0, icon: Users },
    { label: 'Assinaturas ativas', value: stats?.activeSubscriptions ?? 0, icon: Wallet },
    { label: 'Assinaturas pendentes', value: stats?.pendingSubscriptions ?? 0, icon: AlertTriangle },
    {
      label: 'Receita mensal estimada',
      value: currency.format(stats?.estimatedMonthlyRevenue ?? 0),
      icon: CircleDollarSign
    }
  ]

  if (loadingStats || loadingSubscriptions) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Admin</h1>
        <p className="mt-1 text-slate-500">Visão geral das assinaturas e da operação comercial do SaaS.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="h-5 w-5 text-red-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-900">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Novos cadastros por mês</h2>
              <p className="text-sm text-slate-500">Acompanha o crescimento do SaaS nos últimos meses.</p>
            </div>
            <Link to="/admin/clientes" className="text-sm font-medium text-red-600 hover:underline">
              Ver clientes
            </Link>
          </div>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.recentSignups ?? []}>
                <XAxis dataKey="month" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Ações urgentes</h2>
            <p className="mt-1 text-sm text-slate-500">Clientes aguardando ativação manual.</p>
            <div className="mt-5 space-y-3">
              {pending.length === 0 && <p className="text-sm text-slate-500">Nenhum cliente pendente no momento.</p>}
              {pending.map((item) => (
                <div key={item.id} className="rounded-2xl bg-amber-50 p-4">
                  <p className="font-semibold text-slate-900">{item.clinic?.name ?? 'Clínica sem nome'}</p>
                  <p className="text-sm text-slate-600">{item.clinic?.email ?? item.professional?.email ?? 'Sem email'}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900">Expirando em até 7 dias</h2>
            <p className="mt-1 text-sm text-slate-500">Assinaturas que exigem acompanhamento comercial.</p>
            <div className="mt-5 space-y-3">
              {expiringSoon.length === 0 && <p className="text-sm text-slate-500">Nenhuma assinatura próxima do vencimento.</p>}
              {expiringSoon.map((item) => (
                <div key={item.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{item.clinic?.name ?? 'Clínica sem nome'}</p>
                  <p className="text-sm text-slate-600">
                    Vence em {item.current_period_end ? new Date(item.current_period_end).toLocaleDateString('pt-BR') : '-'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
