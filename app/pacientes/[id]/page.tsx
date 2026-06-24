'use client';

import React, { useState } from 'react';

interface MedicalRecord {
  id: string;
  date: string;
  type: string;
  professional: string;
  notes: string;
}

const mockRecords: MedicalRecord[] = [
  {
    id: '1',
    date: '2024-06-15',
    type: 'Avaliação',
    professional: 'Dr. José Santos',
    notes: 'Paciente relata dor na coluna lombar há 2 semanas...',
  },
  {
    id: '2',
    date: '2024-06-20',
    type: 'Evolução',
    professional: 'Dr. José Santos',
    notes: 'Paciente apresentou melhora significativa...',
  },
];

export default function Prontuario({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const [records, setRecords] = useState<MedicalRecord[]>(mockRecords);
  const [activeTab, setActiveTab] = useState<'records' | 'info' | 'appointments'>('records');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Maria Silva</h2>
          <p className="text-gray-600">CPF: 123.456.789-00</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Nova Anotação
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('records')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'records'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Prontuário
            </button>
            <button
              onClick={() => setActiveTab('info')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Dados do Paciente
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'appointments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Atendimentos
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'records' && (
            <div className="space-y-4">
              {records.map((record) => (
                <div key={record.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                        {record.type}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        {record.date} - {record.professional}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      ...
                    </button>
                  </div>
                  <p className="text-gray-700">{record.notes}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informações Pessoais</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Nome:</span>
                    <p>Maria Silva</p>
                  </div>
                  <div>
                    <span className="text-gray-600">CPF:</span>
                    <p>123.456.789-00</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data de Nascimento:</span>
                    <p>15/05/1990</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Gênero:</span>
                    <p>Feminino</p>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contato</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p>maria@email.com</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefone:</span>
                    <p>(11) 98765-4321</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <p>Histórico de atendimentos aparecerá aqui...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
