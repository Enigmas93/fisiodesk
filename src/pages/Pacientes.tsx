import { Search, Plus } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const pacientesMock = [
  {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 99999-8888',
    email: 'maria@email.com',
    status: 'Ativo',
    ultimaConsulta: '15/06/2025',
    proximaConsulta: '24/06/2025',
  },
  {
    id: '2',
    nome: 'João Pereira',
    telefone: '(11) 97777-6666',
    email: 'joao@email.com',
    status: 'Ativo',
    ultimaConsulta: '18/06/2025',
    proximaConsulta: '25/06/2025',
  },
  {
    id: '3',
    nome: 'Ana Costa',
    telefone: '(11) 95555-4444',
    email: 'ana@email.com',
    status: 'Inativo',
    ultimaConsulta: '10/05/2025',
    proximaConsulta: null,
  },
  {
    id: '4',
    nome: 'Carlos Souza',
    telefone: '(11) 93333-2222',
    email: 'carlos@email.com',
    status: 'Ativo',
    ultimaConsulta: '20/06/2025',
    proximaConsulta: '26/06/2025',
  },
];

export function Pacientes() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');

  const filteredPacientes = pacientesMock.filter((p) => {
    const matchesSearch =
      p.nome.toLowerCase().includes(search.toLowerCase()) ||
      p.telefone.includes(search) ||
      p.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === 'todos' || p.status.toLowerCase() === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
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
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
            <option value="alta">Alta</option>
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

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Paciente</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Última Consulta</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-700">Próxima Consulta</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredPacientes.map((paciente) => (
                <tr key={paciente.id} className="hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                        {paciente.nome.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800">{paciente.nome}</p>
                        <p className="text-sm text-neutral-500">{paciente.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      paciente.status === 'Ativo'
                        ? 'bg-secondary/10 text-secondary'
                        : paciente.status === 'Inativo'
                        ? 'bg-neutral-200 text-neutral-600'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {paciente.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {paciente.ultimaConsulta}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-600">
                    {paciente.proximaConsulta || '-'}
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
      </div>
    </div>
  );
}
