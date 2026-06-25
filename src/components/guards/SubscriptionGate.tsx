import { Link } from 'react-router-dom'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { appEnv, getSupportWhatsappLink } from '../../lib/env'

const PLAN_PRICE_LABEL = 'R$59,90/mês'

const statusMessages = {
  pending: {
    title: 'Aguardando ativação',
    description:
      'Seu cadastro foi concluído. Fale com nossa equipe pelo WhatsApp para ativar o Plano Pro e liberar o acesso completo ao sistema.',
    badge: 'Cadastro recebido'
  },
  suspended: {
    title: 'Assinatura suspensa',
    description:
      'Seu acesso foi suspenso temporariamente. Entre em contato para regularizar e voltar a usar o FisioDesk.',
    badge: 'Regularização pendente'
  },
  cancelled: {
    title: 'Assinatura cancelada',
    description:
      'Sua assinatura foi cancelada. Se quiser retomar o uso, podemos reativar seu plano pelo WhatsApp.',
    badge: 'Assinatura cancelada'
  },
  expired: {
    title: 'Assinatura expirada',
    description:
      'Seu período contratado terminou. Renove o plano para continuar usando agenda, prontuário e financeiro.',
    badge: 'Renovação necessária'
  },
  trial: {
    title: 'Período de teste ativo',
    description:
      'Seu acesso está em trial. Caso precise de ajuda para ativação definitiva, fale conosco pelo WhatsApp.',
    badge: 'Trial ativo'
  },
  active: {
    title: 'Acesso disponível',
    description: 'Sua assinatura está ativa.',
    badge: 'Assinatura ativa'
  }
} as const

export function SubscriptionGate() {
  const { clinic, subscription, logout } = useAuthStore()
  const status = subscription?.status ?? 'pending'
  const statusInfo = statusMessages[status] ?? statusMessages.pending
  const whatsappMessage = `Olá! Acabei de me cadastrar no ${appEnv.appName}.\n\n🏥 Clínica: ${clinic?.name ?? 'Minha Clínica'}\n📧 Email: ${clinic?.email ?? ''}\n📱 Telefone: ${subscription?.contact_whatsapp ?? clinic?.phone ?? ''}\n\nGostaria de ativar meu acesso ao Plano Pro (${PLAN_PRICE_LABEL}). Como posso realizar o pagamento?`
  const whatsappLink = getSupportWhatsappLink(whatsappMessage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-sky-100 bg-white shadow-xl p-8">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white">
          <ShieldCheck className="h-8 w-8" />
        </div>

        <div className="mb-6 text-center">
          <span className="inline-flex items-center rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {statusInfo.badge}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900">{statusInfo.title}</h1>
          <p className="mt-3 text-neutral-500">{statusInfo.description}</p>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-500">Plano</p>
              <p className="text-lg font-semibold text-neutral-900">Plano Pro</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-neutral-500">Investimento</p>
              <p className="text-lg font-bold text-primary">{PLAN_PRICE_LABEL}</p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm text-neutral-600">
            <li>Agenda completa com lembretes</li>
            <li>Prontuário eletrônico e pacotes</li>
            <li>Financeiro, relatórios e PDFs</li>
            <li>Integração com Google e suporte via WhatsApp</li>
          </ul>
        </div>

        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 px-6 py-4 text-lg font-semibold text-white transition-colors hover:bg-green-600"
        >
          <MessageCircle className="h-5 w-5" />
          Ativar meu plano via WhatsApp
        </a>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link to="/configuracoes" className="font-medium text-primary hover:underline">
            Ver configurações
          </Link>
          <button onClick={() => void logout()} className="text-neutral-500 hover:text-neutral-700">
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}
