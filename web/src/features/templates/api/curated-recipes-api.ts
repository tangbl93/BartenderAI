import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { type Recipe } from '@/lib/types'

/** Curated cocktail recommendations = example recipes (精选调酒推荐). */
export function useCuratedRecipes() {
  return useQuery<Recipe[]>({
    queryKey: ['curated-recipes'],
    queryFn: async () => {
      const res = await api.get<Recipe[]>('/recipes/examples')
      return res.data
    },
  })
}

export function useDeleteRecipe() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/recipes/admin/${id}`)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['curated-recipes'] })
      toast.success('推荐已删除')
    },
    onError: () => toast.error('删除失败'),
  })
}
