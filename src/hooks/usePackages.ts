import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentTenantContext } from '../lib/tenant'
import type { Package, PackageInsert, PackageUpdate, Procedure, Professional } from '../types'

type PackageWithRelations = Package & {
  procedure?: Procedure
  professional?: Professional
}

export const usePackages = (patientId?: string) => {
  return useQuery({
    queryKey: ['packages', patientId],
    queryFn: async () => {
      let query = supabase
        .from('packages')
        .select(`
          *,
          procedure:procedures(*),
          professional:professionals(*)
        `)
        .order('created_at', { ascending: false })

      if (patientId) {
        query = query.eq('patient_id', patientId)
      }

      const { data, error } = await query

      if (error) throw error
      return data as PackageWithRelations[]
    }
  })
}

export const useCreatePackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pkg: PackageInsert) => {
      const tenant = await getCurrentTenantContext()
      const payload: PackageInsert = {
        ...pkg,
        clinic_id: pkg.clinic_id ?? tenant.clinicId,
        professional_id: pkg.professional_id ?? tenant.professionalId
      }

      const { data, error } = await (supabase.from('packages') as any)
        .insert(payload)
        .select()
        .single()

      if (error) throw error
      return data as Package
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['packages', data.patient_id] })
    }
  })
}

export const useUpdatePackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...pkg }: PackageUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('packages') as any)
        .update(pkg)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Package
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['packages', data.patient_id] })
    }
  })
}

export const useDeletePackage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase.from('packages').delete().eq('id', id)
      if (error) throw error
      return { patientId }
    },
    onSuccess: ({ patientId }) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['packages', patientId] })
    }
  })
}
