import { Loader2 } from 'lucide-react'
import { useAdminLogs } from '../../hooks/useAdmin'

export default function AdminLogsPage() {
  const { data, isLoading } = useAdminLogs()

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Logs do Admin</h1>
        <p className="mt-1 text-slate-500">Histórico de ativações, suspensões e mudanças operacionais do painel administrativo.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm font-semibold text-slate-600">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Ação</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Admin</th>
                <th className="px-6 py-4">Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {data?.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{new Date(item.created_at).toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.action}</td>
                  <td className="px-6 py-4">{item.target_type ?? '-'}</td>
                  <td className="px-6 py-4">{item.admin?.email ?? item.admin?.name ?? '-'}</td>
                  <td className="px-6 py-4">
                    <pre className="max-w-md overflow-auto whitespace-pre-wrap text-xs text-slate-500">
                      {JSON.stringify(item.details ?? {}, null, 2)}
                    </pre>
                  </td>
                </tr>
              ))}
              {!data?.length && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    Nenhum log encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
