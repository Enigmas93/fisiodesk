import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { SubscriptionGate } from './SubscriptionGate'
import { FullPageSpinner } from '../shared/FullPageSpinner'

export function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, hasTenant, isSuperAdmin, hasActiveSubscription } = useAuthStore()

  if (isLoading) {
    return <FullPageSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!hasTenant && !isSuperAdmin) {
    return <Navigate to="/onboarding" replace />
  }

  if (!isSuperAdmin && !hasActiveSubscription) {
    return <SubscriptionGate />
  }

  return <>{children}</>
}
