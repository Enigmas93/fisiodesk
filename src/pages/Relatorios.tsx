import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const atendimentosMes = [
  { mes: 'Jan', atendimentos: 45 },
  { mes: 'Fev', atendimentos: 52 },
  { mes: 'Mar', atendimentos: 68 },
  { mes: 'Abr', atendimentos: 72 },
  { mes: 'Mai', atendimentos: 65 },
  { mes: 'Jun', atendimentos: 80 },
];

const pacientesStatus = [
  { name: 'Ativos', value: 120, color: '#10B981' },
  { name: 'Inativos', value: 25, color: '#F59E0B' },
  { name: 'Alta', value: 15, color: '#6366F1' },
];

const relatorios = [
  {
    titulo: 'Atendimentos por período',
    descricao: 'Visualize a quantidade de atendimentos em um intervalo de datas',
    icon: '📊',
  },
  {
    titulo: 'Taxa de presença',
    descricao: 'Analise a taxa de comparecimento, faltas e cancelamentos',
    icon: '✅',
  },
  {
    titulo: 'Financeiro',
    descricao: 'Receitas, despesas e lucratividade da clínica',
    icon: '💰',
  },
  {
    titulo: 'Pacientes',
    descricao: 'Distribuição de pacientes por convênio, faixa etária e status',
    icon: '👥',
  },
];

export function Relatorios() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatorios.map((relatorio, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">{relatorio.icon}</div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">{relatorio.titulo}</h3>
            <p className="text-sm text-neutral-500">{relatorio.descricao}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Atendimentos por mês</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atendimentosMes}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="mes" axisLine={false} tickLine={false} />
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

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <h3 className="text-lg font-semibold text-neutral-800 mb-6">Status dos Pacientes</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pacientesStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pacientesStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
