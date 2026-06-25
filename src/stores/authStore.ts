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
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

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
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || data.user.email!,
          avatar_url: data.user.user_metadata?.avatar_url
        },
        isAuthenticated: true,
        isLoading: false
      })
    }
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
        user: {
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name || data.session.user.email!,
          avatar_url: data.session.user.user_metadata?.avatar_url
        },
        isAuthenticated: true,
        isLoading: false
      })
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
