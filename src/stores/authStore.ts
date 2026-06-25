import { create } from 'zustand'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  login: (email: string, password: string) => Promise<void>
  register: (params: { email: string; password: string; name: string }) => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

const mapAuthUser = (authUser: {
  id: string
  email?: string | null
  user_metadata?: Record<string, unknown>
}) => ({
  id: authUser.id,
  email: authUser.email ?? '',
  name: (authUser.user_metadata?.name as string | undefined) || authUser.email || 'Usuário',
  avatar_url: authUser.user_metadata?.avatar_url as string | undefined
})

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  login: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    
    if (data.user) {
      set({
        user: mapAuthUser(data.user),
        isAuthenticated: true,
        isLoading: false
      })
    }
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

    if (data.user) {
      set({
        user: mapAuthUser(data.user),
        isAuthenticated: true,
        isLoading: false
      })
      return
    }

    set({ isLoading: false })
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
    set({ user: null, isAuthenticated: false, isLoading: false })
  },
  checkSession: async () => {
    set({ isLoading: true })
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      set({
        user: mapAuthUser(data.session.user),
        isAuthenticated: true,
        isLoading: false
      })
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
