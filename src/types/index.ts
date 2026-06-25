import type { Database } from './supabase';

export type Patient = Database['public']['Tables']['patients']['Row'];
export type PatientInsert = Database['public']['Tables']['patients']['Insert'];
export type PatientUpdate = Database['public']['Tables']['patients']['Update'];
export type Appointment = Database['public']['Tables']['appointments']['Row'];
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];
export type Professional = Database['public']['Tables']['professionals']['Row'];
export type ProfessionalInsert = Database['public']['Tables']['professionals']['Insert'];
export type ProfessionalUpdate = Database['public']['Tables']['professionals']['Update'];
export type Clinic = Database['public']['Tables']['clinics']['Row'];
export type ClinicInsert = Database['public']['Tables']['clinics']['Insert'];
export type ClinicUpdate = Database['public']['Tables']['clinics']['Update'];

export type Room = {
  id: string;
  clinic_id: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  color?: string | null;
  is_active?: boolean | null;
  created_at: string;
};

export type Procedure = {
  id: string;
  clinic_id: string;
  name: string;
  description?: string | null;
  duration_min?: number | null;
  price?: number | null;
  category?: string | null;
  color?: string | null;
  is_active?: boolean | null;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
};
