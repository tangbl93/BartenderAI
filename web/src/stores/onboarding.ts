import { defineStore } from 'pinia'

const ONBOARDING_KEY = 'hba.onboarding.done'

function loadDone(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1'
  } catch {
    return false
  }
}

export const useOnboardingStore = defineStore('onboarding', {
  state: () => ({
    done: loadDone(),
    open: false,
  }),
  getters: {
    /** Should the tour auto-show? Only when it has never been completed/skipped. */
    shouldAutoShow: (s): boolean => !s.done,
  },
  actions: {
    maybeAutoOpen() {
      if (!this.done) this.open = true
    },
    /** Re-open from the help entry (does not reset the "done" flag). */
    reopen() {
      this.open = true
    },
    finish() {
      this.open = false
      this.done = true
      try {
        localStorage.setItem(ONBOARDING_KEY, '1')
      } catch {
        /* ignore storage errors */
      }
    },
    skip() {
      this.finish()
    },
  },
})
