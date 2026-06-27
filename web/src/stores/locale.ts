import { defineStore } from 'pinia'
import type { LocaleCode } from '@/api/types'
import { resolveInitialLocale, setLocale, SUPPORTED_LOCALES } from '@/i18n'

export const useLocaleStore = defineStore('locale', {
  state: () => ({
    current: resolveInitialLocale() as LocaleCode,
  }),
  getters: {
    available: () => SUPPORTED_LOCALES,
  },
  actions: {
    change(locale: LocaleCode) {
      this.current = locale
      setLocale(locale)
    },
  },
})
