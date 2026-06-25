import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { FullPageSpinner } from '../shared/FullPageSpinner'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isSuperAdmin } = useAuthStore()

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
