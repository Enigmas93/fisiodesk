import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment
} from '../hooks/useAppointments'
import { usePatients } from '../hooks/usePatients'
import { useProfessionals } from '../hooks/useLookupData'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AppointmentInsert, AppointmentUpdate } from '../types'

export default function AgendamentoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointment(
    id || ''
  )
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const [formData, setFormData] = useState<Partial<AppointmentInsert>>({
    patient_id: undefined,
    professional_id: undefined,
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:00',
    status: 'scheduled',
    type: 'session',
    modality: 'in_person',
    notes: undefined
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        date: appointment.date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status,
        type: appointment.type,
        modality: appointment.modality,
        notes: appointment.notes
      })
    }
  }, [appointment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (id) {
        await updateAppointment.mutateAsync({
          id,
          ...formData
        } as AppointmentUpdate & { id: string })
        toast.success('Agendamento atualizado com sucesso!')
      } else {
        await createAppointment.mutateAsync({
          ...formData,
          clinic_id: 'temp-clinic-id' // TODO: Replace with actual clinic_id
        } as AppointmentInsert)
        toast.success('Agendamento criado com sucesso!')
      }
      navigate('/agenda')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingAppointment && id) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/agenda"
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            {id ? 'Editar Agendamento' : 'Novo Agendamento'}
          </h1>
          <p className="text-neutral-500">
            {id ? 'Atualize os dados do agendamento' : 'Preencha os dados para criar um novo agendamento'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-neutral-800 mb-4">Dados do Agendamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Paciente *
              </label>
              <select
                required
                value={formData.patient_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_id: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                {patients?.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Profissional *
              </label>
              <select
                required
                value={formData.professional_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, professional_id: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                {professionals?.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={formData.date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Hora de Início *
              </label>
              <input
                type="time"
                required
                value={formData.start_time || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Hora de Fim *
              </label>
              <input
                type="time"
                required
                value={formData.end_time || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Status
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="scheduled">Agendado</option>
                <option value="confirmed">Confirmado</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="cancelled">Cancelado</option>
                <option value="no_show">Não Compareceu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tipo
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="initial">Avaliação Inicial</option>
                <option value="session">Sessão</option>
                <option value="reassessment">Reavaliação</option>
                <option value="discharge">Alta</option>
                <option value="online">Online</option>
                <option value="return">Retorno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Modalidade
              </label>
              <select
                value={formData.modality || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, modality: e.target.value as any }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="in_person">Presencial</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Observações
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value || undefined }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            to="/agenda"
            className="px-6 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
