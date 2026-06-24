# Guia de Deploy - FisioDesk

## Passo 1: Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. No painel do Supabase:
   - Vá para **SQL Editor**
   - Crie uma nova query
   - Copie e execute o conteúdo do arquivo `supabase/schema.sql`
4. Vá para **Authentication > **Settings** > **API**
   - Copie a `Project URL` e a `anon public`
5. Configure essas credenciais no arquivo `.env.local`

## Passo 2: Deploy no Vercel

1. Crie uma conta no [Vercel](https://vercel.com)
2. Conecte seu repositório Git (GitHub, GitLab ou Bitbucket)
3. Configure as variáveis de ambiente no painel do Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Funcionalidades Implementadas

- ✅ Autenticação com Supabase Auth
- ✅ Agenda com visualização de atendimentos
- ✅ Gestão de pacientes e prontuário eletrônico
- ✅ Módulo financeiro (receitas, despesas, relatórios)
- ⏳ Integração de pagamentos (Stripe/Mercado Pago)
- ⏳ Notificações (SMS, e-mail, WhatsApp)
- ✅ Estrutura pronta para deploy na Vercel e Supabase
