import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppointments, useUpdateAppointment } from '../hooks/useAppointments'
import { useProfessionals } from '../hooks/useLookupData'
import { CalendarPlus2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type CalendarDateClickArg = {
  date: Date
  dateStr: string
  allDay: boolean
}

type CalendarDateSelectArg = {
  start: Date
  end: Date
}

type CalendarEventBase = {
  id: string
  start: Date | null
  end: Date | null
}

type CalendarEventClickArg = {
  event: CalendarEventBase
}

type CalendarEventMutationArg = {
  event: CalendarEventBase
  revert: () => void
}

export function Agenda() {
  const navigate = useNavigate()
  const { date } = useParams<{ date?: string }>()
  const { data: appointments, isLoading, error } = useAppointments()
  const { data: professionals } = useProfessionals()
  const updateAppointment = useUpdateAppointment()

  const [agendaSettings] = useState(() => {
    const saved = localStorage.getItem('agendaSettings')
    return saved ? JSON.parse(saved) : {
      startTime: '08:00',
      endTime: '18:00',
      slotDuration: 15,
      defaultView: 'timeGridWeek',
      showWeekends: false
    }
  })

  const [filters, setFilters] = useState({
    professionalId: 'todos',
    status: 'todos'
  })

  const formatSlotDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`
  }

  const resolveCalendarView = (view: string) => {
    switch (view) {
      case 'day':
        return 'timeGridDay'
      case 'month':
        return 'dayGridMonth'
      case 'agenda':
        return 'listWeek'
      case 'week':
      default:
        return 'timeGridWeek'
    }
  }

  const formatDate = (value: Date) => value.toISOString().split('T')[0]
  const formatTime = (value: Date) => value.toTimeString().slice(0, 5)

  const openCreateForm = (params: { date: string; start?: string; end?: string }) => {
    const searchParams = new URLSearchParams()
    searchParams.set('date', params.date)
    if (params.start) searchParams.set('start', params.start)
    if (params.end) searchParams.set('end', params.end)
    navigate(`/agenda/novo?${searchParams.toString()}`)
  }

  const handleDateClick = (info: CalendarDateClickArg) => {
    const selectedDate = formatDate(info.date)
    const selectedTime = info.allDay ? agendaSettings.startTime : formatTime(info.date)
    openCreateForm({
      date: selectedDate,
      start: selectedTime
    })
  }

  const handleEventClick = (info: CalendarEventClickArg) => {
    navigate(`/agenda/${info.event.id}/editar`)
  }

  const handleSelect = (info: CalendarDateSelectArg) => {
    openCreateForm({
      date: formatDate(info.start),
      start: formatTime(info.start),
      end: formatTime(info.end)
    })
  }

  const handleReschedule = async (info: CalendarEventMutationArg) => {
    try {
      await updateAppointment.mutateAsync({
        id: info.event.id,
        date: formatDate(info.event.start ?? new Date()),
        start_time: formatTime(info.event.start ?? new Date()),
        end_time: formatTime(info.event.end ?? info.event.start ?? new Date()),
        duration_min: info.event.start && info.event.end
          ? Math.max(15, Math.round((info.event.end.getTime() - info.event.start.getTime()) / 60000))
          : undefined
      })
      toast.success('Agendamento atualizado com sucesso!')
    } catch (updateError: any) {
      info.revert()
      toast.error(updateError.message || 'Não foi possível atualizar o agendamento.')
    }
  }

  const filteredAppointments = useMemo(() => {
    return (appointments || []).filter((appointment) => {
      const matchesProfessional =
        filters.professionalId === 'todos' || appointment.professional_id === filters.professionalId

      const matchesStatus =
        filters.status === 'todos' || appointment.status === filters.status

      return matchesProfessional && matchesStatus
    })
  }, [appointments, filters])

  const calendarEvents = filteredAppointments.map((appointment) => ({
    id: appointment.id,
    title: appointment.patient?.name || 'Paciente',
    start: `${appointment.date}T${appointment.start_time}`,
    end: `${appointment.date}T${appointment.end_time}`,
    backgroundColor: getStatusColor(appointment.status),
    borderColor: getStatusColor(appointment.status),
    extendedProps: {
      status: appointment.status,
      professionalName: appointment.professional?.name || 'Profissional',
      procedureName: appointment.procedure?.name || null,
      roomName: appointment.room?.name || null
    }
  }))

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
        <p className="text-red-600 mb-4">Erro ao carregar agenda</p>
        <p className="text-neutral-500 text-sm">{(error as any).message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-2">Filtros da agenda</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select
                value={filters.professionalId}
                onChange={(e) => setFilters((prev) => ({ ...prev, professionalId: e.target.value }))}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="todos">Todos os profissionais</option>
                {professionals?.map((professional) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="todos">Todos os status</option>
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="in_progress">Em andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
                <option value="no_show">Não compareceu</option>
              </select>

              <button
                type="button"
                onClick={() =>
                  openCreateForm({
                    date: date || formatDate(new Date()),
                    start: agendaSettings.startTime
                  })
                }
                className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <CalendarPlus2 className="w-4 h-4" />
                Novo Agendamento
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="h-[650px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView={resolveCalendarView(agendaSettings.defaultView || 'week')}
          initialDate={date}
          locale={ptBrLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'listWeek,dayGridMonth,timeGridWeek,timeGridDay',
          }}
          slotMinTime={`${agendaSettings.startTime}:00`}
          slotMaxTime={`${agendaSettings.endTime}:00`}
          slotDuration={formatSlotDuration(agendaSettings.slotDuration)}
          weekends={Boolean(agendaSettings.showWeekends)}
          editable
          selectable
          selectMirror
          events={calendarEvents}
          height="100%"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          select={handleSelect}
          eventDrop={handleReschedule}
          eventResize={handleReschedule}
          eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        />
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'scheduled':
      return '#0EA5E9'
    case 'confirmed':
      return '#10B981'
    case 'in_progress':
      return '#6366F1'
    case 'completed':
      return '#94A3B8'
    case 'cancelled':
      return '#EF4444'
    case 'no_show':
      return '#F59E0B'
    default:
      return '#0EA5E9'
  }
}
