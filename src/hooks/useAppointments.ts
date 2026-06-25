import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentTenantContext } from '../lib/tenant';
import type {
  Appointment,
  AppointmentInsert,
  AppointmentUpdate,
  Patient,
  Professional,
  Room,
  Procedure
} from '../types';

type AppointmentWithRelations = Appointment & {
  patient?: Patient;
  professional?: Professional;
  room?: Room;
  procedure?: Procedure;
};

export const useAppointments = () => {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          room:rooms(*),
          procedure:procedures(*)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data as AppointmentWithRelations[];
    }
  });
};

export const useAppointment = (id: string) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          room:rooms(*),
          procedure:procedures(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as AppointmentWithRelations;
    },
    enabled: !!id
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (appointment: AppointmentInsert) => {
      const tenant = await getCurrentTenantContext();
      const payload: AppointmentInsert = {
        ...appointment,
        clinic_id: appointment.clinic_id ?? tenant.clinicId,
        professional_id: appointment.professional_id ?? tenant.professionalId,
        created_by: appointment.created_by ?? tenant.userId
      };

      const { data, error } = await (supabase.from('appointments') as any)
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};

export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...appointment }: AppointmentUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('appointments') as any)
        .update(appointment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', data.id] });
    }
  });
};

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    }
  });
};
