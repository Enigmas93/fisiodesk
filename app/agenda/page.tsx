'use client';

import Calendar from '@/components/Calendar';

export default function Agenda() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Agenda</h2>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Novo Atendimento
        </button>
      </div>
      <Calendar />
    </div>
  );
}
