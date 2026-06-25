import { Building, Calendar, CreditCard, Users, Settings, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
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
  
  // Estado para Profissionais
  const [profissionais, setProfissionais] = useState([
    { id: 1, nome: 'Dr. João Silva', especialidade: 'Fisioterapia', email: 'joao@fisiodesk.com' },
    { id: 2, nome: 'Dra. Maria Costa', especialidade: 'Pilates', email: 'maria@fisiodesk.com' },
  ]);
  const [editingProfissional, setEditingProfissional] = useState<number | null>(null);
  const [showAddProfissional, setShowAddProfissional] = useState(false);
  const [newProfissional, setNewProfissional] = useState({ nome: '', especialidade: '', email: '' });

  // Estado para Salas
  const [salas, setSalas] = useState([
    { id: 1, nome: 'Sala 1', capacidade: 1, equipamentos: 'Cama de fisioterapia' },
    { id: 2, nome: 'Sala 2', capacidade: 2, equipamentos: 'Bolas, elásticos' },
  ]);
  const [editingSala, setEditingSala] = useState<number | null>(null);
  const [showAddSala, setShowAddSala] = useState(false);
  const [newSala, setNewSala] = useState({ nome: '', capacidade: 1, equipamentos: '' });

  // Estado para Procedimentos
  const [procedimentos, setProcedimentos] = useState([
    { id: 1, nome: 'Avaliação Inicial', valor: 150, duracao: '60' },
    { id: 2, nome: 'Sessão de Fisioterapia', valor: 100, duracao: '45' },
  ]);
  const [editingProcedimento, setEditingProcedimento] = useState<number | null>(null);
  const [showAddProcedimento, setShowAddProcedimento] = useState(false);
  const [newProcedimento, setNewProcedimento] = useState({ nome: '', valor: 0, duracao: '30' });

  const handleSave = (section: string) => {
    toast.success(`${section} salva com sucesso!`);
  };

  // Funções para Profissionais
  const handleAddProfissional = () => {
    if (!newProfissional.nome || !newProfissional.especialidade || !newProfissional.email) {
      toast.error('Preencha todos os campos');
      return;
    }
    const id = Math.max(...profissionais.map(p => p.id)) + 1;
    setProfissionais([...profissionais, { ...newProfissional, id }]);
    setNewProfissional({ nome: '', especialidade: '', email: '' });
    setShowAddProfissional(false);
    toast.success('Profissional adicionado!');
  };

  const handleEditProfissional = (id: number) => {
    setEditingProfissional(id);
  };

  const handleSaveProfissional = (id: number, updated: any) => {
    setProfissionais(profissionais.map(p => p.id === id ? { ...p, ...updated } : p));
    setEditingProfissional(null);
    toast.success('Profissional atualizado!');
  };

  const handleDeleteProfissional = (id: number) => {
    setProfissionais(profissionais.filter(p => p.id !== id));
    toast.success('Profissional removido!');
  };

  // Funções para Salas
  const handleAddSala = () => {
    if (!newSala.nome || !newSala.equipamentos) {
      toast.error('Preencha todos os campos');
      return;
    }
    const id = Math.max(...salas.map(s => s.id)) + 1;
    setSalas([...salas, { ...newSala, id }]);
    setNewSala({ nome: '', capacidade: 1, equipamentos: '' });
    setShowAddSala(false);
    toast.success('Sala adicionada!');
  };

  const handleEditSala = (id: number) => {
    setEditingSala(id);
  };

  const handleSaveSala = (id: number, updated: any) => {
    setSalas(salas.map(s => s.id === id ? { ...s, ...updated } : s));
    setEditingSala(null);
    toast.success('Sala atualizada!');
  };

  const handleDeleteSala = (id: number) => {
    setSalas(salas.filter(s => s.id !== id));
    toast.success('Sala removida!');
  };

  // Funções para Procedimentos
  const handleAddProcedimento = () => {
    if (!newProcedimento.nome || !newProcedimento.valor || !newProcedimento.duracao) {
      toast.error('Preencha todos os campos');
      return;
    }
    const id = Math.max(...procedimentos.map(p => p.id)) + 1;
    setProcedimentos([...procedimentos, { ...newProcedimento, id }]);
    setNewProcedimento({ nome: '', valor: 0, duracao: '30' });
    setShowAddProcedimento(false);
    toast.success('Procedimento adicionado!');
  };

  const handleEditProcedimento = (id: number) => {
    setEditingProcedimento(id);
  };

  const handleSaveProcedimento = (id: number, updated: any) => {
    setProcedimentos(procedimentos.map(p => p.id === id ? { ...p, ...updated } : p));
    setEditingProcedimento(null);
    toast.success('Procedimento atualizado!');
  };

  const handleDeleteProcedimento = (id: number) => {
    setProcedimentos(procedimentos.filter(p => p.id !== id));
    toast.success('Procedimento removido!');
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
                  onClick={() => setShowAddProfissional(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {showAddProfissional && (
                <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-800">Novo Profissional</h4>
                    <button onClick={() => setShowAddProfissional(false)}>
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={newProfissional.nome}
                        onChange={(e) => setNewProfissional({ ...newProfissional, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                      <input
                        type="text"
                        value={newProfissional.especialidade}
                        onChange={(e) => setNewProfissional({ ...newProfissional, especialidade: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newProfissional.email}
                        onChange={(e) => setNewProfissional({ ...newProfissional, email: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddProfissional}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                    <button 
                      onClick={() => setShowAddProfissional(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {profissionais.map((profissional) => (
                  <div key={profissional.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingProfissional === profissional.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              defaultValue={profissional.nome}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-nome-${profissional.id}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                            <input
                              type="text"
                              defaultValue={profissional.especialidade}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-especialidade-${profissional.id}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                            <input
                              type="email"
                              defaultValue={profissional.email}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-email-${profissional.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const nome = (document.getElementById(`edit-nome-${profissional.id}`) as HTMLInputElement).value;
                              const especialidade = (document.getElementById(`edit-especialidade-${profissional.id}`) as HTMLInputElement).value;
                              const email = (document.getElementById(`edit-email-${profissional.id}`) as HTMLInputElement).value;
                              handleSaveProfissional(profissional.id, { nome, especialidade, email });
                            }}
                            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingProfissional(null)}
                            className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">{profissional.nome}</p>
                          <p className="text-sm text-neutral-500">{profissional.especialidade} • {profissional.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProfissional(profissional.id)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProfissional(profissional.id)}
                            className="text-danger hover:text-danger/80 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
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
                  onClick={() => setShowAddSala(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {showAddSala && (
                <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-800">Nova Sala</h4>
                    <button onClick={() => setShowAddSala(false)}>
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={newSala.nome}
                        onChange={(e) => setNewSala({ ...newSala, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Capacidade</label>
                      <input
                        type="number"
                        value={newSala.capacidade}
                        onChange={(e) => setNewSala({ ...newSala, capacidade: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Equipamentos</label>
                      <input
                        type="text"
                        value={newSala.equipamentos}
                        onChange={(e) => setNewSala({ ...newSala, equipamentos: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddSala}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                    <button 
                      onClick={() => setShowAddSala(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {salas.map((sala) => (
                  <div key={sala.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingSala === sala.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              defaultValue={sala.nome}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-sala-nome-${sala.id}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Capacidade</label>
                            <input
                              type="number"
                              defaultValue={sala.capacidade}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-sala-capacidade-${sala.id}`}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Equipamentos</label>
                            <input
                              type="text"
                              defaultValue={sala.equipamentos}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-sala-equipamentos-${sala.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const nome = (document.getElementById(`edit-sala-nome-${sala.id}`) as HTMLInputElement).value;
                              const capacidade = parseInt((document.getElementById(`edit-sala-capacidade-${sala.id}`) as HTMLInputElement).value) || 1;
                              const equipamentos = (document.getElementById(`edit-sala-equipamentos-${sala.id}`) as HTMLInputElement).value;
                              handleSaveSala(sala.id, { nome, capacidade, equipamentos });
                            }}
                            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingSala(null)}
                            className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">{sala.nome}</p>
                          <p className="text-sm text-neutral-500">Capacidade: {sala.capacidade} • {sala.equipamentos}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditSala(sala.id)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSala(sala.id)}
                            className="text-danger hover:text-danger/80 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
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
                  onClick={() => setShowAddProcedimento(true)}
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>

              {showAddProcedimento && (
                <div className="p-4 border border-neutral-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-neutral-800">Novo Procedimento</h4>
                    <button onClick={() => setShowAddProcedimento(false)}>
                      <X className="w-4 h-4 text-neutral-500" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={newProcedimento.nome}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, nome: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Valor (R$)</label>
                      <input
                        type="number"
                        value={newProcedimento.valor}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, valor: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Duração (min)</label>
                      <input
                        type="text"
                        value={newProcedimento.duracao}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, duracao: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleAddProcedimento}
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Salvar
                    </button>
                    <button 
                      onClick={() => setShowAddProcedimento(false)}
                      className="px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {procedimentos.map((procedimento) => (
                  <div key={procedimento.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingProcedimento === procedimento.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              defaultValue={procedimento.nome}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-proc-nome-${procedimento.id}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Valor (R$)</label>
                            <input
                              type="number"
                              defaultValue={procedimento.valor}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-proc-valor-${procedimento.id}`}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Duração (min)</label>
                            <input
                              type="text"
                              defaultValue={procedimento.duracao}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                              id={`edit-proc-duracao-${procedimento.id}`}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => {
                              const nome = (document.getElementById(`edit-proc-nome-${procedimento.id}`) as HTMLInputElement).value;
                              const valor = parseFloat((document.getElementById(`edit-proc-valor-${procedimento.id}`) as HTMLInputElement).value) || 0;
                              const duracao = (document.getElementById(`edit-proc-duracao-${procedimento.id}`) as HTMLInputElement).value;
                              handleSaveProcedimento(procedimento.id, { nome, valor, duracao });
                            }}
                            className="flex items-center gap-2 bg-secondary hover:bg-secondary-dark text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                            Salvar
                          </button>
                          <button 
                            onClick={() => setEditingProcedimento(null)}
                            className="px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-neutral-800">{procedimento.nome}</p>
                          <p className="text-sm text-neutral-500">Duração: {procedimento.duracao}min • Valor: R$ {procedimento.valor}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProcedimento(procedimento.id)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProcedimento(procedimento.id)}
                            className="text-danger hover:text-danger/80 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
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
