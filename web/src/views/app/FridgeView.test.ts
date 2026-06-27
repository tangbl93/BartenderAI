import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import FridgeView from './FridgeView.vue'

const { apiMock } = vi.hoisted(() => {
  const ingredients = [
    { id: 'a', category: 'base_spirit', name: 'Vodka', enabled: true },
    { id: 'b', category: 'drink', name: 'Cola', enabled: true },
  ]
  const examples = [
    {
      id: 'example-mojito',
      name: 'Midnight Mojito',
      tagline: 'cool',
      locale: 'en',
      items: [{ ingredientId: 'a', name: 'Vodka', amount: '45 ml' }],
      steps: [],
      toolSubstitutions: [],
      alcoholRange: '10%',
      safetyNotes: [],
      isExample: true,
    },
  ]
  return {
    apiMock: {
      getIngredients: vi.fn().mockResolvedValue(ingredients),
      getExamples: vi.fn().mockResolvedValue(examples),
      generateRecipe: vi.fn(),
    },
  }
})

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api')
  return { ...actual, api: apiMock }
})

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/app/fridge', name: 'fridge', component: FridgeView },
      { path: '/app/recipe/:id', name: 'recipe', component: { template: '<div />' } },
    ],
  })
}

describe('FridgeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders categories, ingredients and example cards', async () => {
    const router = makeRouter()
    router.push('/app/fridge')
    await router.isReady()
    const wrapper = mount(FridgeView, { global: { plugins: [router] } })
    await flushPromises()

    expect(wrapper.find('[data-test="ing-a"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="ing-b"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="example-card"]').exists()).toBe(true)
  })

  it('enables generate only after 2+ ingredients are selected', async () => {
    const router = makeRouter()
    router.push('/app/fridge')
    await router.isReady()
    const wrapper = mount(FridgeView, { global: { plugins: [router] } })
    await flushPromises()

    const generate = wrapper.find('[data-test="generate"]')
    expect((generate.element as HTMLButtonElement).disabled).toBe(true)

    await wrapper.find('[data-test="ing-a"]').trigger('click')
    await wrapper.find('[data-test="ing-b"]').trigger('click')
    expect((generate.element as HTMLButtonElement).disabled).toBe(false)
  })
})
