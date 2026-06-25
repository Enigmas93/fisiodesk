import { useMemo, useState } from 'react'
import { ExternalLink, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { appEnv } from '../../lib/env'
import {
  type AdminSubscriptionItem,
  useActivateSubscription,
  useAdminSubscriptions,
  useUpdateSubscriptionStatus
} from '../../hooks/useAdmin'

const statusMeta: Record<string, { label: string; className: string }> = {
  pending: { label: 'Aguardando ativação', className: 'bg-amber-100 text-amber-700' },
  active: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-700' },
  suspended: { label: 'Suspenso', className: 'bg-orange-100 text-orange-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  expired: { label: 'Expirado', className: 'bg-slate-200 text-slate-700' },
  trial: { label: 'Trial', className: 'bg-sky-100 text-sky-700' }
}

type FilterStatus = 'all' | 'pending' | 'active' | 'suspended' | 'cancelled' | 'expired' | 'trial'

export default function AdminClientesPage() {
  const { data, isLoading } = useAdminSubscriptions()
  const activateMutation = useActivateSubscription()
  const updateStatusMutation = useUpdateSubscriptionStatus()

  const [filter, setFilter] = useState<FilterStatus>('all')
  const [selected, setSelected] = useState<AdminSubscriptionItem | null>(null)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('pix')

  const filteredData = useMemo(() => {
    if (!data) return []
    return data.filter((item) => (filter === 'all' ? true : item.status === filter))
  }, [data, filter])

  const openWhatsapp = (item: AdminSubscriptionItem) => {
    const message = encodeURIComponent(
      `Olá! Aqui é a equipe do ${appEnv.appName}.\n\nEstamos acompanhando sua assinatura da clínica ${item.clinic?.name ?? 'sem nome'}.\nPodemos ajudar na ativação do Plano Pro?`
    )
    window.open(`https://wa.me/${item.contact_whatsapp || appEnv.supportWhatsapp}?text=${message}`, '_blank')
  }

  const handleActivate = async () => {
    if (!selected) return
    try {
      await activateMutation.mutateAsync({
        subscription_id: selected.id,
        note,
        payment_method: paymentMethod
      })
      toast.success('Assinatura ativada com sucesso.')
      setSelected(null)
      setNote('')
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível ativar a assinatura.')
    }
  }

  const handleStatusChange = async (item: AdminSubscriptionItem, status: 'suspended' | 'cancelled') => {
    const reason = window.prompt(`Informe uma observação para marcar como ${status}:`, '') ?? ''
    try {
      await updateStatusMutation.mutateAsync({
        subscription_id: item.id,
        status,
        note: reason
      })
      toast.success(`Assinatura atualizada para ${status}.`)
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível atualizar a assinatura.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clientes e assinaturas</h1>
          <p className="mt-1 text-slate-500">Gerencie ativações, suspensões e cancelamentos dos clientes do SaaS.</p>
        </div>

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as FilterStatus)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
        >
          <option value="all">Todos os status</option>
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
          <option value="trial">Trial</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-6 py-4">Clínica</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Telefone</th>
                <th className="px-6 py-4">Plano</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Desde</th>
                <th className="px-6 py-4">Vence em</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {filteredData.map((item) => {
                const meta = statusMeta[item.status] ?? statusMeta.pending
                return (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-slate-900">{item.clinic?.name ?? 'Clínica sem nome'}</p>
                        <p className="text-xs text-slate-500">{item.professional?.name ?? 'Responsável não encontrado'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{item.clinic?.email ?? item.professional?.email ?? '-'}</td>
                    <td className="px-6 py-4">{item.contact_whatsapp ?? item.clinic?.phone ?? '-'}</td>
                    <td className="px-6 py-4">{item.plan?.name ?? 'Plano Pro'}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.className}`}>{meta.label}</span>
                    </td>
                    <td className="px-6 py-4">{new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      {item.current_period_end ? new Date(item.current_period_end).toLocaleDateString('pt-BR') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelected(item)}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                        >
                          Ativar
                        </button>
                        <button
                          onClick={() => void handleStatusChange(item, 'suspended')}
                          className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600"
                        >
                          Suspender
                        </button>
                        <button
                          onClick={() => void handleStatusChange(item, 'cancelled')}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => openWhatsapp(item)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    Nenhum cliente encontrado para o filtro selecionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Ativar assinatura</h2>
                <p className="mt-1 text-sm text-slate-500">Confirme as informações antes de liberar o acesso do cliente.</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-700">
                Fechar
              </button>
            </div>

            <div className="mt-6 space-y-4 rounded-2xl bg-slate-50 p-5 text-sm text-slate-700">
              <p><strong>Clínica:</strong> {selected.clinic?.name ?? '-'}</p>
              <p><strong>Email:</strong> {selected.clinic?.email ?? selected.professional?.email ?? '-'}</p>
              <p><strong>Plano:</strong> {selected.plan?.name ?? 'Plano Pro'} - R$59,90/mês</p>
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Método de pagamento</span>
                <select
                  value={paymentMethod}
                  onChange={(event) => setPaymentMethod(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <option value="pix">PIX</option>
                  <option value="manual">Manual</option>
                  <option value="boleto">Boleto</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block font-medium text-slate-700">Observações</span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3"
                  placeholder="Anotações internas da ativação"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                onClick={() => setSelected(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => void openWhatsapp(selected)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-700 hover:bg-slate-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </button>
              <button
                onClick={() => void handleActivate()}
                disabled={activateMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {activateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
                Confirmar e ativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
