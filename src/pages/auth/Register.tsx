import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '../../stores/authStore'
import { ensureClinicBootstrap } from '../../lib/bootstrap'

export function Register() {
  const navigate = useNavigate()
  const register = useAuthStore((state) => state.register)

  const [formData, setFormData] = useState({
    name: '',
    clinicName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem.')
      return
    }

    setIsSubmitting(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      const authUser = useAuthStore.getState().user

      if (!authUser) {
        toast.success('Conta criada com sucesso! Faça login para continuar.')
        navigate('/login')
        return
      }

      await ensureClinicBootstrap({
        user: authUser,
        clinicName: formData.clinicName,
        clinicPhone: formData.phone,
        professionalName: formData.name
      })

      await useAuthStore.getState().checkSession()
      toast.success('Conta criada com sucesso! Seu teste gratuito de 14 dias ja esta liberado.')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Não foi possível criar sua conta.')
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
          Criar conta
        </h1>
        <p className="text-neutral-500 text-center mb-8">
          Cadastre sua clinica e comece agora com 14 dias gratis no Plano Pro
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
              Seu nome
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Nome do responsável"
              required
            />
          </div>

          <div>
            <label htmlFor="clinicName" className="block text-sm font-medium text-neutral-700 mb-2">
              Nome da clínica
            </label>
            <input
              id="clinicName"
              type="text"
              value={formData.clinicName}
              onChange={(e) => setFormData((prev) => ({ ...prev, clinicName: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Nome da sua clínica"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
              WhatsApp
            </label>
            <input
              id="phone"
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="(21) 99999-9999"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Crie uma senha"
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
              value={formData.confirmPassword}
              onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Repita a senha"
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
                Criando conta...
              </>
            ) : (
              'Criar conta'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-neutral-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Entrar
          </Link>
        </p>
        <p className="mt-3 text-center text-xs text-neutral-500">
          Sem cartao de credito. Apos 14 dias, voce escolhe se deseja continuar com o plano.
        </p>
      </div>
    </div>
  )
}
