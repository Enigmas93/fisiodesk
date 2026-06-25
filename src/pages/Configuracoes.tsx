import { Building, Calendar, CreditCard, Users, Settings, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const tabs = [
  { id: 'clinica', label: 'Clínica', icon: Building },
  { id: 'profissionais', label: 'Profissionais', icon: Users },
  { id: 'salas', label: 'Salas', icon: Calendar },
  { id: 'procedimentos', label: 'Procedimentos', icon: CreditCard },
  { id: 'agenda', label: 'Agenda', icon: Settings },
];

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState('clinica');
  const profissionais = [
    { id: 1, nome: 'Dr. João Silva', especialidade: 'Fisioterapia', email: 'joao@fisiodesk.com' },
    { id: 2, nome: 'Dra. Maria Costa', especialidade: 'Pilates', email: 'maria@fisiodesk.com' },
  ];
  const salas = [
    { id: 1, nome: 'Sala 1', capacidade: 1, equipamentos: 'Cama de fisioterapia' },
    { id: 2, nome: 'Sala 2', capacidade: 2, equipamentos: 'Bolas, elásticos' },
  ];
  const procedimentos = [
    { id: 1, nome: 'Avaliação Inicial', valor: 150, duracao: '60' },
    { id: 2, nome: 'Sessão de Fisioterapia', valor: 100, duracao: '45' },
  ];

  const handleSave = (section: string) => {
    toast.success(`${section} salva com sucesso!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-primary'
                      : 'text-neutral-500 border-transparent hover:text-neutral-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'clinica' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Dados da Clínica</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nome da Clínica</label>
                  <input
                    type="text"
                    defaultValue="FisioDesk Clínica de Fisioterapia"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">CNPJ</label>
                  <input
                    type="text"
                    defaultValue="00.000.000/0001-00"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    defaultValue="(11) 99999-9999"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue="contato@fisiodesk.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <button 
                  onClick={() => handleSave('Clínica')}
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'profissionais' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">Profissionais</h3>
                <button 
                  onClick={() => toast.info('Adicionar profissional em desenvolvimento')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-4">
                {profissionais.map((profissional) => (
                  <div key={profissional.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-800">{profissional.nome}</p>
                      <p className="text-sm text-neutral-500">{profissional.especialidade} • {profissional.email}</p>
                    </div>
                    <button 
                      onClick={() => toast.info('Remover profissional em desenvolvimento')}
                      className="text-danger hover:text-danger/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'salas' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">Salas</h3>
                <button 
                  onClick={() => toast.info('Adicionar sala em desenvolvimento')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-4">
                {salas.map((sala) => (
                  <div key={sala.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-800">{sala.nome}</p>
                      <p className="text-sm text-neutral-500">Capacidade: {sala.capacidade} • {sala.equipamentos}</p>
                    </div>
                    <button 
                      onClick={() => toast.info('Remover sala em desenvolvimento')}
                      className="text-danger hover:text-danger/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'procedimentos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-neutral-800">Procedimentos</h3>
                <button 
                  onClick={() => toast.info('Adicionar procedimento em desenvolvimento')}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
              <div className="space-y-4">
                {procedimentos.map((procedimento) => (
                  <div key={procedimento.id} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                    <div>
                      <p className="font-medium text-neutral-800">{procedimento.nome}</p>
                      <p className="text-sm text-neutral-500">Duração: {procedimento.duracao}min • Valor: R$ {procedimento.valor}</p>
                    </div>
                    <button 
                      onClick={() => toast.info('Remover procedimento em desenvolvimento')}
                      className="text-danger hover:text-danger/80"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agenda' && (
            <div className="max-w-2xl space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Configurações da Agenda</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Início</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Término</label>
                  <input
                    type="time"
                    defaultValue="18:00"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Intervalo padrão (minutos)</label>
                  <input
                    type="number"
                    defaultValue="15"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <button 
                  onClick={() => handleSave('Agenda')}
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
