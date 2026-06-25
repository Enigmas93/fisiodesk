import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const lancamentos = [
  { id: 1, descricao: 'Consulta - Maria Silva', tipo: 'receita', valor: 150, data: '24/06/2025', status: 'pago' },
  { id: 2, descricao: 'Consulta - João Pereira', tipo: 'receita', valor: 150, data: '24/06/2025', status: 'pendente' },
  { id: 3, descricao: 'Aluguel - Sala 1', tipo: 'despesa', valor: 2000, data: '20/06/2025', status: 'pago' },
  { id: 4, descricao: 'Consulta - Ana Costa', tipo: 'receita', valor: 120, data: '23/06/2025', status: 'pago' },
];

export function Financeiro() {
  const totalReceitas = lancamentos
    .filter((l) => l.tipo === 'receita')
    .reduce((sum, l) => sum + l.valor, 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === 'despesa')
    .reduce((sum, l) => sum + l.valor, 0);

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-secondary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">
            R$ {totalReceitas.toLocaleString('pt-BR')}
          </h3>
          <p className="text-sm text-neutral-500">Receitas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-danger/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-danger" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">
            R$ {totalDespesas.toLocaleString('pt-BR')}
          </h3>
          <p className="text-sm text-neutral-500">Despesas do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">
            R$ {(totalReceitas - totalDespesas).toLocaleString('pt-BR')}
          </h3>
          <p className="text-sm text-neutral-500">Saldo do mês</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-neutral-800 mb-1">R$ 150</h3>
          <p className="text-sm text-neutral-500">Inadimplência</p>
        </div>
      </div>

      {/* Lançamentos */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800">Lançamentos</h3>
        </div>
        <div className="divide-y divide-neutral-200">
          {lancamentos.map((lancamento) => (
            <div key={lancamento.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  lancamento.tipo === 'receita'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-danger/10 text-danger'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-neutral-800">{lancamento.descricao}</p>
                  <p className="text-sm text-neutral-500">{lancamento.data}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-sm px-2 py-1 rounded-full font-medium ${
                  lancamento.status === 'pago'
                    ? 'bg-secondary/10 text-secondary'
                    : 'bg-warning/10 text-warning'
                }`}>
                  {lancamento.status === 'pago' ? 'Pago' : 'Pendente'}
                </span>
                <span className={`text-lg font-bold ${
                  lancamento.tipo === 'receita' ? 'text-secondary' : 'text-danger'
                }`}>
                  {lancamento.tipo === 'receita' ? '+' : '-'} R$ {lancamento.valor.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
