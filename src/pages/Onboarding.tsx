import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { initiateGoogleOAuth } from '../lib/google'
import { useAuthStore } from '../stores/authStore'
import { useTenantContext } from '../hooks/useTenantContext'
import { ensureClinicBootstrap } from '../lib/bootstrap'

type OnboardingData = {
  clinicName: string
  clinicPhone: string
  clinicAddress: string
  clinicLogoUrl: string
  professionalName: string
  crefito: string
  specialty: string
  professionalColor: string
  createRoom: boolean
  roomName: string
  roomDescription: string
  createProcedure: boolean
  procedureName: string
  procedureDuration: number
  procedurePrice: number
}

const TOTAL_STEPS = 4

export function Onboarding() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const checkSession = useAuthStore((state) => state.checkSession)
  const user = useAuthStore((state) => state.user)
  const professional = useAuthStore((state) => state.professional)
  const clinic = useAuthStore((state) => state.clinic)
  const hasTenant = useAuthStore((state) => state.hasTenant)
  const { data: tenantContext, isLoading: isLoadingTenant } = useTenantContext({ required: false })

  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [data, setData] = useState<OnboardingData>({
    clinicName: '',
    clinicPhone: '',
    clinicAddress: '',
    clinicLogoUrl: '',
    professionalName: user?.name || '',
    crefito: '',
    specialty: '',
    professionalColor: '#0EA5E9',
    createRoom: true,
    roomName: 'Sala 1',
    roomDescription: '',
    createProcedure: true,
    procedureName: 'Sessão de Fisioterapia',
    procedureDuration: 50,
    procedurePrice: 0
  })

  const hasExistingSetup =
    hasTenant ||
    Boolean(tenantContext?.clinicId) ||
    Boolean(professional?.clinic_id) ||
    Boolean(clinic?.id)

  useEffect(() => {
    if (hasExistingSetup && !isConnectingGoogle) {
      navigate('/dashboard', { replace: true })
    }
  }, [hasExistingSetup, isConnectingGoogle, navigate])

  const progress = useMemo(() => (step / TOTAL_STEPS) * 100, [step])

  const nextStep = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS))
  const previousStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const createInitialStructure = async () => {
    if (!user) {
      throw new Error('Usuário não autenticado.')
    }

    if (hasExistingSetup) {
      return tenantContext
        ? tenantContext
        : {
            clinicId: professional?.clinic_id || clinic?.id || '',
            professionalId: professional?.id || '',
            professionalName: professional?.name || data.professionalName,
            role: professional?.role || 'admin',
            clinicName: clinic?.name || data.clinicName,
            userId: user.id
          }
    }

    if (!data.clinicName || !data.professionalName) {
      throw new Error('Preencha os dados obrigatórios para concluir o onboarding.')
    }

    const bootstrap = await ensureClinicBootstrap({
      user,
      clinicName: data.clinicName,
      clinicPhone: data.clinicPhone,
      clinicAddress: data.clinicAddress,
      clinicLogoUrl: data.clinicLogoUrl,
      professionalName: data.professionalName,
      crefito: data.crefito,
      specialty: data.specialty,
      professionalColor: data.professionalColor,
      createRoom: data.createRoom,
      roomName: data.roomName,
      roomDescription: data.roomDescription,
      createProcedure: data.createProcedure,
      procedureName: data.procedureName,
      procedureDuration: data.procedureDuration,
      procedurePrice: data.procedurePrice
    })

    await queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
    await queryClient.invalidateQueries({ queryKey: ['professionals'] })
    await queryClient.invalidateQueries({ queryKey: ['rooms'] })
    await queryClient.invalidateQueries({ queryKey: ['procedures'] })
    await queryClient.invalidateQueries({ queryKey: ['admin'] })

    return {
      id: bootstrap.professionalId,
      clinic_id: bootstrap.clinicId,
      name: data.professionalName,
      role: 'admin'
    }
  }

  const finishOnboarding = async () => {
    if (!user) {
      toast.error('Usuário não autenticado.')
      return
    }

    if (!hasExistingSetup && (!data.clinicName || !data.professionalName)) {
      toast.error('Preencha os dados obrigatórios para concluir o onboarding.')
      return
    }

    setIsSubmitting(true)

    try {
      await createInitialStructure()
      await checkSession()
      toast.success('Onboarding concluído com sucesso!')
      navigate('/dashboard')
    } catch (error: any) {
      const message = String(error?.message || '')

      if (message.includes('row-level security policy') && message.includes('"clinics"')) {
        toast.error(
          'O banco ainda não liberou a criação da clínica no onboarding. Aplique a migration 003_auth_bootstrap_policies.sql no Supabase e tente novamente.'
        )
      } else if (message.includes('row-level security policy') && message.includes('"professionals"')) {
        toast.error(
          'O banco ainda não liberou a criação do primeiro profissional. Aplique a migration 005_fix_professionals_bootstrap_policy.sql no Supabase e tente novamente.'
        )
      } else {
        toast.error(error.message || 'Não foi possível concluir o onboarding.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const connectGoogle = async () => {
    setIsConnectingGoogle(true)

    try {
      await createInitialStructure()
      await checkSession()
      initiateGoogleOAuth()
    } catch (error: any) {
      const message = String(error?.message || '')

      if (message.includes('row-level security policy') && message.includes('"clinics"')) {
        toast.error(
          'O banco ainda não liberou a criação da clínica no onboarding. Aplique a migration 003_auth_bootstrap_policies.sql no Supabase e tente novamente.'
        )
      } else if (message.includes('row-level security policy') && message.includes('"professionals"')) {
        toast.error(
          'O banco ainda não liberou a criação do primeiro profissional. Aplique a migration 005_fix_professionals_bootstrap_policy.sql no Supabase e tente novamente.'
        )
      } else {
        toast.error(error.message || 'Não foi possível preparar a integração com o Google.')
      }

      setIsConnectingGoogle(false)
    }
  }

  if (isLoadingTenant) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">Setup inicial</h1>
                <p className="text-neutral-500 mt-1">
                  Vamos preparar sua clínica para começar a operar no FisioDesk
                </p>
              </div>
              <span className="text-sm font-medium text-primary">Passo {step} de {TOTAL_STEPS}</span>
            </div>
            <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-neutral-800">Dados da clínica</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nome da clínica</label>
                  <input
                    type="text"
                    value={data.clinicName}
                    onChange={(e) => setData((prev) => ({ ...prev, clinicName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Nome fantasia ou razão social"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Telefone</label>
                  <input
                    type="text"
                    value={data.clinicPhone}
                    onChange={(e) => setData((prev) => ({ ...prev, clinicPhone: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Logo URL</label>
                  <input
                    type="url"
                    value={data.clinicLogoUrl}
                    onChange={(e) => setData((prev) => ({ ...prev, clinicLogoUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Endereço</label>
                  <input
                    type="text"
                    value={data.clinicAddress}
                    onChange={(e) => setData((prev) => ({ ...prev, clinicAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-neutral-800">Primeiro profissional</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Nome</label>
                  <input
                    type="text"
                    value={data.professionalName}
                    onChange={(e) => setData((prev) => ({ ...prev, professionalName: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">CREFITO</label>
                  <input
                    type="text"
                    value={data.crefito}
                    onChange={(e) => setData((prev) => ({ ...prev, crefito: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Especialidade</label>
                  <input
                    type="text"
                    value={data.specialty}
                    onChange={(e) => setData((prev) => ({ ...prev, specialty: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    placeholder="Ortopedia, Pilates, Neurologia..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Cor da agenda</label>
                  <input
                    type="color"
                    value={data.professionalColor}
                    onChange={(e) => setData((prev) => ({ ...prev, professionalColor: e.target.value }))}
                    className="w-full h-12 px-2 py-2 border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-neutral-800">Sala e procedimento inicial</h2>

              <div className="space-y-4 border border-neutral-200 rounded-xl p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={data.createRoom}
                    onChange={(e) => setData((prev) => ({ ...prev, createRoom: e.target.checked }))}
                  />
                  Criar uma sala agora
                </label>

                {data.createRoom && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      value={data.roomName}
                      onChange={(e) => setData((prev) => ({ ...prev, roomName: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Nome da sala"
                    />
                    <input
                      type="text"
                      value={data.roomDescription}
                      onChange={(e) => setData((prev) => ({ ...prev, roomDescription: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Descrição da sala"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 border border-neutral-200 rounded-xl p-4">
                <label className="flex items-center gap-3 text-sm font-medium text-neutral-700">
                  <input
                    type="checkbox"
                    checked={data.createProcedure}
                    onChange={(e) => setData((prev) => ({ ...prev, createProcedure: e.target.checked }))}
                  />
                  Criar um procedimento agora
                </label>

                {data.createProcedure && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="text"
                      value={data.procedureName}
                      onChange={(e) => setData((prev) => ({ ...prev, procedureName: e.target.value }))}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none md:col-span-1"
                      placeholder="Nome do procedimento"
                    />
                    <input
                      type="number"
                      value={data.procedureDuration}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, procedureDuration: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Duração"
                    />
                    <input
                      type="number"
                      value={data.procedurePrice}
                      onChange={(e) =>
                        setData((prev) => ({ ...prev, procedurePrice: Number(e.target.value) || 0 }))
                      }
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      placeholder="Valor"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-neutral-800">Conectar Google</h2>
              <div className="border border-neutral-200 rounded-xl p-6 bg-neutral-50">
                <p className="text-neutral-700 mb-3">
                  Você pode conectar Google Calendar e Gmail agora, ou concluir e configurar depois.
                </p>
                <p className="text-sm text-neutral-500 mb-5">
                  A conexão libera criação de eventos no Google Calendar, links Meet para consultas online e envio de lembretes por email.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={connectGoogle}
                    disabled={isConnectingGoogle}
                    className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isConnectingGoogle ? 'Redirecionando...' : 'Conectar com Google'}
                  </button>
                  <button
                    type="button"
                    onClick={finishOnboarding}
                    disabled={isSubmitting}
                    className="border border-neutral-300 hover:bg-neutral-100 px-5 py-3 rounded-lg transition-colors"
                  >
                    Configurar depois
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-secondary/20 bg-secondary/5 p-4">
                <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5" />
                <div>
                  <p className="font-medium text-neutral-800">Quase pronto</p>
                  <p className="text-sm text-neutral-500">
                    Ao concluir, sua clínica já poderá começar o uso básico do sistema.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-10">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 1 || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar
            </button>

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-colors"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={finishOnboarding}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  'Concluir onboarding'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
