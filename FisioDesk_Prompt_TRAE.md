# PROMPT COMPLETO — FisioDesk para TRAE IA

> Cole este prompt inteiro no TRAE IA. Ele contém toda a arquitetura, stack, banco de dados, integrações e UI necessários para construir o sistema completo.

---

## CONTEXTO DO PROJETO

Você vai construir o **FisioDesk** — um sistema SaaS de gestão completo para clínicas de fisioterapia, consultórios e estúdios de pilates. O projeto já possui uma base inicial criada (estrutura básica de pastas, autenticação Supabase e deploy na Vercel). Seu trabalho é **reescrever e expandir** essa base, criando um sistema profissional e completo.

O sistema concorre diretamente com o ZenFisio (zenfisio.com). Analise esse concorrente como referência de funcionalidades.

---

## STACK TECNOLÓGICA (OBRIGATÓRIA)

```
Frontend:    React 18 + TypeScript + Vite
Estilo:      Tailwind CSS 3 + shadcn/ui (componentes)
Estado:      Zustand (global) + React Query / TanStack Query (server state)
Roteamento:  React Router v6
Banco:       Supabase (PostgreSQL) — já provisionado
Auth:        Supabase Auth (já configurado)
Storage:     Supabase Storage (uploads de documentos e imagens)
Deploy:      Vercel (já configurado, CI/CD automático via GitHub)
PDF:         @react-pdf/renderer ou jsPDF
Calendário:  @fullcalendar/react (FullCalendar v6)
Gráficos:    Recharts
Formulários: React Hook Form + Zod (validação)
Datas:       date-fns + date-fns-tz (fuso horário Brasil)
Ícones:      Lucide React
Toast:       Sonner
Drag-drop:   @dnd-kit/core (agenda)
```

---

## IDENTIDADE VISUAL

**Paleta de cores principal:**
```css
--primary:      #0EA5E9  /* Azul saúde — botões principais, links */
--primary-dark: #0284C7
--secondary:    #10B981  /* Verde — confirmado, sucesso */
--accent:       #6366F1  /* Roxo — destaques, badges */
--warning:      #F59E0B
--danger:       #EF4444
--neutral-50:   #F8FAFC
--neutral-100:  #F1F5F9
--neutral-800:  #1E293B
--neutral-900:  #0F172A
```

**Design System:**
- Fonte: Inter (Google Fonts)
- Border radius padrão: 8px (cards), 6px (inputs), 20px (badges/pills)
- Sombras: suaves, nunca pesadas (shadow-sm a shadow-md)
- Sidebar: largura 240px colapsável para 60px (ícones apenas)
- Header fixo: altura 60px com breadcrumb e ações contextuais
- Cards com borda sutil (border-neutral-200), fundo branco
- Modo escuro: suportado via classe `.dark` no `<html>`
- Layout responsivo: sidebar vira bottom-nav no mobile

---

## ESTRUTURA DE PASTAS DO PROJETO

```
fisio-desk/
├── src/
│   ├── app/                    # Configuração global (providers, router)
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── layout/             # Sidebar, Header, PageWrapper
│   │   ├── agenda/             # CalendarView, AppointmentCard, etc
│   │   ├── patients/           # PatientCard, PatientForm, etc
│   │   ├── records/            # ProntuarioForm, EvolutionCard, PainMap
│   │   ├── financial/          # FinancialTable, CashFlowChart
│   │   ├── reports/            # ReportCard, ChartSection
│   │   └── shared/             # Avatar, StatusBadge, EmptyState, etc
│   ├── pages/
│   │   ├── auth/               # Login, Register, ForgotPassword
│   │   ├── dashboard/          # Dashboard.tsx
│   │   ├── agenda/             # AgendaPage.tsx
│   │   ├── patients/           # PatientsPage, PatientDetailPage
│   │   ├── records/            # RecordsPage (por atendimento)
│   │   ├── financial/          # FinancialPage
│   │   ├── reports/            # ReportsPage
│   │   └── settings/           # SettingsPage (clínica, profissionais, salas)
│   ├── hooks/                  # useAppointments, usePatients, useAuth, etc
│   ├── lib/
│   │   ├── supabase.ts         # cliente Supabase
│   │   ├── google.ts           # OAuth Google (Calendar + Meet + Gmail)
│   │   ├── whatsapp.ts         # Gerador de links wa.me
│   │   ├── email.ts            # Envio via Gmail API
│   │   └── pdf.ts              # Geração de documentos PDF
│   ├── stores/                 # Zustand stores
│   ├── types/                  # TypeScript types (espelham DB schema)
│   └── utils/                  # Formatadores, máscaras, helpers
├── supabase/
│   └── migrations/             # SQL migrations
├── .env.example
└── vite.config.ts
```

---

## BANCO DE DADOS SUPABASE — SCHEMA COMPLETO

Execute as migrations abaixo em ordem. Use `supabase/migrations/` com timestamp.

### 001 — Tabelas base

```sql
-- ============================================================
-- EXTENSÕES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca fuzzy

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
  settings      JSONB DEFAULT '{}'::jsonb, -- configs gerais
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
  specialty     TEXT, -- Ortopedia, Neurologia, Esportiva, etc
  bio           TEXT,
  avatar_url    TEXT,
  color         TEXT DEFAULT '#0EA5E9', -- cor na agenda
  commission_pct NUMERIC(5,2) DEFAULT 0, -- % de comissão
  work_hours    JSONB DEFAULT '{}'::jsonb, -- horários por dia da semana
  active_days   TEXT[] DEFAULT ARRAY['mon','tue','wed','thu','fri'],
  slot_duration INTEGER DEFAULT 50, -- minutos por slot padrão
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
  category     TEXT, -- ex: "Fisioterapia", "Pilates", "Estética"
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
  insurance         TEXT, -- convênio
  insurance_card    TEXT, -- número carteirinha
  occupation        TEXT,
  emergency_contact TEXT, -- nome do responsável
  emergency_phone   TEXT,
  how_found         TEXT, -- como conheceu a clínica
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
  package_session_id  UUID, -- preenchido se faz parte de um pacote
  date                DATE NOT NULL,
  start_time          TIME NOT NULL,
  end_time            TIME NOT NULL,
  duration_min        INTEGER DEFAULT 50,
  status              TEXT DEFAULT 'scheduled' CHECK (status IN (
                        'scheduled','confirmed','in_progress','completed','cancelled','no_show','rescheduled'
                      )),
  type                TEXT DEFAULT 'session' CHECK (type IN (
                        'initial','session','reassessment','discharge','online','return'
                      )),
  modality            TEXT DEFAULT 'in_person' CHECK (modality IN ('in_person','online')),
  meet_link           TEXT, -- Google Meet URL (gerado automaticamente)
  google_event_id     TEXT, -- ID do evento no Google Calendar
  color               TEXT,
  notes               TEXT, -- observações do agendamento
  cancellation_reason TEXT,
  reminder_sent_at    TIMESTAMPTZ,
  reminder_method     TEXT[], -- ['whatsapp','email','sms']
  price               NUMERIC(10,2),
  is_paid             BOOLEAN DEFAULT FALSE,
  financial_entry_id  UUID, -- vincula ao financeiro
  created_by          UUID REFERENCES auth.users(id),
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_appointments_date ON appointments(date, clinic_id);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_professional ON appointments(professional_id, date);

-- ============================================================
-- PLANOS DE TRATAMENTO
-- ============================================================
CREATE TABLE treatment_plans (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  diagnosis       TEXT, -- CID-10
  objective       TEXT,
  sessions_total  INTEGER DEFAULT 10,
  sessions_done   INTEGER DEFAULT 0,
  frequency       TEXT, -- ex: "2x por semana"
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','paused','cancelled')),
  start_date      DATE,
  end_date        DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PACOTES DE ATENDIMENTO
-- ============================================================
CREATE TABLE packages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  procedure_id    UUID REFERENCES procedures(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  total_sessions  INTEGER NOT NULL DEFAULT 10,
  used_sessions   INTEGER DEFAULT 0,
  price_total     NUMERIC(10,2),
  price_per_session NUMERIC(10,2),
  status          TEXT DEFAULT 'active' CHECK (status IN ('active','completed','expired','cancelled')),
  valid_until     DATE,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE package_sessions (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id     UUID REFERENCES packages(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  used_at        TIMESTAMPTZ,
  status         TEXT DEFAULT 'available' CHECK (status IN ('available','used','cancelled'))
);

-- ============================================================
-- PRONTUÁRIO — AVALIAÇÕES (anamnese + avaliação inicial)
-- ============================================================
CREATE TABLE assessments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  type            TEXT DEFAULT 'initial' CHECK (type IN ('initial','reassessment','discharge')),
  template_id     UUID, -- referência a um template personalizado
  -- Anamnese
  chief_complaint TEXT,   -- queixa principal
  pain_level      INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  pain_location   JSONB,  -- pontos de dor no mapa corporal (JSON com coordenadas)
  pain_character  TEXT,   -- características da dor
  onset           TEXT,   -- início do problema
  aggravating     TEXT,   -- o que piora
  relieving       TEXT,   -- o que melhora
  previous_treatment TEXT,
  -- Avaliação física
  posture_notes   TEXT,
  muscle_strength JSONB,  -- força muscular por grupo
  range_of_motion JSONB,  -- amplitude de movimento
  special_tests   JSONB,  -- testes especiais
  functional_tests TEXT,
  imaging         TEXT,   -- exames de imagem
  -- Diagnóstico e plano
  clinical_diagnosis TEXT,
  icd10_code      TEXT,   -- CID-10
  treatment_goals TEXT,
  treatment_plan  TEXT,
  -- Campos livres (para templates customizados)
  custom_fields   JSONB DEFAULT '{}'::jsonb,
  -- Documentos anexados
  attachments     JSONB DEFAULT '[]'::jsonb, -- [{url, name, type, size}]
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PRONTUÁRIO — EVOLUÇÕES (por sessão)
-- ============================================================
CREATE TABLE evolutions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
  patient_id      UUID REFERENCES patients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number  INTEGER,
  date            DATE DEFAULT CURRENT_DATE,
  -- Evolução clínica
  pain_level      INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  pain_location   JSONB,
  patient_report  TEXT, -- relato do paciente
  objective       TEXT, -- dados objetivos (ADM, força, etc)
  procedures_done TEXT, -- procedimentos realizados na sessão
  response        TEXT, -- resposta ao tratamento
  next_plan       TEXT, -- plano para próxima sessão
  -- Campos extras
  custom_fields   JSONB DEFAULT '{}'::jsonb,
  attachments     JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TEMPLATES DE AVALIAÇÃO
-- ============================================================
CREATE TABLE assessment_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id   UUID REFERENCES clinics(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT DEFAULT 'assessment' CHECK (type IN ('assessment','evolution','anamnesis')),
  is_default  BOOLEAN DEFAULT FALSE,
  fields      JSONB NOT NULL, -- definição dos campos customizados
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FINANCEIRO — LANÇAMENTOS
-- ============================================================
CREATE TABLE financial_entries (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id       UUID REFERENCES clinics(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES professionals(id) ON DELETE SET NULL,
  patient_id      UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id  UUID REFERENCES appointments(id) ON DELETE SET NULL,
  package_id      UUID REFERENCES packages(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('income','expense')),
  category        TEXT, -- Atendimento, Pacote, Aluguel, Material, Salário, etc
  description     TEXT NOT NULL,
  amount          NUMERIC(10,2) NOT NULL,
  due_date        DATE,
  paid_date       DATE,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','paid','overdue','cancelled')),
  payment_method  TEXT, -- PIX, dinheiro, cartão, boleto, convênio
  installments    INTEGER DEFAULT 1,
  installment_num INTEGER DEFAULT 1,
  parent_entry_id UUID, -- para parcelamentos
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- mensal, semanal, etc
  notes           TEXT,
  receipt_url     TEXT, -- PDF do recibo gerado
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_financial_clinic_date ON financial_entries(clinic_id, due_date);
CREATE INDEX idx_financial_status ON financial_entries(status, clinic_id);

-- ============================================================
-- LEMBRETES (histórico de envios)
-- ============================================================
CREATE TABLE reminders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id      UUID REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id     UUID REFERENCES patients(id) ON DELETE CASCADE,
  method         TEXT NOT NULL CHECK (method IN ('whatsapp','email','sms')),
  status         TEXT DEFAULT 'sent' CHECK (status IN ('sent','delivered','failed','pending')),
  message        TEXT,
  sent_at        TIMESTAMPTZ DEFAULT NOW(),
  sent_by        UUID REFERENCES auth.users(id)
);

-- ============================================================
-- CONFIGURAÇÕES DA AGENDA
-- ============================================================
CREATE TABLE agenda_configs (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id         UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  default_view      TEXT DEFAULT 'week' CHECK (default_view IN ('day','week','month','agenda')),
  slot_duration     INTEGER DEFAULT 30, -- minutos
  start_hour        TEXT DEFAULT '07:00',
  end_hour          TEXT DEFAULT '20:00',
  show_weekends     BOOLEAN DEFAULT FALSE,
  color_by          TEXT DEFAULT 'status', -- status | professional | procedure | room
  show_room         BOOLEAN DEFAULT TRUE,
  show_procedure    BOOLEAN DEFAULT TRUE,
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOOGLE OAUTH TOKENS (por profissional)
-- ============================================================
CREATE TABLE google_tokens (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE UNIQUE,
  access_token    TEXT NOT NULL,
  refresh_token   TEXT NOT NULL,
  token_type      TEXT DEFAULT 'Bearer',
  expires_at      TIMESTAMPTZ,
  scope           TEXT, -- calendar, gmail, meet
  calendar_id     TEXT DEFAULT 'primary',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "clinic_isolation" ON financial_entries
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON assessments
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON evolutions
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON packages
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON treatment_plans
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON reminders
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "clinic_isolation" ON agenda_configs
  FOR ALL USING (clinic_id = get_user_clinic_id());

CREATE POLICY "own_tokens" ON google_tokens
  FOR ALL USING (professional_id IN (
    SELECT id FROM professionals WHERE user_id = auth.uid()
  ));

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
CREATE TRIGGER trg_packages_updated BEFORE UPDATE ON packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_financial_updated BEFORE UPDATE ON financial_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON treatment_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## VARIÁVEIS DE AMBIENTE (.env)

```bash
# Supabase
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=sua_anon_key

# Google OAuth (Calendar + Gmail + Meet)
VITE_GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret
VITE_GOOGLE_REDIRECT_URI=https://seudominio.vercel.app/auth/google/callback

# App
VITE_APP_NAME=FisioDesk
VITE_APP_URL=https://seudominio.vercel.app
```

---

## MÓDULO 1: LAYOUT E NAVEGAÇÃO

Crie um layout profissional e responsivo com os seguintes elementos:

### Sidebar (desktop)
```
Logo FisioDesk (colapsável)
─────────────────────────────
📊 Dashboard
📅 Agenda
👥 Pacientes
📋 Prontuários
💰 Financeiro
📈 Relatórios
─────────────────────────────
⚙️  Configurações
❓  Ajuda
─────────────────────────────
[Avatar] Nome do profissional
         Clínica atual
         [Sair]
```

### Header
- Breadcrumb dinâmico
- Botão "Novo Agendamento" (atalho global, obre modal)
- Notificações (sino com badge)
- Avatar com dropdown (perfil, configurações, sair)
- Toggle modo escuro

### Rotas da aplicação
```
/login                          Tela de login
/register                       Cadastro (clínica + profissional)
/onboarding                     Setup inicial (pós-registro)
/                               Dashboard (redirect)
/dashboard                      Dashboard principal
/agenda                         Agenda completa
/agenda/:date                   Agenda de data específica
/pacientes                      Lista de pacientes
/pacientes/novo                 Cadastro de paciente
/pacientes/:id                  Perfil completo do paciente
/pacientes/:id/prontuario       Prontuário do paciente
/atendimentos/:id               Detalhes do atendimento
/financeiro                     Gestão financeira
/financeiro/lancamentos         Lançamentos
/relatorios                     Relatórios e gráficos
/configuracoes                  Configurações gerais
/configuracoes/clinica          Dados da clínica
/configuracoes/profissionais    Gerenciar profissionais
/configuracoes/salas            Salas
/configuracoes/procedimentos    Procedimentos/serviços
/configuracoes/agenda           Configurações da agenda
/configuracoes/integracoes      Google Calendar, Gmail
```

---

## MÓDULO 2: DASHBOARD

Cards de KPI no topo (4 colunas):
- Atendimentos hoje / semana
- Novos pacientes no mês
- Taxa de presença (%)
- Receita do mês

Seção central (2 colunas):
- Mini-agenda do dia (próximos atendimentos com status)
- Gráfico de barras: atendimentos por dia da semana (últimas 4 semanas) — Recharts

Seção inferior (3 colunas):
- Últimos pacientes cadastrados (3 cards)
- Próximas contas a vencer (tabela)
- Pacotes com sessões baixas (alerta < 2 sessões restantes)

---

## MÓDULO 3: AGENDA (PRIORIDADE MÁXIMA)

Use **FullCalendar v6** (`@fullcalendar/react`, `@fullcalendar/daygrid`, `@fullcalendar/timegrid`, `@fullcalendar/interaction`, `@fullcalendar/list`).

### Visualizações
1. **Dia** — colunas por profissional (quando multi-profissional) ou por sala
2. **Semana** — padrão do sistema
3. **Mês** — visão condensada
4. **Lista** — lista de próximos atendimentos

### Funcionalidades da agenda
- Drag & drop para reagendar (atualiza Supabase em tempo real)
- Click em slot vazio → modal de novo agendamento
- Click em evento → modal de detalhes/edição
- Resize de eventos para ajustar duração
- Filtro por: profissional, sala, status, tipo, procedimento
- Colorização configurável: por status, por profissional, por procedimento, por sala
- Indicador de conflito de horário (overlay vermelho)
- Botão de atalho: "Hoje", "<", ">"
- Configurações de horário de exibição (7h-20h por padrão)
- Ocultar fins de semana (configurável)

### Cores de status dos eventos
```
scheduled    → #0EA5E9 (azul)
confirmed    → #10B981 (verde)
in_progress  → #6366F1 (roxo)
completed    → #94A3B8 (cinza)
cancelled    → #EF4444 (vermelho)
no_show      → #F59E0B (amarelo)
```

### Modal de novo/editar agendamento
Campos:
- Paciente (busca com autocomplete — busca por nome, CPF, telefone)
- Profissional (select)
- Data e hora de início
- Duração (ou hora de término calculada)
- Procedimento (select — pré-preenche duração e preço)
- Sala (select)
- Tipo: inicial / sessão / reavaliação / alta / online / retorno
- Modalidade: presencial / online (se online → gerar Meet link)
- Pacote: vincular a pacote existente do paciente
- Valor da sessão (editável)
- Notas
- Enviar lembrete: [WhatsApp] [Email] (botões de ação)

### Envio de lembretes dentro do modal
**WhatsApp (link wa.me):**
```typescript
// lib/whatsapp.ts
export function generateWhatsAppReminderLink(params: {
  phone: string;
  patientName: string;
  date: string;
  time: string;
  professionalName: string;
  clinicName: string;
  address?: string;
  meetLink?: string;
}): string {
  const message = encodeURIComponent(
    `Olá ${params.patientName}! 👋\n\n` +
    `Lembrando que você tem uma sessão de fisioterapia agendada:\n\n` +
    `📅 *${params.date}* às *${params.time}*\n` +
    `👨‍⚕️ ${params.professionalName}\n` +
    `🏥 ${params.clinicName}` +
    (params.address ? `\n📍 ${params.address}` : '') +
    (params.meetLink ? `\n🎥 Acesse: ${params.meetLink}` : '') +
    `\n\nPor favor, confirme sua presença respondendo esta mensagem. Em caso de cancelamento, avise com antecedência. Obrigado! 🙏`
  );
  const phone = params.phone.replace(/\D/g, '');
  const phoneWithCode = phone.startsWith('55') ? phone : `55${phone}`;
  return `https://wa.me/${phoneWithCode}?text=${message}`;
}
```

**Email (Gmail API)** — botão que abre modal com preview da mensagem antes de enviar.

---

## MÓDULO 4: GESTÃO DE PACIENTES

### Lista de pacientes (`/pacientes`)
- Busca em tempo real (nome, CPF, telefone, email)
- Filtros: status, profissional responsável, convênio, mês de aniversário
- Toggle: grade de cards / tabela
- Card do paciente: avatar, nome, telefone, último atendimento, status (badge colorido)
- Ordenação: nome, data de cadastro, último atendimento
- Paginação (20 por página)

### Formulário de cadastro (multi-step)

**Step 1 — Dados pessoais:**
- Nome completo (required)
- CPF (com máscara e validação)
- Data de nascimento + idade calculada
- Gênero
- Telefone principal + WhatsApp (checkbox "mesmo número")
- Telefone alternativo
- Email

**Step 2 — Endereço:**
- CEP (busca automática via ViaCEP API)
- Logradouro, número, complemento, bairro, cidade, estado

**Step 3 — Saúde:**
- Tipo sanguíneo
- Convênio / plano de saúde
- Número da carteirinha
- Alergias
- Medicamentos em uso
- Histórico médico relevante
- Ocupação

**Step 4 — Dados adicionais:**
- Contato de emergência (nome + telefone)
- Como conheceu a clínica
- Profissional responsável
- Observações livres
- Tags (ex: "Pilates", "Convênio", "Online")

### Perfil do paciente (`/pacientes/:id`)

Tabs:
1. **Resumo** — dados cadastrais + últimos atendimentos + próximos agendamentos
2. **Prontuário** — avaliações e evoluções cronológicas
3. **Agendamentos** — histórico completo de consultas com filtros
4. **Pacotes** — pacotes contratados e saldo de sessões
5. **Financeiro** — lançamentos vinculados ao paciente
6. **Documentos** — arquivos e imagens do paciente

Ações rápidas no header do perfil:
- [Agendar consulta] [Enviar WhatsApp] [Enviar email] [Gerar documento]

---

## MÓDULO 5: PRONTUÁRIO ELETRÔNICO

### Avaliação inicial / Anamnese

Formulário com seções colapsáveis:

**Queixa principal:**
- Descrição da queixa
- Nível de dor (slider 0-10 com faces visuais)
- **Mapa corporal de dor** (implementar como SVG interativo):
  - Silhueta humana frontal e dorsal em SVG
  - Click na silhueta adiciona um marcador de dor
  - Cada marcador tem: tipo (queimação, pontada, pressão, etc), intensidade
  - Os pontos são salvos como JSON: `[{x, y, side, type, intensity}]`

**Histórico:**
- Início do problema
- O que piora / o que melhora
- Tratamentos anteriores
- Medicamentos relacionados
- Exames de imagem (upload de arquivo)

**Avaliação física:**
- Postura (texto livre + upload de foto)
- Força muscular por grupo (tabela dinâmica)
- Amplitude de movimento (ADM) por articulação
- Testes especiais (checklist configurável)

**Diagnóstico e Plano:**
- Diagnóstico clínico
- CID-10 (busca por código ou descrição)
- Objetivos do tratamento
- Plano terapêutico
- Frequência recomendada
- Prognóstico

### Evolução por sessão

Formulário rápido (acessível direto da agenda após completar sessão):
- Sessão número X de Y
- Relato do paciente
- Nível de dor atual (0-10)
- Pontos de dor (mapa corporal simplificado)
- Procedimentos realizados (checklist de procedimentos)
- Dados objetivos mensurados
- Resposta ao tratamento
- Plano da próxima sessão
- Attachments (fotos, relatórios)

### Templates de avaliação

- Templates padrão pré-carregados: Ortopedia, Neurologia, Respiratório, Pediátrico
- Templates personalizados: o profissional pode criar campos adicionais
- Sistema de campos customizáveis (texto, número, select, checkbox, escala)

---

## MÓDULO 6: CONTROLE FINANCEIRO

### Painel financeiro (`/financeiro`)

Header com KPIs:
- Receitas do mês
- Despesas do mês
- Saldo do mês
- Inadimplência (valor em aberto vencido)

Tabs:
1. **Lançamentos** — tabela filtráveis (tipo, status, data, categoria, profissional, paciente)
2. **Contas a receber** — lista com data de vencimento e status
3. **Contas a pagar** — idem para despesas
4. **Fluxo de caixa** — gráfico de linha (Recharts): receitas vs despesas por dia/semana/mês
5. **DRE Simplificada** — receitas por categoria vs despesas por categoria

### Modal de lançamento

- Tipo: Receita / Despesa
- Categoria (lista configurável): Atendimento, Pacote, Convênio, Aluguel, Material, Salário, Equipamento, Marketing, Outros
- Descrição
- Valor
- Data de vencimento / competência
- Status: Pago / Pendente
- Data de pagamento (se pago)
- Forma de pagamento: PIX, Dinheiro, Cartão Débito, Cartão Crédito, Boleto, Convênio, Transferência
- Parcelamento: dividir em X vezes (cria múltiplos lançamentos)
- Recorrência: mensal, semanal (cria lançamentos futuros)
- Paciente vinculado (opcional)
- Profissional responsável (opcional)
- Observações

### Geração de recibo em PDF

Ao marcar um recibo como pago, botão "Gerar recibo" que cria um PDF com:
- Logo da clínica
- Dados do paciente
- Descrição do serviço
- Valor pago
- Forma de pagamento
- Data
- Assinatura do responsável (campo de nome)
- Número sequencial do recibo

---

## MÓDULO 7: RELATÓRIOS

Página com cards de relatórios disponíveis:

**Atendimentos:**
- Atendimentos por período (filtro: profissional, procedimento, status)
- Taxa de presença vs faltas vs cancelamentos
- Atendimentos por convênio
- Distribuição por horário do dia (heatmap)

**Pacientes:**
- Novos pacientes por mês
- Pacientes por faixa etária
- Pacientes por convênio
- Taxa de retorno (pacientes que voltaram)

**Financeiro:**
- Fluxo de caixa por período
- Receitas por profissional
- Receitas por procedimento
- DRE completa
- Comissões por profissional

**Operacional:**
- Ocupação das salas por hora
- Produtividade por profissional
- Pacotes a vencer (próximos 30 dias)

Todos os relatórios têm:
- Filtros por período (date picker range)
- Filtro por profissional
- Gráfico visual (Recharts)
- Tabela de dados detalhada
- Botão "Exportar PDF" e "Exportar CSV"

---

## MÓDULO 8: INTEGRAÇÕES

### 8.1 Google OAuth (Calendar + Gmail + Meet)

**Configuração no Google Cloud Console (instruções para o usuário):**
```
1. Acesse console.cloud.google.com
2. Crie um projeto "FisioDesk"
3. Ative as APIs: Google Calendar API, Gmail API
4. Configure OAuth 2.0:
   - Tipo: Aplicativo Web
   - Authorized JavaScript origins: https://seudominio.vercel.app
   - Authorized redirect URIs: https://seudominio.vercel.app/auth/google/callback
5. Copie Client ID e Client Secret para o .env
6. Configure o OAuth Consent Screen (escopos necessários abaixo)
```

**Escopos Google necessários:**
```
https://www.googleapis.com/auth/calendar.events     (criar/editar eventos)
https://www.googleapis.com/auth/gmail.send           (enviar emails)
https://www.googleapis.com/auth/userinfo.email       (identificar usuário)
```

**Implementação — `lib/google.ts`:**
```typescript
// Fluxo OAuth2 PKCE para SPA (sem backend necessário)
// Usar googleapis ou gapi-client no front

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

export const initiateGoogleOAuth = () => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',   // para receber refresh_token
    prompt: 'consent',
  });
  window.location.href = `${GOOGLE_AUTH_URL}?${params}`;
};

// Na página /auth/google/callback:
// 1. Pegar o code da URL
// 2. Trocar por access_token + refresh_token via POST para token endpoint
// 3. Salvar tokens na tabela google_tokens do Supabase (criptografado)

export const createGoogleCalendarEvent = async (
  accessToken: string,
  appointment: Appointment
): Promise<string> => {
  const event = {
    summary: `Fisioterapia — ${appointment.patient.name}`,
    description: `Atendimento com ${appointment.professional.name}`,
    start: {
      dateTime: `${appointment.date}T${appointment.start_time}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: `${appointment.date}T${appointment.end_time}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    conferenceData: appointment.modality === 'online' ? {
      createRequest: {
        requestId: appointment.id,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    } : undefined,
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'email', minutes: 1440 }, // 24h antes
      ],
    },
  };

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  );
  const data = await response.json();
  // Retorna o link do Meet se online
  return data.conferenceData?.entryPoints?.[0]?.uri ?? data.id;
};

export const sendGmailReminder = async (
  accessToken: string,
  to: string,
  subject: string,
  htmlBody: string
): Promise<void> => {
  const email = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    htmlBody,
  ].join('\n');

  const base64Email = btoa(unescape(encodeURIComponent(email)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64Email }),
  });
};
```

### 8.2 Template de email HTML (lembrete de consulta)

```html
<!-- Template base para emails de lembrete -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; }
    .container { max-width: 560px; margin: 30px auto; background: white;
                  border-radius: 12px; overflow: hidden; }
    .header { background: #0EA5E9; padding: 28px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 22px; }
    .body { padding: 32px; }
    .card { background: #F1F5F9; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .card-row { display: flex; align-items: center; margin: 8px 0; font-size: 15px; }
    .card-label { color: #64748B; width: 100px; }
    .card-value { color: #0F172A; font-weight: 600; }
    .btn { display: block; text-align: center; background: #0EA5E9; color: white !important;
           padding: 14px 28px; border-radius: 8px; text-decoration: none;
           font-weight: 600; margin: 24px auto; max-width: 240px; }
    .footer { background: #F8FAFC; padding: 20px; text-align: center;
               font-size: 12px; color: #94A3B8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏥 {{clinicName}}</h1>
      <p style="color:#BAE6FD;margin:6px 0 0">Lembrete de Consulta</p>
    </div>
    <div class="body">
      <p style="color:#334155;font-size:16px">Olá, <strong>{{patientName}}</strong>!</p>
      <p style="color:#64748B">Este é um lembrete do seu próximo atendimento de fisioterapia.</p>
      <div class="card">
        <div class="card-row">
          <span class="card-label">📅 Data</span>
          <span class="card-value">{{date}}</span>
        </div>
        <div class="card-row">
          <span class="card-label">⏰ Horário</span>
          <span class="card-value">{{time}}</span>
        </div>
        <div class="card-row">
          <span class="card-label">👨‍⚕️ Profissional</span>
          <span class="card-value">{{professionalName}}</span>
        </div>
        {{#if address}}
        <div class="card-row">
          <span class="card-label">📍 Local</span>
          <span class="card-value">{{address}}</span>
        </div>
        {{/if}}
        {{#if meetLink}}
        <div class="card-row">
          <span class="card-label">🎥 Online</span>
          <span class="card-value"><a href="{{meetLink}}">Clique para entrar</a></span>
        </div>
        {{/if}}
      </div>
      {{#if meetLink}}
      <a href="{{meetLink}}" class="btn">Entrar na Videoconsulta</a>
      {{/if}}
      <p style="color:#94A3B8;font-size:13px;text-align:center">
        Precisa remarcar? Entre em contato conosco com antecedência.
      </p>
    </div>
    <div class="footer">
      <p>{{clinicName}} · {{clinicPhone}}</p>
      <p style="margin:4px 0">Este email foi enviado pelo sistema FisioDesk</p>
    </div>
  </div>
</body>
</html>
```

---

## MÓDULO 9: CONFIGURAÇÕES

### `/configuracoes/clinica`
- Dados da clínica (nome, CNPJ, endereço, telefone, email, site)
- Upload de logo
- Horários de funcionamento (por dia da semana)
- Configurações de notificação padrão

### `/configuracoes/profissionais`
- Lista de profissionais da clínica
- Adicionar/editar/desativar profissional
- Definir role: admin / profissional / recepcionista
- Configurar comissão (%)
- Definir horários e dias de atendimento por profissional
- Cor na agenda

### `/configuracoes/salas`
- CRUD de salas
- Nome, descrição, capacidade, cor

### `/configuracoes/procedimentos`
- CRUD de procedimentos/serviços
- Nome, categoria, duração padrão, valor padrão, cor

### `/configuracoes/agenda`
- Visualização padrão (dia/semana/mês)
- Duração do slot (15/20/30/50/60 min)
- Horário de início e fim da agenda
- Exibir fins de semana (toggle)
- Colorir eventos por: status / profissional / procedimento / sala

### `/configuracoes/integracoes`
- **Google Calendar:**
  - Status: conectado / desconectado
  - Botão "Conectar com Google"
  - Ao conectar: salva tokens na tabela `google_tokens`
  - Opção de qual calendário sincronizar
- **Google Meet:**
  - Automático quando Calendar está conectado
  - Toggle: "Gerar link Meet automaticamente para atendimentos online"
- **Email (Gmail):**
  - Status da conexão Google (mesma conexão do Calendar)
  - Template de e-mail personalizável (editor básico)
  - Configurar quando enviar: 24h antes / 2h antes / ambos

---

## MÓDULO 10: ONBOARDING

Após o registro, exibir wizard de onboarding (4 steps) com progress bar:

```
Step 1: Dados da clínica
  → Nome, telefone, endereço, logo

Step 2: Primeiro profissional
  → Completar perfil, CREFITO, especialidade, cor na agenda

Step 3: Configurar salas e procedimentos
  → Criar pelo menos 1 sala e 1 procedimento
  → Opção "Pular por agora"

Step 4: Conectar Google (opcional)
  → Botão Google Calendar
  → Opção "Configurar depois"

[ Concluir → redireciona para /dashboard ]
```

---

## PADRÕES DE CÓDIGO OBRIGATÓRIOS

### Supabase client
```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types'; // gerado via supabase gen types

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);
```

### Hook padrão (exemplo useAppointments)
```typescript
// hooks/useAppointments.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useAppointments = (filters: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, name, phone, avatar_url),
          professional:professionals(id, name, color, avatar_url),
          room:rooms(id, name, color),
          procedure:procedures(id, name, color, duration_min)
        `)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true });

      if (filters.date) query = query.eq('date', filters.date);
      if (filters.professional_id) query = query.eq('professional_id', filters.professional_id);
      if (filters.status) query = query.eq('status', filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60, // 1 minuto
  });
};

export const useCreateAppointment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAppointmentPayload) => {
      const { data: result, error } = await supabase
        .from('appointments')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
};
```

### Componente de status badge
```typescript
// components/shared/StatusBadge.tsx
const STATUS_MAP = {
  scheduled:   { label: 'Agendado',    class: 'bg-blue-100 text-blue-800' },
  confirmed:   { label: 'Confirmado',  class: 'bg-green-100 text-green-800' },
  in_progress: { label: 'Em andamento',class: 'bg-purple-100 text-purple-800' },
  completed:   { label: 'Concluído',   class: 'bg-gray-100 text-gray-600' },
  cancelled:   { label: 'Cancelado',   class: 'bg-red-100 text-red-700' },
  no_show:     { label: 'Faltou',      class: 'bg-yellow-100 text-yellow-800' },
};
```

### Geração de tipos TypeScript do Supabase
```bash
# Execute este comando para gerar os tipos automaticamente
npx supabase gen types typescript \
  --project-id SEU_PROJECT_REF \
  --schema public > src/types/database.types.ts
```

---

## CHECKLIST DE IMPLEMENTAÇÃO (ordem sugerida)

### Sprint 1 — Estrutura base
- [ ] Configurar Vite + TypeScript + Tailwind + shadcn/ui
- [ ] Instalar todas as dependências listadas
- [ ] Configurar cliente Supabase + tipos gerados
- [ ] Implementar autenticação (login, register, logout, recuperar senha)
- [ ] Criar layout (Sidebar + Header + PageWrapper)
- [ ] Criar sistema de rotas com React Router v6
- [ ] Implementar Zustand stores (auth, clinic, ui)
- [ ] Executar todas as migrations SQL no Supabase

### Sprint 2 — Agenda
- [ ] Integrar FullCalendar v6
- [ ] Views: dia, semana, mês, lista
- [ ] Modal de criação/edição de agendamento
- [ ] Drag & drop para reagendar
- [ ] Filtros da agenda
- [ ] Colorização por status
- [ ] Link WhatsApp de lembrete
- [ ] Detecção de conflito de horário

### Sprint 3 — Pacientes e Prontuário
- [ ] Lista de pacientes com busca/filtros
- [ ] Formulário multi-step de cadastro
- [ ] Perfil completo do paciente (tabs)
- [ ] Mapa corporal de dor (SVG interativo)
- [ ] Formulário de avaliação inicial
- [ ] Formulário de evolução por sessão
- [ ] Histórico de atendimentos no perfil
- [ ] Upload de arquivos (Supabase Storage)

### Sprint 4 — Financeiro e Relatórios
- [ ] Módulo financeiro completo
- [ ] Fluxo de caixa com Recharts
- [ ] Parcelamento e recorrência
- [ ] Geração de recibo em PDF
- [ ] Dashboard com KPIs e gráficos
- [ ] Relatórios exportáveis

### Sprint 5 — Integrações e Config
- [ ] Google OAuth (Calendar + Gmail + Meet)
- [ ] Sincronização bidirecional com Google Calendar
- [ ] Envio de email via Gmail API
- [ ] Pacotes de atendimento
- [ ] Templates de avaliação
- [ ] Configurações completas
- [ ] Onboarding wizard
- [ ] Modo escuro

---

## OBSERVAÇÕES FINAIS PARA O TRAE IA

1. **Não use `any` no TypeScript.** Todos os tipos devem ser explícitos, preferencialmente derivados dos tipos gerados pelo Supabase.

2. **Tratamento de erros:** Use padrão try/catch em todas as operações assíncronas. Exiba erros com `toast.error()` via Sonner.

3. **Loading states:** Implemente skeleton loaders (não spinners) em listas e tabelas.

4. **Realtime:** Use `supabase.channel()` para atualizar a agenda em tempo real quando outro usuário criar/editar um agendamento.

5. **Busca de pacientes:** Implemente debounce de 300ms na busca. Use a função `ilike` do Supabase ou `pg_trgm` para busca fuzzy.

6. **Máscaras de input:** Implemente máscaras para CPF, CNPJ, telefone, CEP usando `react-input-mask` ou função utilitária simples.

7. **CEP:** Integre com `https://viacep.com.br/ws/{CEP}/json/` para auto-completar endereço.

8. **CID-10:** Integre com API pública de CID-10 ou use um JSON local com os principais códigos de fisioterapia.

9. **PDF:** Use `@react-pdf/renderer` para recibos e documentos formais, ou `jsPDF` para exportações mais simples.

10. **Performance:** Use `React.memo`, `useMemo` e `useCallback` nas listas e componentes da agenda. Implemente paginação infinita ou cursor-based na lista de pacientes.

11. **Mobile first:** A agenda no mobile deve ter uma view simplificada de lista (não tente renderizar FullCalendar em telas muito pequenas — use o `listDay` view do FullCalendar).

12. **Acessibilidade:** Todos os formulários devem ter labels associados. Use `aria-label` em botões de ícone.

13. **Supabase Storage bucket:** Crie o bucket `patient-files` com as políticas:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false);

CREATE POLICY "clinic_members_can_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-files' AND auth.role() = 'authenticated');

CREATE POLICY "clinic_members_can_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-files' AND auth.role() = 'authenticated');
```

14. **Fuso horário:** Sempre use `date-fns-tz` com `'America/Sao_Paulo'` para exibição de datas e horas. Salve sempre em UTC no banco.

---

*Fim do prompt — FisioDesk v1.0 — Estrutura completa para implementação com TRAE IA*
