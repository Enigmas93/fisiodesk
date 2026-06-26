import { FileText, Calendar, User, Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAssessments, useCreateAssessment, useUpdateAssessment, useDeleteAssessment } from '../hooks/useAssessments';
import { useEvolutions, useCreateEvolution, useUpdateEvolution, useDeleteEvolution } from '../hooks/useEvolutions';
import { usePatients } from '../hooks/usePatients';
import type { Assessment, Evolution } from '../types';

const defaultAssessmentForm = (): Partial<Assessment> => ({
  type: 'initial',
  pain_level: 0
});

const defaultEvolutionForm = (): Partial<Evolution> => ({
  date: new Date().toISOString().split('T')[0],
  pain_level: 0
});

export function Prontuarios() {
  const [activeTab, setActiveTab] = useState<'avaliacoes' | 'evolucoes'>('avaliacoes');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Assessment | Evolution | null>(null);
  const [newItem, setNewItem] = useState<Partial<Assessment | Evolution>>(defaultAssessmentForm());

  const { data: patients } = usePatients();
  const { data: assessments, isLoading: loadingAssessments } = useAssessments();
  const { data: evolutions, isLoading: loadingEvolutions } = useEvolutions();
  const createAssessment = useCreateAssessment();
  const updateAssessment = useUpdateAssessment();
  const deleteAssessment = useDeleteAssessment();
  const createEvolution = useCreateEvolution();
  const updateEvolution = useUpdateEvolution();
  const deleteEvolution = useDeleteEvolution();

  const resetModalState = () => {
    setShowAddModal(false);
    setEditingItem(null);
    setNewItem(activeTab === 'avaliacoes' ? defaultAssessmentForm() : defaultEvolutionForm());
  };

  const handleSave = async () => {
    try {
      if (!newItem.patient_id) {
        toast.error('Selecione o paciente antes de salvar o prontuário.');
        return;
      }

      if (activeTab === 'avaliacoes') {
        if (editingItem) {
          await updateAssessment.mutateAsync({ id: editingItem.id, ...newItem } as any);
          toast.success('Avaliação atualizada!');
        } else {
          await createAssessment.mutateAsync(newItem as any);
          toast.success('Avaliação adicionada!');
        }
      } else {
        if (editingItem) {
          await updateEvolution.mutateAsync({ id: editingItem.id, ...newItem } as any);
          toast.success('Evolução atualizada!');
        } else {
          await createEvolution.mutateAsync(newItem as any);
          toast.success('Evolução adicionada!');
        }
      }
      resetModalState();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar');
    }
  };

  const handleEdit = (item: Assessment | Evolution) => {
    setEditingItem(item);
    setNewItem({ ...item });
    setShowAddModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    try {
      if (activeTab === 'avaliacoes') {
        await deleteAssessment.mutateAsync(id);
        toast.success('Avaliação excluída!');
      } else {
        await deleteEvolution.mutateAsync(id);
        toast.success('Evolução excluída!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir');
    }
  };

  const isLoading = activeTab === 'avaliacoes' ? loadingAssessments : loadingEvolutions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const items = activeTab === 'avaliacoes' ? assessments : evolutions;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">Prontuários</h3>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setNewItem(activeTab === 'avaliacoes' ? defaultAssessmentForm() : defaultEvolutionForm());
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          {activeTab === 'avaliacoes' ? 'Nova Avaliação' : 'Nova Evolução'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="border-b border-neutral-200">
          <nav className="flex">
            {[
              { id: 'avaliacoes', label: 'Avaliações' },
              { id: 'evolucoes', label: 'Evoluções' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-neutral-500 border-transparent hover:text-neutral-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="divide-y divide-neutral-200">
          {items?.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhum registro encontrado</p>
            </div>
          ) : (
            items?.map(item => (
              <div key={item.id} className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-neutral-800">{item.patient?.name || 'Paciente'}</p>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        {('type' in item ? item.type : 'Evolução')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {(item as any).date ? new Date((item as any).date).toLocaleDateString('pt-BR') : ''}
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {item.professional?.name || 'Profissional'}
                      </div>
                      {('pain_level' in item) && item.pain_level !== undefined && (
                        <div className="text-yellow-600">
                          Dor: {item.pain_level}/10
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-primary hover:text-primary-dark p-2"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:text-red-600 p-2"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">
                {editingItem ? (activeTab === 'avaliacoes' ? 'Editar Avaliação' : 'Editar Evolução') : (activeTab === 'avaliacoes' ? 'Nova Avaliação' : 'Nova Evolução')}
              </h3>
              <button onClick={resetModalState}>
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              {activeTab === 'avaliacoes' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Paciente</label>
                    <select
                      value={(newItem as Assessment | Evolution).patient_id || ''}
                      onChange={(e) => setNewItem({ ...newItem, patient_id: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="">Selecione um paciente</option>
                      {patients?.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                    <select
                      value={(newItem as Assessment).type || 'initial'}
                      onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="initial">Avaliação Inicial</option>
                      <option value="reassessment">Reavaliação</option>
                      <option value="discharge">Alta</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Queixa Principal</label>
                    <textarea
                      value={(newItem as Assessment).chief_complaint || ''}
                      onChange={(e) => setNewItem({ ...newItem, chief_complaint: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nível de Dor (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={(newItem as Assessment).pain_level || 0}
                      onChange={(e) => setNewItem({ ...newItem, pain_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Diagnóstico Clínico</label>
                    <textarea
                      value={(newItem as Assessment).clinical_diagnosis || ''}
                      onChange={(e) => setNewItem({ ...newItem, clinical_diagnosis: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">CID-10</label>
                    <input
                      type="text"
                      value={(newItem as Assessment).icd10_code || ''}
                      onChange={(e) => setNewItem({ ...newItem, icd10_code: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Paciente</label>
                    <select
                      value={(newItem as Assessment | Evolution).patient_id || ''}
                      onChange={(e) => setNewItem({ ...newItem, patient_id: e.target.value || undefined })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    >
                      <option value="">Selecione um paciente</option>
                      {patients?.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={(newItem as Evolution).date || ''}
                      onChange={(e) => setNewItem({ ...newItem, date: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nível de Dor (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={(newItem as Evolution).pain_level || 0}
                      onChange={(e) => setNewItem({ ...newItem, pain_level: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Relato do Paciente</label>
                    <textarea
                      value={(newItem as Evolution).patient_report || ''}
                      onChange={(e) => setNewItem({ ...newItem, patient_report: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Procedimentos Realizados</label>
                    <textarea
                      value={(newItem as Evolution).procedures_done || ''}
                      onChange={(e) => setNewItem({ ...newItem, procedures_done: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Resposta ao Tratamento</label>
                    <textarea
                      value={(newItem as Evolution).response || ''}
                      onChange={(e) => setNewItem({ ...newItem, response: e.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={resetModalState}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
