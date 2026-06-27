import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useOnboardingStore } from './onboarding'

describe('onboarding store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('auto-opens on first visit', () => {
    const s = useOnboardingStore()
    expect(s.shouldAutoShow).toBe(true)
    s.maybeAutoOpen()
    expect(s.open).toBe(true)
  })

  it('does not re-force after finishing/skipping (persisted)', () => {
    const s = useOnboardingStore()
    s.skip()
    expect(s.open).toBe(false)
    expect(s.done).toBe(true)

    // simulate a fresh session/store
    setActivePinia(createPinia())
    const s2 = useOnboardingStore()
    expect(s2.shouldAutoShow).toBe(false)
    s2.maybeAutoOpen()
    expect(s2.open).toBe(false)
  })

  it('can be re-opened manually from help without resetting done', () => {
    const s = useOnboardingStore()
    s.finish()
    s.reopen()
    expect(s.open).toBe(true)
    expect(s.done).toBe(true)
  })
})
