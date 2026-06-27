export const SUPPORTED_LOCALES = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

export const INGREDIENT_CATEGORIES = [
  'base_spirit',
  'drink',
  'fruit',
  'snack',
] as const;
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number];

export const POSTER_DIMENSIONS = [
  'home_closeup',
  'bar_commercial',
  'steps_long',
] as const;
export type PosterDimension = (typeof POSTER_DIMENSIONS)[number];

export const TEMPLATE_DIMENSIONS = [
  'home_closeup',
  'bar_commercial',
  'steps_long',
  'custom',
] as const;

export const USER_ROLES = ['user', 'operator', 'admin'] as const;
export type Role = (typeof USER_ROLES)[number];

/**
 * Resolve a localized string from a multi-language map, falling back to `en`.
 */
export function resolveLocalized(
  names: Record<string, string> | undefined | null,
  locale: string,
): string {
  if (!names) {
    return '';
  }
  return names[locale] || names[DEFAULT_LOCALE] || Object.values(names)[0] || '';
}

/**
 * Normalize an arbitrary locale string to a supported one, defaulting to `en`.
 */
export function normalizeLocale(locale?: string): Locale {
  if (locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
    return locale as Locale;
  }
  return DEFAULT_LOCALE;
}
