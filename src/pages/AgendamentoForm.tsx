import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import {
  useAppointment,
  useCreateAppointment,
  useUpdateAppointment
} from '../hooks/useAppointments'
import { useTenantContext } from '../hooks/useTenantContext'
import { useClinicProfile } from '../hooks/useClinicProfile'
import { useGoogleConnection } from '../hooks/useGoogleConnection'
import { usePatients } from '../hooks/usePatients'
import { useProfessionals, useProcedures, useRooms } from '../hooks/useLookupData'
import { createGoogleCalendarEvent, initiateGoogleOAuth, sendGmailReminder } from '../lib/google'
import { generateEmailReminderBody } from '../lib/email'
import { generateWhatsAppReminderLink } from '../lib/whatsapp'
import { ArrowLeft, Save, Loader2, CalendarPlus2, Mail, MessageCircle, Video } from 'lucide-react'
import { toast } from 'sonner'
import type { AppointmentInsert, AppointmentUpdate } from '../types'

const toTimeValue = (value?: string | null) => {
  if (!value) return ''
  return value.slice(0, 5)
}

const addMinutesToTime = (time: string, duration: number) => {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + duration
  const nextHours = Math.floor(totalMinutes / 60) % 24
  const nextMinutes = totalMinutes % 60
  return `${nextHours.toString().padStart(2, '0')}:${nextMinutes.toString().padStart(2, '0')}`
}

export default function AgendamentoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { data: appointment, isLoading: isLoadingAppointment } = useAppointment(
    id || ''
  )
  const { data: patients } = usePatients()
  const { data: professionals } = useProfessionals()
  const { data: procedures } = useProcedures()
  const { data: rooms } = useRooms()
  const { data: tenantContext, isLoading: isLoadingTenant } = useTenantContext()
  const { data: clinic } = useClinicProfile()
  const { data: googleConnection } = useGoogleConnection()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  const [formData, setFormData] = useState<Partial<AppointmentInsert>>({
    patient_id: searchParams.get('patient_id') || undefined,
    professional_id: undefined,
    date: searchParams.get('date') || new Date().toISOString().split('T')[0],
    start_time: searchParams.get('start') || '09:00',
    end_time: searchParams.get('end') || '10:00',
    procedure_id: undefined,
    room_id: undefined,
    duration_min: 60,
    price: 0,
    status: 'scheduled',
    type: 'session',
    modality: 'in_person',
    notes: undefined
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRunningAction, setIsRunningAction] = useState<'google' | 'email' | 'whatsapp' | null>(null)

  useEffect(() => {
    if (appointment) {
      setFormData({
        patient_id: appointment.patient_id,
        professional_id: appointment.professional_id,
        date: appointment.date,
        start_time: toTimeValue(appointment.start_time),
        end_time: toTimeValue(appointment.end_time),
        procedure_id: appointment.procedure_id,
        room_id: appointment.room_id,
        duration_min: appointment.duration_min,
        price: appointment.price,
        status: appointment.status,
        type: appointment.type,
        modality: appointment.modality,
        notes: appointment.notes
      })
    }
  }, [appointment])

  useEffect(() => {
    if (!id && tenantContext?.professionalId && !formData.professional_id) {
      setFormData((prev) => ({
        ...prev,
        professional_id: tenantContext.professionalId
      }))
    }
  }, [tenantContext, id, formData.professional_id])

  useEffect(() => {
    if (!id && formData.start_time && formData.duration_min && !searchParams.get('end')) {
      setFormData((prev) => ({
        ...prev,
        end_time: addMinutesToTime(prev.start_time || '09:00', prev.duration_min || 60)
      }))
    }
  }, [formData.start_time, formData.duration_min, id, searchParams])

  const handleProcedureChange = (procedureId: string) => {
    const selectedProcedure = procedures?.find((procedure) => procedure.id === procedureId)

    setFormData((prev) => {
      const nextDuration = selectedProcedure?.duration_min ?? prev.duration_min ?? 60
      const nextStartTime = prev.start_time || '09:00'

      return {
        ...prev,
        procedure_id: procedureId || undefined,
        duration_min: nextDuration,
        price: selectedProcedure?.price ?? prev.price ?? 0,
        end_time: addMinutesToTime(nextStartTime, nextDuration)
      }
    })
  }

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
        navigate(`/agenda/${id}/editar`)
      } else {
        const createdAppointment = await createAppointment.mutateAsync({
          ...formData
        } as AppointmentInsert)
        toast.success('Agendamento criado com sucesso!')
        navigate(`/agenda/${createdAppointment.id}/editar`)
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar agendamento')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedPatient = patients?.find((patient) => patient.id === formData.patient_id)
  const selectedProfessional = professionals?.find((professional) => professional.id === formData.professional_id)

  const buildIntegrationAppointment = () => {
    if (!id || !selectedPatient || !selectedProfessional || !formData.date || !formData.start_time || !formData.end_time) {
      throw new Error('Salve o agendamento e selecione paciente, profissional, data e horário antes de usar integrações.')
    }

    return {
      ...(appointment || {}),
      id,
      patient_id: selectedPatient.id,
      professional_id: selectedProfessional.id,
      patient: selectedPatient,
      professional: selectedProfessional,
      date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      modality: formData.modality || 'in_person',
      meet_link: appointment?.meet_link || null
    }
  }

  const handleCreateGoogleEvent = async () => {
    if (!googleConnection?.access_token) {
      toast.info('Conecte sua conta Google nas Configurações antes de usar esta ação.')
      initiateGoogleOAuth()
      return
    }

    setIsRunningAction('google')
    try {
      const integrationAppointment = buildIntegrationAppointment()
      const googleEvent = await createGoogleCalendarEvent(googleConnection.access_token, integrationAppointment as any)
      await updateAppointment.mutateAsync({
        id: integrationAppointment.id,
        google_event_id: googleEvent.eventId,
        meet_link: googleEvent.meetLink || appointment?.meet_link || null
      })
      toast.success(googleEvent.meetLink ? 'Evento criado no Google Calendar com link Meet!' : 'Evento criado no Google Calendar!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar evento no Google Calendar')
    } finally {
      setIsRunningAction(null)
    }
  }

  const handleSendEmailReminder = async () => {
    if (!googleConnection?.access_token) {
      toast.info('Conecte sua conta Google nas Configurações antes de enviar emails.')
      initiateGoogleOAuth()
      return
    }

    if (!selectedPatient?.email) {
      toast.error('O paciente precisa ter email cadastrado para receber lembrete.')
      return
    }

    setIsRunningAction('email')
    try {
      const integrationAppointment = buildIntegrationAppointment()
      const htmlBody = generateEmailReminderBody({
        patientName: selectedPatient.name,
        date: new Date(integrationAppointment.date).toLocaleDateString('pt-BR'),
        time: integrationAppointment.start_time,
        professionalName: selectedProfessional?.name || tenantContext?.professionalName || 'Profissional',
        clinicName: clinic?.name || tenantContext?.clinicName || 'Clínica',
        address: clinic?.address || undefined,
        meetLink: appointment?.meet_link || undefined
      })

      await sendGmailReminder(
        googleConnection.access_token,
        selectedPatient.email,
        `Lembrete de sessão - ${clinic?.name || tenantContext?.clinicName || 'Clínica'}`,
        htmlBody
      )

      await updateAppointment.mutateAsync({
        id: integrationAppointment.id,
        reminder_sent_at: new Date().toISOString(),
        reminder_method: Array.from(new Set([...(appointment?.reminder_method || []), 'email']))
      })

      toast.success('Lembrete por email enviado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email')
    } finally {
      setIsRunningAction(null)
    }
  }

  const handleOpenWhatsAppReminder = async () => {
    if (!selectedPatient?.phone) {
      toast.error('O paciente precisa ter telefone cadastrado para usar WhatsApp.')
      return
    }

    setIsRunningAction('whatsapp')
    try {
      const integrationAppointment = buildIntegrationAppointment()
      const link = generateWhatsAppReminderLink({
        phone: selectedPatient.phone,
        patientName: selectedPatient.name,
        date: new Date(integrationAppointment.date).toLocaleDateString('pt-BR'),
        time: integrationAppointment.start_time,
        professionalName: selectedProfessional?.name || tenantContext?.professionalName || 'Profissional',
        clinicName: clinic?.name || tenantContext?.clinicName || 'Clínica',
        address: clinic?.address || undefined,
        meetLink: appointment?.meet_link || undefined
      })

      window.open(link, '_blank', 'noopener,noreferrer')

      await updateAppointment.mutateAsync({
        id: integrationAppointment.id,
        reminder_sent_at: new Date().toISOString(),
        reminder_method: Array.from(new Set([...(appointment?.reminder_method || []), 'whatsapp']))
      })

      toast.success('Lembrete aberto no WhatsApp Web!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao abrir WhatsApp')
    } finally {
      setIsRunningAction(null)
    }
  }

  if ((isLoadingAppointment && id) || isLoadingTenant) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!tenantContext) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <p className="text-red-600 font-medium">Nao foi possivel identificar a clinica do usuario logado.</p>
        <p className="text-neutral-500 text-sm mt-2">
          Vincule este usuario a um profissional da clinica no Supabase para criar agendamentos.
        </p>
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
                onChange={(e) =>
                  setFormData((prev) => {
                    const nextStart = e.target.value
                    const nextDuration = prev.duration_min ?? 60
                    return {
                      ...prev,
                      start_time: nextStart,
                      end_time: addMinutesToTime(nextStart, nextDuration)
                    }
                  })
                }
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
                Duração (min)
              </label>
              <input
                type="number"
                min={15}
                step={5}
                value={formData.duration_min || 60}
                onChange={(e) =>
                  setFormData((prev) => {
                    const nextDuration = Number(e.target.value) || 60
                    return {
                      ...prev,
                      duration_min: nextDuration,
                      end_time: addMinutesToTime(prev.start_time || '09:00', nextDuration)
                    }
                  })
                }
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
                Procedimento
              </label>
              <select
                value={formData.procedure_id || ''}
                onChange={(e) => handleProcedureChange(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sala
              </label>
              <select
                value={formData.room_id || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, room_id: e.target.value || undefined }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="">Selecione</option>
                {rooms?.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
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

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Valor da sessão
              </label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={formData.price || 0}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
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

        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-neutral-800">Integrações e Lembretes</h2>
              <p className="text-sm text-neutral-500">
                {id
                  ? 'Ações disponíveis para este agendamento salvo.'
                  : 'Salve o agendamento primeiro para criar evento no Google, enviar email e abrir o WhatsApp.'}
              </p>
            </div>
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
              googleConnection?.access_token ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'
            }`}>
              {googleConnection?.access_token ? 'Google conectado' : 'Google não conectado'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <button
              type="button"
              disabled={!id || isRunningAction !== null}
              onClick={handleCreateGoogleEvent}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {isRunningAction === 'google' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarPlus2 className="w-4 h-4" />}
              Google Calendar
            </button>

            <button
              type="button"
              disabled={!id || isRunningAction !== null}
              onClick={handleSendEmailReminder}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {isRunningAction === 'email' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar Email
            </button>

            <button
              type="button"
              disabled={!id || isRunningAction !== null}
              onClick={handleOpenWhatsAppReminder}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {isRunningAction === 'whatsapp' ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
              WhatsApp
            </button>

            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs text-neutral-500 mb-1">Google Meet</p>
              {appointment?.meet_link ? (
                <a
                  href={appointment.meet_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                >
                  <Video className="w-4 h-4" />
                  Abrir link
                </a>
              ) : (
                <p className="text-sm text-neutral-600">Crie o evento Google para gerar o Meet.</p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-neutral-500">Paciente</p>
              <p className="font-medium text-neutral-800">{selectedPatient?.name || 'Selecione um paciente'}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-neutral-500">Email</p>
              <p className="font-medium text-neutral-800">{selectedPatient?.email || 'Não cadastrado'}</p>
            </div>
            <div className="rounded-lg bg-neutral-50 border border-neutral-200 p-4">
              <p className="text-neutral-500">WhatsApp</p>
              <p className="font-medium text-neutral-800">{selectedPatient?.phone || 'Não cadastrado'}</p>
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
