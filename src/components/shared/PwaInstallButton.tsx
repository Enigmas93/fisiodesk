import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PwaInstallButtonProps = {
  className?: string
  label?: string
  compact?: boolean
}

const isIosDevice = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
  (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)

export function PwaInstallButton({
  className = '',
  label = 'Instalar app',
  compact = false
}: PwaInstallButtonProps) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const updateInstalledState = () => {
      const iosStandalone = typeof (window.navigator as Navigator & { standalone?: boolean }).standalone === 'boolean'
        ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
        : false
      setIsInstalled(mediaQuery.matches || iosStandalone)
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setPromptEvent(event as BeforeInstallPromptEvent)
    }

    const onAppInstalled = () => {
      setPromptEvent(null)
      setIsInstalled(true)
      toast.success('FisioDesk instalado com sucesso.')
    }

    updateInstalledState()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    mediaQuery.addEventListener('change', updateInstalledState)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
      mediaQuery.removeEventListener('change', updateInstalledState)
    }
  }, [])

  const isIos = useMemo(() => isIosDevice(), [])

  if (isInstalled) return null

  const handleInstall = async () => {
    if (promptEvent) {
      await promptEvent.prompt()
      const choice = await promptEvent.userChoice
      if (choice.outcome === 'accepted') {
        toast.success('Instalação iniciada.')
      }
      setPromptEvent(null)
      return
    }

    if (isIos) {
      toast.info('No iPhone ou iPad, toque em Compartilhar e depois em "Adicionar à Tela de Início".')
      return
    }

    toast.info('Use a opção "Instalar aplicativo" do navegador para adicionar o FisioDesk à sua tela inicial.')
  }

  return (
    <button
      type="button"
      onClick={() => void handleInstall()}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 transition-colors hover:bg-sky-100 ${compact ? 'px-3 py-2 text-xs' : ''} ${className}`.trim()}
    >
      <Download className={compact ? 'h-4 w-4' : 'h-4.5 w-4.5'} />
      {label}
    </button>
  )
}

export default PwaInstallButton
