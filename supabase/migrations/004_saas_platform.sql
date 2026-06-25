-- ============================================================
-- FisioDesk SaaS Platform
-- plans + subscriptions + admin logs + subscription-aware RLS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  billing_cycle TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_cycle IN ('monthly', 'yearly', 'lifetime')),
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_professionals INTEGER NOT NULL DEFAULT 1,
  max_patients INTEGER NOT NULL DEFAULT -1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO plans (name, slug, description, price, billing_cycle, features, is_featured, sort_order)
VALUES (
  'Plano Pro',
  'pro',
  'Acesso completo ao FisioDesk para sua clínica',
  59.90,
  'monthly',
  '[
    "Agenda completa com múltiplas visualizações",
    "Prontuário eletrônico ilimitado",
    "Gestão financeira completa",
    "Lembretes via WhatsApp e e-mail",
    "Google Calendar integrado",
    "Videoconsulta via Google Meet",
    "Relatórios e gráficos gerenciais",
    "Pacotes de atendimento",
    "Suporte via WhatsApp",
    "Atualizações gratuitas"
  ]'::jsonb,
  TRUE,
  1
)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  billing_cycle = EXCLUDED.billing_cycle,
  features = EXCLUDED.features,
  is_active = TRUE,
  is_featured = TRUE,
  sort_order = EXCLUDED.sort_order;

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'active', 'trial', 'suspended', 'cancelled', 'expired')),
  activated_at TIMESTAMPTZ,
  activated_by UUID REFERENCES auth.users(id),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  next_billing_date DATE,
  cancelled_at TIMESTAMPTZ,
  cancel_reason TEXT,
  payment_method TEXT DEFAULT 'manual',
  payment_notes TEXT,
  contact_whatsapp TEXT,
  contacted_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE professionals DROP CONSTRAINT IF EXISTS professionals_role_check;
ALTER TABLE professionals ADD CONSTRAINT professionals_role_check
  CHECK (role IN ('super_admin', 'admin', 'professional', 'receptionist'));

DROP TRIGGER IF EXISTS trg_subscriptions_updated ON subscriptions;
CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM professionals
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_subscription_active()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM subscriptions
    WHERE clinic_id = get_user_clinic_id()
      AND status IN ('active', 'trial')
      AND (current_period_end IS NULL OR current_period_end > NOW())
  );
$$ LANGUAGE sql SECURITY DEFINER;

ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'plans' AND policyname = 'anyone_can_read_active_plans'
  ) THEN
    CREATE POLICY anyone_can_read_active_plans
      ON plans FOR SELECT
      USING (is_active = TRUE OR is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'own_subscription_select'
  ) THEN
    CREATE POLICY own_subscription_select
      ON subscriptions FOR SELECT
      USING (clinic_id = get_user_clinic_id() OR is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'bootstrap_insert_pending_subscription'
  ) THEN
    CREATE POLICY bootstrap_insert_pending_subscription
      ON subscriptions FOR INSERT
      WITH CHECK (
        clinic_id = get_user_clinic_id()
        AND status IN ('pending', 'trial')
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'subscriptions' AND policyname = 'super_admin_manage_subscriptions'
  ) THEN
    CREATE POLICY super_admin_manage_subscriptions
      ON subscriptions FOR ALL
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'admin_logs' AND policyname = 'super_admin_logs'
  ) THEN
    CREATE POLICY super_admin_logs
      ON admin_logs FOR ALL
      USING (is_super_admin())
      WITH CHECK (is_super_admin());
  END IF;
END $$;

DROP POLICY IF EXISTS "clinic_isolation" ON appointments;
CREATE POLICY "clinic_isolation" ON appointments
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS "clinic_isolation" ON patients;
CREATE POLICY "clinic_isolation" ON patients
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS "clinic_isolation" ON professionals;
CREATE POLICY "clinic_isolation" ON professionals
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (
      is_subscription_active()
      OR is_super_admin()
      OR (user_id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "clinic_isolation" ON rooms;
CREATE POLICY "clinic_isolation" ON rooms
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS "clinic_isolation" ON procedures;
CREATE POLICY "clinic_isolation" ON procedures
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_treatment_plans ON treatment_plans;
CREATE POLICY clinic_isolation_treatment_plans ON treatment_plans
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_packages ON packages;
CREATE POLICY clinic_isolation_packages ON packages
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_assessments ON assessments;
CREATE POLICY clinic_isolation_assessments ON assessments
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_evolutions ON evolutions;
CREATE POLICY clinic_isolation_evolutions ON evolutions
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_assessment_templates ON assessment_templates;
CREATE POLICY clinic_isolation_assessment_templates ON assessment_templates
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_financial_entries ON financial_entries;
CREATE POLICY clinic_isolation_financial_entries ON financial_entries
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_reminders ON reminders;
CREATE POLICY clinic_isolation_reminders ON reminders
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );

DROP POLICY IF EXISTS clinic_isolation_agenda_configs ON agenda_configs;
CREATE POLICY clinic_isolation_agenda_configs ON agenda_configs
  FOR ALL USING (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  )
  WITH CHECK (
    clinic_id = get_user_clinic_id()
    AND (is_subscription_active() OR is_super_admin())
  );
