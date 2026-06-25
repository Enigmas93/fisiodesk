import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentTenantContext } from '../lib/tenant'
import type { GoogleToken } from '../types'

export const useGoogleConnection = () => {
  return useQuery({
    queryKey: ['google-connection'],
    queryFn: async () => {
      const tenant = await getCurrentTenantContext()
      const { data, error } = await supabase
        .from('google_tokens')
        .select('*')
        .eq('professional_id', tenant.professionalId)
        .maybeSingle()

      if (error) throw error
      return data as GoogleToken | null
    }
  })
}

export const useDisconnectGoogle = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const tenant = await getCurrentTenantContext()
      const { error } = await supabase
        .from('google_tokens')
        .delete()
        .eq('professional_id', tenant.professionalId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['google-connection'] })
    }
  })
}
