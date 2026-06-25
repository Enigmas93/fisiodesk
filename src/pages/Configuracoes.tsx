import { Building, Calendar, CreditCard, Users, Settings, Plus, Trash2, Edit2, X, Check, Loader2, Link2, Unplug } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  useProfessionals,
  useCreateProfessional,
  useUpdateProfessional,
  useDeleteProfessional,
  useRooms,
  useCreateRoom,
  useUpdateRoom,
  useDeleteRoom,
  useProcedures,
  useCreateProcedure,
  useUpdateProcedure,
  useDeleteProcedure,
} from '../hooks/useLookupData';
import { useClinicProfile, useUpdateClinicProfile } from '../hooks/useClinicProfile';
import { useGoogleConnection, useDisconnectGoogle } from '../hooks/useGoogleConnection';
import { useTenantContext } from '../hooks/useTenantContext';
import { initiateGoogleOAuth } from '../lib/google';
import { getEnvChecklist, isCoreEnvConfigured, isDeployEnvConfigured, isGoogleEnvConfigured } from '../lib/env';
import type { Professional, Room, Procedure, Clinic } from '../types';

const tabs = [
  { id: 'clinica', label: 'Clínica', icon: Building },
  { id: 'profissionais', label: 'Profissionais', icon: Users },
  { id: 'salas', label: 'Salas', icon: Calendar },
  { id: 'procedimentos', label: 'Procedimentos', icon: CreditCard },
  { id: 'agenda', label: 'Agenda', icon: Settings },
  { id: 'integracoes', label: 'Integrações', icon: Link2 },
];

export function Configuracoes() {
  const [activeTab, setActiveTab] = useState('clinica');
  const { data: tenantContext } = useTenantContext({ required: false });
  const { data: clinic, isLoading: loadingClinic } = useClinicProfile();
  const updateClinic = useUpdateClinicProfile();
  const { data: googleConnection, isLoading: loadingGoogleConnection } = useGoogleConnection();
  const disconnectGoogle = useDisconnectGoogle();
  const [clinicForm, setClinicForm] = useState<Partial<Clinic>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    logo_url: ''
  });
  
  // Estado para configurações da agenda (carregado do localStorage)
  const [agendaSettings, setAgendaSettings] = useState(() => {
    const saved = localStorage.getItem('agendaSettings');
    return saved ? JSON.parse(saved) : {
      startTime: '08:00',
      endTime: '18:00',
      slotDuration: 15
    };
  });

  // Profissionais
  const { data: profissionais, isLoading: loadingProfissionais } = useProfessionals();
  const createProfessional = useCreateProfessional();
  const updateProfessional = useUpdateProfessional();
  const deleteProfessional = useDeleteProfessional();
  const [editingProfissional, setEditingProfissional] = useState<string | null>(null);
  const [showAddProfissional, setShowAddProfissional] = useState(false);
  const [newProfissional, setNewProfissional] = useState<Partial<Professional>>({
    name: '',
    specialty: '',
    email: '',
    is_active: true,
  });
  const [editProfissionalForm, setEditProfissionalForm] = useState<Partial<Professional>>({});

  // Salas
  const { data: salas, isLoading: loadingSalas } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const [editingSala, setEditingSala] = useState<string | null>(null);
  const [showAddSala, setShowAddSala] = useState(false);
  const [newSala, setNewSala] = useState<Partial<Room>>({
    name: '',
    capacity: 1,
    description: '',
    is_active: true,
  });
  const [editSalaForm, setEditSalaForm] = useState<Partial<Room>>({});

  // Procedimentos
  const { data: procedimentos, isLoading: loadingProcedimentos } = useProcedures();
  const createProcedure = useCreateProcedure();
  const updateProcedure = useUpdateProcedure();
  const deleteProcedure = useDeleteProcedure();
  const [editingProcedimento, setEditingProcedimento] = useState<string | null>(null);
  const [showAddProcedimento, setShowAddProcedimento] = useState(false);
  const [newProcedimento, setNewProcedimento] = useState<Partial<Procedure>>({
    name: '',
    price: 0,
    duration_min: 30,
    is_active: true,
  });
  const [editProcedimentoForm, setEditProcedimentoForm] = useState<Partial<Procedure>>({});
  const envChecklist = getEnvChecklist();

  useEffect(() => {
    if (clinic) {
      setClinicForm({
        id: clinic.id,
        name: clinic.name || '',
        phone: clinic.phone || '',
        email: clinic.email || '',
        address: clinic.address || '',
        logo_url: clinic.logo_url || ''
      });
    }
  }, [clinic]);

  const handleSaveClinic = async () => {
    try {
      await updateClinic.mutateAsync(clinicForm);
      toast.success('Dados da clínica salvos com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dados da clínica');
    }
  };
  
  // Função para salvar configurações da agenda
  const handleSaveAgenda = () => {
    localStorage.setItem('agendaSettings', JSON.stringify(agendaSettings));
    toast.success('Configurações da agenda salvas com sucesso!');
  };

  // Funções para Profissionais
  const handleAddProfissional = async () => {
    if (!newProfissional.name || !newProfissional.specialty || !newProfissional.email) {
      toast.error('Preencha todos os campos');
      return;
    }
    try {
      await createProfessional.mutateAsync(newProfissional as any);
      setNewProfissional({ name: '', specialty: '', email: '', is_active: true });
      setShowAddProfissional(false);
      toast.success('Profissional adicionado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar profissional');
    }
  };

  const handleEditProfissional = (prof: Professional) => {
    setEditingProfissional(prof.id);
    setEditProfissionalForm({ ...prof });
  };

  const handleSaveProfissional = async () => {
    if (!editingProfissional) return;
    try {
      await updateProfessional.mutateAsync({
        id: editingProfissional,
        ...editProfissionalForm,
      } as any);
      setEditingProfissional(null);
      toast.success('Profissional atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar profissional');
    }
  };

  const handleDeleteProfissional = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return;
    try {
      await deleteProfessional.mutateAsync(id);
      toast.success('Profissional removido!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover profissional');
    }
  };

  // Funções para Salas
  const handleAddSala = async () => {
    if (!newSala.name) {
      toast.error('Preencha o nome da sala');
      return;
    }
    try {
      await createRoom.mutateAsync(newSala as any);
      setNewSala({ name: '', capacity: 1, description: '', is_active: true });
      setShowAddSala(false);
      toast.success('Sala adicionada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar sala');
    }
  };

  const handleEditSala = (sala: Room) => {
    setEditingSala(sala.id);
    setEditSalaForm({ ...sala });
  };

  const handleSaveSala = async () => {
    if (!editingSala) return;
    try {
      await updateRoom.mutateAsync({
        id: editingSala,
        ...editSalaForm,
      } as any);
      setEditingSala(null);
      toast.success('Sala atualizada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar sala');
    }
  };

  const handleDeleteSala = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta sala?')) return;
    try {
      await deleteRoom.mutateAsync(id);
      toast.success('Sala removida!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover sala');
    }
  };

  // Funções para Procedimentos
  const handleAddProcedimento = async () => {
    if (!newProcedimento.name || !newProcedimento.duration_min) {
      toast.error('Preencha nome e duração');
      return;
    }
    try {
      await createProcedure.mutateAsync(newProcedimento as any);
      setNewProcedimento({ name: '', price: 0, duration_min: 30, is_active: true });
      setShowAddProcedimento(false);
      toast.success('Procedimento adicionado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar procedimento');
    }
  };

  const handleEditProcedimento = (proc: Procedure) => {
    setEditingProcedimento(proc.id);
    setEditProcedimentoForm({ ...proc });
  };

  const handleSaveProcedimento = async () => {
    if (!editingProcedimento) return;
    try {
      await updateProcedure.mutateAsync({
        id: editingProcedimento,
        ...editProcedimentoForm,
      } as any);
      setEditingProcedimento(null);
      toast.success('Procedimento atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar procedimento');
    }
  };

  const handleDeleteProcedimento = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este procedimento?')) return;
    try {
      await deleteProcedure.mutateAsync(id);
      toast.success('Procedimento removido!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover procedimento');
    }
  };

  const handleDisconnectGoogle = async () => {
    if (!confirm('Tem certeza que deseja desconectar a integração com o Google?')) return;
    try {
      await disconnectGoogle.mutateAsync();
      toast.success('Integração Google desconectada!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desconectar integração');
    }
  };

  const isGoogleConnected = Boolean(googleConnection?.access_token);
  const isGoogleExpired = Boolean(
    googleConnection?.expires_at && new Date(googleConnection.expires_at).getTime() < Date.now()
  );
  const coreEnvReady = isCoreEnvConfigured();
  const googleEnvReady = isGoogleEnvConfigured();
  const deployEnvReady = isDeployEnvConfigured();

  if (loadingProfissionais || loadingSalas || loadingProcedimentos || loadingClinic || loadingGoogleConnection) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

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
                    value={clinicForm.name || ''}
                    onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={clinicForm.phone || ''}
                    onChange={(e) => setClinicForm({ ...clinicForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={clinicForm.email || ''}
                    onChange={(e) => setClinicForm({ ...clinicForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={clinicForm.address || ''}
                    onChange={(e) => setClinicForm({ ...clinicForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={clinicForm.logo_url || ''}
                    onChange={(e) => setClinicForm({ ...clinicForm, logo_url: e.target.value })}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
                  Clínica atual: <span className="font-medium text-neutral-800">{tenantContext?.clinicName || clinicForm.name || 'Sem nome'}</span>
                </div>
                <button 
                  onClick={handleSaveClinic}
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
                        value={newProfissional.name}
                        onChange={(e) => setNewProfissional({ ...newProfissional, name: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                      <input
                        type="text"
                        value={newProfissional.specialty || ''}
                        onChange={(e) => setNewProfissional({ ...newProfissional, specialty: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={newProfissional.email || ''}
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
                {profissionais?.map((profissional) => (
                  <div key={profissional.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingProfissional === profissional.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              value={editProfissionalForm.name || ''}
                              onChange={(e) => setEditProfissionalForm({ ...editProfissionalForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                            <input
                              type="text"
                              value={editProfissionalForm.specialty || ''}
                              onChange={(e) => setEditProfissionalForm({ ...editProfissionalForm, specialty: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={editProfissionalForm.email || ''}
                              onChange={(e) => setEditProfissionalForm({ ...editProfissionalForm, email: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={handleSaveProfissional}
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
                          <p className="font-medium text-neutral-800">{profissional.name}</p>
                          <p className="text-sm text-neutral-500">{profissional.specialty} • {profissional.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProfissional(profissional)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProfissional(profissional.id)}
                            className="text-red-500 hover:text-red-600 p-2"
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
                        value={newSala.name}
                        onChange={(e) => setNewSala({ ...newSala, name: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Capacidade</label>
                      <input
                        type="number"
                        value={newSala.capacity || 1}
                        onChange={(e) => setNewSala({ ...newSala, capacity: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Descrição</label>
                      <input
                        type="text"
                        value={newSala.description || ''}
                        onChange={(e) => setNewSala({ ...newSala, description: e.target.value })}
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
                {salas?.map((sala) => (
                  <div key={sala.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingSala === sala.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              value={editSalaForm.name || ''}
                              onChange={(e) => setEditSalaForm({ ...editSalaForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Capacidade</label>
                            <input
                              type="number"
                              value={editSalaForm.capacity || 1}
                              onChange={(e) => setEditSalaForm({ ...editSalaForm, capacity: parseInt(e.target.value) || 1 })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Descrição</label>
                            <input
                              type="text"
                              value={editSalaForm.description || ''}
                              onChange={(e) => setEditSalaForm({ ...editSalaForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={handleSaveSala}
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
                          <p className="font-medium text-neutral-800">{sala.name}</p>
                          <p className="text-sm text-neutral-500">Capacidade: {sala.capacity} • {sala.description}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditSala(sala)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteSala(sala.id)}
                            className="text-red-500 hover:text-red-600 p-2"
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
                        value={newProcedimento.name}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, name: e.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Valor (R$)</label>
                      <input
                        type="number"
                        value={newProcedimento.price || 0}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Duração (min)</label>
                      <input
                        type="number"
                        value={newProcedimento.duration_min || 30}
                        onChange={(e) => setNewProcedimento({ ...newProcedimento, duration_min: parseInt(e.target.value) || 30 })}
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
                {procedimentos?.map((procedimento) => (
                  <div key={procedimento.id} className="p-4 border border-neutral-200 rounded-lg">
                    {editingProcedimento === procedimento.id ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                            <input
                              type="text"
                              value={editProcedimentoForm.name || ''}
                              onChange={(e) => setEditProcedimentoForm({ ...editProcedimentoForm, name: e.target.value })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Valor (R$)</label>
                            <input
                              type="number"
                              value={editProcedimentoForm.price || 0}
                              onChange={(e) => setEditProcedimentoForm({ ...editProcedimentoForm, price: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">Duração (min)</label>
                            <input
                              type="number"
                              value={editProcedimentoForm.duration_min || 30}
                              onChange={(e) => setEditProcedimentoForm({ ...editProcedimentoForm, duration_min: parseInt(e.target.value) || 30 })}
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={handleSaveProcedimento}
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
                          <p className="font-medium text-neutral-800">{procedimento.name}</p>
                          <p className="text-sm text-neutral-500">Duração: {procedimento.duration_min}min • Valor: R$ {procedimento.price}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditProcedimento(procedimento)}
                            className="text-primary hover:text-primary/80 p-2"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProcedimento(procedimento.id)}
                            className="text-red-500 hover:text-red-600 p-2"
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
                    value={agendaSettings.startTime}
                    onChange={(e) => setAgendaSettings({...agendaSettings, startTime: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Horário de Término</label>
                  <input
                    type="time"
                    value={agendaSettings.endTime}
                    onChange={(e) => setAgendaSettings({...agendaSettings, endTime: e.target.value})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Intervalo padrão (minutos)</label>
                  <input
                    type="number"
                    value={agendaSettings.slotDuration}
                    onChange={(e) => setAgendaSettings({...agendaSettings, slotDuration: parseInt(e.target.value) || 15})}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <button 
                  onClick={handleSaveAgenda}
                  className="bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeTab === 'integracoes' && (
            <div className="max-w-3xl space-y-6">
              <h3 className="text-lg font-semibold text-neutral-800">Integrações Operacionais</h3>

              <div className="border border-neutral-200 rounded-xl p-5 space-y-4">
                <div>
                  <h4 className="font-medium text-neutral-800">Status do Ambiente</h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    Verifica se as variáveis essenciais para operação, integrações Google e deploy estão configuradas.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Core do sistema</p>
                    <p className={`font-medium ${coreEnvReady ? 'text-green-700' : 'text-red-600'}`}>
                      {coreEnvReady ? 'Configurado' : 'Pendente'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Integração Google</p>
                    <p className={`font-medium ${googleEnvReady ? 'text-green-700' : 'text-red-600'}`}>
                      {googleEnvReady ? 'Configurado' : 'Pendente'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Deploy</p>
                    <p className={`font-medium ${deployEnvReady ? 'text-green-700' : 'text-red-600'}`}>
                      {deployEnvReady ? 'Configurado' : 'Pendente'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {envChecklist.map((item) => (
                    <div key={item.key} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-lg border border-neutral-200 p-4">
                      <div>
                        <p className="font-medium text-neutral-800">{item.label}</p>
                        <p className="text-xs text-neutral-500">{item.key}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          item.configured ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {item.configured ? 'Configurado' : 'Ausente'}
                        </span>
                        <span className="text-xs text-neutral-500">
                          {item.requiredFor === 'core'
                            ? 'Core'
                            : item.requiredFor === 'google'
                              ? 'Google'
                              : 'Deploy'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-xl p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-neutral-800">Google Calendar e Gmail</h4>
                    <p className="text-sm text-neutral-500 mt-1">
                      Permite criar eventos no Google Calendar, gerar links Meet e enviar lembretes por email.
                    </p>
                    {!googleEnvReady && (
                      <p className="text-sm text-red-600 mt-2">
                        Configure `VITE_GOOGLE_CLIENT_ID`, `VITE_GOOGLE_CLIENT_SECRET` e `VITE_GOOGLE_REDIRECT_URI` para ativar esta integração.
                      </p>
                    )}
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                    isGoogleConnected && !isGoogleExpired && googleEnvReady
                      ? 'bg-green-100 text-green-700'
                      : isGoogleConnected
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {isGoogleConnected && !isGoogleExpired
                      ? 'Conectado'
                      : isGoogleConnected
                        ? 'Expirado'
                        : 'Não conectado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Profissional vinculado</p>
                    <p className="font-medium text-neutral-800">{tenantContext?.professionalName || '-'}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Expira em</p>
                    <p className="font-medium text-neutral-800">
                      {googleConnection?.expires_at ? new Date(googleConnection.expires_at).toLocaleString('pt-BR') : '-'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={initiateGoogleOAuth}
                    disabled={!googleEnvReady}
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {isGoogleConnected ? 'Reconectar Google' : 'Conectar Google'}
                  </button>
                  {isGoogleConnected && (
                    <button
                      onClick={handleDisconnectGoogle}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Unplug className="w-4 h-4" />
                      Desconectar
                    </button>
                  )}
                </div>
              </div>

              <div className="border border-neutral-200 rounded-xl p-5 space-y-3">
                <h4 className="font-medium text-neutral-800">Canais disponíveis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">WhatsApp</p>
                    <p className="font-medium text-neutral-800">Link direto ativo</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Email Gmail</p>
                    <p className="font-medium text-neutral-800">{isGoogleConnected ? 'Pronto para envio' : 'Aguardando conexão Google'}</p>
                  </div>
                  <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
                    <p className="text-neutral-500">Google Meet</p>
                    <p className="font-medium text-neutral-800">{isGoogleConnected ? 'Disponível em agendamentos online' : 'Aguardando conexão Google'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
