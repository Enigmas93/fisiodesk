import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  FileText,
  LayoutDashboard,
  MessageCircle,
  ShieldCheck,
  Wallet,
  BellRing,
  Video,
  Package,
  BarChart3,
  FileBadge2,
  Menu,
  X
} from 'lucide-react'
import { appEnv, getSupportWhatsappLink } from '../../lib/env'

const WHATSAPP_PLAN_LINK = getSupportWhatsappLink(
  'Olá! Quero começar o trial de 14 dias do FisioDesk e depois seguir no Plano Pro (R$59,90/mês). Como funciona?'
)

const features = [
  {
    icon: CalendarDays,
    title: 'Agenda Inteligente',
    description:
      'Visualize por dia, semana ou mês. Arraste e solte para reagendar com filtros por profissional, sala e status.'
  },
  {
    icon: FileText,
    title: 'Prontuário Eletrônico',
    description:
      'Avaliações completas, evoluções por sessão, histórico detalhado e organização clínica em um só lugar.'
  },
  {
    icon: Wallet,
    title: 'Gestão Financeira',
    description:
      'Controle receitas, despesas, fluxo de caixa, comissões e emita recibos em PDF com poucos cliques.'
  },
  {
    icon: BellRing,
    title: 'Lembretes Automáticos',
    description:
      'Envie lembretes de consulta por WhatsApp e e-mail para reduzir faltas e cancelamentos.'
  },
  {
    icon: Video,
    title: 'Google Calendar',
    description:
      'Sincronize seus agendamentos com o Google Calendar e gere links do Google Meet para consultas online.'
  },
  {
    icon: Package,
    title: 'Pacotes de Atendimento',
    description:
      'Gerencie pacotes de sessões, acompanhe saldo por paciente e receba alertas antes de acabar.'
  },
  {
    icon: BarChart3,
    title: 'Relatórios Gerenciais',
    description:
      'Acompanhe atendimentos, financeiro, taxa de presença e desempenho por profissional.'
  },
  {
    icon: ShieldCheck,
    title: 'Dados Seguros',
    description:
      'Seus dados ficam protegidos em nuvem com isolamento por clínica, autenticação e backups.'
  },
  {
    icon: FileBadge2,
    title: 'Documentos em PDF',
    description:
      'Gere recibos, declarações, atestados e relatórios com a identidade visual da sua clínica.'
  }
]

const faqs = [
  {
    question: 'Como funciona o pagamento?',
    answer:
      'Voce comeca com 14 dias gratis. Ao final do trial, se quiser continuar, o pagamento e feito via PIX e sua assinatura segue no Plano Pro.'
  },
  {
    question: 'Preciso instalar algum programa?',
    answer:
      'Não. O FisioDesk funciona 100% online pelo navegador do computador, tablet ou celular.'
  },
  {
    question: 'Meus dados ficam seguros?',
    answer:
      'Sim. Os dados são armazenados no Supabase com infraestrutura em nuvem, criptografia e isolamento por clínica.'
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer:
      'Sim. Não há contrato de fidelidade. Você pode cancelar a qualquer momento pelo WhatsApp.'
  },
  {
    question: 'O sistema funciona no celular?',
    answer: 'Sim. O FisioDesk é responsivo e funciona em computadores, tablets e celulares.'
  },
  {
    question: 'Tenho suporte técnico?',
    answer: 'Sim. Oferecemos suporte via WhatsApp em horário comercial.'
  },
  {
    question: 'Posso ter mais de um profissional usando o sistema?',
    answer:
      'O Plano Pro inclui 1 profissional por clínica. Para equipes, fale conosco e avaliamos uma solução personalizada.'
  }
]

const navLinks = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#precos', label: 'Preços' },
  { href: '#faq', label: 'FAQ' }
]

export function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeFaq, setActiveFaq] = useState<number | null>(0)

  const supportLink = useMemo(() => getSupportWhatsappLink(), [])

  // #region debug-point C:landing-render
  fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'C', location: 'src/pages/public/LandingPage.tsx:LandingPage', msg: '[DEBUG] LandingPage render', data: { href: window.location.href, pathname: window.location.pathname }, ts: Date.now() }) }).catch(() => {})
  // #endregion

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-white/50 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold">{appEnv.appName}</p>
              <p className="text-xs text-neutral-500">Sistema de gestão para fisioterapeutas</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-medium text-neutral-600 hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
              Fazer login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="inline-flex rounded-xl border border-neutral-200 p-2 lg:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-neutral-200 bg-white px-4 py-4 lg:hidden">
            <div className="space-y-3">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100">
                Fazer login
              </Link>
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white"
              >
                Começar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">
                🏥 Sistema completo para fisioterapeutas
              </span>
              <h1 className="mt-6 text-4xl font-bold leading-tight text-neutral-950 md:text-6xl">
                Gerencie sua clínica com profissionalismo e praticidade
              </h1>
              <p className="mt-6 text-lg leading-8 text-neutral-600">
                O FisioDesk reúne agenda inteligente, prontuário eletrônico, gestão financeira e muito mais em um só sistema. Focado 100% na realidade do fisioterapeuta brasileiro.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-500 px-6 py-4 text-base font-semibold text-white hover:bg-green-600"
                >
                  Comecar gratis por 14 dias
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <a
                  href="#como-funciona"
                  className="inline-flex items-center justify-center rounded-2xl border border-neutral-200 px-6 py-4 text-base font-semibold text-neutral-700 hover:bg-white"
                >
                  Ver como funciona ↓
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-neutral-500">
                <span>✓ 14 dias gratis</span>
                <span>✓ Sem cartao</span>
                <span>✓ Cancele quando quiser</span>
                <span>✓ Suporte via WhatsApp</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 -translate-x-3 translate-y-3 rounded-[32px] bg-sky-100 blur-3xl" />
              <div className="relative rounded-[32px] border border-sky-100 bg-white p-5 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-500">Dashboard FisioDesk</p>
                    <h2 className="text-xl font-bold text-neutral-900">Sua clínica organizada em uma única tela</h2>
                  </div>
                  <div className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Ao vivo</div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-sky-50 p-4">
                    <p className="text-sm text-neutral-500">Atendimentos hoje</p>
                    <p className="mt-3 text-3xl font-bold text-neutral-950">18</p>
                    <p className="mt-2 text-sm text-emerald-600">+12% vs ontem</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-4">
                    <p className="text-sm text-neutral-500">Receita do mês</p>
                    <p className="mt-3 text-3xl font-bold text-neutral-950">R$ 8.420</p>
                    <p className="mt-2 text-sm text-emerald-600">5 pacientes novos</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 p-4 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-neutral-900">Próximos agendamentos</p>
                      <p className="text-sm text-neutral-500">Hoje</p>
                    </div>
                    <div className="mt-4 space-y-3">
                      {['08:00 - Ana Paula', '09:00 - Lucas Martins', '10:30 - Renata Costa'].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl bg-neutral-50 px-4 py-3">
                          <span className="font-medium text-neutral-800">{item}</span>
                          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">Confirmado</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="funcionalidades" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-950 md:text-4xl">Tudo que você precisa em um só lugar</h2>
            <p className="mt-4 text-lg text-neutral-600">
              Criado especificamente para fisioterapeutas e clínicas de fisioterapia.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <article key={feature.title} className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-neutral-900">{feature.title}</h3>
                  <p className="mt-3 text-neutral-600">{feature.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="como-funciona" className="bg-neutral-950 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold md:text-4xl">Comece a usar em 3 passos simples</h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {[
                ['📝', 'Crie sua conta', 'Cadastre-se gratuitamente em menos de 2 minutos. Preencha os dados da sua clinica e pronto.'],
                ['🎁', 'Use 14 dias gratis', 'Seu trial e liberado automaticamente para testar agenda, pacientes, prontuario e financeiro.'],
                ['🚀', 'Continue se gostar', 'Ao final do trial, assine o Plano Pro para manter sua operacao liberada sem perder seus dados.']
              ].map(([emoji, title, description]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-4xl">{emoji}</div>
                  <h3 className="mt-6 text-2xl font-semibold">{title}</h3>
                  <p className="mt-3 text-white/70">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="precos" className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-neutral-950 md:text-4xl">Um plano simples, sem surpresas</h2>
            <p className="mt-4 text-lg text-neutral-600">Teste 14 dias gratis e continue por um valor acessivel.</p>
          </div>

          <div className="mx-auto mt-12 max-w-2xl rounded-[32px] border-2 border-sky-200 bg-white p-8 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  Mais popular
                </span>
                <h3 className="mt-4 text-3xl font-bold text-neutral-950">Plano Pro</h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">R$ 59,90</p>
                <p className="text-neutral-500">/mês</p>
              </div>
            </div>

            <ul className="grid gap-3 text-neutral-700 md:grid-cols-2">
              {[
                'Agenda completa',
                'Prontuário eletrônico',
                'Gestão financeira',
                'Lembretes WhatsApp',
                'Google Calendar',
                'Videoconsulta (Meet)',
                'Relatórios completos',
                'Pacotes de atendimento',
                'Emissão de PDF',
                'Suporte via WhatsApp',
                'Atualizações gratuitas',
                'Dados ilimitados'
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={WHATSAPP_PLAN_LINK}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 text-lg font-semibold text-white hover:bg-primary-dark"
            >
              Quero testar por 14 dias
              <ArrowRight className="h-5 w-5" />
            </a>

            <p className="mt-4 text-center text-sm text-neutral-500">
              Sem contrato de fidelidade. Sem cartao. Cancele quando quiser.
            </p>
          </div>

          <div className="mt-8 text-center">
            <p className="text-neutral-600">Dúvidas? Fale conosco pelo WhatsApp.</p>
            <a
              href={supportLink}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-3 font-semibold text-green-700 hover:bg-green-100"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp {appEnv.supportWhatsapp}
            </a>
          </div>
        </section>

        <section id="faq" className="bg-neutral-50 py-20">
          <div className="mx-auto max-w-4xl px-4 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-neutral-950 md:text-4xl">Perguntas frequentes</h2>
            </div>
            <div className="mt-12 space-y-4">
              {faqs.map((item, index) => {
                const open = activeFaq === index
                return (
                  <div key={item.question} className="rounded-2xl border border-neutral-200 bg-white">
                    <button
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => setActiveFaq(open ? null : index)}
                    >
                      <span className="text-lg font-semibold text-neutral-900">{item.question}</span>
                      <ChevronDown className={`h-5 w-5 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && <p className="px-6 pb-6 text-neutral-600">{item.answer}</p>}
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-sky-600 to-blue-700 py-20 text-white">
          <div className="mx-auto flex max-w-5xl flex-col items-center px-4 text-center lg:px-8">
            <h2 className="text-3xl font-bold md:text-4xl">Pronto para organizar sua clínica?</h2>
            <p className="mt-4 max-w-2xl text-lg text-white/80">
              Comece com 14 dias gratis e veja na pratica como centralizar agenda, pacientes e financeiro.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-base font-semibold text-sky-700 hover:bg-sky-50"
              >
                Começar agora
                <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href={supportLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 px-6 py-4 text-base font-semibold text-white hover:bg-white/10"
              >
                <MessageCircle className="h-5 w-5" />
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <p className="font-bold text-neutral-950">{appEnv.appName}</p>
                <p className="text-sm text-neutral-500">Sistema de gestão para fisioterapeutas</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-500">Contato via WhatsApp: (21) 97265-2314</p>
          </div>

          <div className="flex flex-wrap gap-6 text-sm font-medium text-neutral-600">
            <a href="#funcionalidades" className="hover:text-primary">Funcionalidades</a>
            <a href="#precos" className="hover:text-primary">Preços</a>
            <Link to="/login" className="hover:text-primary">Entrar</Link>
            <Link to="/register" className="hover:text-primary">Cadastrar</Link>
          </div>
        </div>
        <div className="border-t border-neutral-200 px-4 py-4 text-center text-sm text-neutral-500">
          © 2024 {appEnv.appName}. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
