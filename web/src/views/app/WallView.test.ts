import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import WallView from './WallView.vue'
import type { WallSort } from '@/api/types'

const { getWall } = vi.hoisted(() => {
  const approved = [
    { id: 'w1', recipeId: 'r1', imageUrl: 'x', result: 'success', moderationStatus: 'approved', createdAt: '2026-01-02', likes: 9, recipeName: 'Alpha' },
    { id: 'w2', recipeId: 'r2', imageUrl: 'y', result: 'success', moderationStatus: 'approved', createdAt: '2026-01-03', likes: 2, recipeName: 'Beta' },
  ]
  return {
    getWall: vi.fn((sort: WallSort) =>
      Promise.resolve(
        sort === 'hot'
          ? [...approved].sort((a, b) => (b.likes || 0) - (a.likes || 0))
          : [...approved].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      ),
    ),
  }
})

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api')
  return { ...actual, api: { getWall } }
})

describe('WallView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows approved entries and re-fetches when sort changes', async () => {
    const wrapper = mount(WallView)
    await flushPromises()
    expect(getWall).toHaveBeenCalledWith('time')
    expect(wrapper.text()).toContain('Alpha')
    expect(wrapper.text()).toContain('Beta')

    await wrapper.find('[data-test="sort-hot"]').trigger('click')
    await flushPromises()
    expect(getWall).toHaveBeenCalledWith('hot')
  })
})
