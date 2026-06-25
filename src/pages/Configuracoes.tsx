import { Building, Calendar, CreditCard, Users, Settings } from 'lucide-react';
import { useState } from 'react';

const tabs = [
  { id: 'clinica', label: 'Clínica', icon: Building },
  { id: 'profissionais', label: 'Profissionais', icon: Users },
  { id: 'salas', label: 'Salas', icon: Calendar },
  { id: 'procedimentos', label: 'Procedimentos', icon: CreditCard },
  { id: 'agenda', label: 'Agenda', icon: Settings },
];

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState('clinica');

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
                <button className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors">
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab !== 'clinica' && (
            <div className="py-12 text-center text-neutral-500">
              Configurações de {tabs.find(t => t.id === activeTab)?.label} em desenvolvimento
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
