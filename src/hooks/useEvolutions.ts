import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentTenantContext } from '../lib/tenant';
import type {
  Evolution,
  EvolutionInsert,
  EvolutionUpdate,
  Patient,
  Professional,
  Appointment
} from '../types';

type EvolutionWithRelations = Evolution & {
  patient?: Patient;
  professional?: Professional;
  appointment?: Appointment;
};

export const useEvolutions = (patientId?: string) => {
  return useQuery({
    queryKey: ['evolutions', patientId],
    queryFn: async () => {
      let query = supabase
        .from('evolutions')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          appointment:appointments(*)
        `);
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EvolutionWithRelations[];
    }
  });
};

export const useEvolution = (id: string) => {
  return useQuery({
    queryKey: ['evolution', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('evolutions')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          appointment:appointments(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as EvolutionWithRelations;
    },
    enabled: !!id
  });
};

export const useCreateEvolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (evolution: EvolutionInsert) => {
      if (!evolution.patient_id) {
        throw new Error('Selecione um paciente antes de salvar a evolução.')
      }

      const tenant = await getCurrentTenantContext();
      const payload: EvolutionInsert = {
        ...evolution,
        clinic_id: evolution.clinic_id ?? tenant.clinicId,
        professional_id: evolution.professional_id ?? tenant.professionalId
      };

      const { data, error } = await (supabase.from('evolutions') as any)
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data as Evolution;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evolutions'] });
      queryClient.invalidateQueries({ queryKey: ['evolutions', data.patient_id] });
    }
  });
};

export const useUpdateEvolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...evolution }: EvolutionUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('evolutions') as any)
        .update(evolution)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Evolution;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evolutions'] });
      queryClient.invalidateQueries({ queryKey: ['evolutions', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['evolution', data.id] });
    }
  });
};

export const useDeleteEvolution = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('evolutions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolutions'] });
    }
  });
};
