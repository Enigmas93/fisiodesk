'use client';

import { useState } from 'react';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'canceled';
}

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date: Date): Day[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Day[] = [];

    // Add days from previous month
    const startDay = firstDay.getDay();
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isToday: isToday(prevDate),
        appointments: [],
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        isToday: isToday(currentDate),
        appointments: getMockAppointments(currentDate),
      });
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isToday: isToday(nextDate),
        appointments: [],
      });
    }

    return days;
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const getMockAppointments = (date: Date): Appointment[] => {
    // Mock appointments for demonstration
    if (date.getDate() % 3 === 0) {
      return [
        {
          id: '1',
          patientName: 'Maria Silva',
          time: '09:00',
          type: 'Fisioterapia',
          status: 'confirmed',
        },
        {
          id: '2',
          patientName: 'João Pereira',
          time: '10:30',
          type: 'Avaliação',
          status: 'scheduled',
        },
      ];
    }
    return [];
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500';
      case 'scheduled':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-gray-500';
      case 'canceled':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={prevMonth}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            ←
          </button>
          <button 
            onClick={nextMonth}
            className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div 
            key={day} 
            className="text-center font-semibold text-gray-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            className={`min-h-[120px] p-2 border rounded ${
              day.isToday ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
            } ${!day.isCurrentMonth ? 'opacity-50' : ''}`}
          >
            <div className="font-semibold text-sm mb-2">{day.date.getDate()}</div>
            <div className="space-y-1">
              {day.appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={`text-xs p-1 rounded ${getStatusColor(appointment.status)} text-white truncate`}
                  title={`${appointment.patientName} - ${appointment.time}`}
                >
                  {appointment.time} {appointment.patientName}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
