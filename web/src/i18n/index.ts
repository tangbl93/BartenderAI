import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import zhCN from '@/locales/zh-CN.json'
import zhTW from '@/locales/zh-TW.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'
import type { LocaleCode } from '@/api/types'

export const SUPPORTED_LOCALES: LocaleCode[] = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko']
export const FALLBACK_LOCALE: LocaleCode = 'en'
export const LOCALE_STORAGE_KEY = 'hba.locale'

export const LOCALE_LABELS: Record<LocaleCode, string> = {
  en: 'English',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
  ja: '日本語',
  ko: '한국어',
}

/** Map an arbitrary browser/device language tag to the closest supported locale. */
export function detectLocale(rawTags: readonly string[] = []): LocaleCode {
  for (const raw of rawTags) {
    const tag = raw.toLowerCase()
    // Exact / regional Chinese matching (keep simplified vs traditional distinct).
    if (tag.startsWith('zh')) {
      if (tag.includes('tw') || tag.includes('hant') || tag.includes('hk') || tag.includes('mo')) {
        return 'zh-TW'
      }
      return 'zh-CN'
    }
    const base = tag.split('-')[0]
    if (base === 'en') return 'en'
    if (base === 'ja') return 'ja'
    if (base === 'ko') return 'ko'
  }
  return FALLBACK_LOCALE
}

/** Resolve the initial locale: persisted choice → browser detection → fallback. */
export function resolveInitialLocale(): LocaleCode {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
    if (saved && (SUPPORTED_LOCALES as string[]).includes(saved)) {
      return saved as LocaleCode
    }
  } catch {
    /* ignore storage errors */
  }
  const navTags =
    typeof navigator !== 'undefined'
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : []
  return detectLocale(navTags)
}

export function persistLocale(locale: LocaleCode): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* ignore storage errors */
  }
}

export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: resolveInitialLocale(),
  fallbackLocale: FALLBACK_LOCALE,
  // Silence noisy fallback warnings in production; fallback still works.
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    en,
    'zh-CN': zhCN,
    'zh-TW': zhTW,
    ja,
    ko,
  },
})

export function setLocale(locale: LocaleCode): void {
  i18n.global.locale.value = locale
  persistLocale(locale)
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', locale)
  }
}
