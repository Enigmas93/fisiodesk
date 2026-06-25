import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/authStore'

export function ResetPassword() {
  const navigate = useNavigate()
  const updatePassword = useAuthStore((state) => state.updatePassword)

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      await updatePassword(password)
      toast.success('Senha atualizada com sucesso.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível atualizar a senha.')
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
          Definir nova senha
        </h1>
        <p className="text-neutral-500 text-center mb-8">
          Informe sua nova senha para concluir a recuperação
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Digite a nova senha"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Repita a nova senha"
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
                Salvando...
              </>
            ) : (
              'Atualizar senha'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-neutral-600">
          <Link to="/login" className="text-primary font-medium hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  )
}
