import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../lib/supabase'
import { getCurrentTenantContext } from '../../lib/tenant'
import { appEnv, assertGoogleEnvConfigured } from '../../lib/env'
import { useAuthStore } from '../../stores/authStore'

type GoogleTokenResponse = {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
  scope?: string
}

export function GoogleCallback() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const checkSession = useAuthStore((state) => state.checkSession)

  useEffect(() => {
    const handleGoogleCallback = async () => {
      const url = new URL(window.location.href)
      const code = url.searchParams.get('code')
      const error = url.searchParams.get('error')

      if (error) {
        setErrorMessage(`O Google retornou um erro: ${error}`)
        return
      }

      if (!code) {
        setErrorMessage('Nenhum código de autorização foi retornado pelo Google.')
        return
      }

      try {
        assertGoogleEnvConfigured()
        const tenant = await getCurrentTenantContext()

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            code,
            client_id: appEnv.googleClientId,
            client_secret: appEnv.googleClientSecret,
            redirect_uri: appEnv.googleRedirectUri,
            grant_type: 'authorization_code'
          })
        })

        const tokenData = (await tokenResponse.json()) as GoogleTokenResponse & { error?: string }

        if (!tokenResponse.ok || !tokenData.access_token) {
          throw new Error(tokenData.error || 'Falha ao trocar o código do Google por tokens.')
        }

        const expiresAt =
          typeof tokenData.expires_in === 'number'
            ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
            : null

        const { error: saveError } = await (supabase.from('google_tokens') as any).upsert(
          {
            professional_id: tenant.professionalId,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || '',
            token_type: tokenData.token_type || 'Bearer',
            expires_at: expiresAt,
            scope: tokenData.scope || null
          },
          { onConflict: 'professional_id' }
        )

        if (saveError) {
          throw saveError
        }

        toast.success('Google conectado com sucesso!')
        await checkSession()
        navigate('/configuracoes')
      } catch (callbackError: any) {
        setErrorMessage(callbackError.message || 'Não foi possível concluir a conexão com o Google.')
      }
    }

    void handleGoogleCallback()
  }, [navigate])

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-3">Falha na conexão Google</h1>
          <p className="text-neutral-500 mb-6">{errorMessage}</p>
          <Link to="/configuracoes" className="text-primary font-medium hover:underline">
            Voltar para configurações
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-neutral-800 mb-3">Conectando Google</h1>
        <p className="text-neutral-500">Estamos concluindo a autorização e salvando sua integração.</p>
      </div>
    </div>
  )
}
