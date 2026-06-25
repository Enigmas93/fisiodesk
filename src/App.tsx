import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, lazy, Suspense } from 'react'
import { Layout } from './components/layout/Layout'
import { Login } from './pages/auth/Login'
import { Dashboard } from './pages/Dashboard'
import { Agenda } from './pages/Agenda'
import { Pacientes } from './pages/Pacientes'
import { Prontuarios } from './pages/Prontuarios'
import { Financeiro } from './pages/Financeiro'
import { Relatorios } from './pages/Relatorios'
import { Configuracoes } from './pages/Configuracoes'
import { useAuthStore } from './stores/authStore'
import { Loader2 } from 'lucide-react'
import { Toaster } from 'sonner'

const PacienteDetail = lazy(() => import('./pages/PacienteDetail'))
const PacienteForm = lazy(() => import('./pages/PacienteForm'))
const AgendamentoForm = lazy(() => import('./pages/AgendamentoForm'))

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
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <Layout />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="agenda" element={<Agenda />} />
          <Route 
            path="agenda/novo" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route 
            path="agenda/:id/editar" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <AgendamentoForm />
              </Suspense>
            } 
          />
          <Route path="pacientes" element={<Pacientes />} />
          <Route 
            path="pacientes/novo" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route 
            path="pacientes/:id" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <PacienteDetail />
              </Suspense>
            } 
          />
          <Route 
            path="pacientes/:id/editar" 
            element={
              <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
                <PacienteForm />
              </Suspense>
            } 
          />
          <Route path="prontuarios" element={<Prontuarios />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="configuracoes" element={<Configuracoes />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
