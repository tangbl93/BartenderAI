import { describe, it, expect, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import DashboardView from './DashboardView.vue'
import ModerationView from './ModerationView.vue'
import IngredientsView from './IngredientsView.vue'

// vi.mock is hoisted above any top-level const, so build the mocked api in vi.hoisted.
const { moderate, apiMock } = vi.hoisted(() => {
  const moderateFn = vi.fn().mockResolvedValue(undefined)
  return {
    moderate: moderateFn,
    apiMock: {
      dashboard: vi.fn().mockResolvedValue({
        recipeCount: 12,
        posterCount: 30,
        submissionCount: 5,
        approvalRate: 0.8,
        topIngredients: [{ name: 'Vodka', count: 10 }],
        topStyles: [{ name: 'Bar', count: 7 }],
      }),
      moderationQueue: vi.fn().mockResolvedValue([
        { id: 'lab-1', recipeId: 'r1', imageUrl: 'x', result: 'success', moderationStatus: 'pending', createdAt: '2026-01-01' },
      ]),
      moderate: moderateFn,
      adminListIngredients: vi.fn().mockResolvedValue([
        { id: 'a', category: 'base_spirit', name: 'Vodka', enabled: true },
      ]),
      adminUpdateIngredient: vi.fn().mockResolvedValue({ id: 'a', category: 'base_spirit', name: 'Vodka', enabled: true }),
      adminDeleteIngredient: vi.fn().mockResolvedValue(undefined),
    },
  }
})

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api')
  return { ...actual, api: apiMock }
})

describe('admin views', () => {
  it('DashboardView renders metrics and charts', async () => {
    const wrapper = mount(DashboardView)
    await flushPromises()
    expect(wrapper.find('[data-test="recipe-count"]').text()).toBe('12')
    expect(wrapper.text()).toContain('Vodka')
    expect(wrapper.text()).toContain('80%')
  })

  it('IngredientsView lists ingredients with CRUD controls', async () => {
    const wrapper = mount(IngredientsView)
    await flushPromises()
    expect(wrapper.text()).toContain('Vodka')
    expect(wrapper.find('[data-test="add-ingredient"]').exists()).toBe(true)
  })

  it('ModerationView blocks reject without a reason, then allows it', async () => {
    const wrapper = mount(ModerationView)
    await flushPromises()

    // Reject with empty reason -> validation error, no API call.
    await wrapper.find('[data-test="reject-lab-1"]').trigger('click')
    expect(moderate).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('reason')

    // Provide a reason -> moderate called with reject + reason.
    await wrapper.find('[data-test="mod-lab-1"] input').setValue('inappropriate')
    await wrapper.find('[data-test="reject-lab-1"]').trigger('click')
    await flushPromises()
    expect(moderate).toHaveBeenCalledWith('lab-1', { decision: 'reject', reason: 'inappropriate' })
  })
})
