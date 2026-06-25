export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

export interface Patient {
  id: string;
  clinic_id: string;
  name: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'O';
  phone?: string;
  phone2?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  blood_type?: string;
  insurance?: string;
  insurance_card?: string;
  occupation?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  how_found?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  observations?: string;
  avatar_url?: string;
  status?: 'active' | 'inactive' | 'discharged';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  professional_id?: string;
  patient_id: string;
  room_id?: string;
  procedure_id?: string;
  package_session_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_min?: number;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  type?: 'initial' | 'session' | 'reassessment' | 'discharge' | 'online' | 'return';
  modality?: 'in_person' | 'online';
  meet_link?: string;
  google_event_id?: string;
  color?: string;
  notes?: string;
  cancellation_reason?: string;
  reminder_sent_at?: string;
  reminder_method?: string[];
  price?: number;
  is_paid?: boolean;
  financial_entry_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
}

export interface Professional {
  id: string;
  user_id?: string;
  clinic_id: string;
  name: string;
  email?: string;
  phone?: string;
  crefito?: string;
  specialty?: string;
  bio?: string;
  avatar_url?: string;
  color?: string;
  commission_pct?: number;
  work_hours?: any;
  active_days?: string[];
  slot_duration?: number;
  role?: 'admin' | 'professional' | 'receptionist';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  capacity?: number;
  color?: string;
  is_active?: boolean;
  created_at: string;
}

export interface Procedure {
  id: string;
  clinic_id: string;
  name: string;
  description?: string;
  duration_min?: number;
  price?: number;
  category?: string;
  color?: string;
  is_active?: boolean;
  created_at: string;
}
