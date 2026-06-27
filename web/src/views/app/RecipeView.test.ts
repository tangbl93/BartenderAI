import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import RecipeView from './RecipeView.vue'

const { apiMock } = vi.hoisted(() => {
  const recipe = {
    id: 'r1',
    name: 'Test Negroni',
    tagline: 'bittersweet',
    locale: 'en',
    items: [
      { ingredientId: 'a', name: 'Gin', amount: '30 ml' },
      { ingredientId: 'b', name: 'Vermouth', amount: '30 ml' },
    ],
    steps: ['Stir', 'Serve'],
    toolSubstitutions: [{ tool: 'Jigger', homeAlternative: '1.5 tbsp' }],
    alcoholRange: '20% ABV',
    safetyNotes: ['Drink responsibly'],
  }
  return { apiMock: { getRecipe: vi.fn().mockResolvedValue(recipe) } }
})

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api')
  return { ...actual, api: apiMock }
})

describe('RecipeView', () => {
  it('renders recipe name, items, steps, tool substitutions and safety notes', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/app/recipe/:id', name: 'recipe', component: RecipeView }],
    })
    const wrapper = mount(RecipeView, {
      props: { id: 'r1' },
      global: { plugins: [router] },
    })
    await flushPromises()

    expect(wrapper.find('[data-test="recipe-name"]').text()).toBe('Test Negroni')
    expect(wrapper.text()).toContain('30 ml')
    expect(wrapper.text()).toContain('Stir')
    expect(wrapper.text()).toContain('1.5 tbsp')
    expect(wrapper.text()).toContain('Drink responsibly')
    expect(wrapper.find('[data-test="make-poster"]').exists()).toBe(true)
  })
})
