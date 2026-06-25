import { Loader2 } from 'lucide-react'

export function FullPageSpinner() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin" />
    </div>
  )
}
