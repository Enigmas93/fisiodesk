-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- CLÍNICAS (multi-tenant)
-- ============================================================
CREATE TABLE clinics (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  cnpj          TEXT,
  phone         TEXT,
  email         TEXT,
  address       TEXT,
  city          TEXT,
  state         TEXT,
  zip_code      TEXT,
  logo_url      TEXT,
  website       TEXT,
  working_hours JSONB DEFAULT '{"mon":{"open":"08:00","close":"18:00"},"tue":{"open":"08:00","close":"18:00"},"wed":{"open":"08:00","close":"18:00"},"thu":{"open":"08:00","close":"18:00"},"fri":{"open":"08:00","close":"18:00"}}'::jsonb,
  settings      JSONB DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFISSIONAIS
-- ============================================================
CREATE TABLE professionals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clinic_id     UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT,
  phone         TEXT,
  crefito       TEXT,
  specialty     TEXT,
  bio           TEXT,
  avatar_url    TEXT,
  color         TEXT DEFAULT '#0EA5E9',
  commission_pct NUMERIC(5,2) DEFAULT 0,
  work_hours    JSONB DEFAULT '{}'::jsonb,
  active_days   TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  slot_duration INTEGER DEFAULT 50,
  role          TEXT DEFAULT 'professional' CHECK (role IN ('admin','professional','receptionist')),
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SALAS
-- ============================================================
CREATE TABLE rooms (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  capacity    INTEGER DEFAULT 1,
  color       TEXT DEFAULT '#6366F1',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROCEDIMENTOS / SERVIÇOS
-- ============================================================
CREATE TABLE procedures (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id    UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  duration_min INTEGER DEFAULT 50,
  price        NUMERIC(10,2) DEFAULT 0,
  category     TEXT,
  color        TEXT DEFAULT '#10B981',
  is_active    BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PACIENTES
-- ============================================================
CREATE TABLE patients (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id         UUID REFERENCES clinics(id) ON DELETE CASCADE,
  owner_id          UUID REFERENCES professionals(id) ON DELETE SET NULL,
  name              TEXT NOT NULL,
  cpf               TEXT,
  rg                TEXT,
  birth_date        DATE,
  gender            TEXT CHECK (gender IN ('M','F','O')),
  phone             TEXT,
  phone2            TEXT,
  email             TEXT,
  address           TEXT,
  city              TEXT,
  state             TEXT,
  zip_code          TEXT,
  blood_type        TEXT,
  insurance         TEXT,
  insurance_card    TEXT,
  occupation        TEXT,
  emergency_contact TEXT,
  emergency_phone   TEXT,
  how_found         TEXT,
  medical_history   TEXT,
  allergies         TEXT,
  medications       TEXT,
  observations      TEXT,
  avatar_url        TEXT,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active','inactive','discharged')),
  tags              TEXT[],
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida por nome, CPF, telefone
CREATE INDEX idx_patients_name ON patients USING gin(name gin_trgm_ops);
CREATE INDEX idx_patients_cpf ON patients(cpf);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_clinic ON patients(clinic_id);

-- ============================================================
-- AGENDAMENTOS
-- ============================================================
CREATE TABLE appointments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id           UUID REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id     UUID REFERENCES professionals(id) ON DELETE SET NULL,
  patient_id          UUID REFERENCES patients(id) ON DELETE CASCADE,
  room_id             UUID REFERENCES rooms(id) ON DELETE SET NULL,
  procedure_id        UUID REFERENCES procedures(id) ON DELETE SET NULL,
  package_session_id  UUID,
  date                DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  duration_min        INTEGER DEFAULT 50,
  status              TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','in_progress','completed','cancelled','no_show','rescheduled')),
  type                TEXT DEFAULT 'session' CHECK (type IN ('initial','session','reassessment','discharge','online','return')),
  modality            TEXT DEFAULT 'in_person' CHECK (modality IN ('in_person','online')),
  meet_link           TEXT,
  google_event_id     TEXT,
  color               TEXT,
  notes               TEXT,
  cancellation_reason TEXT,
  reminder_sent_at    TIMESTAMPTZ,
  reminder_method     TEXT[],
  price               NUMERIC(10,2),
  is_paid             BOOLEAN DEFAULT FALSE,
  financial_entry_id  UUID,
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON appointments(date, clinic_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id, date);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Função helper para pegar clinic_id do usuário logado
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
  SELECT clinic_id FROM professionals WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Políticas RLS: cada usuário só acessa dados da sua clínica
CREATE POLICY "clinic_isolation" ON patients
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON appointments
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON professionals
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON rooms
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON procedures
  FOR ALL USING (clinic_id = get_user_clinic_id());

-- ============================================================
-- TRIGGERS — atualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clinics_updated BEFORE UPDATE ON clinics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_professionals_updated BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON patients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_appointments_updated BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
