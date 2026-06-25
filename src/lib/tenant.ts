import { supabase } from './supabase'

export type TenantContext = {
  userId: string
  clinicId: string
  professionalId: string
  professionalName: string
  role: string | null
  clinicName: string | null
}

type ProfessionalTenantRow = {
  id: string
  clinic_id: string
  name: string
  role: string | null
  clinic: {
    id: string
    name: string
  } | null
}

async function fetchTenantContext(): Promise<TenantContext | null> {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError) {
    throw authError
  }

  if (!user) {
    throw new Error('Usuário não autenticado.')
  }

  const { data, error } = await supabase
    .from('professionals')
    .select(`
      id,
      clinic_id,
      name,
      role,
      clinic:clinics (
        id,
        name
      )
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw error
  }

  const professional = data as ProfessionalTenantRow | null

  if (!professional?.clinic_id) {
    return null
  }

  return {
    userId: user.id,
    clinicId: professional.clinic_id,
    professionalId: professional.id,
    professionalName: professional.name,
    role: professional.role,
    clinicName: professional.clinic?.name ?? null
  }
}

export async function getCurrentTenantContext(): Promise<TenantContext> {
  const tenant = await fetchTenantContext()

  if (!tenant) {
    throw new Error('Nenhum profissional vinculado a uma clínica foi encontrado para este usuário.')
  }

  return tenant
}

export async function getOptionalTenantContext(): Promise<TenantContext | null> {
  return fetchTenantContext()
}
