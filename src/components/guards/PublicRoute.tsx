import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { FullPageSpinner } from '../shared/FullPageSpinner'

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isSuperAdmin, hasTenant } = useAuthStore()

  // #region debug-point D:public-route
  fetch('http://127.0.0.1:7777/event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionId: 'root-auto-login', runId: 'pre-fix', hypothesisId: 'D', location: 'src/components/guards/PublicRoute.tsx:PublicRoute', msg: '[DEBUG] PublicRoute render', data: { isAuthenticated, isLoading, isSuperAdmin, hasTenant, href: window.location.href, pathname: window.location.pathname }, ts: Date.now() }) }).catch(() => {})
  // #endregion

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <>{children}</>
  }

  if (isSuperAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to={hasTenant ? '/dashboard' : '/onboarding'} replace />
}
