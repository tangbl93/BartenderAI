import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { type AdminUserDetail, type UserPage } from '@/lib/types'

interface UseUsersParams {
  q?: string
  page?: number
  size?: number
}

export function useUsers(params: UseUsersParams = {}) {
  const { q, page = 1, size = 10 } = params
  return useQuery<UserPage>({
    queryKey: ['users', { q, page, size }],
    queryFn: async () => {
      const res = await api.get<UserPage>('/admin/users', {
        params: { q, page, size },
      })
      return res.data
    },
    placeholderData: (prev) => prev,
  })
}

export function useUser(id?: string) {
  return useQuery<AdminUserDetail>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await api.get<AdminUserDetail>(`/admin/users/${id}`)
      return res.data
    },
    enabled: !!id,
  })
}

export type { AdminUser, UserPage, AdminUserDetail } from '@/lib/types'
export type { AdminUser as User } from '@/lib/types'
