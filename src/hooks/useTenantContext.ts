import { useQuery } from '@tanstack/react-query'
import { getCurrentTenantContext, getOptionalTenantContext } from '../lib/tenant'
import { useAuthStore } from '../stores/authStore'

type UseTenantContextOptions = {
  required?: boolean
}

export const useTenantContext = ({ required = true }: UseTenantContextOptions = {}) => {
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['tenant-context', user?.id, required],
    queryFn: required ? getCurrentTenantContext : getOptionalTenantContext,
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5
  })
}
