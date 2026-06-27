import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import OnboardingTour from './OnboardingTour.vue'
import { useOnboardingStore } from '@/stores/onboarding'

describe('OnboardingTour', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('is hidden until opened and steps through to completion', async () => {
    const wrapper = mount(OnboardingTour)
    const store = useOnboardingStore()

    // hidden initially
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)

    store.reopen()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    // 4 steps: clicking next 4 times finishes the tour
    for (let i = 0; i < 4; i++) {
      await wrapper.find('[data-test="next"]').trigger('click')
    }
    expect(store.done).toBe(true)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('skip closes the tour and marks done', async () => {
    const wrapper = mount(OnboardingTour)
    const store = useOnboardingStore()
    store.reopen()
    await wrapper.vm.$nextTick()
    await wrapper.find('[data-test="skip"]').trigger('click')
    expect(store.done).toBe(true)
  })
})
