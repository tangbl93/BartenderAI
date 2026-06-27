import { IngredientCategory } from '../common/constants';
import { LayoutConfig, TextRenderMode } from './entities/style-template.entity';

export interface SeedIngredient {
  category: IngredientCategory;
  names: Record<string, string>;
}

export const SEED_INGREDIENTS: SeedIngredient[] = [
  // ---- base_spirit (14) ----
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
    names: { en: 'White Rum', 'zh-CN': '白朗姆酒', 'zh-TW': '白蘭姆酒', ja: 'ホワイトラム', ko: '화이트 럼' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Dark Rum', 'zh-CN': '黑朗姆酒', 'zh-TW': '黑蘭姆酒', ja: 'ダークラム', ko: '다크 럼' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Tequila', 'zh-CN': '龙舌兰', 'zh-TW': '龍舌蘭', ja: 'テキーラ', ko: '데킬라' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Bourbon', 'zh-CN': '波本威士忌', 'zh-TW': '波本威士忌', ja: 'バーボン', ko: '버번' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Scotch', 'zh-CN': '苏格兰威士忌', 'zh-TW': '蘇格蘭威士忌', ja: 'スコッチ', ko: '스카치' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Brandy', 'zh-CN': '白兰地', 'zh-TW': '白蘭地', ja: 'ブランデー', ko: '브랜디' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Triple Sec', 'zh-CN': '橙味利口酒', 'zh-TW': '橙酒', ja: 'トリプルセック', ko: '트리플 섹' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Sweet Vermouth', 'zh-CN': '甜味美思', 'zh-TW': '甜苦艾酒', ja: 'スイートベルモット', ko: '스위트 버무스' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Campari', 'zh-CN': '坎帕利', 'zh-TW': '坎帕利', ja: 'カンパリ', ko: '캄파리' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Aperol', 'zh-CN': '阿佩罗', 'zh-TW': '阿佩羅', ja: 'アペロール', ko: '아페롤' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Coffee Liqueur', 'zh-CN': '咖啡利口酒', 'zh-TW': '咖啡利口酒', ja: 'コーヒーリキュール', ko: '커피 리큐어' },
  },
  {
    category: 'base_spirit',
    names: { en: 'Angostura Bitters', 'zh-CN': '安古斯图拉苦精', 'zh-TW': '安古斯圖拉苦精', ja: 'アンゴスチュラ・ビターズ', ko: '라고스투라 비터즈' },
  },
  // ---- drink (14) ----
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
  {
    category: 'drink',
    names: { en: 'Cranberry Juice', 'zh-CN': '蔓越莓汁', 'zh-TW': '蔓越莓汁', ja: 'クランベリージュース', ko: '크랜베리 주스' },
  },
  {
    category: 'drink',
    names: { en: 'Pineapple Juice', 'zh-CN': '菠萝汁', 'zh-TW': '鳳梨汁', ja: 'パイナップルジュース', ko: '파인애플 주스' },
  },
  {
    category: 'drink',
    names: { en: 'Ginger Beer', 'zh-CN': '姜啤', 'zh-TW': '薑啤酒', ja: 'ジンジャービール', ko: '진저 비어' },
  },
  {
    category: 'drink',
    names: { en: 'Lime Juice', 'zh-CN': '青柠汁', 'zh-TW': '萊姆汁', ja: 'ライムジュース', ko: '라임 주스' },
  },
  {
    category: 'drink',
    names: { en: 'Simple Syrup', 'zh-CN': '糖浆', 'zh-TW': '糖漿', ja: 'シロップ', ko: '시럽' },
  },
  {
    category: 'drink',
    names: { en: 'Grenadine', 'zh-CN': '红石榴糖浆', 'zh-TW': '紅石榴糖漿', ja: 'グレナデンシロップ', ko: '그레나딘 시럽' },
  },
  {
    category: 'drink',
    names: { en: 'Coconut Cream', 'zh-CN': '椰浆', 'zh-TW': '椰漿', ja: 'ココナッツクリーム', ko: '코코넛 크림' },
  },
  {
    category: 'drink',
    names: { en: 'Tomato Juice', 'zh-CN': '番茄汁', 'zh-TW': '番茄汁', ja: 'トマトジュース', ko: '토마토 주스' },
  },
  {
    category: 'drink',
    names: { en: 'Espresso', 'zh-CN': '浓缩咖啡', 'zh-TW': '濃縮咖啡', ja: 'エスプレッソ', ko: '에스프레소' },
  },
  {
    category: 'drink',
    names: { en: 'Prosecco', 'zh-CN': '普罗赛克', 'zh-TW': '普羅賽克', ja: 'プロセッコ', ko: '프로세코' },
  },
  // ---- fruit (8) ----
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
  {
    category: 'fruit',
    names: { en: 'Orange', 'zh-CN': '橙子', 'zh-TW': '柳橙', ja: 'オレンジ', ko: '오렌지' },
  },
  {
    category: 'fruit',
    names: { en: 'Olive', 'zh-CN': '橄榄', 'zh-TW': '橄欖', ja: 'オリーブ', ko: '올리브' },
  },
  {
    category: 'fruit',
    names: { en: 'Cherry', 'zh-CN': '樱桃', 'zh-TW': '櫻桃', ja: 'チェリー', ko: '체리' },
  },
  {
    category: 'fruit',
    names: { en: 'Rosemary', 'zh-CN': '迷迭香', 'zh-TW': '迷迭香', ja: 'ローズマリー', ko: '로즈마리' },
  },
  // ---- snack (3) ----
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
