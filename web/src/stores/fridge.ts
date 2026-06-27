import { defineStore } from 'pinia'
import type { Ingredient, IngredientCategory } from '@/api/types'

interface FridgeState {
  ingredients: Ingredient[]
  selectedIds: string[]
}

export const MIN_INGREDIENTS = 2

export const useFridgeStore = defineStore('fridge', {
  state: (): FridgeState => ({
    ingredients: [],
    selectedIds: [],
  }),
  getters: {
    /** Enabled ingredients grouped by category (only enabled ones are shown). */
    byCategory(state): Record<IngredientCategory, Ingredient[]> {
      const groups: Record<IngredientCategory, Ingredient[]> = {
        base_spirit: [],
        drink: [],
        fruit: [],
        snack: [],
      }
      for (const ing of state.ingredients) {
        if (ing.enabled) groups[ing.category].push(ing)
      }
      return groups
    },
    selectedIngredients(state): Ingredient[] {
      const set = new Set(state.selectedIds)
      return state.ingredients.filter((i) => set.has(i.id))
    },
    selectedCount(state): number {
      return state.selectedIds.length
    },
    canGenerate(state): boolean {
      return state.selectedIds.length >= MIN_INGREDIENTS
    },
    isSelected(state) {
      return (id: string): boolean => state.selectedIds.includes(id)
    },
  },
  actions: {
    setIngredients(list: Ingredient[]) {
      this.ingredients = list
      // Drop selections that no longer exist / are disabled.
      const valid = new Set(list.filter((i) => i.enabled).map((i) => i.id))
      this.selectedIds = this.selectedIds.filter((id) => valid.has(id))
    },
    toggle(id: string) {
      const idx = this.selectedIds.indexOf(id)
      if (idx >= 0) this.selectedIds.splice(idx, 1)
      else this.selectedIds.push(id)
    },
    select(id: string) {
      if (!this.selectedIds.includes(id)) this.selectedIds.push(id)
    },
    deselect(id: string) {
      const idx = this.selectedIds.indexOf(id)
      if (idx >= 0) this.selectedIds.splice(idx, 1)
    },
    clear() {
      this.selectedIds = []
    },
  },
})
