import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { useAppointments } from '../hooks/useAppointments'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export function Agenda() {
  const { data: appointments, isLoading, error } = useAppointments()
  
  // Carregar configurações da agenda do localStorage
  const [agendaSettings] = useState(() => {
    const saved = localStorage.getItem('agendaSettings');
    return saved ? JSON.parse(saved) : {
      startTime: '08:00',
      endTime: '18:00',
      slotDuration: 15
    };
  })
  
  // Formatar slotDuration para FullCalendar (ex: 15 -> '00:15:00')
  const formatSlotDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
  };

  const handleDateClick = (info: any) => {
    toast.info(`Data selecionada: ${info.dateStr}`)
  }

  const handleEventClick = (info: any) => {
    toast.info(`Evento clicado: ${info.event.title}`)
  }

  const handleSelect = (info: any) => {
    toast.info(`Selecionado: ${info.startStr} até ${info.endStr}`)
  }

  const calendarEvents = appointments?.map(appt => ({
    id: appt.id,
    title: appt.patient?.name || 'Paciente',
    start: appt.date + 'T' + appt.start_time,
    end: appt.date + 'T' + appt.end_time,
    backgroundColor: getStatusColor(appt.status),
  })) || []

  const mockEvents = [
    {
      title: 'Maria Silva - Avaliação Inicial',
      start: new Date().toISOString().split('T')[0] + 'T09:00:00',
      end: new Date().toISOString().split('T')[0] + 'T10:00:00',
      backgroundColor: '#0EA5E9',
    },
    {
      title: 'João Pereira - Sessão',
      start: new Date().toISOString().split('T')[0] + 'T10:00:00',
      end: new Date().toISOString().split('T')[0] + 'T11:00:00',
      backgroundColor: '#10B981',
    },
  ]

  const events = calendarEvents.length > 0 ? calendarEvents : mockEvents

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
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
      <div className="h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          locale={ptBrLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          slotMinTime={`${agendaSettings.startTime}:00`}
          slotMaxTime={`${agendaSettings.endTime}:00`}
          slotDuration={formatSlotDuration(agendaSettings.slotDuration)}
          events={events}
          height="100%"
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          selectable={true}
          select={handleSelect}
        />
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
