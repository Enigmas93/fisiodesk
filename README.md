# FisioDesk - Sistema de Gestão para Clínicas

SaaS completo para gestão de clínicas, consultórios e estúdios de pilates.

## Tecnologias

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Deploy**: Vercel

## Funcionalidades Planejadas

- Agenda completa e organizada
- Gestão de pacientes e prontuário eletrônico
- Atendimentos organizados
- Gestão financeira completa
- Aplicativo para pacientes
- Serviço de cobranças
- Relatórios e gráficos gerenciais

## Configuração do Projeto

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Configure as variáveis de ambiente no arquivo `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=seu-projeto-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Configuração do Supabase

1. Crie um projeto no [Supabase](https://supabase.com/)
2. Execute o script SQL em `supabase/schema.sql` para criar as tabelas
3. Configure a autenticação no painel do Supabase
4. Adicione as URLs do seu projeto no arquivo `.env.local`

## Deploy na Vercel

1. Conecte seu repositório Git ao Vercel
2. Adicione as variáveis de ambiente no painel do Vercel
3. Faça o deploy!
