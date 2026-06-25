import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { usePatient, useDeletePatient } from '../hooks/usePatients'
import { useAppointments } from '../hooks/useAppointments'
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
} from 'lucide-react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const TABS = [
  { id: 'resumo', label: 'Resumo', icon: User },
  { id: 'prontuario', label: 'Prontuário', icon: ClipboardList },
  { id: 'agendamentos', label: 'Agendamentos', icon: Calendar },
  { id: 'pacotes', label: 'Pacotes', icon: FileText },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
  { id: 'documentos', label: 'Documentos', icon: Upload }
]

export default function PacienteDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: patient, isLoading, error } = usePatient(id || '')
  const { data: appointments } = useAppointments()
  const deletePatient = useDeletePatient()
  const [activeTab, setActiveTab] = useState('resumo')

  const patientAppointments = appointments?.filter(
    (a) => a.patient_id === id
  ) || []

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
      try {
        await deletePatient.mutateAsync(id!)
        toast.success('Paciente excluído com sucesso!')
        navigate('/pacientes')
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir paciente')
      }
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
    .map(n => n[0])
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
    in_progress: 'Em Andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não Compareceu'
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/pacientes"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
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
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map(tab => {
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
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                  Dados Pessoais
                </h3>
                <div className="space-y-3">
                  {patient.cpf && (
                    <div>
                      <p className="text-sm text-neutral-500">CPF</p>
                      <p className="text-neutral-800">{patient.cpf}</p>
                    </div>
                  )}
                  {patient.birth_date && (
                    <div>
                      <p className="text-sm text-neutral-500">Data de Nascimento</p>
                      <p className="text-neutral-800">
                        {new Date(patient.birth_date).toLocaleDateString('pt-BR')}
                      </p>
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
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                  Contato
                </h3>
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
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                  Endereço
                </h3>
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
                      <p className="text-neutral-800">
                        {[patient.city, patient.state].filter(Boolean).join(' - ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {(patient.medical_history || patient.allergies || patient.medications) && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                  Saúde
                </h3>
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
                      <p className="text-sm text-neutral-500">Histórico Médico</p>
                      <p className="text-neutral-800">{patient.medical_history}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {patient.tags && patient.tags.length > 0 && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {patient.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.observations && (
              <div className="pt-6 border-t border-neutral-200">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-2">
                  Observações
                </h3>
                <p className="text-neutral-700">{patient.observations}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'prontuario' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Prontuário</h2>
              <button onClick={() => toast.info('Adicionar registro em desenvolvimento')} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar Registro
              </button>
            </div>
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhum registro no prontuário ainda</p>
            </div>
          </div>
        )}

        {activeTab === 'agendamentos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Histórico de Agendamentos</h2>
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
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-neutral-800">
                          {appointment.date ? new Date(appointment.date).toLocaleDateString('pt-BR') : ''} às {appointment.start_time} - {appointment.end_time}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${appointmentStatusColors[appointment.status || 'scheduled']}`}>
                          {appointmentStatusLabels[appointment.status || 'scheduled']}
                        </span>
                      </div>
                      <Link to={`/agenda/${appointment.id}/editar`} className="text-primary hover:underline text-sm">Editar</Link>
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Pacotes</h2>
              <button onClick={() => toast.info('Adicionar pacote em desenvolvimento')} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar Pacote
              </button>
            </div>
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhum pacote para este paciente</p>
            </div>
          </div>
        )}

        {activeTab === 'financeiro' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Financeiro</h2>
              <button onClick={() => toast.info('Adicionar transação em desenvolvimento')} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4" />
                Adicionar Transação
              </button>
            </div>
            <div className="text-center py-12 text-neutral-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhuma transação registrada</p>
            </div>
          </div>
        )}

        {activeTab === 'documentos' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-800">Documentos</h2>
              <button onClick={() => toast.info('Upload em desenvolvimento')} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                <Upload className="w-4 h-4" />
                Upload Documento
              </button>
            </div>
            <div className="text-center py-12 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhum documento para este paciente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
