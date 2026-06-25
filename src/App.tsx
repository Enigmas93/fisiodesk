import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { GoogleCallback } from './pages/auth/GoogleCallback'
import { useAuthStore } from './stores/authStore'
import { useTenantContext } from './hooks/useTenantContext'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'

const Dashboard = lazy(() => import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })))
const Agenda = lazy(() => import('./pages/Agenda').then((module) => ({ default: module.Agenda })))
const Pacientes = lazy(() => import('./pages/Pacientes').then((module) => ({ default: module.Pacientes })))
const Prontuarios = lazy(() => import('./pages/Prontuarios').then((module) => ({ default: module.Prontuarios })))
const Financeiro = lazy(() => import('./pages/Financeiro').then((module) => ({ default: module.Financeiro })))
const Relatorios = lazy(() => import('./pages/Relatorios').then((module) => ({ default: module.Relatorios })))
const Configuracoes = lazy(() => import('./pages/Configuracoes').then((module) => ({ default: module.Configuracoes })))
const Onboarding = lazy(() => import('./pages/Onboarding').then((module) => ({ default: module.Onboarding })))
const PacienteDetail = lazy(() => import('./pages/PacienteDetail'))
const PacienteForm = lazy(() => import('./pages/PacienteForm'))
const AgendamentoForm = lazy(() => import('./pages/AgendamentoForm'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function ProtectedLayoutRoute() {
  const { isAuthenticated } = useAuthStore()
  const { data: tenantContext, isLoading } = useTenantContext({ required: false })

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!tenantContext) {
    return <Navigate to="/onboarding" replace />
  }

  return <Layout />
}

function App() {
  const { checkSession, isAuthenticated, isLoading } = useAuthStore()

  useEffect(() => {
    checkSession()
  }, [checkSession])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Register /> : <Navigate to="/onboarding" replace />}
        />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />
        <Route
          path="/onboarding"
          element={
            <AuthenticatedRoute>
              <Suspense fallback={<RouteFallback />}>
                <Onboarding />
              </Suspense>
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/auth/google/callback"
          element={
            <AuthenticatedRoute>
              <GoogleCallback />
            </AuthenticatedRoute>
          }
        />
        <Route
          path="/*"
          element={<ProtectedLayoutRoute />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="agenda"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Agenda />
              </Suspense>
            }
          />
          <Route
            path="agenda/:date"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Agenda />
              </Suspense>
            }
          />
          <Route 
            path="agenda/novo" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route 
            path="agenda/:id/editar" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route
            path="pacientes"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Pacientes />
              </Suspense>
            }
          />
          <Route 
            path="pacientes/novo" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route 
            path="pacientes/:id" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteDetail />
              </Suspense>
            } 
          />
          <Route 
            path="pacientes/:id/editar" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route
            path="prontuarios"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Prontuarios />
              </Suspense>
            }
          />
          <Route
            path="financeiro"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Financeiro />
              </Suspense>
            }
          />
          <Route
            path="relatorios"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Relatorios />
              </Suspense>
            }
          />
          <Route
            path="configuracoes"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Configuracoes />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </>
  )
}

export default App
