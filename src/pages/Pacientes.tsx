import { Search, Plus, Loader2, Users } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePatients } from '../hooks/usePatients'

export function Pacientes() {
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('todos')
  const { data: pacientes, isLoading, error } = usePatients()

  const filteredPacientes = pacientes?.filter((p) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.phone && p.phone.includes(search)) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
      (p.cpf && p.cpf.includes(search))

    const matchesStatus =
      filterStatus === 'todos' || p.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const statusColors: Record<string, string> = {
    active: 'bg-secondary/10 text-secondary',
    inactive: 'bg-neutral-200 text-neutral-600',
    discharged: 'bg-warning/10 text-warning'
  }

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    discharged: 'Alta'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-12">
        <p className="text-red-600 mb-4">Erro ao carregar pacientes</p>
        <p className="text-neutral-500 text-sm">{(error as any).message}</p>
      </div>
    )
  }

  const messageText = (search || filterStatus !== 'todos') 
    ? 'Tente ajustar os filtros de busca' 
    : 'Cadastre seu primeiro paciente'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone, email ou CPF..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
          >
            <option value="todos">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="discharged">Alta</option>
          </select>
          <Link
            to="/pacientes/novo"
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Paciente
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredPacientes && filteredPacientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Paciente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Telefone</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Email</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredPacientes.map((paciente) => (
                  <tr key={paciente.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                          {paciente.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-neutral-800">{paciente.name}</p>
                          {paciente.cpf && (
                            <p className="text-sm text-neutral-500">{paciente.cpf}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[paciente.status || 'active']}`}>
                        {statusLabels[paciente.status || 'active']}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {paciente.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">
                      {paciente.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/pacientes/${paciente.id}`}
                        className="text-primary hover:underline text-sm font-medium"
                      >
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              Nenhum paciente encontrado
            </h3>
            <p className="text-neutral-500 mb-6">
              {messageText}
            </p>
            {!search && filterStatus === 'todos' && (
              <Link
                to="/pacientes/novo"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Paciente
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
