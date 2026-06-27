import type {
  Ingredient,
  IngredientCategory,
  LocaleCode,
  Recipe,
  StyleTemplate,
} from '../types'

export type IngredientSeed = {
  id: string
  category: IngredientCategory
  names: Record<LocaleCode, string>
  enabled: boolean
}

// Multi-language ingredient seed. zh-CN and zh-TW intentionally differ.
export const ingredientSeed: IngredientSeed[] = [
  { id: 'ing-vodka', category: 'base_spirit', enabled: true, names: { en: 'Vodka', 'zh-CN': '伏特加', 'zh-TW': '伏特加', ja: 'ウォッカ', ko: '보드카' } },
  { id: 'ing-gin', category: 'base_spirit', enabled: true, names: { en: 'Gin', 'zh-CN': '金酒', 'zh-TW': '琴酒', ja: 'ジン', ko: '진' } },
  { id: 'ing-rum', category: 'base_spirit', enabled: true, names: { en: 'White Rum', 'zh-CN': '白朗姆酒', 'zh-TW': '白蘭姆酒', ja: 'ホワイトラム', ko: '화이트 럼' } },
  { id: 'ing-whisky', category: 'base_spirit', enabled: true, names: { en: 'Whisky', 'zh-CN': '威士忌', 'zh-TW': '威士忌', ja: 'ウイスキー', ko: '위스키' } },
  { id: 'ing-tequila', category: 'base_spirit', enabled: false, names: { en: 'Tequila', 'zh-CN': '龙舌兰', 'zh-TW': '龍舌蘭', ja: 'テキーラ', ko: '데킬라' } },

  { id: 'ing-cola', category: 'drink', enabled: true, names: { en: 'Cola', 'zh-CN': '可乐', 'zh-TW': '可樂', ja: 'コーラ', ko: '콜라' } },
  { id: 'ing-soda', category: 'drink', enabled: true, names: { en: 'Soda Water', 'zh-CN': '苏打水', 'zh-TW': '蘇打水', ja: 'ソーダ水', ko: '탄산수' } },
  { id: 'ing-tonic', category: 'drink', enabled: true, names: { en: 'Tonic Water', 'zh-CN': '汤力水', 'zh-TW': '通寧水', ja: 'トニックウォーター', ko: '토닉워터' } },
  { id: 'ing-orange-juice', category: 'drink', enabled: true, names: { en: 'Orange Juice', 'zh-CN': '橙汁', 'zh-TW': '柳橙汁', ja: 'オレンジジュース', ko: '오렌지 주스' } },
  { id: 'ing-greentea', category: 'drink', enabled: true, names: { en: 'Green Tea', 'zh-CN': '绿茶', 'zh-TW': '綠茶', ja: '緑茶', ko: '녹차' } },

  { id: 'ing-lemon', category: 'fruit', enabled: true, names: { en: 'Lemon', 'zh-CN': '柠檬', 'zh-TW': '檸檬', ja: 'レモン', ko: '레몬' } },
  { id: 'ing-lime', category: 'fruit', enabled: true, names: { en: 'Lime', 'zh-CN': '青柠', 'zh-TW': '萊姆', ja: 'ライム', ko: '라임' } },
  { id: 'ing-orange', category: 'fruit', enabled: true, names: { en: 'Orange', 'zh-CN': '橙子', 'zh-TW': '柳橙', ja: 'オレンジ', ko: '오렌지' } },
  { id: 'ing-strawberry', category: 'fruit', enabled: true, names: { en: 'Strawberry', 'zh-CN': '草莓', 'zh-TW': '草莓', ja: 'いちご', ko: '딸기' } },
  { id: 'ing-mint', category: 'fruit', enabled: true, names: { en: 'Mint', 'zh-CN': '薄荷', 'zh-TW': '薄荷', ja: 'ミント', ko: '민트' } },

  { id: 'ing-icecube', category: 'snack', enabled: true, names: { en: 'Ice Cubes', 'zh-CN': '冰块', 'zh-TW': '冰塊', ja: '氷', ko: '얼음' } },
  { id: 'ing-honey', category: 'snack', enabled: true, names: { en: 'Honey', 'zh-CN': '蜂蜜', 'zh-TW': '蜂蜜', ja: 'はちみつ', ko: '꿀' } },
  { id: 'ing-sugar', category: 'snack', enabled: true, names: { en: 'Sugar', 'zh-CN': '糖', 'zh-TW': '糖', ja: '砂糖', ko: '설탕' } },
  { id: 'ing-salt', category: 'snack', enabled: true, names: { en: 'Salt', 'zh-CN': '盐', 'zh-TW': '鹽', ja: '塩', ko: '소금' } },
]

export function resolveLocale(names: Record<string, string>, locale: string): string {
  return names[locale] || names['en'] || Object.values(names)[0] || ''
}

export function ingredientView(seed: IngredientSeed, locale: string): Ingredient {
  return {
    id: seed.id,
    category: seed.category,
    name: resolveLocale(seed.names, locale),
    enabled: seed.enabled,
  }
}

const placeholderImg = (label: string, color: string) =>
  `data:image/svg+xml;utf8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500"><rect width="100%" height="100%" fill="${color}"/><text x="50%" y="50%" fill="#fff" font-family="sans-serif" font-size="22" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`,
  )

export const posterPlaceholder = placeholderImg

// Localized example recipes (2-3 groups), distinct simplified/traditional Chinese.
function exampleRecipes(locale: string): Recipe[] {
  const L = (m: Partial<Record<LocaleCode, string>>) => resolveLocale(m as Record<string, string>, locale)
  return [
    {
      id: 'example-mojito',
      isExample: true,
      locale,
      name: L({ en: 'Midnight Mojito', 'zh-CN': '午夜莫吉托', 'zh-TW': '午夜莫西多', ja: 'ミッドナイト・モヒート', ko: '미드나잇 모히토' }),
      tagline: L({ en: 'A cool breeze in a glass for warm evenings.', 'zh-CN': '杯中的一缕清凉，献给温热的夜晚。', 'zh-TW': '杯中的一縷清涼，獻給溫熱的夜晚。', ja: '暖かい夜に贈る、グラスの中のそよ風。', ko: '따뜻한 밤을 위한 잔 속의 시원한 바람.' }),
      alcoholRange: '10-12% ABV',
      items: [
        { ingredientId: 'ing-rum', name: L({ en: 'White Rum', 'zh-CN': '白朗姆酒', 'zh-TW': '白蘭姆酒', ja: 'ホワイトラム', ko: '화이트 럼' }), amount: '45 ml' },
        { ingredientId: 'ing-lime', name: L({ en: 'Lime', 'zh-CN': '青柠', 'zh-TW': '萊姆', ja: 'ライム', ko: '라임' }), amount: '1/2' },
        { ingredientId: 'ing-mint', name: L({ en: 'Mint', 'zh-CN': '薄荷', 'zh-TW': '薄荷', ja: 'ミント', ko: '민트' }), amount: '8 leaves' },
        { ingredientId: 'ing-soda', name: L({ en: 'Soda Water', 'zh-CN': '苏打水', 'zh-TW': '蘇打水', ja: 'ソーダ水', ko: '탄산수' }), amount: 'top up', optional: true },
      ],
      steps: [
        L({ en: 'Muddle mint and lime in the glass.', 'zh-CN': '在杯中轻捣薄荷和青柠。', 'zh-TW': '在杯中輕搗薄荷和萊姆。', ja: 'グラスでミントとライムを軽くつぶす。', ko: '잔에 민트와 라임을 가볍게 으깬다.' }),
        L({ en: 'Add rum and ice.', 'zh-CN': '加入朗姆酒和冰块。', 'zh-TW': '加入蘭姆酒和冰塊。', ja: 'ラムと氷を加える。', ko: '럼과 얼음을 넣는다.' }),
        L({ en: 'Top with soda and stir gently.', 'zh-CN': '注满苏打水，轻轻搅拌。', 'zh-TW': '注滿蘇打水，輕輕攪拌。', ja: 'ソーダで満たし、軽くかき混ぜる。', ko: '탄산수를 채우고 부드럽게 젓는다.' }),
      ],
      toolSubstitutions: [
        { tool: L({ en: 'Muddler', 'zh-CN': '捣棒', 'zh-TW': '搗棒', ja: 'マドラー', ko: '머들러' }), homeAlternative: L({ en: 'Back of a spoon', 'zh-CN': '勺子背面', 'zh-TW': '湯匙背面', ja: 'スプーンの背', ko: '숟가락 뒷면' }) },
        { tool: L({ en: 'Jigger', 'zh-CN': '量酒器', 'zh-TW': '量酒器', ja: 'ジガー', ko: '지거' }), homeAlternative: L({ en: '1 jigger ≈ 1.5 tablespoons', 'zh-CN': '1 量酒器 ≈ 1.5 汤匙', 'zh-TW': '1 量酒器 ≈ 1.5 湯匙', ja: '1ジガー ≈ 大さじ1.5', ko: '지거 1개 ≈ 1.5 큰술' }) },
      ],
      safetyNotes: [
        L({ en: 'Please drink responsibly. No alcohol for minors.', 'zh-CN': '请适量饮用，未成年人禁止饮酒。', 'zh-TW': '請適量飲用，未成年人禁止飲酒。', ja: '適量をお楽しみください。未成年者の飲酒は禁止です。', ko: '적당히 즐기세요. 미성년자 음주 금지.' }),
      ],
    },
    {
      id: 'example-screwdriver',
      isExample: true,
      locale,
      name: L({ en: 'Sunrise Screwdriver', 'zh-CN': '日出螺丝起子', 'zh-TW': '日出螺絲起子', ja: 'サンライズ・スクリュードライバー', ko: '선라이즈 스크루드라이버' }),
      tagline: L({ en: 'Liquid sunshine to start the night.', 'zh-CN': '一杯液态阳光，点亮夜的开始。', 'zh-TW': '一杯液態陽光，點亮夜的開始。', ja: '夜の始まりを照らす、液体の陽光。', ko: '밤의 시작을 밝히는 액체 햇살.' }),
      alcoholRange: '8-10% ABV',
      items: [
        { ingredientId: 'ing-vodka', name: L({ en: 'Vodka', 'zh-CN': '伏特加', 'zh-TW': '伏特加', ja: 'ウォッカ', ko: '보드카' }), amount: '40 ml' },
        { ingredientId: 'ing-orange-juice', name: L({ en: 'Orange Juice', 'zh-CN': '橙汁', 'zh-TW': '柳橙汁', ja: 'オレンジジュース', ko: '오렌지 주스' }), amount: '120 ml' },
        { ingredientId: 'ing-icecube', name: L({ en: 'Ice Cubes', 'zh-CN': '冰块', 'zh-TW': '冰塊', ja: '氷', ko: '얼음' }), amount: 'as needed' },
      ],
      steps: [
        L({ en: 'Fill a glass with ice.', 'zh-CN': '杯中装满冰块。', 'zh-TW': '杯中裝滿冰塊。', ja: 'グラスに氷を入れる。', ko: '잔에 얼음을 채운다.' }),
        L({ en: 'Pour vodka, then orange juice.', 'zh-CN': '倒入伏特加，再加橙汁。', 'zh-TW': '倒入伏特加，再加柳橙汁。', ja: 'ウォッカ、次にオレンジジュースを注ぐ。', ko: '보드카를 붓고 오렌지 주스를 넣는다.' }),
        L({ en: 'Stir and serve.', 'zh-CN': '搅拌后即可享用。', 'zh-TW': '攪拌後即可享用。', ja: 'かき混ぜて完成。', ko: '저은 뒤 즐긴다.' }),
      ],
      toolSubstitutions: [
        { tool: L({ en: 'Bar spoon', 'zh-CN': '调酒勺', 'zh-TW': '調酒匙', ja: 'バースプーン', ko: '바 스푼' }), homeAlternative: L({ en: 'A long chopstick', 'zh-CN': '一根长筷子', 'zh-TW': '一根長筷子', ja: '長い箸', ko: '긴 젓가락' }) },
      ],
      safetyNotes: [
        L({ en: 'Please drink responsibly. No alcohol for minors.', 'zh-CN': '请适量饮用，未成年人禁止饮酒。', 'zh-TW': '請適量飲用，未成年人禁止飲酒。', ja: '適量をお楽しみください。未成年者の飲酒は禁止です。', ko: '적당히 즐기세요. 미성년자 음주 금지.' }),
      ],
    },
    {
      id: 'example-honeytea',
      isExample: true,
      locale,
      name: L({ en: 'Honey Green Highball', 'zh-CN': '蜂蜜绿茶高球', 'zh-TW': '蜂蜜綠茶高球', ja: 'ハニー緑茶ハイボール', ko: '허니 녹차 하이볼' }),
      tagline: L({ en: 'Mellow, fragrant, and easy on the palate.', 'zh-CN': '醇香顺口，回味绵长。', 'zh-TW': '醇香順口，回味綿長。', ja: 'まろやかで香り高く、飲みやすい。', ko: '부드럽고 향긋하며 마시기 편한 한 잔.' }),
      alcoholRange: '7-9% ABV',
      items: [
        { ingredientId: 'ing-whisky', name: L({ en: 'Whisky', 'zh-CN': '威士忌', 'zh-TW': '威士忌', ja: 'ウイスキー', ko: '위스키' }), amount: '30 ml' },
        { ingredientId: 'ing-greentea', name: L({ en: 'Green Tea', 'zh-CN': '绿茶', 'zh-TW': '綠茶', ja: '緑茶', ko: '녹차' }), amount: '100 ml' },
        { ingredientId: 'ing-honey', name: L({ en: 'Honey', 'zh-CN': '蜂蜜', 'zh-TW': '蜂蜜', ja: 'はちみつ', ko: '꿀' }), amount: '1 tsp' },
      ],
      steps: [
        L({ en: 'Dissolve honey in a splash of warm tea.', 'zh-CN': '用少量温茶化开蜂蜜。', 'zh-TW': '用少量溫茶化開蜂蜜。', ja: '温かいお茶少量でハチミツを溶かす。', ko: '따뜻한 차 약간에 꿀을 녹인다.' }),
        L({ en: 'Add whisky, ice and remaining tea.', 'zh-CN': '加入威士忌、冰块和剩余绿茶。', 'zh-TW': '加入威士忌、冰塊和剩餘綠茶。', ja: 'ウイスキー、氷、残りのお茶を加える。', ko: '위스키, 얼음, 남은 차를 넣는다.' }),
        L({ en: 'Stir well and enjoy chilled.', 'zh-CN': '充分搅拌，冰镇享用。', 'zh-TW': '充分攪拌，冰鎮享用。', ja: 'よく混ぜて冷たいうちに楽しむ。', ko: '잘 저어 차갑게 즐긴다.' }),
      ],
      toolSubstitutions: [],
      safetyNotes: [
        L({ en: 'Please drink responsibly. No alcohol for minors.', 'zh-CN': '请适量饮用，未成年人禁止饮酒。', 'zh-TW': '請適量飲用，未成年人禁止飲酒。', ja: '適量をお楽しみください。未成年者の飲酒は禁止です。', ko: '적당히 즐기세요. 미성년자 음주 금지.' }),
      ],
    },
  ]
}

export { exampleRecipes }

export const templateSeed: StyleTemplate[] = [
  {
    id: 'tpl-home-closeup',
    name: 'Home Micro-Brew Close-up',
    dimension: 'home_closeup',
    prompt:
      'A realistic smartphone-style close-up of the finished drink on a cozy home table, warm ambient lighting, ice refraction, lifestyle check-in photo.',
    layout: { textAlign: 'center', watermarkPosition: 'bottom-right' },
    textRenderMode: 'backend',
    enabled: true,
    version: 1,
  },
  {
    id: 'tpl-bar-commercial',
    name: 'Bar Commercial Poster',
    dimension: 'bar_commercial',
    prompt:
      'Teleport the drink to an upscale neon bar counter, luxe black-gold / cyberpunk aesthetic, overlaid art-type cocktail name, bartender English signature, exclusive-recipe tag and a moody tagline — nightclub launch poster grade.',
    layout: { textAlign: 'left', watermarkPosition: 'bottom-right' },
    textRenderMode: 'model',
    enabled: true,
    version: 1,
  },
  {
    id: 'tpl-steps-long',
    name: 'Step-by-step Long Image',
    dimension: 'steps_long',
    prompt:
      'A long vertical infographic illustrating the mixing steps with cute hand-drawn / minimal illustration style, perfect for a social "nanny-level tutorial".',
    layout: { textAlign: 'center', watermarkPosition: 'bottom-left' },
    textRenderMode: 'backend',
    enabled: true,
    version: 1,
  },
  {
    id: 'tpl-retro-hk',
    name: 'Retro Hong Kong',
    dimension: 'custom',
    prompt: 'Nostalgic 90s Hong Kong neon street vibe, film grain, moody teal and magenta.',
    layout: { textAlign: 'center', watermarkPosition: 'top-right' },
    textRenderMode: 'model',
    enabled: false,
    version: 1,
  },
]
