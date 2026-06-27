import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useFridgeStore, MIN_INGREDIENTS } from './fridge'
import type { Ingredient } from '@/api/types'

const sample: Ingredient[] = [
  { id: 'a', category: 'base_spirit', name: 'Vodka', enabled: true },
  { id: 'b', category: 'drink', name: 'Cola', enabled: true },
  { id: 'c', category: 'fruit', name: 'Lime', enabled: true },
  { id: 'd', category: 'snack', name: 'Ice', enabled: false },
]

describe('fridge store multi-select', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('groups only enabled ingredients by category', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    expect(s.byCategory.base_spirit.map((i) => i.id)).toEqual(['a'])
    expect(s.byCategory.drink.map((i) => i.id)).toEqual(['b'])
    expect(s.byCategory.fruit.map((i) => i.id)).toEqual(['c'])
    // disabled ingredient is excluded
    expect(s.byCategory.snack).toEqual([])
  })

  it('toggles selection on and off', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    s.toggle('a')
    expect(s.isSelected('a')).toBe(true)
    expect(s.selectedCount).toBe(1)
    s.toggle('a')
    expect(s.isSelected('a')).toBe(false)
    expect(s.selectedCount).toBe(0)
  })

  it('select/deselect are idempotent', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    s.select('a')
    s.select('a')
    expect(s.selectedCount).toBe(1)
    s.deselect('a')
    s.deselect('a')
    expect(s.selectedCount).toBe(0)
  })

  it(`canGenerate requires at least ${MIN_INGREDIENTS} ingredients`, () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    expect(s.canGenerate).toBe(false)
    s.toggle('a')
    expect(s.canGenerate).toBe(false)
    s.toggle('b')
    expect(s.canGenerate).toBe(true)
  })

  it('selectedIngredients returns resolved objects across categories', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    s.toggle('a')
    s.toggle('c')
    expect(s.selectedIngredients.map((i) => i.name).sort()).toEqual(['Lime', 'Vodka'])
  })

  it('drops selections that become invalid after re-setting ingredients', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    s.toggle('a')
    s.toggle('b')
    // 'a' removed, 'b' now disabled -> both selections must be dropped
    s.setIngredients([{ id: 'b', category: 'drink', name: 'Cola', enabled: false }])
    expect(s.selectedIds).toEqual([])
  })

  it('clear empties the selection', () => {
    const s = useFridgeStore()
    s.setIngredients(sample)
    s.toggle('a')
    s.toggle('b')
    s.clear()
    expect(s.selectedCount).toBe(0)
  })
})
