import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { FullPageSpinner } from '../shared/FullPageSpinner'

export function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isSuperAdmin, hasTenant } = useAuthStore()

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
