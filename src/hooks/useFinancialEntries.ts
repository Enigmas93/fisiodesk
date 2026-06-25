import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { getCurrentTenantContext } from '../lib/tenant';
import type {
  FinancialEntry,
  FinancialEntryInsert,
  FinancialEntryUpdate,
  Patient,
  Professional
} from '../types';

type FinancialEntryWithRelations = FinancialEntry & {
  patient?: Patient;
  professional?: Professional;
};

export const useFinancialEntries = () => {
  return useQuery({
    queryKey: ['financialEntries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_entries')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as FinancialEntryWithRelations[];
    }
  });
};

export const useFinancialEntry = (id: string) => {
  return useQuery({
    queryKey: ['financialEntry', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_entries')
        .select(`
          *,
          patient:patients(*),
          professional:professionals(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as FinancialEntryWithRelations;
    },
    enabled: !!id
  });
};

export const useCreateFinancialEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entry: FinancialEntryInsert) => {
      const tenant = await getCurrentTenantContext();
      const payload: FinancialEntryInsert = {
        ...entry,
        clinic_id: entry.clinic_id ?? tenant.clinicId,
        professional_id: entry.professional_id ?? tenant.professionalId
      };

      const { data, error } = await (supabase.from('financial_entries') as any)
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data as FinancialEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
    }
  });
};

export const useUpdateFinancialEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...entry }: FinancialEntryUpdate & { id: string }) => {
      const { data, error } = await (supabase.from('financial_entries') as any)
        .update(entry)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as FinancialEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
      queryClient.invalidateQueries({ queryKey: ['financialEntry', data.id] });
    }
  });
};

export const useDeleteFinancialEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('financial_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialEntries'] });
    }
  });
};
