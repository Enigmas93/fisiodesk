import { supabase } from './supabase'

type BootstrapUser = {
  id: string
  email?: string | null
  name?: string | null
}

export type BootstrapOptions = {
  user: BootstrapUser
  clinicName: string
  clinicPhone?: string
  clinicAddress?: string
  clinicLogoUrl?: string
  professionalName?: string
  crefito?: string
  specialty?: string
  professionalColor?: string
  createRoom?: boolean
  roomName?: string
  roomDescription?: string
  createProcedure?: boolean
  procedureName?: string
  procedureDuration?: number
  procedurePrice?: number
}

async function getProPlanId() {
  const { data, error } = await (supabase.from('plans') as any)
    .select('id')
    .eq('slug', 'pro')
    .eq('is_active', true)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data?.id as string | undefined
}

export async function ensureClinicBootstrap(options: BootstrapOptions) {
  const {
    user,
    clinicName,
    clinicPhone,
    clinicAddress,
    clinicLogoUrl,
    professionalName,
    crefito,
    specialty,
    professionalColor = '#0EA5E9',
    createRoom,
    roomName,
    roomDescription,
    createProcedure,
    procedureName,
    procedureDuration = 50,
    procedurePrice = 0
  } = options

  if (!clinicName || !user.id) {
    throw new Error('Dados insuficientes para criar a clínica.')
  }

  const { data: existingProfessional, error: existingProfessionalError } = await (supabase.from('professionals') as any)
    .select('id, clinic_id, name, role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingProfessionalError) {
    throw existingProfessionalError
  }

  let clinicId = existingProfessional?.clinic_id as string | undefined
  let professionalId = existingProfessional?.id as string | undefined

  if (!clinicId) {
    clinicId = crypto.randomUUID()
    const { error: clinicError } = await (supabase.from('clinics') as any).insert({
      id: clinicId,
      name: clinicName,
      phone: clinicPhone || null,
      email: user.email || null,
      address: clinicAddress || null,
      logo_url: clinicLogoUrl || null
    })

    if (clinicError) {
      throw clinicError
    }
  }

  if (!professionalId) {
    professionalId = crypto.randomUUID()
    const { error: professionalError } = await (supabase.from('professionals') as any).insert({
      id: professionalId,
      clinic_id: clinicId,
      user_id: user.id,
      name: professionalName || user.name || user.email || 'Responsável',
      email: user.email || null,
      phone: clinicPhone || null,
      crefito: crefito || null,
      specialty: specialty || null,
      color: professionalColor,
      role: 'admin'
    })

    if (professionalError) {
      throw professionalError
    }
  }

  const { data: existingSubscription, error: existingSubscriptionError } = await (supabase.from('subscriptions') as any)
    .select('id')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  if (existingSubscriptionError && existingSubscriptionError.code !== 'PGRST116') {
    throw existingSubscriptionError
  }

  if (!existingSubscription?.id) {
    const planId = await getProPlanId()
    const { error: subscriptionError } = await (supabase.from('subscriptions') as any).insert({
      clinic_id: clinicId,
      plan_id: planId || null,
      status: 'pending',
      payment_method: 'manual',
      contact_whatsapp: clinicPhone || null,
      metadata: {
        source: 'bootstrap'
      }
    })

    if (subscriptionError) {
      throw subscriptionError
    }
  }

  const { data: existingAgendaConfig, error: agendaConfigError } = await (supabase.from('agenda_configs') as any)
    .select('id')
    .eq('clinic_id', clinicId)
    .maybeSingle()

  if (agendaConfigError && agendaConfigError.code !== 'PGRST116') {
    throw agendaConfigError
  }

  if (!existingAgendaConfig?.id) {
    await (supabase.from('agenda_configs') as any).insert({
      clinic_id: clinicId
    })
  }

  if (createRoom && roomName) {
    const { data: existingRoom } = await (supabase.from('rooms') as any)
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('name', roomName)
      .maybeSingle()

    if (!existingRoom?.id) {
      await (supabase.from('rooms') as any).insert({
        clinic_id: clinicId,
        name: roomName,
        description: roomDescription || null
      })
    }
  }

  if (createProcedure && procedureName) {
    const { data: existingProcedure } = await (supabase.from('procedures') as any)
      .select('id')
      .eq('clinic_id', clinicId)
      .eq('name', procedureName)
      .maybeSingle()

    if (!existingProcedure?.id) {
      await (supabase.from('procedures') as any).insert({
        clinic_id: clinicId,
        name: procedureName,
        duration_min: procedureDuration,
        price: procedurePrice
      })
    }
  }

  return {
    clinicId,
    professionalId
  }
}
