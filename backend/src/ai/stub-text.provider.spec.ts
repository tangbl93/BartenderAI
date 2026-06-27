import { StubTextProvider } from './stub-text.provider';
import { I18nService } from '../i18n/i18n.service';
import { TextProviderIngredient } from './text-provider.interface';

function ing(
  id: string,
  category: string,
  enName: string,
  name = enName,
): TextProviderIngredient {
  return { id, category, name, enName };
}

describe('StubTextProvider', () => {
  const i18n = new I18nService();
  const provider = new StubTextProvider(i18n);

  describe('signature recognition', () => {
    it('matches Margarita from Tequila + Triple Sec + Lime and returns authored content', async () => {
      const ingredients = [
        ing('1', 'base_spirit', 'Tequila'),
        ing('2', 'base_spirit', 'Triple Sec'),
        ing('3', 'drink', 'Lime Juice'),
      ];
      const r = await provider.generateRecipe({
        ingredients,
        locale: 'en',
      });
      expect(r.name).toBe('Margarita');
      // Authored steps (NOT the generic 4-step "Stir gently..." template).
      expect(r.steps.length).toBeGreaterThanOrEqual(4);
      expect(r.steps.join(' ')).toContain('shaker');
      expect(r.alcoholRange).toBe('22% ABV');
      // Amounts come from the signature require.
      const tequila = r.items.find((i) => i.ingredientId === '1')!;
      expect(tequila.amount).toBe('45 ml');
      const tripleSec = r.items.find((i) => i.ingredientId === '2')!;
      expect(tripleSec.amount).toBe('20 ml');
    });

    it('matches Gin & Tonic', async () => {
      const r = await provider.generateRecipe({
        ingredients: [
          ing('g', 'base_spirit', 'Gin'),
          ing('t', 'drink', 'Tonic Water'),
        ],
        locale: 'en',
      });
      expect(r.name).toBe('Gin & Tonic');
      expect(r.alcoholRange).toBe('10% ABV');
    });

    it('returns Traditional Chinese for zh-TW on a match', async () => {
      const r = await provider.generateRecipe({
        ingredients: [
          ing('g', 'base_spirit', 'Gin', '琴酒'),
          ing('t', 'drink', 'Tonic Water', '通寧水'),
        ],
        locale: 'zh-TW',
      });
      expect(r.name).toBe('琴湯尼');
      // Traditional 「攪」 not simplified 「搅」.
      expect(r.steps.join(' ')).toContain('攪');
    });
  });

  describe('generic composer (no match)', () => {
    it('falls back to a generic drink containing both ingredient names', async () => {
      const r = await provider.generateRecipe({
        ingredients: [
          ing('v', 'base_spirit', 'Vodka'),
          ing('c', 'drink', 'Cola'),
        ],
        locale: 'en',
      });
      expect(r.name).not.toBe('Margarita');
      expect(r.name).toContain('Vodka');
      expect(r.name).toContain('Cola');
      expect(r.alcoholRange).toBe('8-12% ABV');
    });

    it('generic composer is locale-aware (zh-TW Traditional)', async () => {
      const r = await provider.generateRecipe({
        ingredients: [
          ing('v', 'base_spirit', 'Vodka', '伏特加'),
          ing('c', 'drink', 'Cola', '可樂'),
        ],
        locale: 'zh-TW',
      });
      expect(r.name).toContain('特調');
      expect(r.name).not.toContain('特调');
    });
  });

  describe('determinism', () => {
    it('returns identical output for identical input', async () => {
      const req = {
        ingredients: [
          ing('1', 'base_spirit', 'Tequila'),
          ing('2', 'base_spirit', 'Triple Sec'),
          ing('3', 'drink', 'Lime Juice'),
        ],
        locale: 'en' as const,
      };
      const a = await provider.generateRecipe(req);
      const b = await provider.generateRecipe(req);
      expect(a).toEqual(b);
    });
  });
});
