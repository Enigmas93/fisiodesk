import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';

const eventos = [
  {
    title: 'Maria Silva - Avaliação Inicial',
    start: '2025-06-24T09:00:00',
    end: '2025-06-24T10:00:00',
    backgroundColor: '#0EA5E9',
  },
  {
    title: 'João Pereira - Sessão',
    start: '2025-06-24T10:00:00',
    end: '2025-06-24T11:00:00',
    backgroundColor: '#10B981',
  },
  {
    title: 'Ana Costa - Reavaliação',
    start: '2025-06-24T11:00:00',
    end: '2025-06-24T12:00:00',
    backgroundColor: '#6366F1',
  },
];

export function Agenda() {

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
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          events={eventos}
          height="100%"
        />
      </div>
    </div>
  );
}
