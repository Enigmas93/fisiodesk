import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/authStore'

export function ForgotPassword() {
  const forgotPassword = useAuthStore((state) => state.forgotPassword)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await forgotPassword(email)
      toast.success('Enviamos o link de redefinição para seu email.')
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível enviar o email de redefinição.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-accent p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-neutral-800">FisioDesk</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-neutral-800 mb-2">
          Recuperar senha
        </h1>
        <p className="text-neutral-500 text-center mb-8">
          Informe seu email para receber o link de redefinição
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              'Enviar link'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-neutral-600">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
