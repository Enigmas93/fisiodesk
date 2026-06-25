export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: {
          id: string
          name: string
          cnpj: string | null
          phone: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          logo_url: string | null
          website: string | null
          working_hours: Json | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          cnpj?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          logo_url?: string | null
          website?: string | null
          working_hours?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          cnpj?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          logo_url?: string | null
          website?: string | null
          working_hours?: Json | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      professionals: {
        Row: {
          id: string
          user_id: string | null
          clinic_id: string
          name: string
          email: string | null
          phone: string | null
          crefito: string | null
          specialty: string | null
          bio: string | null
          avatar_url: string | null
          color: string | null
          commission_pct: number | null
          work_hours: Json | null
          active_days: string[] | null
          slot_duration: number | null
          role: string | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          clinic_id: string
          name: string
          email?: string | null
          phone?: string | null
          crefito?: string | null
          specialty?: string | null
          bio?: string | null
          avatar_url?: string | null
          color?: string | null
          commission_pct?: number | null
          work_hours?: Json | null
          active_days?: string[] | null
          slot_duration?: number | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          clinic_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          crefito?: string | null
          specialty?: string | null
          bio?: string | null
          avatar_url?: string | null
          color?: string | null
          commission_pct?: number | null
          work_hours?: Json | null
          active_days?: string[] | null
          slot_duration?: number | null
          role?: string | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          clinic_id: string
          owner_id: string | null
          name: string
          cpf: string | null
          rg: string | null
          birth_date: string | null
          gender: string | null
          phone: string | null
          phone2: string | null
          email: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          blood_type: string | null
          insurance: string | null
          insurance_card: string | null
          occupation: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          how_found: string | null
          medical_history: string | null
          allergies: string | null
          medications: string | null
          observations: string | null
          avatar_url: string | null
          status: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          owner_id?: string | null
          name: string
          cpf?: string | null
          rg?: string | null
          birth_date?: string | null
          gender?: string | null
          phone?: string | null
          phone2?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          blood_type?: string | null
          insurance?: string | null
          insurance_card?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          how_found?: string | null
          medical_history?: string | null
          allergies?: string | null
          medications?: string | null
          observations?: string | null
          avatar_url?: string | null
          status?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          owner_id?: string | null
          name?: string
          cpf?: string | null
          rg?: string | null
          birth_date?: string | null
          gender?: string | null
          phone?: string | null
          phone2?: string | null
          email?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          blood_type?: string | null
          insurance?: string | null
          insurance_card?: string | null
          occupation?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          how_found?: string | null
          medical_history?: string | null
          allergies?: string | null
          medications?: string | null
          observations?: string | null
          avatar_url?: string | null
          status?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          clinic_id: string
          professional_id: string | null
          patient_id: string
          room_id: string | null
          procedure_id: string | null
          package_session_id: string | null
          date: string
          start_time: string
          end_time: string
          duration_min: number | null
          status: string
          type: string
          modality: string
          meet_link: string | null
          google_event_id: string | null
          color: string | null
          notes: string | null
          cancellation_reason: string | null
          reminder_sent_at: string | null
          reminder_method: string[] | null
          price: number | null
          is_paid: boolean | null
          financial_entry_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          professional_id?: string | null
          patient_id: string
          room_id?: string | null
          procedure_id?: string | null
          package_session_id?: string | null
          date: string
          start_time: string
          end_time: string
          duration_min?: number | null
          status?: string
          type?: string
          modality?: string
          meet_link?: string | null
          google_event_id?: string | null
          color?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          reminder_sent_at?: string | null
          reminder_method?: string[] | null
          price?: number | null
          is_paid?: boolean | null
          financial_entry_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          professional_id?: string | null
          patient_id?: string
          room_id?: string | null
          procedure_id?: string | null
          package_session_id?: string | null
          date?: string
          start_time?: string
          end_time?: string
          duration_min?: number | null
          status?: string
          type?: string
          modality?: string
          meet_link?: string | null
          google_event_id?: string | null
          color?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          reminder_sent_at?: string | null
          reminder_method?: string[] | null
          price?: number | null
          is_paid?: boolean | null
          financial_entry_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
