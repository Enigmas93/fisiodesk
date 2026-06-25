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
      rooms: {
        Row: {
          id: string
          clinic_id: string
          name: string
          description: string | null
          capacity: number | null
          color: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          description?: string | null
          capacity?: number | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          description?: string | null
          capacity?: number | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string
        }
      }
      procedures: {
        Row: {
          id: string
          clinic_id: string
          name: string
          description: string | null
          duration_min: number | null
          price: number | null
          category: string | null
          color: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          description?: string | null
          duration_min?: number | null
          price?: number | null
          category?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          description?: string | null
          duration_min?: number | null
          price?: number | null
          category?: string | null
          color?: string | null
          is_active?: boolean | null
          created_at?: string
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
      treatment_plans: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string | null
          name: string
          diagnosis: string | null
          objective: string | null
          sessions_total: number | null
          sessions_done: number | null
          frequency: string | null
          status: string | null
          start_date: string | null
          end_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          professional_id?: string | null
          name: string
          diagnosis?: string | null
          objective?: string | null
          sessions_total?: number | null
          sessions_done?: number | null
          frequency?: string | null
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          professional_id?: string | null
          name?: string
          diagnosis?: string | null
          objective?: string | null
          sessions_total?: number | null
          sessions_done?: number | null
          frequency?: string | null
          status?: string | null
          start_date?: string | null
          end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string | null
          procedure_id: string | null
          name: string
          total_sessions: number
          used_sessions: number | null
          price_total: number | null
          price_per_session: number | null
          status: string | null
          valid_until: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          professional_id?: string | null
          procedure_id?: string | null
          name: string
          total_sessions: number
          used_sessions?: number | null
          price_total?: number | null
          price_per_session?: number | null
          status?: string | null
          valid_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          professional_id?: string | null
          procedure_id?: string | null
          name?: string
          total_sessions?: number
          used_sessions?: number | null
          price_total?: number | null
          price_per_session?: number | null
          status?: string | null
          valid_until?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      package_sessions: {
        Row: {
          id: string
          package_id: string
          appointment_id: string | null
          session_number: number
          used_at: string | null
          status: string | null
        }
        Insert: {
          id?: string
          package_id: string
          appointment_id?: string | null
          session_number: number
          used_at?: string | null
          status?: string | null
        }
        Update: {
          id?: string
          package_id?: string
          appointment_id?: string | null
          session_number?: number
          used_at?: string | null
          status?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string | null
          appointment_id: string | null
          type: string | null
          template_id: string | null
          chief_complaint: string | null
          pain_level: number | null
          pain_location: Json | null
          pain_character: string | null
          onset: string | null
          aggravating: string | null
          relieving: string | null
          previous_treatment: string | null
          posture_notes: string | null
          muscle_strength: Json | null
          range_of_motion: Json | null
          special_tests: Json | null
          functional_tests: string | null
          imaging: string | null
          clinical_diagnosis: string | null
          icd10_code: string | null
          treatment_goals: string | null
          treatment_plan: string | null
          custom_fields: Json | null
          attachments: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          professional_id?: string | null
          appointment_id?: string | null
          type?: string | null
          template_id?: string | null
          chief_complaint?: string | null
          pain_level?: number | null
          pain_location?: Json | null
          pain_character?: string | null
          onset?: string | null
          aggravating?: string | null
          relieving?: string | null
          previous_treatment?: string | null
          posture_notes?: string | null
          muscle_strength?: Json | null
          range_of_motion?: Json | null
          special_tests?: Json | null
          functional_tests?: string | null
          imaging?: string | null
          clinical_diagnosis?: string | null
          icd10_code?: string | null
          treatment_goals?: string | null
          treatment_plan?: string | null
          custom_fields?: Json | null
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          professional_id?: string | null
          appointment_id?: string | null
          type?: string | null
          template_id?: string | null
          chief_complaint?: string | null
          pain_level?: number | null
          pain_location?: Json | null
          pain_character?: string | null
          onset?: string | null
          aggravating?: string | null
          relieving?: string | null
          previous_treatment?: string | null
          posture_notes?: string | null
          muscle_strength?: Json | null
          range_of_motion?: Json | null
          special_tests?: Json | null
          functional_tests?: string | null
          imaging?: string | null
          clinical_diagnosis?: string | null
          icd10_code?: string | null
          treatment_goals?: string | null
          treatment_plan?: string | null
          custom_fields?: Json | null
          attachments?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      evolutions: {
        Row: {
          id: string
          clinic_id: string
          patient_id: string
          professional_id: string | null
          appointment_id: string | null
          session_number: number | null
          date: string | null
          pain_level: number | null
          pain_location: Json | null
          patient_report: string | null
          objective: string | null
          procedures_done: string | null
          response: string | null
          next_plan: string | null
          custom_fields: Json | null
          attachments: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          patient_id: string
          professional_id?: string | null
          appointment_id?: string | null
          session_number?: number | null
          date?: string | null
          pain_level?: number | null
          pain_location?: Json | null
          patient_report?: string | null
          objective?: string | null
          procedures_done?: string | null
          response?: string | null
          next_plan?: string | null
          custom_fields?: Json | null
          attachments?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          patient_id?: string
          professional_id?: string | null
          appointment_id?: string | null
          session_number?: number | null
          date?: string | null
          pain_level?: number | null
          pain_location?: Json | null
          patient_report?: string | null
          objective?: string | null
          procedures_done?: string | null
          response?: string | null
          next_plan?: string | null
          custom_fields?: Json | null
          attachments?: Json | null
          created_at?: string
        }
      }
      assessment_templates: {
        Row: {
          id: string
          clinic_id: string
          name: string
          type: string | null
          is_default: boolean | null
          fields: Json
          created_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          name: string
          type?: string | null
          is_default?: boolean | null
          fields: Json
          created_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          name?: string
          type?: string | null
          is_default?: boolean | null
          fields?: Json
          created_at?: string
        }
      }
      financial_entries: {
        Row: {
          id: string
          clinic_id: string
          professional_id: string | null
          patient_id: string | null
          appointment_id: string | null
          package_id: string | null
          type: string
          category: string | null
          description: string
          amount: number
          due_date: string | null
          paid_date: string | null
          status: string | null
          payment_method: string | null
          installments: number | null
          installment_num: number | null
          parent_entry_id: string | null
          is_recurring: boolean | null
          recurrence_rule: string | null
          notes: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          professional_id?: string | null
          patient_id?: string | null
          appointment_id?: string | null
          package_id?: string | null
          type: string
          category?: string | null
          description: string
          amount: number
          due_date?: string | null
          paid_date?: string | null
          status?: string | null
          payment_method?: string | null
          installments?: number | null
          installment_num?: number | null
          parent_entry_id?: string | null
          is_recurring?: boolean | null
          recurrence_rule?: string | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          professional_id?: string | null
          patient_id?: string | null
          appointment_id?: string | null
          package_id?: string | null
          type?: string
          category?: string | null
          description?: string
          amount?: number
          due_date?: string | null
          paid_date?: string | null
          status?: string | null
          payment_method?: string | null
          installments?: number | null
          installment_num?: number | null
          parent_entry_id?: string | null
          is_recurring?: boolean | null
          recurrence_rule?: string | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          clinic_id: string
          appointment_id: string
          patient_id: string
          method: string
          status: string | null
          message: string | null
          sent_at: string | null
          sent_by: string | null
        }
        Insert: {
          id?: string
          clinic_id: string
          appointment_id: string
          patient_id: string
          method: string
          status?: string | null
          message?: string | null
          sent_at?: string | null
          sent_by?: string | null
        }
        Update: {
          id?: string
          clinic_id?: string
          appointment_id?: string
          patient_id?: string
          method?: string
          status?: string | null
          message?: string | null
          sent_at?: string | null
          sent_by?: string | null
        }
      }
      agenda_configs: {
        Row: {
          id: string
          clinic_id: string
          default_view: string | null
          slot_duration: number | null
          start_hour: string | null
          end_hour: string | null
          show_weekends: boolean | null
          color_by: string | null
          show_room: boolean | null
          show_procedure: boolean | null
          updated_at: string
        }
        Insert: {
          id?: string
          clinic_id: string
          default_view?: string | null
          slot_duration?: number | null
          start_hour?: string | null
          end_hour?: string | null
          show_weekends?: boolean | null
          color_by?: string | null
          show_room?: boolean | null
          show_procedure?: boolean | null
          updated_at?: string
        }
        Update: {
          id?: string
          clinic_id?: string
          default_view?: string | null
          slot_duration?: number | null
          start_hour?: string | null
          end_hour?: string | null
          show_weekends?: boolean | null
          color_by?: string | null
          show_room?: boolean | null
          show_procedure?: boolean | null
          updated_at?: string
        }
      }
      google_tokens: {
        Row: {
          id: string
          professional_id: string
          access_token: string
          refresh_token: string
          token_type: string | null
          expires_at: string | null
          scope: string | null
          calendar_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          professional_id: string
          access_token: string
          refresh_token: string
          token_type?: string | null
          expires_at?: string | null
          scope?: string | null
          calendar_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          professional_id?: string
          access_token?: string
          refresh_token?: string
          token_type?: string | null
          expires_at?: string | null
          scope?: string | null
          calendar_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
