# PROMPT DE AUDITORIA COMPLETA — FisioDesk
# Para: TRAE IA
# Objetivo: Verificar, testar, corrigir e certificar que o sistema está 100% funcional e pronto para comercialização

---

## INSTRUÇÕES GERAIS

Você vai realizar uma **auditoria técnica completa e profissional** do sistema FisioDesk.
Não presuma que nada funciona — teste TUDO do zero, como se fosse um QA engineer sênior auditando
um sistema antes de ir para produção comercial.

Ao final, gere dois arquivos:
1. `AUDITORIA_RELATORIO.md` — relatório completo com o resultado de cada item auditado
2. `CORRECOES_PENDENTES.md` — passo a passo detalhado de TUDO que precisa ser corrigido/implementado

Se encontrar problemas, **corrija imediatamente** antes de prosseguir para o próximo item.
Documente cada correção feita.

---

## FASE 0 — RECONHECIMENTO DO AMBIENTE

### 0.1 Mapeie o projeto completo
```
Execute e documente:
- tree . --ignore node_modules -L 4 (estrutura de pastas)
- cat package.json (dependências instaladas)
- cat vite.config.ts (configuração do bundler)
- cat tsconfig.json (configuração TypeScript)
- cat .env.example (variáveis de ambiente esperadas)
- cat src/lib/supabase.ts (configuração do client)
- ls supabase/migrations/ (migrations existentes)
```

### 0.2 Verifique o build local
```bash
npm install          # instalar dependências
npm run build        # verificar se compila sem erros
npm run type-check   # verificar erros TypeScript (se script existir)
```

**Critério de aprovação:** Build sem erros. Zero erros TypeScript.
Se houver erros, corrija todos antes de continuar.

### 0.3 Verifique as variáveis de ambiente
Confirme que as seguintes variáveis existem no `.env.local` e no painel da Vercel:
```
VITE_SUPABASE_URL           ✓/✗
VITE_SUPABASE_ANON_KEY      ✓/✗
VITE_GOOGLE_CLIENT_ID       ✓/✗
VITE_GOOGLE_CLIENT_SECRET   ✓/✗  (não exposta no front — se estiver, mover para Edge Function)
VITE_GOOGLE_REDIRECT_URI    ✓/✗
VITE_APP_NAME               ✓/✗
VITE_APP_URL                ✓/✗
```

⚠️ ATENÇÃO DE SEGURANÇA: `VITE_GOOGLE_CLIENT_SECRET` NÃO deve aparecer no código front-end
(qualquer variável VITE_ é exposta no bundle). Se estiver lá, mova a troca de tokens OAuth
para uma Supabase Edge Function.

---

## FASE 1 — AUDITORIA DO BANCO DE DADOS (SUPABASE)

### 1.1 Verifique todas as tabelas existentes
Execute no SQL Editor do Supabase:
```sql
SELECT table_name, 
       (SELECT count(*) FROM information_schema.columns 
        WHERE table_name = t.table_name AND table_schema = 'public') as col_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Tabelas obrigatórias — marque cada uma:**
- [ ] `clinics`
- [ ] `professionals`
- [ ] `rooms`
- [ ] `procedures`
- [ ] `patients`
- [ ] `appointments`
- [ ] `treatment_plans`
- [ ] `packages`
- [ ] `package_sessions`
- [ ] `assessments`
- [ ] `evolutions`
- [ ] `assessment_templates`
- [ ] `financial_entries`
- [ ] `reminders`
- [ ] `agenda_configs`
- [ ] `google_tokens`

Se alguma tabela estiver faltando, execute a migration correspondente agora.

### 1.2 Verifique colunas críticas de cada tabela
```sql
-- Appointments — colunas obrigatórias
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'appointments' AND table_schema = 'public'
ORDER BY ordinal_position;
```
Repita para: `patients`, `professionals`, `financial_entries`, `assessments`, `evolutions`.

Colunas obrigatórias em `appointments`:
- [ ] id, clinic_id, professional_id, patient_id, room_id, procedure_id
- [ ] date (DATE), start_time (TIME), end_time (TIME), duration_min
- [ ] status (com CHECK constraint)
- [ ] type, modality, meet_link, google_event_id
- [ ] notes, price, is_paid, financial_entry_id
- [ ] reminder_sent_at, reminder_method
- [ ] created_at, updated_at

### 1.3 Verifique RLS (Row Level Security)
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
**Todas as tabelas devem ter `rowsecurity = true`.**

Verifique as políticas:
```sql
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;
```

Cada tabela deve ter pelo menos 1 política restringindo por `clinic_id`.

### 1.4 Verifique índices de performance
```sql
SELECT indexname, tablename, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

Índices obrigatórios:
- [ ] `idx_patients_name` (gin_trgm para busca fuzzy)
- [ ] `idx_patients_cpf`
- [ ] `idx_patients_phone`
- [ ] `idx_appointments_date`
- [ ] `idx_appointments_patient`
- [ ] `idx_appointments_professional`
- [ ] `idx_financial_clinic_date`

Se faltarem, crie agora:
```sql
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON patients(phone);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date, clinic_id);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_professional ON appointments(professional_id, date);
CREATE INDEX IF NOT EXISTS idx_financial_clinic_date ON financial_entries(clinic_id, due_date);
```

### 1.5 Verifique a função helper e triggers
```sql
-- Função de isolamento por clínica
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';
-- Deve conter: get_user_clinic_id, update_updated_at

-- Triggers automáticos de updated_at
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
-- Deve ter trigger em: clinics, professionals, patients, appointments, packages, financial_entries, treatment_plans
```

### 1.6 Verifique o Storage bucket
```sql
SELECT * FROM storage.buckets;
-- Deve existir: patient-files
```

Se não existir:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('patient-files', 'patient-files', false)
ON CONFLICT DO NOTHING;

CREATE POLICY IF NOT EXISTS "authenticated_upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'patient-files' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "authenticated_read"
ON storage.objects FOR SELECT
USING (bucket_id = 'patient-files' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "authenticated_delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'patient-files' AND auth.role() = 'authenticated');
```

### 1.7 Verifique extensões necessárias
```sql
SELECT extname FROM pg_extension;
-- Deve ter: uuid-ossp, pg_trgm
```

---

## FASE 2 — TESTE FUNCIONAL COMPLETO (FLUXO DE USO REAL)

Execute cada teste em sequência. Use a URL de produção da Vercel.
Documente resultado: ✅ Passou | ❌ Falhou | ⚠️ Parcial

### 2.1 AUTENTICAÇÃO

**Teste A — Registro de nova clínica:**
```
1. Acesse /register
2. Preencha:
   - Nome da clínica: "Clínica Teste Auditoria"
   - Nome do profissional: "Dr. Carlos Auditoria"
   - Email: auditoria@fisio.teste
   - Senha: Audit@2024#
3. Submeta o formulário
4. Verifique:
   ✓ Redirecionou para /onboarding OU /dashboard
   ✓ Registro criado em auth.users no Supabase
   ✓ Registro criado em clinics com dados corretos
   ✓ Registro criado em professionals vinculado ao user_id e clinic_id
   ✓ Não há CORS errors no console
   ✓ Token de sessão salvo no localStorage
```

**Teste B — Login:**
```
1. Faça logout
2. Acesse /login
3. Entre com as credenciais criadas acima
4. Verifique:
   ✓ Redirecionou para /dashboard
   ✓ Nome do profissional aparece na sidebar/header
   ✓ Nenhum erro no console
```

**Teste C — Proteção de rotas:**
```
1. Faça logout
2. Tente acessar diretamente: /dashboard, /pacientes, /agenda, /financeiro
3. Verifique:
   ✓ Todas redirecionam para /login
   ✓ Após login, volta para a rota original (redirect_to)
```

**Teste D — Recuperação de senha:**
```
1. Acesse /login → "Esqueci minha senha"
2. Insira o email de teste
3. Verifique:
   ✓ Email de recuperação enviado (checar Supabase Auth logs)
   ✓ Mensagem de confirmação exibida
```

---

### 2.2 ONBOARDING (se implementado)

```
1. Registre uma nova conta do zero
2. Siga o wizard de onboarding:
   Step 1: Preencha dados da clínica (endereço, telefone)
   Step 2: Complete perfil do profissional (CREFITO, especialidade)
   Step 3: Crie 1 sala ("Sala 1") e 1 procedimento ("Fisioterapia Ortopédica - R$150,00 - 50min")
   Step 4: Pule a integração Google por ora
3. Verifique:
   ✓ Dados salvos corretamente no Supabase
   ✓ Redirecionou para /dashboard
   ✓ Dashboard mostra dados da clínica (não em branco)
```

---

### 2.3 CADASTRO DE PROFISSIONAL

Acesse `/configuracoes/profissionais` e crie um segundo profissional:
```
Nome: Dra. Ana Fisioterapia
Email: ana@fisio.teste
CREFITO: 12345-F
Especialidade: Neurologia
Cor na agenda: #10B981 (verde)
Comissão: 40%
Horários: Segunda a Sexta, 08:00-18:00
Slot padrão: 50 minutos
Role: professional
```

**Verificações:**
- [ ] Profissional aparece na lista com avatar inicial (iniciais do nome)
- [ ] Cor configurada aparece corretamente
- [ ] Profissional aparece nos selects de filtro da agenda
- [ ] Profissional aparece no select ao criar agendamento
- [ ] Dados salvos corretamente no banco (verifique via SQL)

```sql
SELECT id, name, specialty, color, commission_pct, role
FROM professionals
WHERE name = 'Dra. Ana Fisioterapia';
```

---

### 2.4 CONFIGURAÇÃO DE SALAS E PROCEDIMENTOS

**Salas — crie 3:**
```
Sala 1: "Sala de Avaliação", capacidade 1, cor #0EA5E9
Sala 2: "Sala de Fisioterapia", capacidade 2, cor #6366F1
Sala 3: "Sala de Pilates", capacidade 8, cor #10B981
```

**Procedimentos — crie 4:**
```
1. "Fisioterapia Ortopédica", 50 min, R$150,00, cor #0EA5E9
2. "Pilates Individual", 60 min, R$120,00, cor #10B981
3. "Fisioterapia Neurológica", 50 min, R$180,00, cor #6366F1
4. "Avaliação Inicial", 60 min, R$200,00, cor #F59E0B
```

**Verificações:**
- [ ] Salas aparecem no select ao criar agendamento
- [ ] Procedimentos pré-preenchem duração e valor no modal de agendamento
- [ ] Cores aparecem corretamente na agenda quando colorização = por procedimento

---

### 2.5 CADASTRO DE PACIENTES

Cadastre 5 pacientes com dados completos para testar todos os cenários:

**Paciente 1 — Completo:**
```
Nome: João Carlos Silva
CPF: 123.456.789-09
Data nascimento: 15/03/1985 (deve mostrar: 39 anos)
Gênero: Masculino
Telefone: (21) 99999-0001
WhatsApp: mesmo número ✓
Email: joao@teste.com
CEP: 20040-020 (Rio de Janeiro — testar auto-preenchimento via ViaCEP)
Tipo sanguíneo: O+
Convênio: Unimed
Nº Carteirinha: 123456789
Alergias: Dipirona
Medicamentos: Losartana 50mg
Histórico: Lombalgia crônica, cirurgia de hérnia em 2020
Ocupação: Engenheiro
Contato emergência: Maria Silva - (21) 98888-0001
Como conheceu: Indicação de amigo
Profissional responsável: Dr. Carlos Auditoria
Tags: Convênio, Lombalgia
```

**Paciente 2 — Básico (campos mínimos):**
```
Nome: Maria Fernanda Costa
Telefone: (21) 99999-0002
Email: maria@teste.com
```

**Paciente 3 — Online:**
```
Nome: Pedro Augusto Rocha
CPF: 987.654.321-00
Telefone: (21) 99999-0003
Email: pedro@teste.com
Observações: Prefere atendimento online
Tags: Online
```

**Paciente 4 — Convênio:**
```
Nome: Ana Beatriz Mendes
Convênio: Bradesco Saúde
Nº Carteirinha: 98765432
Telefone: (21) 99999-0004
```

**Paciente 5 — Pilates:**
```
Nome: Carlos Eduardo Lima
Telefone: (21) 99999-0005
Tags: Pilates
Profissional responsável: Dra. Ana Fisioterapia
```

**Verificações de cada cadastro:**
- [ ] CEP auto-preencheu endereço corretamente (Paciente 1)
- [ ] CPF com máscara (123.456.789-09)
- [ ] Telefone com máscara ((21) 99999-0001)
- [ ] Idade calculada automaticamente (Paciente 1 = 39 anos)
- [ ] Avatar gerado com iniciais (JCS para João Carlos Silva)
- [ ] Todos os 5 aparecem na lista de pacientes
- [ ] Busca por nome funciona em tempo real (teste: "joao", "maria", "carlos")
- [ ] Busca por CPF funciona (teste: "123.456")
- [ ] Busca por telefone funciona (teste: "99999-0001")
- [ ] Filtro por status funciona
- [ ] Filtro por profissional responsável funciona
- [ ] Filtro por convênio funciona
- [ ] Toggle grade/tabela funciona

```sql
-- Verifique no banco
SELECT name, cpf, phone, email, insurance, status, tags
FROM patients
ORDER BY created_at DESC
LIMIT 5;
```

---

### 2.6 AGENDA — CRIAÇÃO DE AGENDAMENTOS

Crie os seguintes agendamentos para testar todos os cenários:

**Agendamento 1 — Presencial básico:**
```
Paciente: João Carlos Silva
Profissional: Dr. Carlos Auditoria
Data: amanhã
Horário: 09:00
Procedimento: Fisioterapia Ortopédica (duração 50min → end_time = 09:50)
Sala: Sala de Fisioterapia
Tipo: Inicial
Modalidade: Presencial
Valor: R$150,00
Notas: Primeira sessão — paciente com lombalgia crônica
```

**Agendamento 2 — Online (deve gerar Meet):**
```
Paciente: Pedro Augusto Rocha
Profissional: Dr. Carlos Auditoria
Data: amanhã
Horário: 10:00
Procedimento: Fisioterapia Ortopédica
Tipo: Sessão
Modalidade: Online
Valor: R$150,00
```
→ Se Google Calendar estiver conectado: verificar que evento foi criado + link Meet gerado
→ Se não conectado: campo meet_link deve ficar vazio (não quebrar)

**Agendamento 3 — Verificar conflito:**
```
Tente criar:
Profissional: Dr. Carlos Auditoria
Data: amanhã
Horário: 09:30 (conflita com Agendamento 1 que vai até 09:50)
```
→ Sistema deve bloquear ou alertar conflito de horário

**Agendamento 4 — Profissional diferente, mesmo horário:**
```
Paciente: Maria Fernanda Costa
Profissional: Dra. Ana Fisioterapia
Data: amanhã
Horário: 09:00
Procedimento: Pilates Individual (60min)
Sala: Sala de Pilates
```
→ Deve criar sem conflito (profissional diferente)

**Agendamento 5 — Cancelamento:**
```
Crie um agendamento qualquer e depois cancele:
Status: Cancelado
Motivo: Paciente solicitou cancelamento
```

**Agendamento 6 — Passado (para histórico):**
```
Data: há 7 dias
Paciente: João Carlos Silva
Status: Concluído
```

**Verificações na agenda:**
- [ ] Agendamento 1 aparece na view de semana com cor correta de status
- [ ] Agendamento 2 aparece com ícone de câmera (online)
- [ ] Conflito do Agendamento 3 foi alertado/bloqueado
- [ ] Agendamento 4 coexiste com 1 (profissionais diferentes)
- [ ] Agendamento 5 aparece com cor de cancelado (vermelho)
- [ ] Drag & drop funciona (tente arrastar Agendamento 1 para 11:00)
- [ ] Após drag, hora atualizada no banco
- [ ] Filtro por profissional: mostrar só agenda da Dra. Ana → mostra apenas Agendamento 4
- [ ] Filtro por status: mostrar só cancelados → mostra Agendamento 5
- [ ] View "Dia" funciona
- [ ] View "Semana" funciona
- [ ] View "Mês" funciona
- [ ] View "Lista" funciona
- [ ] Botão "Hoje" funciona
- [ ] Navegação < > entre semanas funciona
- [ ] Click em slot vazio abre modal de novo agendamento com data/hora pré-preenchida

```sql
-- Verifique agendamentos no banco
SELECT a.date, a.start_time, a.end_time, a.status, a.modality,
       p.name as patient, pr.name as professional
FROM appointments a
JOIN patients p ON a.patient_id = p.id
JOIN professionals pr ON a.professional_id = pr.id
ORDER BY a.date, a.start_time;
```

---

### 2.7 LEMBRETES (WhatsApp e Email)

**Teste WhatsApp:**
```
1. Abra o Agendamento 1 (João Carlos Silva, amanhã 09:00)
2. Clique em "Enviar lembrete WhatsApp"
3. Verifique:
   ✓ Abre nova aba com link wa.me/55219999990001?text=...
   ✓ Mensagem contém: nome do paciente, data, hora, nome do profissional
   ✓ Mensagem formatada corretamente (sem caracteres corrompidos)
   ✓ Campo reminder_sent_at atualizado no banco
   ✓ reminder_method inclui 'whatsapp'
```

**Teste Email (se Gmail conectado):**
```
1. Abra qualquer agendamento
2. Clique em "Enviar lembrete por email"
3. Verifique preview do email antes do envio
4. Confirme envio
5. Verifique:
   ✓ Email chegou na caixa de entrada do paciente
   ✓ Template HTML renderizou corretamente
   ✓ Dados do agendamento corretos no email
   ✓ Sem erros de autenticação Gmail
```

---

### 2.8 PRONTUÁRIO ELETRÔNICO

**Teste A — Avaliação Inicial:**
```
1. Acesse perfil de João Carlos Silva → aba "Prontuário"
2. Clique "Nova Avaliação"
3. Preencha todos os campos:
   Queixa principal: "Dor lombar há 3 anos, piora ao sentar"
   Nível de dor: 7/10
   Mapa corporal: clique na região lombar (posterior) para marcar ponto de dor
   Tipo: pontada
   Início: "Após cirurgia de hérnia em 2020"
   Piora: "Ao sentar por longos períodos, ao levantar peso"
   Melhora: "Com repouso, após medicação"
   Tratamento anterior: "Fisioterapia por 3 meses em 2021"
   Diagnóstico: "Lombalgia crônica com irradiação para MI direito"
   CID-10: M54.5 (Dor lombar baixa)
   Objetivo: "Redução da dor para EVA < 3 em 30 dias"
   Plano: "10 sessões de fisioterapia ortopédica 2x/semana"
4. Salve a avaliação
5. Verifique:
   ✓ Avaliação salva na tabela assessments
   ✓ Mapa corporal salvo como JSON em pain_location
   ✓ Avaliação aparece no histórico do prontuário
   ✓ Aparece com data e nome do profissional
```

**Teste B — Evolução de Sessão:**
```
1. No prontuário do João, clique "Nova Evolução"
2. OU: na agenda, clique em um agendamento concluído → "Registrar Evolução"
3. Preencha:
   Sessão: 1
   Relato do paciente: "Sente melhora leve após repouso no final de semana"
   Nível de dor atual: 6/10
   Pontos de dor: marcar na lombar
   Procedimentos realizados: "TENS lombar, massagem desportiva, exercícios de estabilização"
   Dados objetivos: "Flexão lombar: 60° (anterior 45°)"
   Resposta ao tratamento: "Boa tolerância, sem intercorrências"
   Próxima sessão: "Progredir exercícios, incluir alongamento de psoas"
4. Verifique:
   ✓ Evolução salva na tabela evolutions
   ✓ Aparece cronologicamente no prontuário
   ✓ Numeração de sessões correta
```

**Teste C — Mapa corporal:**
```
Verifique especificamente:
✓ SVG da silhueta humana renderiza (frontal e dorsal)
✓ Click na silhueta adiciona marcador visual
✓ Modal para tipo e intensidade da dor abre
✓ Múltiplos pontos podem ser adicionados
✓ Pontos salvos como JSON: [{x, y, side, type, intensity}]
✓ Pontos recarregam ao reabrir a avaliação
```

**Teste D — Upload de arquivo:**
```
1. Em uma evolução, faça upload de um arquivo (PDF ou imagem)
2. Verifique:
   ✓ Arquivo enviado para Supabase Storage (bucket patient-files)
   ✓ URL salva no campo attachments (JSON array)
   ✓ Arquivo listado na evolução
   ✓ Click no arquivo abre/baixa o arquivo
   ✓ Arquivo não acessível sem autenticação (testar URL direta sem token)
```

---

### 2.9 PACOTES DE ATENDIMENTO

**Criar pacote:**
```
1. No perfil de João Carlos Silva → aba "Pacotes"
2. Crie:
   Nome: "Pacote Lombalgia 10 sessões"
   Procedimento: Fisioterapia Ortopédica
   Total de sessões: 10
   Preço total: R$1.200,00 (R$120,00/sessão)
   Validade: 90 dias
3. Verifique:
   ✓ Pacote criado na tabela packages
   ✓ 10 package_sessions criadas (status: available)
   ✓ Pacote aparece no select ao criar agendamento
   ✓ Ao marcar sessão como concluída e vinculada ao pacote:
     - package_sessions atualiza (used_sessions ++)
     - Mostra saldo correto: "9 sessões restantes"
   ✓ Alerta quando restam < 2 sessões
```

---

### 2.10 MÓDULO FINANCEIRO

**Receitas:**
```
1. Crie lançamento de RECEITA:
   Tipo: Receita
   Categoria: Atendimento
   Descrição: "Sessão de fisioterapia — João Carlos Silva"
   Valor: R$150,00
   Vencimento: hoje
   Status: Pago
   Data pagamento: hoje
   Forma: PIX
   Paciente: João Carlos Silva
   Profissional: Dr. Carlos Auditoria
2. Verifique:
   ✓ Aparece na lista de lançamentos
   ✓ Soma no KPI "Receitas do mês"
   ✓ Aparece no perfil do paciente (aba Financeiro)
```

**Despesas:**
```
Crie lançamento de DESPESA:
   Tipo: Despesa
   Categoria: Aluguel
   Descrição: "Aluguel da clínica — Junho/2024"
   Valor: R$3.500,00
   Vencimento: dia 10 do próximo mês
   Status: Pendente
Verifique:
   ✓ Aparece em "Contas a pagar"
   ✓ Soma no KPI "Despesas do mês"
```

**Parcelamento:**
```
Crie receita parcelada:
   Descrição: "Pacote 10 sessões — João"
   Valor: R$1.200,00
   Parcelamento: 3x
Verifique:
   ✓ 3 lançamentos criados (R$400,00 cada)
   ✓ Datas de vencimento mensais corretas
   ✓ parent_entry_id correto nos filhos
```

**Recorrência:**
```
Crie despesa recorrente:
   Descrição: "Internet da clínica"
   Valor: R$199,00
   Recorrência: mensal
Verifique:
   ✓ Lançamentos futuros criados (pelo menos 3 meses à frente)
```

**Geração de recibo PDF:**
```
1. Marque a receita de R$150,00 como paga
2. Clique "Gerar recibo"
3. Verifique:
   ✓ PDF gerado com dados corretos
   ✓ Logo da clínica presente
   ✓ Número do recibo sequencial
   ✓ Dados do paciente corretos
   ✓ Download funciona
```

**Verificações do painel financeiro:**
- [ ] KPIs corretos (receitas, despesas, saldo, inadimplência)
- [ ] Fluxo de caixa (gráfico Recharts) renderiza sem erro
- [ ] Filtro por período funciona
- [ ] Filtro por profissional funciona
- [ ] Filtro por tipo (receita/despesa) funciona
- [ ] Tab "Contas a receber" mostra pendentes
- [ ] Tab "Contas a pagar" mostra pendentes
- [ ] DRE simplificada renderiza

```sql
-- Verifique no banco
SELECT type, category, description, amount, status, payment_method
FROM financial_entries
ORDER BY created_at DESC;
```

---

### 2.11 DASHBOARD

Após criar todos os dados acima, verifique o dashboard:
- [ ] KPI "Atendimentos hoje" = número correto
- [ ] KPI "Atendimentos esta semana" = correto
- [ ] KPI "Novos pacientes no mês" = 5
- [ ] KPI "Receita do mês" = R$150,00 (ou valor correto)
- [ ] Gráfico de barras renderiza (sem erros de Recharts)
- [ ] Mini-agenda do dia mostra próximos atendimentos
- [ ] "Últimos pacientes" mostra os 3 mais recentes
- [ ] "Contas a vencer" mostra as pendentes
- [ ] "Pacotes com sessões baixas" (se aplicável)
- [ ] Dados são reais (não mockados/hardcoded)

---

### 2.12 RELATÓRIOS

```
Acesse /relatorios e teste cada relatório:

1. Atendimentos por período:
   ✓ Filtro de data funciona
   ✓ Filtro por profissional funciona
   ✓ Gráfico renderiza
   ✓ Tabela mostra dados corretos
   ✓ Exportar CSV gera arquivo válido
   ✓ Exportar PDF gera PDF correto

2. Taxa de presença:
   ✓ Percentual calculado corretamente
   ✓ Gráfico de pizza/barras renderiza

3. Relatório financeiro — fluxo de caixa:
   ✓ Gráfico de linha (receitas vs despesas) por dia
   ✓ Saldo acumulado calculado corretamente

4. Comissões por profissional:
   ✓ Dr. Carlos Auditoria: R$150,00 × 0% (ou % configurada) = R$X
   ✓ Dra. Ana: cálculo correto com 40%
```

---

### 2.13 PERFIL DO PACIENTE — TODAS AS TABS

Acesse o perfil de João Carlos Silva e teste cada tab:

**Tab 1 — Resumo:**
- [ ] Dados cadastrais completos e corretos
- [ ] Idade calculada corretamente
- [ ] Próximos agendamentos listados
- [ ] Últimos atendimentos listados
- [ ] Botões de ação funcionam (Agendar, WhatsApp, Email)
- [ ] Link WhatsApp abre com número correto

**Tab 2 — Prontuário:**
- [ ] Avaliação inicial criada aparece
- [ ] Evolução criada aparece
- [ ] Ordem cronológica correta (mais recente primeiro)
- [ ] Mapa corporal exibe pontos de dor
- [ ] Botão "Nova Avaliação" e "Nova Evolução" funcionam
- [ ] Attachments exibem e são clicáveis

**Tab 3 — Agendamentos:**
- [ ] Histórico completo de agendamentos
- [ ] Status correto em cada um (badges coloridos)
- [ ] Filtro por status funciona
- [ ] Filtro por período funciona
- [ ] Click no agendamento abre detalhes

**Tab 4 — Pacotes:**
- [ ] Pacote "Lombalgia 10 sessões" aparece
- [ ] Progresso visual (barra ou contador: 1/10 usadas)
- [ ] Validade exibida
- [ ] Status correto (ativo)

**Tab 5 — Financeiro:**
- [ ] Lançamentos vinculados ao paciente
- [ ] Total pago calculado
- [ ] Total pendente calculado

**Tab 6 — Documentos:**
- [ ] Upload de arquivo funciona
- [ ] Lista de arquivos com nome, tipo e data
- [ ] Download/visualização funciona

---

### 2.14 CONFIGURAÇÕES — TODAS AS SEÇÕES

**`/configuracoes/clinica`:**
- [ ] Dados da clínica exibidos corretamente
- [ ] Edição e save funcionam
- [ ] Upload de logo funciona
- [ ] Logo exibida na sidebar/header após upload
- [ ] Horários de funcionamento configuráveis

**`/configuracoes/profissionais`:**
- [ ] Lista todos os profissionais
- [ ] Adicionar novo profissional funciona
- [ ] Editar funciona
- [ ] Desativar funciona (profissional some das opções mas não é deletado)
- [ ] Comissão salva corretamente

**`/configuracoes/salas`:**
- [ ] CRUD completo funciona
- [ ] Cores exibidas corretamente

**`/configuracoes/procedimentos`:**
- [ ] CRUD completo funciona
- [ ] Duração e preço salvos corretamente

**`/configuracoes/agenda`:**
- [ ] Visualização padrão salva e aplica
- [ ] Duração do slot afeta a grade da agenda
- [ ] Horário de início/fim configura a agenda
- [ ] Ocultar fins de semana funciona
- [ ] Colorização por critério funciona

**`/configuracoes/integracoes`:**
- [ ] Status de conexão Google Calendar exibido
- [ ] Botão "Conectar com Google" inicia fluxo OAuth
- [ ] Após conexão: token salvo em google_tokens
- [ ] Desconectar limpa os tokens
- [ ] Status de Gmail exibido

---

### 2.15 REALTIME (SUPABASE SUBSCRIPTIONS)

Teste com duas abas abertas simultaneamente:
```
Aba 1: /agenda (semana atual)
Aba 2: /agenda (mesma semana)

Na Aba 1: crie um novo agendamento
Verifique na Aba 2: o agendamento apareceu automaticamente sem recarregar
```
- [ ] Realtime funcionando para appointments
- [ ] Não há vazamentos de memória (subscription unsubscribed no cleanup)

---

## FASE 3 — AUDITORIA DE SEGURANÇA

### 3.1 Teste de isolamento multi-tenant

```
1. Registre uma SEGUNDA clínica com email diferente (teste2@fisio.com)
2. Cadastre um paciente exclusivo desta clínica: "Paciente Clínica Dois"
3. Faça login com a conta da Clínica 1
4. Verifique via SQL:
```
```sql
-- Logado como Clínica 1, esta query NÃO deve retornar "Paciente Clínica Dois"
SELECT name FROM patients WHERE name LIKE '%Clínica Dois%';
-- Deve retornar 0 rows (RLS bloqueando)
```
- [ ] Clínica 1 NÃO vê dados da Clínica 2
- [ ] Clínica 2 NÃO vê dados da Clínica 1

### 3.2 Teste de CORS e headers de segurança
```bash
curl -I https://seu-dominio.vercel.app
# Verifique:
# ✓ X-Frame-Options: DENY ou SAMEORIGIN
# ✓ X-Content-Type-Options: nosniff
# ✓ Strict-Transport-Security presente
# ✓ Content-Security-Policy presente (ou ao menos básico)
```

### 3.3 Verificação de dados sensíveis no bundle
```bash
npm run build
grep -r "supabase.*secret\|google.*secret\|VITE_GOOGLE_CLIENT_SECRET" dist/
# Não deve retornar nada com valores reais de secrets
```

### 3.4 Verificação de SQL Injection
```
No campo de busca de pacientes, tente:
- ' OR '1'='1
- '; DROP TABLE patients; --
- <script>alert('xss')</script>
Verifique: nenhum destes causa erro de banco ou comportamento inesperado
(Supabase SDK usa queries parametrizadas por padrão)
```

---

## FASE 4 — AUDITORIA DE PERFORMANCE

### 4.1 Lighthouse score (via DevTools ou CLI)
```bash
npx lighthouse https://seu-dominio.vercel.app --output=html --output-path=lighthouse.html
```
**Metas mínimas:**
- Performance: ≥ 75
- Accessibility: ≥ 85
- Best Practices: ≥ 90
- SEO: ≥ 80

### 4.2 Bundle size
```bash
npm run build
# Verifique o output do Vite — chunks principais:
# ✓ index.js deve ser < 500kb (gzipped)
# ✓ FullCalendar deve estar em chunk separado (lazy load)
# ✓ Recharts em chunk separado
```

Se o bundle estiver grande, configure lazy loading:
```typescript
// No router — carregamento lazy de páginas pesadas
const AgendaPage = lazy(() => import('./pages/agenda/AgendaPage'));
const RelatoriosPage = lazy(() => import('./pages/reports/ReportsPage'));
```

### 4.3 Queries N+1
Verifique no Supabase Dashboard → API logs se há queries em loop.
A lista de agendamentos deve fazer UMA query com joins (não uma por agendamento).

Correto:
```typescript
supabase.from('appointments').select(`*, patient:patients(*), professional:professionals(*)`)
```

Errado (N+1):
```typescript
// Para cada appointment, busca paciente separado — NUNCA fazer isso
appointments.forEach(a => supabase.from('patients').select().eq('id', a.patient_id))
```

### 4.4 Debounce na busca de pacientes
```
1. Abra /pacientes
2. Abra DevTools → Network
3. Digite "joao" rapidamente (um caractere por vez)
4. Verifique: NO MÁXIMO 2 requests feitos (debounce de 300ms funcionando)
```

---

## FASE 5 — AUDITORIA DO DEPLOY (VERCEL)

### 5.1 Verifique configuração da Vercel
```
1. Acesse vercel.com → seu projeto
2. Verifique em Settings → Environment Variables:
   ✓ VITE_SUPABASE_URL definida para Production
   ✓ VITE_SUPABASE_ANON_KEY definida para Production
   ✓ VITE_GOOGLE_CLIENT_ID definida para Production
   ✓ VITE_APP_URL = URL de produção correta (sem / no final)
   ✗ VITE_GOOGLE_CLIENT_SECRET NÃO deve estar aqui (segurança)
```

### 5.2 Verifique redirecionamentos SPA
O arquivo `vercel.json` deve existir com:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

Se não existir, crie agora. Sem isso, refresh em /pacientes retorna 404.

### 5.3 Verifique o último deploy
```
Vercel Dashboard → seu projeto → Deployments
✓ Último deploy: Status = Ready
✓ Sem erros de build no log
✓ URL de produção respondendo (não 404)
```

### 5.4 Domínio e HTTPS
```
✓ HTTPS ativo (certificado SSL válido)
✓ Redirecionamento HTTP → HTTPS funcionando
✓ Se domínio customizado: DNS configurado corretamente
```

### 5.5 Verifique URL de callback do Google OAuth
```
No Google Cloud Console → Credenciais → seu OAuth client:
✓ Authorized redirect URIs inclui: https://seu-dominio.vercel.app/auth/google/callback
✓ NÃO tem / extra no final
✓ Se tiver domínio customizado: ambos incluídos
```

---

## FASE 6 — AUDITORIA DO SUPABASE (PRODUÇÃO)

### 6.1 Configuração de autenticação
```
Supabase Dashboard → Authentication → Settings:
✓ Site URL = URL de produção da Vercel
✓ Redirect URLs inclui: https://seu-dominio.vercel.app/**
✓ Email confirmação: configurar (ou desabilitar para testes)
✓ PKCE flow habilitado
```

### 6.2 Email templates do Supabase
```
Authentication → Email Templates:
✓ "Confirm signup" com texto em português
✓ "Reset password" com texto em português
✓ "Magic link" (se usado) em português
```

Exemplo de template em português para "Confirm signup":
```html
<h2>Confirme seu email — FisioDesk</h2>
<p>Olá! Clique no link abaixo para confirmar seu cadastro no FisioDesk:</p>
<a href="{{ .ConfirmationURL }}">Confirmar meu email</a>
<p>Se você não criou uma conta, ignore este email.</p>
```

### 6.3 Configurações de CORS no Supabase
```
API Settings → Allowed Origins:
✓ https://seu-dominio.vercel.app
✓ http://localhost:5173 (para desenvolvimento)
```

### 6.4 Verificação de backups
```
Database → Backups:
✓ Backup automático habilitado (plano Pro) ou documentado como risco (plano Free)
Se plano Free: documentar que backups manuais devem ser feitos regularmente
```

### 6.5 Row Level Security — teste final via API
```bash
# Tente acessar sem autenticação — deve retornar []
curl "https://SEU_PROJECT.supabase.co/rest/v1/patients?select=*" \
  -H "apikey: SUA_ANON_KEY"
# Deve retornar: [] (array vazio — RLS bloqueando)
```

---

## FASE 7 — CHECKLIST DE PRONTIDÃO COMERCIAL

### 7.1 UX e Onboarding
- [ ] Tela de login com logo do FisioDesk
- [ ] Tela de registro explicando o produto
- [ ] Onboarding wizard funcional (ou ao menos o dashboard não fica em branco)
- [ ] Estados vazios com calls-to-action (lista de pacientes vazia → "Cadastre seu primeiro paciente")
- [ ] Loading states em todas as listas (skeleton loaders)
- [ ] Error states tratados (sem "undefined" ou erros brutos expostos ao usuário)
- [ ] Mensagens de sucesso/erro em português (toast notifications)
- [ ] Formulários validam campos obrigatórios com mensagem em português
- [ ] Confirmação antes de deletar/cancelar qualquer registro

### 7.2 Responsividade mobile
- [ ] Login funciona no celular
- [ ] Dashboard legível no celular
- [ ] Lista de pacientes navegável no celular
- [ ] Agenda tem view alternativa no mobile (lista, não grid de horas)
- [ ] Modais se adaptam ao tamanho da tela (não cortam)
- [ ] Formulários de cadastro usáveis no mobile (inputs grandes, teclado correto)

### 7.3 Internacionalização (Brasil)
- [ ] Todas as datas em formato DD/MM/AAAA
- [ ] Moeda em R$ com vírgula decimal (R$150,00 não $150.00)
- [ ] Telefone com máscara brasileira
- [ ] CPF com máscara brasileira
- [ ] CEP com máscara brasileira
- [ ] Fuso horário America/Sao_Paulo em todas as exibições

### 7.4 SEO e metadados
Verifique o `index.html`:
```html
<title>FisioDesk — Sistema de Gestão para Fisioterapia</title>
<meta name="description" content="Sistema completo de gestão para clínicas de fisioterapia. Agenda, prontuário eletrônico, financeiro e muito mais.">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="/favicon.ico">
<meta property="og:title" content="FisioDesk">
<meta property="og:description" content="...">
<meta property="og:image" content="...">
```

### 7.5 Favicon e PWA básico
- [ ] Favicon configurado (não o padrão do Vite)
- [ ] manifest.json com nome "FisioDesk" e ícones
- [ ] Ícone da clínica aparece na aba do navegador

### 7.6 Modo escuro
- [ ] Toggle funciona
- [ ] Preferência salva (localStorage)
- [ ] Todos os componentes têm variante dark (sem texto branco em fundo branco)

### 7.7 Acessibilidade básica
- [ ] Todos os inputs têm `<label>` associado
- [ ] Botões de ícone têm `aria-label`
- [ ] Imagens têm `alt`
- [ ] Contraste de cores adequado (mínimo WCAG AA)
- [ ] Navegação por Tab funciona em formulários

---

## FASE 8 — GERAÇÃO DOS RELATÓRIOS FINAIS

Ao terminar toda a auditoria, gere os dois arquivos:

### `AUDITORIA_RELATORIO.md`

```markdown
# Relatório de Auditoria — FisioDesk
Data: [DATA_ATUAL]
Versão auditada: [COMMIT_HASH ou URL_VERCEL]
Auditor: TRAE IA

## Resumo Executivo
- Total de itens auditados: X
- Aprovados: X ✅
- Falhos corrigidos durante auditoria: X 🔧
- Pendências restantes: X ⚠️
- Status geral: [APROVADO / APROVADO COM RESSALVAS / REPROVADO]

## Resultado por Fase

### Fase 0 — Ambiente
[tabela com resultado de cada item]

### Fase 1 — Banco de Dados
[tabela: tabela | colunas | RLS | índices | resultado]

### Fase 2 — Testes Funcionais
[tabela: módulo | teste | resultado | observação]

### Fase 3 — Segurança
[tabela com resultado]

### Fase 4 — Performance
[Lighthouse scores + bundle size]

### Fase 5 — Vercel Deploy
[resultado de cada verificação]

### Fase 6 — Supabase Produção
[resultado de cada verificação]

### Fase 7 — Prontidão Comercial
[checklist com status de cada item]

## Correções Realizadas
[lista de tudo que foi corrigido durante a auditoria]

## Itens Pendentes
[lista de tudo que ainda precisa ser feito]
```

### `CORRECOES_PENDENTES.md`

```markdown
# Correções Pendentes — FisioDesk
# Passo a Passo para Deixar o Sistema Pronto para Comercialização

## PRIORIDADE CRÍTICA (bloqueia o uso)
[itens que impedem uso básico — fazer HOJE]

## PRIORIDADE ALTA (degradam experiência)
[itens que causam má experiência — fazer esta semana]

## PRIORIDADE MÉDIA (melhorias importantes)
[itens que melhoram qualidade — fazer no próximo sprint]

## PRIORIDADE BAIXA (nice-to-have)
[itens opcionais — backlog]

---
Para cada item, incluir:
### [NOME DO ITEM]
**Problema:** descrição do que está errado
**Impacto:** como afeta o usuário
**Solução:** passo a passo exato de como corrigir
**Arquivos afetados:** lista de arquivos a modificar
**SQL necessário:** (se aplicável)
**Tempo estimado:** X horas
```

---

## CRITÉRIO FINAL DE APROVAÇÃO PARA COMERCIALIZAÇÃO

O sistema está **PRONTO PARA SER COMERCIALIZADO** somente quando:

1. ✅ Build sem erros (zero TypeScript errors)
2. ✅ Todas as 16 tabelas existem com RLS ativo
3. ✅ Autenticação + isolamento multi-tenant funcionando
4. ✅ Fluxo completo: cadastrar paciente → agendar → registrar evolução → lançar financeiro
5. ✅ Agenda com drag & drop funcional
6. ✅ Lembrete WhatsApp gerando link correto
7. ✅ Nenhum dado hardcoded/mockado (todos vindos do Supabase)
8. ✅ Deploy Vercel estável (sem 404 em refresh)
9. ✅ Responsivo no mobile (pelo menos legível e usável)
10. ✅ Mensagens de erro/sucesso em português
11. ✅ Estados vazios com orientação ao usuário
12. ✅ Dados isolados por clínica (sem vazamento entre tenants)

---

*Fim do Prompt de Auditoria — FisioDesk v1.0*
*Execute este prompt completo no TRAE IA após a implementação inicial*
```
