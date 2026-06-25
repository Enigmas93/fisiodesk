# FisioDesk

Sistema SaaS para gestao de clinicas de fisioterapia construido com `React`, `Vite`, `TypeScript` e `Supabase`.

## Stack

- `React 18`
- `Vite`
- `TypeScript`
- `Supabase`
- `Tailwind CSS`
- `TanStack Query`
- `FullCalendar`
- `Recharts`

## Executar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Configure as variaveis de ambiente com base em `.env.example`.

3. Rode o projeto:

```bash
npm run dev
```

## Build de producao

```bash
npm run build
```

## Checklist de Comercializacao

- Aplicar as migrations `001_base_schema.sql`, `002_complete_product_schema.sql` e `003_auth_bootstrap_policies.sql` no Supabase.
- Confirmar que cada usuario autenticado possui vinculo em `professionals.user_id`.
- Configurar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Configurar `VITE_APP_URL`, `VITE_GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_SECRET`.
- Ajustar as URLs de callback Google para o ambiente publicado.
- Validar bucket `patient-files` e permissoes de `Storage`.
- Confirmar politicas RLS em ambiente de producao.
- Testar fluxo completo: cadastro, onboarding, agenda, paciente, prontuario, financeiro e relatorios.
- Testar integracoes: Google Calendar, Gmail, Google Meet e WhatsApp.
- Testar deploy Vercel com `outputDirectory` apontando para `dist`.

## Fluxos criticos para homologacao

- Cadastro e onboarding da clinica.
- Login, recuperacao e redefinicao de senha.
- Criacao e edicao de pacientes.
- Criacao, remarcacao e confirmacao de agendamentos.
- Criacao de evento Google Calendar com Meet.
- Envio de lembrete por email e abertura do WhatsApp.
- Registro financeiro, marcacao como pago e emissao de recibo.
- Exportacao de relatorios CSV e PDF.

## Observacoes

- O sistema foi otimizado com carregamento lazy de paginas e separacao manual de chunks no build.
- Em ambiente limpo, a maior parte dos erros operacionais restantes tende a estar relacionada a variaveis de ambiente, RLS ou credenciais externas.
