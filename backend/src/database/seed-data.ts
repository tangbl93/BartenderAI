import { IngredientCategory } from '../common/constants';
import { LayoutConfig, TextRenderMode } from './entities/style-template.entity';

export interface SeedIngredient {
  category: IngredientCategory;
  names: Record<string, string>;
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  // ---- base_spirit ----
  {
    category: 'base_spirit',
    names: { en: 'Vodka', 'zh-CN': '伏特加', 'zh-TW': '伏特加', ja: 'ウォッカ', ko: '보드카' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Gin', 'zh-CN': '金酒', 'zh-TW': '琴酒', ja: 'ジン', ko: '진' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Rum', 'zh-CN': '朗姆酒', 'zh-TW': '蘭姆酒', ja: 'ラム', ko: '럼' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Whiskey', 'zh-CN': '威士忌', 'zh-TW': '威士忌', ja: 'ウイスキー', ko: '위스키' },
  },
  // ---- drink ----
  {
    category: 'drink',
    names: { en: 'Cola', 'zh-CN': '可乐', 'zh-TW': '可樂', ja: 'コーラ', ko: '콜라' },
  },
  {
    category: 'drink',
    names: { en: 'Tonic Water', 'zh-CN': '汤力水', 'zh-TW': '通寧水', ja: 'トニックウォーター', ko: '토닉워터' },
  },
  {
    category: 'drink',
    names: { en: 'Orange Juice', 'zh-CN': '橙汁', 'zh-TW': '柳橙汁', ja: 'オレンジジュース', ko: '오렌지주스' },
  },
  {
    category: 'drink',
    names: { en: 'Soda Water', 'zh-CN': '苏打水', 'zh-TW': '蘇打水', ja: 'ソーダ水', ko: '탄산수' },
  },
  // ---- fruit ----
  {
    category: 'fruit',
    names: { en: 'Lemon', 'zh-CN': '柠檬', 'zh-TW': '檸檬', ja: 'レモン', ko: '레몬' },
  },
  {
    category: 'fruit',
    names: { en: 'Lime', 'zh-CN': '青柠', 'zh-TW': '萊姆', ja: 'ライム', ko: '라임' },
  },
  {
    category: 'fruit',
    names: { en: 'Mint', 'zh-CN': '薄荷', 'zh-TW': '薄荷', ja: 'ミント', ko: '민트' },
  },
  {
    category: 'fruit',
    names: { en: 'Strawberry', 'zh-CN': '草莓', 'zh-TW': '草莓', ja: 'いちご', ko: '딸기' },
  },
  // ---- snack ----
  {
    category: 'snack',
    names: { en: 'Salted Nuts', 'zh-CN': '咸味坚果', 'zh-TW': '鹹味堅果', ja: '塩ナッツ', ko: '소금 견과' },
  },
  {
    category: 'snack',
    names: { en: 'Dark Chocolate', 'zh-CN': '黑巧克力', 'zh-TW': '黑巧克力', ja: 'ダークチョコ', ko: '다크초콜릿' },
  },
  {
    category: 'snack',
    names: { en: 'Potato Chips', 'zh-CN': '薯片', 'zh-TW': '洋芋片', ja: 'ポテトチップス', ko: '감자칩' },
  },
];

export interface SeedTemplate {
  name: string;
  dimension: string;
  prompt: string;
  layout: LayoutConfig;
  textRenderMode: TextRenderMode;
}

export const SEED_TEMPLATES: SeedTemplate[] = [
  {
    name: '居家微酿特写',
    dimension: 'home_closeup',
    prompt:
      'A realistic smartphone-style close-up photo of a home-made cocktail on a cozy wooden table, warm ambient lighting, ice cubes refracting light, shallow depth of field, instagram-worthy home check-in photo.',
    layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
    textRenderMode: 'backend',
  },
  {
    name: '酒吧商业宣传海报',
    dimension: 'bar_commercial',
    // 黑金 / 赛博朋克 commercial bar poster; art text rendered by the model.
    prompt:
      'A premium black-gold cyberpunk commercial bar poster. The cocktail is teleported onto a high-end neon bar counter. Overlay artistic-typography drink name (artistic title), an English bartender signature, an exclusive recipe label, and a high-mood tagline. Nightclub / bar grand-opening promotional quality.',
    layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
    textRenderMode: 'model',
  },
  {
    name: '步骤拆解长图',
    dimension: 'steps_long',
    prompt:
      'A hand-drawn / minimalist illustration long image breaking down the cocktail steps as a cute, clear social-media tutorial, suitable for Xiaohongshu / Weibo sharing.',
    layout: { textAlign: 'left', watermarkPosition: 'bottom-left' },
    textRenderMode: 'backend',
  },
];
