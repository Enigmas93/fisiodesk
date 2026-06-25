import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'
import { appEnv } from './env'

const supabaseUrl = appEnv.supabaseUrl || 'https://placeholder.supabase.co'
const supabaseAnonKey = appEnv.supabaseAnonKey || 'placeholder-anon-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
})
