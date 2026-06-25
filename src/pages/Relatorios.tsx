import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { Download, FileText, Printer } from 'lucide-react'
import { useAppointments } from '../hooks/useAppointments'
import { usePatients } from '../hooks/usePatients'
import { useFinancialEntries } from '../hooks/useFinancialEntries'
import { useProfessionals } from '../hooks/useLookupData'

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#6366F1', '#EF4444', '#8B5CF6']

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const toMonthKey = (value: string) => {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const monthLabel = (key: string) => {
  const [year, month] = key.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
}

const createCsv = (rows: string[][]) =>
  rows
    .map((row) =>
      row
        .map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`)
        .join(';')
    )
    .join('\n')

const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function Relatorios() {
  const { data: appointments } = useAppointments()
  const { data: patients } = usePatients()
  const { data: financialEntries } = useFinancialEntries()
  const { data: professionals } = useProfessionals()

  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    professionalId: 'todos'
  })

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter((appointment) => {
      if (filters.professionalId !== 'todos' && appointment.professional_id !== filters.professionalId) return false
      if (filters.startDate && appointment.date && appointment.date < filters.startDate) return false
      if (filters.endDate && appointment.date && appointment.date > filters.endDate) return false
      return true
    })
  }, [appointments, filters])

  const filteredFinancialEntries = useMemo(() => {
    return (financialEntries || []).filter((entry) => {
      if (filters.professionalId !== 'todos' && entry.professional_id !== filters.professionalId) return false
      if (filters.startDate && (entry.due_date || entry.created_at) < filters.startDate) return false
      if (filters.endDate && (entry.due_date || entry.created_at) > filters.endDate) return false
      return true
    })
  }, [financialEntries, filters])

  const attendanceByMonth = useMemo(() => {
    const grouped = new Map<string, number>()

    filteredAppointments.forEach((appointment) => {
      if (!appointment.date) return
      const key = toMonthKey(appointment.date)
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({
        mes: monthLabel(key),
        atendimentos: value
      }))
  }, [filteredAppointments])

  const financialByMonth = useMemo(() => {
    const grouped = new Map<string, { income: number; expense: number }>()

    filteredFinancialEntries.forEach((entry) => {
      const referenceDate = entry.paid_date || entry.due_date || entry.created_at
      if (!referenceDate) return
      const key = toMonthKey(referenceDate)
      const current = grouped.get(key) || { income: 0, expense: 0 }

      if (entry.type === 'income') current.income += Number(entry.amount)
      if (entry.type === 'expense') current.expense += Number(entry.amount)

      grouped.set(key, current)
    })

    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, value]) => ({
        mes: monthLabel(key),
        receitas: value.income,
        despesas: value.expense,
        saldo: value.income - value.expense
      }))
  }, [filteredFinancialEntries])

  const patientStatusData = useMemo(() => {
    const grouped = new Map<string, number>()
    ;(patients || []).forEach((patient) => {
      const status = patient.status || 'active'
      grouped.set(status, (grouped.get(status) || 0) + 1)
    })

    return Array.from(grouped.entries()).map(([status, value], index) => ({
      name:
        status === 'active' ? 'Ativos' : status === 'inactive' ? 'Inativos' : status === 'discharged' ? 'Alta' : status,
      value,
      color: COLORS[index % COLORS.length]
    }))
  }, [patients])

  const attendanceStatusData = useMemo(() => {
    const grouped = new Map<string, number>()
    filteredAppointments.forEach((appointment) => {
      const status = appointment.status || 'scheduled'
      grouped.set(status, (grouped.get(status) || 0) + 1)
    })

    return Array.from(grouped.entries()).map(([status, value], index) => ({
      name:
        status === 'completed'
          ? 'Concluídos'
          : status === 'confirmed'
            ? 'Confirmados'
            : status === 'cancelled'
              ? 'Cancelados'
              : status === 'no_show'
                ? 'Faltas'
                : status === 'scheduled'
                  ? 'Agendados'
                  : status,
      value,
      color: COLORS[index % COLORS.length]
    }))
  }, [filteredAppointments])

  const professionalRanking = useMemo(() => {
    const grouped = new Map<string, { name: string; atendimentos: number; receita: number }>()

    filteredAppointments.forEach((appointment) => {
      const professionalName = appointment.professional?.name || 'Sem profissional'
      const current = grouped.get(professionalName) || { name: professionalName, atendimentos: 0, receita: 0 }
      current.atendimentos += 1
      grouped.set(professionalName, current)
    })

    filteredFinancialEntries.forEach((entry) => {
      const professionalName = entry.professional?.name || 'Sem profissional'
      const current = grouped.get(professionalName) || { name: professionalName, atendimentos: 0, receita: 0 }
      if (entry.type === 'income') current.receita += Number(entry.amount)
      grouped.set(professionalName, current)
    })

    return Array.from(grouped.values()).sort((a, b) => b.atendimentos - a.atendimentos).slice(0, 5)
  }, [filteredAppointments, filteredFinancialEntries])

  const totalAppointments = filteredAppointments.length
  const completedAppointments = filteredAppointments.filter((appointment) => appointment.status === 'completed').length
  const noShowAppointments = filteredAppointments.filter((appointment) => appointment.status === 'no_show').length
  const attendanceRate = totalAppointments ? (completedAppointments / totalAppointments) * 100 : 0
  const totalIncome = filteredFinancialEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const totalExpense = filteredFinancialEntries
    .filter((entry) => entry.type === 'expense')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)
  const netIncome = totalIncome - totalExpense
  const activePatients = (patients || []).filter((patient) => patient.status === 'active').length

  const exportCsv = () => {
    const rows = [
      ['Indicador', 'Valor'],
      ['Atendimentos filtrados', String(totalAppointments)],
      ['Taxa de presença', `${attendanceRate.toFixed(1)}%`],
      ['Faltas', String(noShowAppointments)],
      ['Receita', formatCurrency(totalIncome)],
      ['Despesa', formatCurrency(totalExpense)],
      ['Resultado líquido', formatCurrency(netIncome)],
      ['Pacientes ativos', String(activePatients)],
      [''],
      ['Profissional', 'Atendimentos', 'Receita']
    ]

    professionalRanking.forEach((item) => {
      rows.push([item.name, String(item.atendimentos), formatCurrency(item.receita)])
    })

    downloadFile(createCsv(rows), 'relatorio-fisiodesk.csv', 'text/csv;charset=utf-8;')
  }

  const exportPdf = () => {
    const popup = window.open('', '_blank')
    if (!popup) return

    popup.document.write(`
      <html>
        <head>
          <title>Relatório FisioDesk</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
            h1 { margin-bottom: 8px; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
            .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
            th { background: #f9fafb; }
          </style>
        </head>
        <body>
          <h1>Relatório FisioDesk</h1>
          <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>
          <div class="grid">
            <div class="card"><strong>Atendimentos</strong><br/>${totalAppointments}</div>
            <div class="card"><strong>Taxa de presença</strong><br/>${attendanceRate.toFixed(1)}%</div>
            <div class="card"><strong>Receita</strong><br/>${formatCurrency(totalIncome)}</div>
            <div class="card"><strong>Resultado líquido</strong><br/>${formatCurrency(netIncome)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Profissional</th>
                <th>Atendimentos</th>
                <th>Receita</th>
              </tr>
            </thead>
            <tbody>
              ${professionalRanking
                .map(
                  (item) =>
                    `<tr><td>${item.name}</td><td>${item.atendimentos}</td><td>${formatCurrency(item.receita)}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        </body>
      </html>
    `)
    popup.document.close()
    popup.print()
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Data inicial</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Data final</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Profissional</label>
              <select
                value={filters.professionalId}
                onChange={(event) => setFilters((prev) => ({ ...prev, professionalId: event.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg"
              >
                <option value="todos">Todos os profissionais</option>
                {professionals?.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Exportar PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            titulo: 'Atendimentos',
            descricao: 'Total no período filtrado',
            valor: String(totalAppointments),
            icon: FileText
          },
          {
            titulo: 'Taxa de presença',
            descricao: 'Concluídos sobre atendimentos',
            valor: `${attendanceRate.toFixed(1)}%`,
            icon: Printer
          },
          {
            titulo: 'Resultado líquido',
            descricao: 'Receitas menos despesas',
            valor: formatCurrency(netIncome),
            icon: Download
          },
          {
            titulo: 'Pacientes ativos',
            descricao: 'Base ativa atual',
            valor: String(activePatients),
            icon: FileText
          }
        ].map((item, index) => {
          const Icon = item.icon
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-800 mb-1">{item.valor}</h3>
              <p className="text-sm font-medium text-neutral-700">{item.titulo}</p>
              <p className="text-sm text-neutral-500">{item.descricao}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Atendimentos por mês</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Financeiro por mês</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialByMonth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="receitas" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Status dos Pacientes</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={patientStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={95}
                  dataKey="value"
                >
                  {patientStatusData.map((entry, index) => (
                    <Cell key={`patient-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Status dos Atendimentos</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={95}
                  dataKey="value"
                >
                  {attendanceStatusData.map((entry, index) => (
                    <Cell key={`attendance-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Ranking de Profissionais</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={professionalRanking}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#6366F1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Resumo Executivo</h3>
          <div className="space-y-4">
            <div className="border border-neutral-200 rounded-lg p-4">
              <p className="text-sm text-neutral-500">Receita total</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4">
              <p className="text-sm text-neutral-500">Despesa total</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4">
              <p className="text-sm text-neutral-500">Faltas / Não compareceu</p>
              <p className="text-xl font-bold text-amber-600">{noShowAppointments}</p>
            </div>
            <div className="border border-neutral-200 rounded-lg p-4">
              <p className="text-sm text-neutral-500">Profissionais no ranking</p>
              <p className="text-xl font-bold text-primary">{professionalRanking.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
