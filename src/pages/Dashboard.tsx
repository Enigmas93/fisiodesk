import { Calendar, Users, DollarSign, Clock, Loader2, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'
import { useAppointments } from '../hooks/useAppointments'
import { usePatients } from '../hooks/usePatients'
import { useFinancialEntries } from '../hooks/useFinancialEntries'

const weekdayLabel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('pt-BR') : '-')

export function Dashboard() {
  const { data: appointments, isLoading: loadingAppointments } = useAppointments()
  const { data: patients, isLoading: loadingPatients } = usePatients()
  const { data: financialEntries, isLoading: loadingFinancial } = useFinancialEntries()

  const isLoading = loadingAppointments || loadingPatients || loadingFinancial

  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - 6)
  weekStart.setHours(0, 0, 0, 0)

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const appointmentsList = appointments || []
  const patientsList = patients || []
  const financialList = financialEntries || []

  const weeklyAppointments = useMemo(
    () =>
      appointmentsList.filter((appointment) => {
        if (!appointment.date) return false
        const date = new Date(`${appointment.date}T00:00:00`)
        return date >= weekStart && date <= now
      }),
    [appointmentsList, weekStart, now]
  )

  const weeklyChart = useMemo(() => {
    const grouped = new Map<string, number>()

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(now)
      date.setDate(now.getDate() - i)
      grouped.set(date.toDateString(), 0)
    }

    weeklyAppointments.forEach((appointment) => {
      const key = new Date(`${appointment.date}T00:00:00`).toDateString()
      grouped.set(key, (grouped.get(key) || 0) + 1)
    })

    return Array.from(grouped.entries()).map(([key, value]) => {
      const date = new Date(key)
      return {
        dia: weekdayLabel[date.getDay()],
        atendimentos: value
      }
    })
  }, [weeklyAppointments, now])

  const upcomingAppointments = useMemo(
    () =>
      appointmentsList
        .filter((appointment) => {
          if (!appointment.date || !appointment.start_time) return false
          const startDateTime = new Date(`${appointment.date}T${appointment.start_time}`)
          return startDateTime >= now && appointment.status !== 'cancelled'
        })
        .sort((a, b) => {
          const aTime = new Date(`${a.date}T${a.start_time}`).getTime()
          const bTime = new Date(`${b.date}T${b.start_time}`).getTime()
          return aTime - bTime
        })
        .slice(0, 5),
    [appointmentsList, now]
  )

  const latestPatients = useMemo(() => patientsList.slice(0, 4), [patientsList])

  const activePatients = patientsList.filter((patient) => patient.status === 'active').length

  const monthlyIncome = financialList
    .filter((entry) => {
      const referenceDate = entry.paid_date || entry.due_date || entry.created_at
      if (!referenceDate) return false
      return new Date(referenceDate) >= monthStart && entry.type === 'income'
    })
    .reduce((sum, entry) => sum + Number(entry.amount), 0)

  const monthlyOverdue = financialList
    .filter((entry) => entry.type === 'income' && entry.status === 'overdue')
    .reduce((sum, entry) => sum + Number(entry.amount), 0)

  const averageDuration = weeklyAppointments.length
    ? Math.round(
        weeklyAppointments.reduce((sum, appointment) => sum + Number(appointment.duration_min || 0), 0) /
          weeklyAppointments.length
      )
    : 0

  const attendanceRate = weeklyAppointments.length
    ? Math.round(
        (weeklyAppointments.filter((appointment) => appointment.status === 'completed').length / weeklyAppointments.length) *
          100
      )
    : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-secondary">{attendanceRate}%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{weeklyAppointments.length}</h3>
          <p className="text-sm text-neutral-500">Atendimentos na semana</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm font-medium text-secondary">{patientsList.length}</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{activePatients}</h3>
          <p className="text-sm text-neutral-500">Pacientes ativos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium text-secondary">Mês atual</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{formatCurrency(monthlyIncome)}</h3>
          <p className="text-sm text-neutral-500">Receitas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <span className="text-sm font-medium text-secondary">Média real</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{averageDuration} min</h3>
          <p className="text-sm text-neutral-500">Tempo médio de atendimento</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-sm font-medium text-red-600">Cobrança</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">{formatCurrency(monthlyOverdue)}</h3>
          <p className="text-sm text-neutral-500">Inadimplência</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Atendimentos por dia da semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="atendimentos" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Próximas consultas</h3>
          <div className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <div className="text-sm text-neutral-500">Nenhuma consulta futura encontrada.</div>
            ) : (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                  <div>
                    <p className="font-medium text-neutral-800">{appointment.patient?.name || 'Paciente'}</p>
                    <p className="text-sm text-neutral-500">{appointment.professional?.name || 'Profissional'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-800">
                      {formatDate(appointment.date)} {appointment.start_time?.slice(0, 5)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        appointment.status === 'confirmed'
                          ? 'bg-secondary/10 text-secondary'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {appointment.status === 'confirmed' ? 'Confirmado' : 'Agendado'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">Últimos pacientes cadastrados</h3>
        {latestPatients.length === 0 ? (
          <div className="text-sm text-neutral-500">Nenhum paciente cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {latestPatients.map((patient) => (
              <div key={patient.id} className="p-4 border border-neutral-200 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-800">{patient.name}</p>
                    <p className="text-sm text-neutral-500">{patient.phone || 'Sem telefone'}</p>
                  </div>
                </div>
                <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                  {patient.status === 'active' ? 'Ativo' : patient.status === 'inactive' ? 'Inativo' : 'Alta'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
