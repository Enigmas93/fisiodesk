import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentTenantContext } from '../lib/tenant'
import type { Clinic, ClinicUpdate } from '../types'

export const useClinicProfile = () => {
  return useQuery({
    queryKey: ['clinic-profile'],
    queryFn: async () => {
      const tenant = await getCurrentTenantContext()
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', tenant.clinicId)
        .single()

      if (error) throw error
      return data as Clinic
    }
  })
}

export const useUpdateClinicProfile = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (clinic: ClinicUpdate & { id?: string }) => {
      const tenant = await getCurrentTenantContext()
      const { id, ...payload } = clinic
      const { data, error } = await (supabase.from('clinics') as any)
        .update(payload)
        .eq('id', id || tenant.clinicId)
        .select()
        .single()

      if (error) throw error
      return data as Clinic
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clinic-profile'] })
      queryClient.invalidateQueries({ queryKey: ['tenant-context'] })
      queryClient.invalidateQueries({ queryKey: ['clinic', data.id] })
    }
  })
}
