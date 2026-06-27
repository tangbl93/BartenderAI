import { Injectable } from '@nestjs/common';
import { I18nService } from '../i18n/i18n.service';
import { Locale } from '../common/constants';
import {
  GeneratedRecipe,
  GeneratedRecipeItem,
  TextGenerationRequest,
  TextProvider,
} from './text-provider.interface';

interface LocalePhrases {
  namePrefix: string;
  nameSuffix: string;
  tagline: (name: string) => string;
  steps: (names: string[]) => string[];
  toolName: string;
  toolAlt: string;
}

/**
 * Deterministic stub text provider. Builds a valid recipe JSON using ONLY the
 * selected ingredients. Used for dev and tests so the full pipeline runs with
 * zero external services. Output is locale-aware (zh-TW = Traditional Chinese).
 */
@Injectable()
export class StubTextProvider implements TextProvider {
  constructor(private readonly i18n: I18nService) {}

  private phrases(locale: Locale): LocalePhrases {
    const map: Record<Locale, LocalePhrases> = {
      en: {
        namePrefix: 'Midnight',
        nameSuffix: 'Fusion',
        tagline: (n) => `A cozy home-brewed ${n} for a mellow buzz.`,
        steps: (names) => [
          `Chill your glass.`,
          `Add ${names.join(', ')} in order.`,
          `Stir gently for 10 seconds.`,
          `Garnish and serve.`,
        ],
        toolName: 'jigger',
        toolAlt: '1 jigger ≈ 1.5 tablespoons',
      },
      'zh-CN': {
        namePrefix: '午夜',
        nameSuffix: '微醺',
        tagline: (n) => `一杯居家自调的「${n}」，献给微醺的夜晚。`,
        steps: (names) => [
          `先把杯子冰镇一下。`,
          `依次加入 ${names.join('、')}。`,
          `轻轻搅拌约 10 秒。`,
          `点缀装饰，即可享用。`,
        ],
        toolName: '量酒器',
        toolAlt: '1 量酒器 ≈ 1.5 汤匙',
      },
      'zh-TW': {
        namePrefix: '午夜',
        nameSuffix: '微醺',
        tagline: (n) => `一杯居家自調的「${n}」，獻給微醺的夜晚。`,
        steps: (names) => [
          `先把杯子冰鎮一下。`,
          `依序加入 ${names.join('、')}。`,
          `輕輕攪拌約 10 秒。`,
          `點綴裝飾，即可享用。`,
        ],
        toolName: '量酒器',
        toolAlt: '1 量酒器 ≈ 1.5 湯匙',
      },
      ja: {
        namePrefix: 'ミッドナイト',
        nameSuffix: 'フュージョン',
        tagline: (n) => `おうちで作る「${n}」、ほろ酔いの夜に。`,
        steps: (names) => [
          `グラスを冷やします。`,
          `${names.join('、')} を順番に加えます。`,
          `10秒ほど軽く混ぜます。`,
          `飾り付けて完成です。`,
        ],
        toolName: 'ジガー',
        toolAlt: 'ジガー1杯 ≈ 大さじ1.5',
      },
      ko: {
        namePrefix: '미드나잇',
        nameSuffix: '퓨전',
        tagline: (n) => `집에서 만드는 「${n}」, 살짝 취하는 밤을 위해.`,
        steps: (names) => [
          `잔을 차갑게 준비하세요.`,
          `${names.join(', ')} 순서대로 넣으세요.`,
          `10초 정도 가볍게 저어주세요.`,
          `장식 후 즐기세요.`,
        ],
        toolName: '지거',
        toolAlt: '지거 1잔 ≈ 큰술 1.5',
      },
    };
    return map[locale];
  }

  async generateRecipe(req: TextGenerationRequest): Promise<GeneratedRecipe> {
    const { ingredients, locale } = req;
    const p = this.phrases(locale);

    const hasSpirit = ingredients.some((i) => i.category === 'base_spirit');
    const names = ingredients.map((i) => i.name);
    // Deterministic creative name built from first ingredient + locale phrase.
    const name = `${p.namePrefix} ${names[0]} ${p.nameSuffix}`.trim();

    // Precise amounts: spirits 45ml, drinks 90ml, fruit/snack 1 piece/garnish.
    const items: GeneratedRecipeItem[] = ingredients.map((ing, idx) => {
      let amount: string;
      switch (ing.category) {
        case 'base_spirit':
          amount = '45 ml';
          break;
        case 'drink':
          amount = '90 ml';
          break;
        case 'fruit':
          amount = '1 pc';
          break;
        default:
          amount = 'to taste';
      }
      return {
        ingredientId: ing.id,
        name: ing.name,
        amount,
        // First two ingredients are core; extras are optional.
        optional: idx >= 2,
      };
    });

    const alcoholRange = hasSpirit ? '8-12% ABV' : '0% ABV';

    return {
      name,
      tagline: p.tagline(name),
      items,
      steps: p.steps(names),
      toolSubstitutions: [{ tool: p.toolName, homeAlternative: p.toolAlt }],
      alcoholRange,
      safetyNotes: this.i18n.safetyNotes(locale),
    };
  }
}
