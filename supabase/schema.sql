-- Criação de tabelas básicas para o FisioDesk

-- Tabela de clínicas/empresas (para SaaS multitenant)
CREATE TABLE clinics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(14),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de usuários (profissionais, administradores)
CREATE TABLE users (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(50) NOT NULL DEFAULT 'professional', -- professional, admin, assistant
    license_number VARCHAR(100), -- número de registro profissional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacientes
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(11),
    email VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    gender VARCHAR(20),
    address TEXT,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de atendimentos
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES users(id) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, completed, canceled
    room VARCHAR(100),
    category VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de prontuários eletrônicos
CREATE TABLE medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    appointment_id UUID REFERENCES appointments(id),
    professional_id UUID REFERENCES users(id) NOT NULL,
    type VARCHAR(100) NOT NULL, -- anamnesis, evaluation, evolution, procedure
    content TEXT NOT NULL,
    attachments TEXT[], -- URLs de arquivos anexados
    pain_points JSONB, -- pontos de dor do paciente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de procedimentos
CREATE TABLE procedures (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    duration INTEGER, -- duração em minutos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de planos de tratamento
CREATE TABLE treatment_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    professional_id UUID REFERENCES users(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de finanças (receitas e despesas)
CREATE TABLE financial_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    type VARCHAR(20) NOT NULL, -- income, expense
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    patient_id UUID REFERENCES patients(id),
    professional_id UUID REFERENCES users(id),
    payment_method VARCHAR(50),
    due_date DATE,
    paid_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, paid, overdue
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pacotes de atendimento
CREATE TABLE packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    clinic_id UUID REFERENCES clinics(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sessions INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de compras de pacotes pelos pacientes
CREATE TABLE patient_packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id) NOT NULL,
    package_id UUID REFERENCES packages(id) NOT NULL,
    purchase_date DATE NOT NULL,
    sessions_used INTEGER DEFAULT 0,
    total_paid NUMERIC(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
