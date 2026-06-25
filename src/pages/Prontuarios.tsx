import { FileText, Calendar, User } from 'lucide-react';

const prontuarios = [
  { id: 1, paciente: 'Maria Silva', data: '15/06/2025', tipo: 'Avaliação Inicial', profissional: 'Dr. João' },
  { id: 2, paciente: 'Maria Silva', data: '18/06/2025', tipo: 'Evolução', profissional: 'Dr. João' },
  { id: 3, paciente: 'João Pereira', data: '20/06/2025', tipo: 'Reavaliação', profissional: 'Dra. Maria' },
];

export function Prontuarios() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800">Prontuários Recentes</h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {prontuarios.map((prontuario) => (
            <div key={prontuario.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-neutral-800">{prontuario.paciente}</p>
                    <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                      {prontuario.tipo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {prontuario.data}
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {prontuario.profissional}
                    </div>
                  </div>
                </div>
              </div>
              <button className="text-primary hover:underline text-sm font-medium">
                Ver detalhes
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
