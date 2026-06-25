import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { Clinic, Professional, User } from '../types'
import type { Subscription, UserRole } from '../types/saas.types'

type AuthStore = {
  user: User | null
  professional: Professional | null
  clinic: Clinic | null
  subscription: Subscription | null
  role: UserRole | null
  isAuthenticated: boolean
  isLoading: boolean
  hasTenant: boolean
  isSuperAdmin: boolean
  hasActiveSubscription: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (params: { email: string; password: string; name: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
  refreshSubscription: () => Promise<void>
}

type ProfessionalWithClinic = Professional & {
  clinic?: Clinic | null
}

const getDefaultState = () => ({
  user: null,
  professional: null,
  clinic: null,
  subscription: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  hasTenant: false,
  isSuperAdmin: false,
  hasActiveSubscription: false
})

const mapAuthUser = (authUser: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}): User => ({
  id: authUser.id,
  email: authUser.email ?? '',
  name: (authUser.user_metadata?.name as string | undefined) || authUser.email || 'Usuário',
  avatar_url: authUser.user_metadata?.avatar_url as string | undefined
})

const loadSessionState = async (authUser: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}) => {
  const user = mapAuthUser(authUser)

  const { data: professionalData, error: professionalError } = await (supabase.from('professionals') as any)
    .select(`
      *,
      clinic:clinics (*)
    `)
    .eq('user_id', user.id)
    .maybeSingle()

  if (professionalError) {
    throw professionalError
  }

  const professional = (professionalData as ProfessionalWithClinic | null) ?? null
  const clinic = professional?.clinic ?? null
  const role = (professional?.role as UserRole | null) ?? null
  const isSuperAdmin = role === 'super_admin'

  let subscription: Subscription | null = null

  if (professional?.clinic_id) {
    const { data: subscriptionData, error: subscriptionError } = await (supabase.from('subscriptions') as any)
      .select(`
        *,
        plan:plans (*)
      `)
      .eq('clinic_id', professional.clinic_id)
      .maybeSingle()

    if (subscriptionError && subscriptionError.code !== 'PGRST116') {
      throw subscriptionError
    }

    subscription = (subscriptionData as Subscription | null) ?? null
  }

  const hasTenant = Boolean(professional?.clinic_id)
  const hasActiveSubscription =
    isSuperAdmin ||
    subscription?.status === 'active' ||
    subscription?.status === 'trial'

  return {
    user,
    professional,
    clinic,
    subscription,
    role,
    isAuthenticated: true,
    isLoading: false,
    hasTenant,
    isSuperAdmin,
    hasActiveSubscription
  }
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...getDefaultState(),
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    if (!data.user) {
      set({ ...getDefaultState(), isLoading: false })
      return
    }

    const nextState = await loadSessionState(data.user)
    set(nextState)
  },
  register: async ({ email, password, name }) => {
    set({ isLoading: true })

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })

    if (error) {
      set({ isLoading: false })
      throw error
    }

    if (!data.user) {
      set({ ...getDefaultState(), isLoading: false })
      return
    }

    if (!data.session) {
      set({
        ...getDefaultState(),
        user: mapAuthUser(data.user),
        isLoading: false
      })
      return
    }

    const nextState = await loadSessionState(data.user)
    set(nextState)
  },
  forgotPassword: async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) throw error
  },
  updatePassword: async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },
  logout: async () => {
    await supabase.auth.signOut()
    set({ ...getDefaultState(), isLoading: false })
  },
  checkSession: async () => {
    set({ isLoading: true })

    const { data, error } = await supabase.auth.getSession()
    if (error) {
      set({ ...getDefaultState(), isLoading: false })
      throw error
    }

    if (!data.session?.user) {
      set({ ...getDefaultState(), isLoading: false })
      return
    }

    const nextState = await loadSessionState(data.session.user)
    set(nextState)
  },
  refreshSubscription: async () => {
    const professional = get().professional
    const isSuperAdmin = get().isSuperAdmin

    if (!professional?.clinic_id) {
      set({ subscription: null, hasActiveSubscription: isSuperAdmin })
      return
    }

    const { data, error } = await (supabase.from('subscriptions') as any)
      .select(`
        *,
        plan:plans (*)
      `)
      .eq('clinic_id', professional.clinic_id)
      .maybeSingle()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    const subscription = (data as Subscription | null) ?? null
    set({
      subscription,
      hasActiveSubscription:
        isSuperAdmin ||
        subscription?.status === 'active' ||
        subscription?.status === 'trial'
    })
  }
}))
