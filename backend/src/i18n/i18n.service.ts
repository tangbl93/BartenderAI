import { Injectable } from '@nestjs/common';
import { Locale, normalizeLocale } from '../common/constants';

/**
 * Lightweight localized string bank for backend-generated, user-facing text
 * (safety notes, stub recipe phrasing, etc.). Real AI Providers receive the
 * locale and generate content directly; this is the deterministic fallback.
 *
 * zh-CN and zh-TW are kept as distinct entries (Simplified vs Traditional) to
 * honour the i18n requirement that zh-TW produce Traditional Chinese.
 */
type Bank = Record<Locale, string>;

const SAFETY_MODERATE: Bank = {
  en: 'Please drink responsibly and in moderation.',
  'zh-CN': '请适量饮用。',
  'zh-TW': '請適量飲用。',
  ja: '適量を守ってお楽しみください。',
  ko: '적당히 즐기세요.',
};

const SAFETY_UNDERAGE: Bank = {
  en: 'Alcohol is prohibited for minors.',
  'zh-CN': '未成年人禁止饮酒。',
  'zh-TW': '未成年人禁止飲酒。',
  ja: '未成年者の飲酒は禁止です。',
  ko: '미성년자 음주 금지.',
};

const SAFETY_RISK: Bank = {
  en: 'Avoid mixing ingredients that may upset your stomach; adjust to taste.',
  'zh-CN': '避免混合可能引起肠胃不适的材料，可按口味调整。',
  'zh-TW': '避免混合可能引起腸胃不適的材料，可依口味調整。',
  ja: '胃腸に負担をかける組み合わせは避け、好みに合わせて調整してください。',
  ko: '위장에 부담을 줄 수 있는 조합은 피하고 입맛에 맞게 조절하세요.',
};

@Injectable()
export class I18nService {
  moderateDrinkingNote(locale?: string): string {
    return SAFETY_MODERATE[normalizeLocale(locale)];
  }

  underageNote(locale?: string): string {
    return SAFETY_UNDERAGE[normalizeLocale(locale)];
  }

  riskNote(locale?: string): string {
    return SAFETY_RISK[normalizeLocale(locale)];
  }

  /** Standard safety notes including 适量饮用 / 未成年人禁饮 for any locale. */
  safetyNotes(locale?: string): string[] {
    return [
      this.moderateDrinkingNote(locale),
      this.underageNote(locale),
      this.riskNote(locale),
    ];
  }
}
