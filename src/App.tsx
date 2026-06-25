import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
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
        <Route path="agenda/*" element={<Agenda />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="pacientes/*" element={<Pacientes />} />
        <Route path="prontuarios" element={<Prontuarios />} />
        <Route path="financeiro" element={<Financeiro />} />
        <Route path="relatorios" element={<Relatorios />} />
        <Route path="configuracoes" element={<Configuracoes />} />
        <Route path="configuracoes/*" element={<Configuracoes />} />
      </Route>
    </Routes>
  )
}

export default App
