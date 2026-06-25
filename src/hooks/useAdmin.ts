import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

type AdminAction =
  | 'list_subscriptions'
  | 'subscription_stats'
  | 'list_logs'
  | 'activate_subscription'
  | 'update_subscription_status'

const callAdminFunction = async <T>(action: AdminAction, payload: Record<string, unknown> = {}) => {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  const response = await supabase.functions.invoke('admin-data', {
    body: { action, ...payload },
    headers: session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : undefined
  })

  if (response.error) {
    throw response.error
  }

  return response.data as T
}

export type AdminSubscriptionItem = {
  id: string
  clinic_id: string
  plan_id: string | null
  status: string
  current_period_end: string | null
  next_billing_date: string | null
  contact_whatsapp: string | null
  payment_method: string | null
  payment_notes: string | null
  created_at: string
  updated_at: string
  activated_at: string | null
  clinic: {
    id: string
    name: string
    email: string | null
    phone: string | null
    city: string | null
    state: string | null
    created_at?: string | null
  } | null
  plan: {
    name: string
    price: number
  } | null
  professional: {
    id: string
    name: string
    email: string | null
    phone: string | null
    role: string | null
  } | null
}

export type AdminDashboardStats = {
  totalClients: number
  activeSubscriptions: number
  pendingSubscriptions: number
  suspendedSubscriptions: number
  estimatedMonthlyRevenue: number
  expiringSoon: number
  recentSignups: Array<{
    month: string
    count: number
  }>
}

export type AdminLogItem = {
  id: string
  action: string
  target_type: string | null
  target_id: string | null
  created_at: string
  details: Record<string, unknown> | null
  admin: {
    name: string | null
    email: string | null
  } | null
}

export const useAdminSubscriptions = () =>
  useQuery({
    queryKey: ['admin', 'subscriptions'],
    queryFn: () => callAdminFunction<AdminSubscriptionItem[]>('list_subscriptions')
  })

export const useAdminStats = () =>
  useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => callAdminFunction<AdminDashboardStats>('subscription_stats')
  })

export const useAdminLogs = () =>
  useQuery({
    queryKey: ['admin', 'logs'],
    queryFn: () => callAdminFunction<AdminLogItem[]>('list_logs')
  })

export const useActivateSubscription = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      subscription_id: string
      note?: string
      payment_method?: string
      period_days?: number
    }) => callAdminFunction('activate_subscription', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    }
  })
}

export const useUpdateSubscriptionStatus = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      subscription_id: string
      status: 'suspended' | 'cancelled' | 'expired' | 'pending' | 'active'
      note?: string
    }) => callAdminFunction('update_subscription_status', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
    }
  })
}
