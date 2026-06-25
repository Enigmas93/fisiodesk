const isFilled = (value?: string) => Boolean(value && value.trim().length > 0)

export const appEnv = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  googleClientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`,
  appUrl: import.meta.env.VITE_APP_URL || window.location.origin
}

export type EnvChecklistItem = {
  key: string
  label: string
  value: string
  configured: boolean
  requiredFor: 'core' | 'google' | 'deploy'
}

export const getEnvChecklist = (): EnvChecklistItem[] => [
  {
    key: 'VITE_SUPABASE_URL',
    label: 'Supabase URL',
    value: appEnv.supabaseUrl,
    configured: isFilled(appEnv.supabaseUrl),
    requiredFor: 'core'
  },
  {
    key: 'VITE_SUPABASE_ANON_KEY',
    label: 'Supabase Anon Key',
    value: appEnv.supabaseAnonKey,
    configured: isFilled(appEnv.supabaseAnonKey),
    requiredFor: 'core'
  },
  {
    key: 'VITE_GOOGLE_CLIENT_ID',
    label: 'Google Client ID',
    value: appEnv.googleClientId,
    configured: isFilled(appEnv.googleClientId),
    requiredFor: 'google'
  },
  {
    key: 'VITE_GOOGLE_CLIENT_SECRET',
    label: 'Google Client Secret',
    value: appEnv.googleClientSecret,
    configured: isFilled(appEnv.googleClientSecret),
    requiredFor: 'google'
  },
  {
    key: 'VITE_GOOGLE_REDIRECT_URI',
    label: 'Google Redirect URI',
    value: appEnv.googleRedirectUri,
    configured: isFilled(appEnv.googleRedirectUri),
    requiredFor: 'google'
  },
  {
    key: 'VITE_APP_URL',
    label: 'App URL',
    value: appEnv.appUrl,
    configured: isFilled(appEnv.appUrl),
    requiredFor: 'deploy'
  }
]

export const getMissingEnvKeys = (scope: 'core' | 'google' | 'deploy' | 'all' = 'all') => {
  const allowedScopes = scope === 'all' ? ['core', 'google', 'deploy'] : [scope]
  return getEnvChecklist()
    .filter((item) => allowedScopes.includes(item.requiredFor) && !item.configured)
    .map((item) => item.key)
}

export const isGoogleEnvConfigured = () => getMissingEnvKeys('google').length === 0
export const isCoreEnvConfigured = () => getMissingEnvKeys('core').length === 0
export const isDeployEnvConfigured = () => getMissingEnvKeys('deploy').length === 0

export const assertGoogleEnvConfigured = () => {
  const missing = getMissingEnvKeys('google')
  if (missing.length > 0) {
    throw new Error(`Configuração Google incompleta. Variáveis ausentes: ${missing.join(', ')}`)
  }
}
