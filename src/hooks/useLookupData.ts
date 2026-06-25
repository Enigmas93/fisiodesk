import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Professional, Room, Procedure } from '../types'

export const useProfessionals = () => {
  return useQuery({
    queryKey: ['professionals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as Professional[]
    }
  })
}

export const useRooms = () => {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as Room[]
    }
  })
}

export const useProcedures = () => {
  return useQuery({
    queryKey: ['procedures'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .eq('is_active', true)
        .order('name')
      
      if (error) throw error
      return data as Procedure[]
    }
  })
}
