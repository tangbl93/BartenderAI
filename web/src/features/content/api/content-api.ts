import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type LabEntry } from '@/lib/types'

interface UseSharedContentParams {
  userId?: string
  status?: string
  page?: number
  size?: number
}

export function useSharedContent(params: UseSharedContentParams = {}) {
  const { userId, status, page = 1, size = 20 } = params
  return useQuery<LabEntry[]>({
    queryKey: ['shared-content', { userId, status, page, size }],
    queryFn: async () => {
      const res = await api.get('/admin/content/shared', {
        params: { userId, status, page, size },
      })
      const data = res.data
      // Backend may return array or paged object; normalize
      return Array.isArray(data) ? data : (data?.items ?? [])
    },
  })
}

export function useHideContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/admin/content/${id}/hide`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-content'] })
      toast.success('内容已屏蔽')
    },
  })
}

export function useDeleteContent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/content/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['shared-content'] })
      toast.success('内容已删除')
    },
  })
}

export type { LabEntry }
