import { Injectable } from '@nestjs/common';
import { I18nService } from '../i18n/i18n.service';
import { Locale } from '../common/constants';
import {
  GeneratedRecipe,
  GeneratedRecipeItem,
  TextGenerationRequest,
  TextProviderIngredient,
} from './text-provider.interface';
import { COCKTAIL_SIGNATURES, CocktailSignature } from './cocktail-signatures';

/**
 * Deterministic recipe generator (no LLM). Two modes:
 *  1. RECOGNIZE — if the selected ingredients contain every required en-name
 *     of a CocktailSignature, return that signature's authored name/tagline/
 *     steps (locale-resolved) + signature amounts + signature ABV.
 *  2. COMPOSE — otherwise build a locale-aware "Smash"/"特调" style drink
 *     from the spirit + mixer + garnish that were actually selected.
 *
 * Output is locale-aware (zh-TW = Traditional Chinese).
 */
@Injectable()
export class StubTextProvider {
  constructor(private readonly i18n: I18nService) {}

  async generateRecipe(req: TextGenerationRequest): Promise<GeneratedRecipe> {
    const { ingredients, locale } = req;

    const sig = this.matchSignature(ingredients);
    if (sig) {
      return this.fromSignature(sig, ingredients, locale);
    }
    return this.composeGeneric(ingredients, locale);
  }

  /** First signature (in defined order, most-specific-first) whose required
   *  en-names are all present in the selected set (case-insensitive). */
  private matchSignature(
    ingredients: TextProviderIngredient[],
  ): CocktailSignature | undefined {
    const selected = new Set(
      ingredients
        .map((i) => (i.enName ?? i.name).toLowerCase().trim())
        .filter(Boolean),
    );
    return COCKTAIL_SIGNATURES.find((s) =>
      s.require.every((r) => selected.has(r.enName.toLowerCase().trim())),
    );
  }

  private fromSignature(
    sig: CocktailSignature,
    ingredients: TextProviderIngredient[],
    locale: Locale,
  ): GeneratedRecipe {
    // Map sig amounts onto selected ingredients by en-name; anything selected
    // but not in the signature keeps a category-based default amount.
    const amountByEn = new Map<string, string>();
    for (const r of sig.require) {
      amountByEn.set(r.enName.toLowerCase().trim(), r.amount);
    }
    const requiredEns = new Set(
      sig.require.map((r) => r.enName.toLowerCase().trim()),
    );

    const items: GeneratedRecipeItem[] = ingredients.map((ing, idx) => {
      const en = (ing.enName ?? ing.name).toLowerCase().trim();
      const amount =
        amountByEn.get(en) ?? this.defaultAmount(ing.category);
      return {
        ingredientId: ing.id,
        name: ing.name,
        amount,
        // Ingredients that are part of the signature are core; any extra
        // selected ingredient is treated as optional garnish.
        optional: !requiredEns.has(en) || idx >= 2,
      };
    });

    return {
      name: sig.name[locale],
      tagline: sig.tagline[locale],
      items,
      steps: sig.steps[locale],
      toolSubstitutions: [this.toolSub(locale)],
      alcoholRange: sig.abv,
      safetyNotes: this.i18n.safetyNotes(locale),
    };
  }

  /** Improved locale-aware generic composer: names the drink from its spirit
   *  and first mixer (e.g. en "Vodka Cola Smash", zh "伏特加可乐特调"). */
  private composeGeneric(
    ingredients: TextProviderIngredient[],
    locale: Locale,
  ): GeneratedRecipe {
    const spirit = ingredients.find((i) => i.category === 'base_spirit');
    const mixer = ingredients.find((i) => i.category === 'drink');
    const garnish = ingredients.find((i) => i.category === 'fruit');
    const names = ingredients.map((i) => i.name);

    const spiritName = spirit?.name ?? names[0];
    const mixerName = mixer?.name ?? names[1] ?? names[0];

    const displayName =
      locale === 'en'
        ? `${spiritName} ${mixerName} Smash`
        : locale === 'zh-CN'
          ? `${spiritName}${mixerName}特调`
          : locale === 'zh-TW'
            ? `${spiritName}${mixerName}特調`
            : locale === 'ja'
              ? `${spiritName} ${mixerName} ブレンド`
              : `${spiritName} ${mixerName} 블렌드`;

    const tagline =
      locale === 'en'
        ? `A bright home-built ${spiritName.toLowerCase()} smash with ${mixerName.toLowerCase()}.`
        : locale === 'zh-CN'
          ? `一杯居家自调的「${spiritName}${mixerName}」，献给微醺的夜晚。`
          : locale === 'zh-TW'
            ? `一杯居家自調的「${spiritName}${mixerName}」，獻給微醺的夜晚。`
            : locale === 'ja'
              ? `おうちで作る「${spiritName}${mixerName}」、ほろ酔いの夜に。`
              : `집에서 만드는 「${spiritName} ${mixerName}」, 살짝 취하는 밤을 위해.`;

    const items: GeneratedRecipeItem[] = ingredients.map((ing, idx) => ({
      ingredientId: ing.id,
      name: ing.name,
      amount: this.defaultAmount(ing.category),
      optional: idx >= 2,
    }));

    const steps = this.genericSteps(names, locale, !!garnish);
    const hasSpirit = !!spirit;

    return {
      name: displayName,
      tagline,
      items,
      steps,
      toolSubstitutions: [this.toolSub(locale)],
      alcoholRange: hasSpirit ? '8-12% ABV' : '0% ABV',
      safetyNotes: this.i18n.safetyNotes(locale),
    };
  }

  private defaultAmount(category: string): string {
    switch (category) {
      case 'base_spirit':
        return '45 ml';
      case 'drink':
        return '90 ml';
      case 'fruit':
        return '1 pc';
      default:
        return 'to taste';
    }
  }

  private toolSub(locale: Locale): { tool: string; homeAlternative: string } {
    const map: Record<Locale, { tool: string; homeAlternative: string }> = {
      en: { tool: 'jigger', homeAlternative: '1 jigger ≈ 1.5 tablespoons' },
      'zh-CN': { tool: '量酒器', homeAlternative: '1 量酒器 ≈ 1.5 汤匙' },
      'zh-TW': { tool: '量酒器', homeAlternative: '1 量酒器 ≈ 1.5 湯匙' },
      ja: { tool: 'ジガー', homeAlternative: 'ジガー1杯 ≈ 大さじ1.5' },
      ko: { tool: '지거', homeAlternative: '지거 1잔 ≈ 큰술 1.5' },
    };
    return map[locale];
  }

  private genericSteps(
    names: string[],
    locale: Locale,
    hasGarnish: boolean,
  ): string[] {
    const list = names.join(
      locale === 'en' || locale === 'ko' ? ', ' : '、',
    );
    switch (locale) {
      case 'zh-CN':
        return [
          `先把杯子冰镇一下。`,
          `依次加入 ${list}。`,
          `轻轻搅拌约 10 秒。`,
          hasGarnish ? `点缀装饰，即可享用。` : `即可享用。`,
        ];
      case 'zh-TW':
        return [
          `先把杯子冰鎮一下。`,
          `依序加入 ${list}。`,
          `輕輕攪拌約 10 秒。`,
          hasGarnish ? `點綴裝飾，即可享用。` : `即可享用。`,
        ];
      case 'ja':
        return [
          `グラスを冷やします。`,
          `${list} を順番に加えます。`,
          `10秒ほど軽く混ぜます。`,
          hasGarnish ? `飾り付けて完成です。` : `完成です。`,
        ];
      case 'ko':
        return [
          `잔을 차갑게 준비하세요.`,
          `${list} 순서대로 넣으세요.`,
          `10초 정도 가볍게 저어주세요.`,
          hasGarnish ? `장식 후 즐기세요.` : `즐기세요.`,
        ];
      default:
        return [
          `Chill your glass.`,
          `Add ${list} in order.`,
          `Stir gently for 10 seconds.`,
          hasGarnish ? `Garnish and serve.` : `Serve and enjoy.`,
        ];
    }
  }
}
