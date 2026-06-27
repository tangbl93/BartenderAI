import { describe, it, expect, beforeEach, vi } from 'vitest'
import { detectLocale, resolveInitialLocale, SUPPORTED_LOCALES, FALLBACK_LOCALE } from './index'
import en from '@/locales/en.json'
import zhCN from '@/locales/zh-CN.json'
import zhTW from '@/locales/zh-TW.json'
import ja from '@/locales/ja.json'
import ko from '@/locales/ko.json'

const LOCALES: Record<string, unknown> = { en, 'zh-CN': zhCN, 'zh-TW': zhTW, ja, ko }

function flatten(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix]
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  )
}

describe('i18n locale completeness', () => {
  const baseKeys = flatten(en).sort()

  for (const loc of SUPPORTED_LOCALES) {
    it(`${loc} has exactly the same keys as en (no missing/extra/placeholder)`, () => {
      const keys = flatten(LOCALES[loc]).sort()
      expect(keys).toEqual(baseKeys)
    })

    it(`${loc} has no empty or __MISSING__ placeholder values`, () => {
      const stack: unknown[] = [LOCALES[loc]]
      while (stack.length) {
        const node = stack.pop()
        if (typeof node === 'string') {
          expect(node.length).toBeGreaterThan(0)
          expect(node).not.toContain('__MISSING__')
        } else if (node && typeof node === 'object') {
          stack.push(...Object.values(node as Record<string, unknown>))
        }
      }
    })
  }

  it('zh-CN and zh-TW are distinct (simplified vs traditional)', () => {
    // appName differs: 调酒师 (simplified) vs 調酒師 (traditional)
    expect(zhCN.common.appName).not.toEqual(zhTW.common.appName)
  })
})

describe('detectLocale', () => {
  it('maps zh-TW / zh-Hant / zh-HK to zh-TW', () => {
    expect(detectLocale(['zh-TW'])).toBe('zh-TW')
    expect(detectLocale(['zh-Hant'])).toBe('zh-TW')
    expect(detectLocale(['zh-HK'])).toBe('zh-TW')
  })
  it('maps generic zh / zh-CN to zh-CN', () => {
    expect(detectLocale(['zh'])).toBe('zh-CN')
    expect(detectLocale(['zh-CN'])).toBe('zh-CN')
  })
  it('maps ja / ko / en regional tags to base locale', () => {
    expect(detectLocale(['ja-JP'])).toBe('ja')
    expect(detectLocale(['ko-KR'])).toBe('ko')
    expect(detectLocale(['en-US'])).toBe('en')
  })
  it('falls back to en for unsupported languages', () => {
    expect(detectLocale(['fr-FR', 'de'])).toBe(FALLBACK_LOCALE)
    expect(detectLocale([])).toBe(FALLBACK_LOCALE)
  })
})

describe('resolveInitialLocale persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('uses a persisted locale when present', () => {
    localStorage.setItem('hba.locale', 'ja')
    expect(resolveInitialLocale()).toBe('ja')
  })

  it('ignores an invalid persisted locale and detects from browser', () => {
    localStorage.setItem('hba.locale', 'xx-YY')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ko-KR'])
    expect(resolveInitialLocale()).toBe('ko')
  })
})
