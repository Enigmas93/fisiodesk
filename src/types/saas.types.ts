export type SubscriptionStatus =
  | 'pending'
  | 'active'
  | 'trial'
  | 'suspended'
  | 'cancelled'
  | 'expired'

export type BillingCycle = 'monthly' | 'yearly' | 'lifetime'

export type UserRole = 'super_admin' | 'admin' | 'professional' | 'receptionist'

export interface Plan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  billing_cycle: BillingCycle
  features: string[]
  max_professionals: number
  max_patients: number
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
}

export interface Subscription {
  id: string
  clinic_id: string
  plan_id: string | null
  status: SubscriptionStatus
  activated_at: string | null
  activated_by: string | null
  current_period_start: string | null
  current_period_end: string | null
  next_billing_date: string | null
  cancelled_at: string | null
  cancel_reason: string | null
  payment_method: string | null
  payment_notes: string | null
  contact_whatsapp: string | null
  contacted_at: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  plan?: Plan | null
}

export interface AdminLog {
  id: string
  admin_id: string | null
  action: string
  target_type: string | null
  target_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}
