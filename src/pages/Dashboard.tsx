import { Calendar, Users, DollarSign, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const atendimentosSemana = [
  { dia: 'Seg', atendimentos: 8 },
  { dia: 'Ter', atendimentos: 12 },
  { dia: 'Qua', atendimentos: 15 },
  { dia: 'Qui', atendimentos: 10 },
  { dia: 'Sex', atendimentos: 13 },
  { dia: 'Sáb', atendimentos: 6 },
];

const ultimosPacientes = [
  { id: 1, nome: 'Maria Silva', telefone: '(11) 99999-8888', status: 'Ativo' },
  { id: 2, nome: 'João Pereira', telefone: '(11) 97777-6666', status: 'Ativo' },
  { id: 3, nome: 'Ana Costa', telefone: '(11) 95555-4444', status: 'Ativo' },
];

const proximasConsultas = [
  { id: 1, paciente: 'Maria Silva', hora: '09:00', profissional: 'Dr. João', status: 'Confirmado' },
  { id: 2, paciente: 'João Pereira', hora: '10:00', profissional: 'Dr. João', status: 'Agendado' },
  { id: 3, paciente: 'Ana Costa', hora: '11:00', profissional: 'Dra. Maria', status: 'Confirmado' },
  { id: 4, paciente: 'Carlos Souza', hora: '14:00', profissional: 'Dr. João', status: 'Agendado' },
];

export function Dashboard() {
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-secondary">+12%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">24</h3>
          <p className="text-sm text-neutral-500">Atendimentos na semana</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <span className="text-sm font-medium text-secondary">+8%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">156</h3>
          <p className="text-sm text-neutral-500">Pacientes ativos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-accent" />
            </div>
            <span className="text-sm font-medium text-secondary">+18%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">R$ 12.450</h3>
          <p className="text-sm text-neutral-500">Receitas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-warning" />
            </div>
            <span className="text-sm font-medium text-secondary">92%</span>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">45 min</h3>
          <p className="text-sm text-neutral-500">Tempo médio de atendimento</p>
        </div>
      </div>

      {/* Charts and Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Atendimentos por dia da semana</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atendimentosSemana}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="dia" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="atendimentos" fill="#0EA5E9" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Proximas consultas */}
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Próximas consultas</h3>
          <div className="space-y-4">
            {proximasConsultas.map((consulta) => (
              <div key={consulta.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                <div>
                  <p className="font-medium text-neutral-800">{consulta.paciente}</p>
                  <p className="text-sm text-neutral-500">{consulta.profissional}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-800">{consulta.hora}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    consulta.status === 'Confirmado'
                      ? 'bg-secondary/10 text-secondary'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {consulta.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Últimos pacientes */}
      <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
        <h3 className="text-lg font-semibold text-neutral-800 mb-6">Últimos pacientes cadastrados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ultimosPacientes.map((paciente) => (
            <div key={paciente.id} className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-medium">
                  {paciente.nome.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{paciente.nome}</p>
                  <p className="text-sm text-neutral-500">{paciente.telefone}</p>
                </div>
              </div>
              <span className="text-xs bg-secondary/10 text-secondary px-2 py-1 rounded-full">
                {paciente.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
