import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type Ingredient, type LocaleNames } from '@/lib/types'

export function useIngredients() {
  return useQuery<Ingredient[]>({
    queryKey: ['ingredients'],
    queryFn: async () => {
      const res = await api.get<Ingredient[]>('/admin/ingredients')
      return res.data
    },
  })
}

interface IngredientInput {
  category: string
  names: LocaleNames
  enabled: boolean
}

export function useCreateIngredient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: IngredientInput) => {
      const res = await api.post<Ingredient>('/admin/ingredients', input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('材料已创建')
    },
  })
}

export function useUpdateIngredient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: IngredientInput
    }) => {
      const res = await api.put<Ingredient>(`/admin/ingredients/${id}`, input)
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('材料已更新')
    },
  })
}

export function useDeleteIngredient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/ingredients/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ingredients'] })
      toast.success('材料已删除')
    },
  })
}

export type { Ingredient }
