import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentTenantContext } from '../lib/tenant';
import type {
  Assessment,
  AssessmentInsert,
  AssessmentUpdate,
  Patient,
  Professional,
  Appointment
} from '../types';

type AssessmentWithRelations = Assessment & {
  patient?: Patient;
  professional?: Professional;
  appointment?: Appointment;
};

export const useAssessments = (patientId?: string) => {
  return useQuery({
    queryKey: ['assessments', patientId],
    queryFn: async () => {
      let query = supabase
        .from('assessments')
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
      return data as AssessmentWithRelations[];
    }
  });
};

export const useAssessment = (id: string) => {
  return useQuery({
    queryKey: ['assessment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*),
          appointment:appointments(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as AssessmentWithRelations;
    },
    enabled: !!id
  });
};

export const useCreateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessment: AssessmentInsert) => {
      const tenant = await getCurrentTenantContext();
      const payload: AssessmentInsert = {
        ...assessment,
        clinic_id: assessment.clinic_id ?? tenant.clinicId,
        professional_id: assessment.professional_id ?? tenant.professionalId
      };

      const { data, error } = await (supabase.from('assessments') as any)
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data as Assessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessments', data.patient_id] });
    }
  });
};

export const useUpdateAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...assessment }: AssessmentUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('assessments') as any)
        .update(assessment)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Assessment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
      queryClient.invalidateQueries({ queryKey: ['assessments', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['assessment', data.id] });
    }
  });
};

export const useDeleteAssessment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('assessments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessments'] });
    }
  });
};
