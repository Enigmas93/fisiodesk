import { useRef, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePatient, useDeletePatient } from '../hooks/usePatients'
import { useAppointments } from '../hooks/useAppointments'
import { useAssessments, useCreateAssessment, useUpdateAssessment, useDeleteAssessment } from '../hooks/useAssessments'
import { useEvolutions, useCreateEvolution, useUpdateEvolution, useDeleteEvolution } from '../hooks/useEvolutions'
import { usePackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '../hooks/usePackages'
import {
  usePatientDocuments,
  useUploadPatientDocument,
  useDeletePatientDocument
} from '../hooks/usePatientDocuments'
import { useFinancialEntries } from '../hooks/useFinancialEntries'
import { useProcedures, useProfessionals } from '../hooks/useLookupData'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Phone,
  Mail,
  User,
  DollarSign,
  ClipboardList,
  Plus,
  FileText,
  Upload,
  Loader2,
  ExternalLink,
  Package as PackageIcon
} from 'lucide-react'
import { toast } from 'sonner'
import type { Assessment, Evolution, PackageInsert, PackageUpdate } from '../types'

const TABS = [
  { id: 'resumo', label: 'Resumo', icon: User },
  { id: 'prontuario', label: 'Prontuário', icon: ClipboardList },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'pacotes', label: 'Pacotes', icon: PackageIcon },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'documentos', label: 'Documentos', icon: Upload }
] as const

type TabId = (typeof TABS)[number]['id']

const defaultAssessmentForm = (patientId?: string): Partial<Assessment> => ({
  type: 'initial',
  pain_level: 0,
  patient_id: patientId
})

const defaultEvolutionForm = (patientId?: string): Partial<Evolution> => ({
  date: new Date().toISOString().split('T')[0],
  pain_level: 0,
  patient_id: patientId
})

const defaultPackageForm = (patientId?: string): Partial<PackageInsert> => ({
  patient_id: patientId || '',
  name: '',
  total_sessions: 10,
  used_sessions: 0,
  price_total: 0,
  price_per_session: 0,
  status: 'active',
  valid_until: '',
  notes: ''
})

const formatCurrency = (value?: number | null) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('pt-BR') : '-'

const formatDateTime = (value?: string | null) =>
  value ? new Date(value).toLocaleString('pt-BR') : '-'

const formatTime = (value?: string | null) => (value ? value.slice(0, 5) : '')

export default function PacienteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const { data: patient, isLoading, error } = usePatient(id || '')
  const { data: appointments } = useAppointments()
  const { data: assessments, isLoading: loadingAssessments } = useAssessments(id)
  const { data: evolutions, isLoading: loadingEvolutions } = useEvolutions(id)
  const { data: packages, isLoading: loadingPackages } = usePackages(id)
  const { data: documents, isLoading: loadingDocuments } = usePatientDocuments(id)
  const { data: financialEntries, isLoading: loadingFinancialEntries } = useFinancialEntries()
  const { data: procedures } = useProcedures()
  const { data: professionals } = useProfessionals()

  const deletePatient = useDeletePatient()
  const createAssessment = useCreateAssessment()
  const updateAssessment = useUpdateAssessment()
  const deleteAssessment = useDeleteAssessment()
  const createEvolution = useCreateEvolution()
  const updateEvolution = useUpdateEvolution()
  const deleteEvolution = useDeleteEvolution()
  const createPackage = useCreatePackage()
  const updatePackage = useUpdatePackage()
  const deletePackage = useDeletePackage()
  const uploadDocument = useUploadPatientDocument()
  const deleteDocument = useDeletePatientDocument()

  const [activeTab, setActiveTab] = useState<TabId>('resumo')
  const [prontuarioTab, setProntuarioTab] = useState<'avaliacoes' | 'evolucoes'>('avaliacoes')
  const [showProntuarioModal, setShowProntuarioModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Assessment | Evolution | null>(null)
  const [newItem, setNewItem] = useState<Partial<Assessment | Evolution>>(defaultAssessmentForm(id))
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null)
  const [packageForm, setPackageForm] = useState<Partial<PackageInsert>>(defaultPackageForm(id))
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const patientAppointments = (appointments || []).filter((appointment) => appointment.patient_id === id)
  const patientFinancialEntries = (financialEntries || []).filter((entry) => entry.patient_id === id)
  const patientPackages = packages || []

  const resetProntuarioModal = () => {
    setEditingItem(null)
    setShowProntuarioModal(false)
    setNewItem(prontuarioTab === 'avaliacoes' ? defaultAssessmentForm(id) : defaultEvolutionForm(id))
  }

  const openNewProntuarioModal = () => {
    setEditingItem(null)
    setNewItem(prontuarioTab === 'avaliacoes' ? defaultAssessmentForm(id) : defaultEvolutionForm(id))
    setShowProntuarioModal(true)
  }

  const resetPackageModal = () => {
    setEditingPackageId(null)
    setPackageForm(defaultPackageForm(id))
    setShowPackageModal(false)
  }

  const handleSaveProntuario = async () => {
    try {
      if (prontuarioTab === 'avaliacoes') {
        if (editingItem) {
          await updateAssessment.mutateAsync({ id: editingItem.id, ...newItem } as Assessment & { id: string })
          toast.success('Avaliação atualizada!')
        } else {
          await createAssessment.mutateAsync({ ...newItem, patient_id: id } as Assessment)
          toast.success('Avaliação adicionada!')
        }
      } else {
        if (editingItem) {
          await updateEvolution.mutateAsync({ id: editingItem.id, ...newItem } as Evolution & { id: string })
          toast.success('Evolução atualizada!')
        } else {
          await createEvolution.mutateAsync({ ...newItem, patient_id: id } as Evolution)
          toast.success('Evolução adicionada!')
        }
      }

      resetProntuarioModal()
    } catch (saveError: any) {
      toast.error(saveError.message || 'Erro ao salvar')
    }
  }

  const handleEditProntuario = (item: Assessment | Evolution) => {
    setEditingItem(item)
    setNewItem({ ...item })
    setShowProntuarioModal(true)
  }

  const handleDeleteProntuario = async (itemId: string) => {
    if (!confirm('Tem certeza que deseja excluir?')) return

    try {
      if (prontuarioTab === 'avaliacoes') {
        await deleteAssessment.mutateAsync(itemId)
        toast.success('Avaliação excluída!')
      } else {
        await deleteEvolution.mutateAsync(itemId)
        toast.success('Evolução excluída!')
      }
    } catch (deleteError: any) {
      toast.error(deleteError.message || 'Erro ao excluir')
    }
  }

  const handleDeletePatient = async () => {
    if (!id || !confirm('Tem certeza que deseja excluir este paciente?')) return

    try {
      await deletePatient.mutateAsync(id)
      toast.success('Paciente excluído com sucesso!')
      navigate('/pacientes')
    } catch (deleteError: any) {
      toast.error(deleteError.message || 'Erro ao excluir paciente')
    }
  }

  const handleEditPackage = (pkg: PackageInsert & { id: string }) => {
    setEditingPackageId(pkg.id)
    setPackageForm({
      patient_id: pkg.patient_id,
      name: pkg.name,
      total_sessions: pkg.total_sessions,
      used_sessions: pkg.used_sessions || 0,
      price_total: pkg.price_total || 0,
      price_per_session: pkg.price_per_session || 0,
      status: pkg.status || 'active',
      valid_until: pkg.valid_until || '',
      notes: pkg.notes || '',
      professional_id: pkg.professional_id || undefined,
      procedure_id: pkg.procedure_id || undefined
    })
    setShowPackageModal(true)
  }

  const handleSavePackage = async () => {
    if (!id || !packageForm.name) {
      toast.error('Informe ao menos o nome do pacote.')
      return
    }

    try {
      if (editingPackageId) {
        await updatePackage.mutateAsync({
          id: editingPackageId,
          ...packageForm
        } as PackageUpdate & { id: string })
        toast.success('Pacote atualizado!')
      } else {
        await createPackage.mutateAsync({
          ...packageForm,
          patient_id: id,
          total_sessions: Number(packageForm.total_sessions) || 0,
          used_sessions: Number(packageForm.used_sessions) || 0,
          price_total: Number(packageForm.price_total) || 0,
          price_per_session: Number(packageForm.price_per_session) || 0
        } as PackageInsert)
        toast.success('Pacote criado!')
      }

      resetPackageModal()
    } catch (packageError: any) {
      toast.error(packageError.message || 'Erro ao salvar pacote')
    }
  }

  const handleDeletePackage = async (packageId: string) => {
    if (!id || !confirm('Tem certeza que deseja excluir este pacote?')) return

    try {
      await deletePackage.mutateAsync({ id: packageId, patientId: id })
      toast.success('Pacote excluído!')
    } catch (packageError: any) {
      toast.error(packageError.message || 'Erro ao excluir pacote')
    }
  }

  const handleUploadDocument = async () => {
    if (!id || !selectedFile) {
      toast.error('Selecione um arquivo para upload.')
      return
    }

    try {
      await uploadDocument.mutateAsync({ patientId: id, file: selectedFile })
      toast.success('Documento enviado com sucesso!')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (uploadError: any) {
      toast.error(uploadError.message || 'Erro ao enviar documento')
    }
  }

  const handleDeleteDocument = async (path: string) => {
    if (!id || !confirm('Tem certeza que deseja excluir este documento?')) return

    try {
      await deleteDocument.mutateAsync({ patientId: id, path })
      toast.success('Documento excluído!')
    } catch (deleteError: any) {
      toast.error(deleteError.message || 'Erro ao excluir documento')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className="text-center p-8">
        <p className="text-neutral-500">Paciente não encontrado</p>
        <Link to="/pacientes" className="text-primary hover:underline">
          Voltar para lista de pacientes
        </Link>
      </div>
    )
  }

  const initials = patient.name
    .split(' ')
    .map((namePart) => namePart[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusColors: Record<string, string> = {
    active: 'bg-secondary/10 text-secondary',
    inactive: 'bg-neutral-200 text-neutral-600',
    discharged: 'bg-warning/10 text-warning'
  }

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    discharged: 'Alta'
  }

  const appointmentStatusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-700',
    confirmed: 'bg-green-100 text-green-700',
    in_progress: 'bg-purple-100 text-purple-700',
    completed: 'bg-gray-100 text-gray-700',
    cancelled: 'bg-red-100 text-red-700',
    no_show: 'bg-yellow-100 text-yellow-700'
  }

  const appointmentStatusLabels: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não compareceu'
  }

  const packageStatusLabels: Record<string, string> = {
    active: 'Ativo',
    completed: 'Concluído',
    expired: 'Expirado',
    cancelled: 'Cancelado'
  }

  const packageStatusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    expired: 'bg-amber-100 text-amber-700',
    cancelled: 'bg-red-100 text-red-700'
  }

  const financialStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700',
    cancelled: 'bg-neutral-200 text-neutral-600'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/pacientes" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xl font-bold">
              {initials}
            </div>

            <div>
              <h1 className="text-2xl font-bold text-neutral-800">{patient.name}</h1>
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusColors[patient.status || 'active']}`}>
                {statusLabels[patient.status || 'active']}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/pacientes/${id}/editar`}
            className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Link>

          <button
            onClick={handleDeletePatient}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        {activeTab === 'resumo' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Dados Pessoais</h3>
                <div className="space-y-3">
                  {patient.cpf && (
                    <div>
                      <p className="text-sm text-neutral-500">CPF</p>
                      <p className="text-neutral-800">{patient.cpf}</p>
                    </div>
                  )}
                  {patient.birth_date && (
                    <div>
                      <p className="text-sm text-neutral-500">Data de nascimento</p>
                      <p className="text-neutral-800">{formatDate(patient.birth_date)}</p>
                    </div>
                  )}
                  {patient.gender && (
                    <div>
                      <p className="text-sm text-neutral-500">Gênero</p>
                      <p className="text-neutral-800">
                        {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Feminino' : 'Outro'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Contato</h3>
                <div className="space-y-3">
                  {patient.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-500">Telefone</p>
                        <p className="text-neutral-800">{patient.phone}</p>
                      </div>
                    </div>
                  )}
                  {patient.phone2 && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-500">Telefone 2</p>
                        <p className="text-neutral-800">{patient.phone2}</p>
                      </div>
                    </div>
                  )}
                  {patient.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-neutral-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-neutral-500">Email</p>
                        <p className="text-neutral-800">{patient.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Endereço</h3>
                <div className="space-y-3">
                  {patient.address && (
                    <div>
                      <p className="text-sm text-neutral-500">Endereço</p>
                      <p className="text-neutral-800">{patient.address}</p>
                    </div>
                  )}
                  {(patient.city || patient.state) && (
                    <div>
                      <p className="text-sm text-neutral-500">Cidade / Estado</p>
                      <p className="text-neutral-800">{[patient.city, patient.state].filter(Boolean).join(' - ')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(patient.medical_history || patient.allergies || patient.medications) && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">Saúde</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {patient.allergies && (
                    <div>
                      <p className="text-sm text-neutral-500">Alergias</p>
                      <p className="text-neutral-800">{patient.allergies}</p>
                    </div>
                  )}
                  {patient.medications && (
                    <div>
                      <p className="text-sm text-neutral-500">Medicamentos</p>
                      <p className="text-neutral-800">{patient.medications}</p>
                    </div>
                  )}
                  {patient.medical_history && (
                    <div>
                      <p className="text-sm text-neutral-500">Histórico médico</p>
                      <p className="text-neutral-800">{patient.medical_history}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {Array.isArray(patient.tags) && patient.tags.length > 0 && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {patient.tags.map((tag, index) => (
                    <span key={`${tag}-${index}`} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {String(tag)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.observations && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">Observações</h3>
                <p className="text-neutral-700">{patient.observations}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prontuario' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800">Prontuário</h2>
              <button
                onClick={openNewProntuarioModal}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                {prontuarioTab === 'avaliacoes' ? 'Nova Avaliação' : 'Nova Evolução'}
              </button>
            </div>

            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="border-b border-neutral-200">
                <nav className="flex">
                  {[
                    { id: 'avaliacoes', label: 'Avaliações' },
                    { id: 'evolucoes', label: 'Evoluções' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setProntuarioTab(tab.id as 'avaliacoes' | 'evolucoes')}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                        prontuarioTab === tab.id
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
                {(() => {
                  const items = prontuarioTab === 'avaliacoes' ? assessments : evolutions
                  const isLoadingTab = prontuarioTab === 'avaliacoes' ? loadingAssessments : loadingEvolutions

                  if (isLoadingTab) {
                    return (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    )
                  }

                  if (!items || items.length === 0) {
                    return (
                      <div className="text-center py-12 text-neutral-500">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                        <p>Nenhum registro no prontuário ainda</p>
                      </div>
                    )
                  }

                  return items.map((item) => (
                    <div key={item.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div>
                          <p className="font-medium text-neutral-800">
                            {'type' in item && item.type ? item.type : 'Evolução clínica'}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(('date' in item ? item.date : item.created_at) || item.created_at)}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {(item as any).professional?.name || 'Profissional'}
                            </div>
                            {'pain_level' in item && item.pain_level !== undefined && item.pain_level !== null && (
                              <div className="text-yellow-600">Dor: {item.pain_level}/10</div>
                            )}
                          </div>

                          {'chief_complaint' in item && item.chief_complaint && (
                            <p className="text-sm text-neutral-600 mt-2">{item.chief_complaint}</p>
                          )}

                          {'patient_report' in item && item.patient_report && (
                            <p className="text-sm text-neutral-600 mt-2">{item.patient_report}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleEditProntuario(item)} className="text-primary hover:text-primary-dark p-2">
                          Editar
                        </button>
                        <button onClick={() => handleDeleteProntuario(item.id)} className="text-red-500 hover:text-red-600 p-2">
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800">Histórico de agendamentos</h2>
              <Link
                to={`/agenda/novo?patient_id=${id}`}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Novo Agendamento
              </Link>
            </div>

            {patientAppointments.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p>Nenhum agendamento para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientAppointments.map((appointment) => (
                  <div key={appointment.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {formatDate(appointment.date)} às {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${appointmentStatusColors[appointment.status || 'scheduled']}`}>
                          {appointmentStatusLabels[appointment.status || 'scheduled']}
                        </span>
                      </div>
                      <Link to={`/agenda/${appointment.id}/editar`} className="text-primary hover:underline text-sm">
                        Editar
                      </Link>
                    </div>
                    {appointment.notes && <p className="text-sm text-neutral-600 mt-2">{appointment.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pacotes' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800">Pacotes</h2>
              <button
                onClick={() => setShowPackageModal(true)}
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Pacote
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Pacotes ativos</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {patientPackages.filter((pkg) => (pkg.status || 'active') === 'active').length}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Sessões contratadas</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {patientPackages.reduce((sum, pkg) => sum + (pkg.total_sessions || 0), 0)}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Sessões utilizadas</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {patientPackages.reduce((sum, pkg) => sum + (pkg.used_sessions || 0), 0)}
                </p>
              </div>
            </div>

            {loadingPackages ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : patientPackages.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <PackageIcon className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p>Nenhum pacote para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientPackages.map((pkg) => (
                  <div key={pkg.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-800">{pkg.name}</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${packageStatusColors[pkg.status || 'active']}`}>
                            {packageStatusLabels[pkg.status || 'active']}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-500">
                          {(pkg as any).procedure?.name || 'Procedimento não vinculado'}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-neutral-600">
                          <p>Sessões: {pkg.used_sessions || 0} / {pkg.total_sessions}</p>
                          <p>Valor total: {formatCurrency(pkg.price_total)}</p>
                          <p>Valor por sessão: {formatCurrency(pkg.price_per_session)}</p>
                          <p>Validade: {formatDate(pkg.valid_until)}</p>
                        </div>
                        {pkg.notes && <p className="text-sm text-neutral-600">{pkg.notes}</p>}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditPackage(pkg as PackageInsert & { id: string })}
                          className="text-primary hover:text-primary-dark p-2"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="text-red-500 hover:text-red-600 p-2"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-neutral-800">Financeiro</h2>
              <Link
                to="/financeiro"
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <DollarSign className="w-4 h-4" />
                Ir para Financeiro
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Receitas do paciente</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {formatCurrency(
                    patientFinancialEntries
                      .filter((entry) => entry.type === 'income')
                      .reduce((sum, entry) => sum + (entry.amount || 0), 0)
                  )}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Pendências</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {patientFinancialEntries.filter((entry) => entry.status === 'pending').length}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200 p-4">
                <p className="text-sm text-neutral-500">Pagamentos realizados</p>
                <p className="text-2xl font-bold text-neutral-800">
                  {patientFinancialEntries.filter((entry) => entry.status === 'paid').length}
                </p>
              </div>
            </div>

            {loadingFinancialEntries ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : patientFinancialEntries.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <DollarSign className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p>Nenhuma transação registrada para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {patientFinancialEntries.map((entry) => (
                  <div key={entry.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-neutral-800">{entry.description}</p>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${financialStatusColors[entry.status || 'pending']}`}>
                            {entry.status || 'pending'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-600 mt-2">
                          <p>Tipo: {entry.type === 'income' ? 'Receita' : 'Despesa'}</p>
                          <p>Valor: {formatCurrency(entry.amount)}</p>
                          <p>Vencimento: {formatDate(entry.due_date)}</p>
                          <p>Pagamento: {formatDate(entry.paid_date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-neutral-800">Documentos</h2>

              <div className="flex flex-col md:flex-row gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="px-3 py-2 border border-neutral-300 rounded-lg"
                />
                <button
                  onClick={handleUploadDocument}
                  disabled={!selectedFile || uploadDocument.isPending}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploadDocument.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload Documento
                </button>
              </div>
            </div>

            {loadingDocuments ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : !documents || documents.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p>Nenhum documento para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div key={document.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-neutral-800">{document.name}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mt-1">
                          <span>Criado em {formatDateTime(document.createdAt)}</span>
                          {document.size ? <span>{Math.round(document.size / 1024)} KB</span> : null}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => document.url && window.open(document.url, '_blank', 'noopener,noreferrer')}
                          disabled={!document.url}
                          className="flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Abrir
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(document.path)}
                          className="flex items-center gap-2 px-3 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showProntuarioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">
                {editingItem
                  ? prontuarioTab === 'avaliacoes'
                    ? 'Editar Avaliação'
                    : 'Editar Evolução'
                  : prontuarioTab === 'avaliacoes'
                    ? 'Nova Avaliação'
                    : 'Nova Evolução'}
              </h3>
              <button onClick={resetProntuarioModal}>
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {prontuarioTab === 'avaliacoes' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Tipo</label>
                    <select
                      value={(newItem as Assessment).type || 'initial'}
                      onChange={(event) => setNewItem({ ...newItem, type: event.target.value as Assessment['type'] })}
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
                      onChange={(event) => setNewItem({ ...newItem, chief_complaint: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Início dos sintomas</label>
                      <input
                        type="text"
                        value={(newItem as Assessment).onset || ''}
                        onChange={(event) => setNewItem({ ...newItem, onset: event.target.value })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Nível de dor (0-10)</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={(newItem as Assessment).pain_level || 0}
                        onChange={(event) => setNewItem({ ...newItem, pain_level: Number(event.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Diagnóstico Clínico</label>
                    <textarea
                      value={(newItem as Assessment).clinical_diagnosis || ''}
                      onChange={(event) => setNewItem({ ...newItem, clinical_diagnosis: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">CID-10</label>
                    <input
                      type="text"
                      value={(newItem as Assessment).icd10_code || ''}
                      onChange={(event) => setNewItem({ ...newItem, icd10_code: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Objetivos terapêuticos</label>
                    <textarea
                      value={(newItem as Assessment).treatment_goals || ''}
                      onChange={(event) => setNewItem({ ...newItem, treatment_goals: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Plano de tratamento</label>
                    <textarea
                      value={(newItem as Assessment).treatment_plan || ''}
                      onChange={(event) => setNewItem({ ...newItem, treatment_plan: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Data</label>
                    <input
                      type="date"
                      value={(newItem as Evolution).date || ''}
                      onChange={(event) => setNewItem({ ...newItem, date: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Nível de dor (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={(newItem as Evolution).pain_level || 0}
                      onChange={(event) => setNewItem({ ...newItem, pain_level: Number(event.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Relato do Paciente</label>
                    <textarea
                      value={(newItem as Evolution).patient_report || ''}
                      onChange={(event) => setNewItem({ ...newItem, patient_report: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Achados Objetivos</label>
                    <textarea
                      value={(newItem as Evolution).objective || ''}
                      onChange={(event) => setNewItem({ ...newItem, objective: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Procedimentos Realizados</label>
                    <textarea
                      value={(newItem as Evolution).procedures_done || ''}
                      onChange={(event) => setNewItem({ ...newItem, procedures_done: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Resposta ao Tratamento</label>
                    <textarea
                      value={(newItem as Evolution).response || ''}
                      onChange={(event) => setNewItem({ ...newItem, response: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Próximo Plano</label>
                    <textarea
                      value={(newItem as Evolution).next_plan || ''}
                      onChange={(event) => setNewItem({ ...newItem, next_plan: event.target.value })}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveProntuario}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={resetProntuarioModal}
                  className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPackageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-neutral-800">
                {editingPackageId ? 'Editar Pacote' : 'Novo Pacote'}
              </h3>
              <button onClick={resetPackageModal}>
                <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Nome do pacote</label>
                <input
                  type="text"
                  value={packageForm.name || ''}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Procedimento</label>
                  <select
                    value={packageForm.procedure_id || ''}
                    onChange={(event) => setPackageForm((prev) => ({ ...prev, procedure_id: event.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    {procedures?.map((procedure) => (
                      <option key={procedure.id} value={procedure.id}>
                        {procedure.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Profissional</label>
                  <select
                    value={packageForm.professional_id || ''}
                    onChange={(event) => setPackageForm((prev) => ({ ...prev, professional_id: event.target.value || undefined }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  >
                    <option value="">Selecione</option>
                    {professionals?.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Sessões contratadas</label>
                  <input
                    type="number"
                    min={1}
                    value={packageForm.total_sessions || 0}
                    onChange={(event) =>
                      setPackageForm((prev) => ({ ...prev, total_sessions: Number(event.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Sessões utilizadas</label>
                  <input
                    type="number"
                    min={0}
                    value={packageForm.used_sessions || 0}
                    onChange={(event) =>
                      setPackageForm((prev) => ({ ...prev, used_sessions: Number(event.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Valor total</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={packageForm.price_total || 0}
                    onChange={(event) =>
                      setPackageForm((prev) => ({ ...prev, price_total: Number(event.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Valor por sessão</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={packageForm.price_per_session || 0}
                    onChange={(event) =>
                      setPackageForm((prev) => ({ ...prev, price_per_session: Number(event.target.value) || 0 }))
                    }
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Validade</label>
                  <input
                    type="date"
                    value={packageForm.valid_until || ''}
                    onChange={(event) => setPackageForm((prev) => ({ ...prev, valid_until: event.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                <select
                  value={packageForm.status || 'active'}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, status: event.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                >
                  <option value="active">Ativo</option>
                  <option value="completed">Concluído</option>
                  <option value="expired">Expirado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Observações</label>
                <textarea
                  value={packageForm.notes || ''}
                  onChange={(event) => setPackageForm((prev) => ({ ...prev, notes: event.target.value }))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSavePackage}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
                <button
                  onClick={resetPackageModal}
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
  )
}
