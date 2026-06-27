import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type DashboardStats } from '@/lib/types'

interface UseDashboardParams {
  from?: string
  to?: string
}

export function useDashboard(params: UseDashboardParams = {}) {
  const { from, to } = params
  return useQuery<DashboardStats>({
    queryKey: ['dashboard', { from, to }],
    queryFn: async () => {
      const res = await api.get<DashboardStats>('/admin/stats/dashboard', {
        params: { from, to },
      })
      return res.data
    },
  })
}

export type { DashboardStats }
