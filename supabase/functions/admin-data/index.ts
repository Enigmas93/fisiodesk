import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

const getMonthLabel = (value: string) =>
  new Date(value).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })

async function getAdminContext(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: {
        Authorization: req.headers.get('Authorization') || ''
      }
    }
  })

  const {
    data: { user }
  } = await userClient.auth.getUser()

  if (!user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const { data: professional } = await userClient
    .from('professionals')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (professional?.role !== 'super_admin') {
    throw new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: corsHeaders })
  }

  const adminClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  return { adminClient, user }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { adminClient, user } = await getAdminContext(req)
    const payload = await req.json()
    const action = payload.action as string

    if (action === 'list_subscriptions') {
      const { data: subscriptions, error } = await adminClient
        .from('subscriptions')
        .select(`
          *,
          plan:plans(name, price),
          clinic:clinics(id, name, email, phone, city, state, created_at)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const clinicIds = [...new Set((subscriptions || []).map((item) => item.clinic_id).filter(Boolean))]
      const { data: professionals } = await adminClient
        .from('professionals')
        .select('id, clinic_id, name, email, phone, role')
        .in('clinic_id', clinicIds)

      const professionalByClinic = new Map<string, Record<string, Json>>()
      for (const professional of professionals || []) {
        const current = professionalByClinic.get(professional.clinic_id)
        const shouldReplace = !current || current.role === 'super_admin'
        if (shouldReplace) {
          professionalByClinic.set(professional.clinic_id, professional as unknown as Record<string, Json>)
        }
      }

      const result = (subscriptions || []).map((item) => ({
        ...item,
        professional: professionalByClinic.get(item.clinic_id) || null
      }))

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'subscription_stats') {
      const { data: subscriptions, error } = await adminClient
        .from('subscriptions')
        .select('id, status, created_at, current_period_end, plan:plans(price)')

      if (error) throw error

      const activeSubscriptions = (subscriptions || []).filter((item) => item.status === 'active').length
      const pendingSubscriptions = (subscriptions || []).filter((item) => item.status === 'pending').length
      const suspendedSubscriptions = (subscriptions || []).filter((item) => item.status === 'suspended').length
      const estimatedMonthlyRevenue = (subscriptions || [])
        .filter((item) => item.status === 'active')
        .reduce((sum, item) => sum + Number((item.plan as { price?: number } | null)?.price || 0), 0)
      const expiringSoon = (subscriptions || []).filter((item) => {
        if (!item.current_period_end) return false
        const end = new Date(item.current_period_end).getTime()
        return end > Date.now() && end - Date.now() <= 7 * 24 * 60 * 60 * 1000
      }).length

      const recentMap = new Map<string, number>()
      for (const item of subscriptions || []) {
        const label = getMonthLabel(item.created_at)
        recentMap.set(label, (recentMap.get(label) || 0) + 1)
      }

      return new Response(
        JSON.stringify({
          totalClients: subscriptions?.length || 0,
          activeSubscriptions,
          pendingSubscriptions,
          suspendedSubscriptions,
          estimatedMonthlyRevenue,
          expiringSoon,
          recentSignups: Array.from(recentMap.entries()).map(([month, count]) => ({ month, count }))
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (action === 'activate_subscription') {
      const now = new Date()
      const periodDays = Number(payload.period_days || 30)
      const periodEnd = new Date(now)
      periodEnd.setDate(periodEnd.getDate() + periodDays)

      const { error } = await adminClient
        .from('subscriptions')
        .update({
          status: 'active',
          activated_at: now.toISOString(),
          activated_by: user.id,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          next_billing_date: periodEnd.toISOString().slice(0, 10),
          payment_method: payload.payment_method || 'pix',
          payment_notes: payload.note || null,
          contacted_at: now.toISOString()
        })
        .eq('id', payload.subscription_id)

      if (error) throw error

      await adminClient.from('admin_logs').insert({
        admin_id: user.id,
        action: 'activate_subscription',
        target_type: 'subscription',
        target_id: payload.subscription_id,
        details: {
          note: payload.note || null,
          period_days: periodDays,
          payment_method: payload.payment_method || 'pix'
        }
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'update_subscription_status') {
      const status = payload.status as string
      const { error } = await adminClient
        .from('subscriptions')
        .update({
          status,
          cancel_reason: payload.note || null,
          cancelled_at: status === 'cancelled' ? new Date().toISOString() : null,
          payment_notes: payload.note || null
        })
        .eq('id', payload.subscription_id)

      if (error) throw error

      await adminClient.from('admin_logs').insert({
        admin_id: user.id,
        action: `subscription_${status}`,
        target_type: 'subscription',
        target_id: payload.subscription_id,
        details: {
          note: payload.note || null
        }
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (action === 'list_logs') {
      const { data: logs, error } = await adminClient
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error

      return new Response(JSON.stringify(logs || []), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
