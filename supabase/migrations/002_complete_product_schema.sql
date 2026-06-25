-- ============================================================
-- TABELAS COMPLEMENTARES DO PRODUTO
-- ============================================================

CREATE TABLE IF NOT EXISTS treatment_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  diagnosis       TEXT,
  objective       TEXT,
  sessions_total  INTEGER DEFAULT 10,
  sessions_done   INTEGER DEFAULT 0,
  frequency       TEXT,
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  start_date      DATE,
  end_date        DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS packages (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id         UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id        UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id   UUID REFERENCES professionals(id) ON DELETE SET NULL,
  procedure_id      UUID REFERENCES procedures(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  total_sessions    INTEGER NOT NULL DEFAULT 10,
  used_sessions     INTEGER DEFAULT 0,
  price_total       NUMERIC(10,2),
  price_per_session NUMERIC(10,2),
  status            TEXT DEFAULT 'active' CHECK (status IN ('active','completed','expired','cancelled')),
  valid_until       DATE,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS package_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id     UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  used_at        TIMESTAMPTZ,
  status         TEXT DEFAULT 'available' CHECK (status IN ('available','used','cancelled'))
);

CREATE TABLE IF NOT EXISTS assessments (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id          UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id         UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id    UUID REFERENCES professionals(id) ON DELETE SET NULL,
  appointment_id     UUID REFERENCES appointments(id) ON DELETE SET NULL,
  type               TEXT DEFAULT 'initial' CHECK (type IN ('initial','reassessment','discharge')),
  template_id        UUID,
  chief_complaint    TEXT,
  pain_level         INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  pain_location      JSONB,
  pain_character     TEXT,
  onset              TEXT,
  aggravating        TEXT,
  relieving          TEXT,
  previous_treatment TEXT,
  posture_notes      TEXT,
  muscle_strength    JSONB,
  range_of_motion    JSONB,
  special_tests      JSONB,
  functional_tests   TEXT,
  imaging            TEXT,
  clinical_diagnosis TEXT,
  icd10_code         TEXT,
  treatment_goals    TEXT,
  treatment_plan     TEXT,
  custom_fields      JSONB DEFAULT '{}'::jsonb,
  attachments        JSONB DEFAULT '[]'::jsonb,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evolutions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number  INTEGER,
  date            DATE DEFAULT CURRENT_DATE,
  pain_level      INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  pain_location   JSONB,
  patient_report  TEXT,
  objective       TEXT,
  procedures_done TEXT,
  response        TEXT,
  next_plan       TEXT,
  custom_fields   JSONB DEFAULT '{}'::jsonb,
  attachments     JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assessment_templates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id  UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  type       TEXT DEFAULT 'assessment' CHECK (type IN ('assessment','evolution','anamnesis')),
  is_default BOOLEAN DEFAULT FALSE,
  fields     JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financial_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  patient_id      UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  package_id      UUID REFERENCES packages(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('income','expense')),
  category        TEXT,
  description     TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  due_date        DATE,
  paid_date       DATE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  payment_method  TEXT,
  installments    INTEGER DEFAULT 1,
  installment_num INTEGER DEFAULT 1,
  parent_entry_id UUID,
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT,
  notes           TEXT,
  receipt_url     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id      UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id     UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  method         TEXT NOT NULL CHECK (method IN ('whatsapp','email','sms')),
  status         TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','pending')),
  message        TEXT,
  sent_at        TIMESTAMPTZ DEFAULT NOW(),
  sent_by        UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS agenda_configs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id      UUID NOT NULL UNIQUE REFERENCES clinics(id) ON DELETE CASCADE,
  default_view   TEXT DEFAULT 'week' CHECK (default_view IN ('day','week','month','agenda')),
  slot_duration  INTEGER DEFAULT 30,
  start_hour     TEXT DEFAULT '07:00',
  end_hour       TEXT DEFAULT '20:00',
  show_weekends  BOOLEAN DEFAULT FALSE,
  color_by       TEXT DEFAULT 'status',
  show_room      BOOLEAN DEFAULT TRUE,
  show_procedure BOOLEAN DEFAULT TRUE,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS google_tokens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL UNIQUE REFERENCES professionals(id) ON DELETE CASCADE,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_type      TEXT DEFAULT 'Bearer',
  expires_at      TIMESTAMPTZ,
  scope           TEXT,
  calendar_id     TEXT DEFAULT 'primary',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_financial_clinic_date ON financial_entries(clinic_id, due_date);
CREATE INDEX IF NOT EXISTS idx_financial_status ON financial_entries(status, clinic_id);
CREATE INDEX IF NOT EXISTS idx_packages_patient ON packages(patient_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_assessments_patient ON assessments(patient_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_patient ON evolutions(patient_id, clinic_id);
CREATE INDEX IF NOT EXISTS idx_reminders_appointment ON reminders(appointment_id, clinic_id);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agenda_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_tokens ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'treatment_plans' AND policyname = 'clinic_isolation_treatment_plans'
  ) THEN
    CREATE POLICY clinic_isolation_treatment_plans ON treatment_plans
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'packages' AND policyname = 'clinic_isolation_packages'
  ) THEN
    CREATE POLICY clinic_isolation_packages ON packages
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'package_sessions' AND policyname = 'clinic_isolation_package_sessions'
  ) THEN
    CREATE POLICY clinic_isolation_package_sessions ON package_sessions
      FOR ALL USING (
        package_id IN (
          SELECT id FROM packages WHERE clinic_id = get_user_clinic_id()
        )
      );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assessments' AND policyname = 'clinic_isolation_assessments'
  ) THEN
    CREATE POLICY clinic_isolation_assessments ON assessments
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'evolutions' AND policyname = 'clinic_isolation_evolutions'
  ) THEN
    CREATE POLICY clinic_isolation_evolutions ON evolutions
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assessment_templates' AND policyname = 'clinic_isolation_assessment_templates'
  ) THEN
    CREATE POLICY clinic_isolation_assessment_templates ON assessment_templates
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'financial_entries' AND policyname = 'clinic_isolation_financial_entries'
  ) THEN
    CREATE POLICY clinic_isolation_financial_entries ON financial_entries
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'reminders' AND policyname = 'clinic_isolation_reminders'
  ) THEN
    CREATE POLICY clinic_isolation_reminders ON reminders
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agenda_configs' AND policyname = 'clinic_isolation_agenda_configs'
  ) THEN
    CREATE POLICY clinic_isolation_agenda_configs ON agenda_configs
      FOR ALL USING (clinic_id = get_user_clinic_id());
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'google_tokens' AND policyname = 'own_google_tokens'
  ) THEN
    CREATE POLICY own_google_tokens ON google_tokens
      FOR ALL USING (
        professional_id IN (
          SELECT id FROM professionals WHERE user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- ============================================================
-- TRIGGERS DE updated_at
-- ============================================================

DROP TRIGGER IF EXISTS trg_treatment_plans_updated ON treatment_plans;
CREATE TRIGGER trg_treatment_plans_updated
  BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_packages_updated ON packages;
CREATE TRIGGER trg_packages_updated
  BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_assessments_updated ON assessments;
CREATE TRIGGER trg_assessments_updated
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_financial_entries_updated ON financial_entries;
CREATE TRIGGER trg_financial_entries_updated
  BEFORE UPDATE ON financial_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_agenda_configs_updated ON agenda_configs;
CREATE TRIGGER trg_agenda_configs_updated
  BEFORE UPDATE ON agenda_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_google_tokens_updated ON google_tokens;
CREATE TRIGGER trg_google_tokens_updated
  BEFORE UPDATE ON google_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'clinic_members_can_upload_patient_files'
  ) THEN
    CREATE POLICY clinic_members_can_upload_patient_files
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'patient-files' AND auth.role() = 'authenticated');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'clinic_members_can_read_patient_files'
  ) THEN
    CREATE POLICY clinic_members_can_read_patient_files
      ON storage.objects FOR SELECT
      USING (bucket_id = 'patient-files' AND auth.role() = 'authenticated');
  END IF;
END $$;
