import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { Layout } from './components/layout/Layout'
import { AdminLayout } from './components/layout/AdminLayout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { ForgotPassword } from './pages/auth/ForgotPassword'
import { ResetPassword } from './pages/auth/ResetPassword'
import { GoogleCallback } from './pages/auth/GoogleCallback'
import { useAuthStore } from './stores/authStore'
import { Loader2 } from 'lucide-react'
import { AdminRoute } from './components/guards/AdminRoute'
import { PrivateRoute } from './components/guards/PrivateRoute'
import { PublicRoute } from './components/guards/PublicRoute'

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
const LandingPage = lazy(() => import('./pages/public/LandingPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminClientesPage = lazy(() => import('./pages/admin/AdminClientesPage'))
const AdminLogsPage = lazy(() => import('./pages/admin/AdminLogsPage'))

function RouteFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
}

function AuthenticatedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isLoading = useAuthStore((state) => state.isLoading)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function ProtectedLayoutRoute() {
  return (
    <PrivateRoute>
      <Layout />
    </PrivateRoute>
  )
}

function App() {
  const checkSession = useAuthStore((state) => state.checkSession)
  const isLoading = useAuthStore((state) => state.isLoading)

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
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteFallback />}>
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/precos" element={<Navigate to="/#precos" replace />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
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
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminDashboard />
              </Suspense>
            }
          />
          <Route
            path="clientes"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminClientesPage />
              </Suspense>
            }
          />
          <Route
            path="logs"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminLogsPage />
              </Suspense>
            }
          />
        </Route>
        <Route element={<ProtectedLayoutRoute />}>
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="/agenda"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Agenda />
              </Suspense>
            }
          />
          <Route
            path="/agenda/:date"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Agenda />
              </Suspense>
            }
          />
          <Route 
            path="/agenda/novo" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route 
            path="/agenda/:id/editar" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route
            path="/pacientes"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Pacientes />
              </Suspense>
            }
          />
          <Route 
            path="/pacientes/novo" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route 
            path="/pacientes/:id" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteDetail />
              </Suspense>
            } 
          />
          <Route 
            path="/pacientes/:id/editar" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route
            path="/prontuarios"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Prontuarios />
              </Suspense>
            }
          />
          <Route
            path="/financeiro"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Financeiro />
              </Suspense>
            }
          />
          <Route
            path="/relatorios"
            element={
              <Suspense fallback={<RouteFallback />}>
                <Relatorios />
              </Suspense>
            }
          />
          <Route
            path="/configuracoes"
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
