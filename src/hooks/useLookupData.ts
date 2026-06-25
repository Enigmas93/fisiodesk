import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { getCurrentTenantContext } from '../lib/tenant'
import type { 
  Professional, ProfessionalInsert, ProfessionalUpdate,
  Room, RoomInsert, RoomUpdate,
  Procedure, ProcedureInsert, ProcedureUpdate 
} from '../types'

// Professionals
export const useProfessionals = () => {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Professional[]
    }
  })
}

export const useCreateProfessional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (professional: ProfessionalInsert) => {
      const tenant = await getCurrentTenantContext()
      const payload: ProfessionalInsert = {
        ...professional,
        clinic_id: professional.clinic_id ?? tenant.clinicId
      }

      const { data, error } = await (supabase.from('professionals') as any)
        .insert(payload)
        .select()
        .single()
      
      if (error) throw error
      return data as Professional
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })
}

export const useUpdateProfessional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...professional }: ProfessionalUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('professionals') as any)
        .update(professional)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Professional
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })
}

export const useDeleteProfessional = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] })
    }
  })
}

// Rooms
export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Room[]
    }
  })
}

export const useCreateRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (room: RoomInsert) => {
      const tenant = await getCurrentTenantContext()
      const payload: RoomInsert = {
        ...room,
        clinic_id: room.clinic_id ?? tenant.clinicId
      }

      const { data, error } = await (supabase.from('rooms') as any)
        .insert(payload)
        .select()
        .single()
      
      if (error) throw error
      return data as Room
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export const useUpdateRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...room }: RoomUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('rooms') as any)
        .update(room)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Room
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

export const useDeleteRoom = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] })
    }
  })
}

// Procedures
export const useProcedures = () => {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data as Procedure[]
    }
  })
}

export const useCreateProcedure = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (procedure: ProcedureInsert) => {
      const tenant = await getCurrentTenantContext()
      const payload: ProcedureInsert = {
        ...procedure,
        clinic_id: procedure.clinic_id ?? tenant.clinicId
      }

      const { data, error } = await (supabase.from('procedures') as any)
        .insert(payload)
        .select()
        .single()
      
      if (error) throw error
      return data as Procedure
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    }
  })
}

export const useUpdateProcedure = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...procedure }: ProcedureUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('procedures') as any)
        .update(procedure)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data as Procedure
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    }
  })
}

export const useDeleteProcedure = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('procedures')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procedures'] })
    }
  })
}
