import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type ResultsPage } from '@/lib/types'

interface UseResultsParams {
  userId?: string
  type?: string
  page?: number
  size?: number
}

export function useResults(params: UseResultsParams = {}) {
  const { userId, type, page = 1, size = 24 } = params
  return useQuery<ResultsPage>({
    queryKey: ['results', { userId, type, page, size }],
    queryFn: async () => {
      const res = await api.get<ResultsPage>('/admin/content/results', {
        params: { userId, type, page, size },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export type { ResultsPage, ResultItem } from '@/lib/types'
