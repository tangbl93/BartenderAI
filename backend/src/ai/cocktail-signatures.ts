import { Locale } from '../common/constants';

/**
 * Shared cocktail "signatures": the set of en ingredient names that must all be
 * selected for a recipe to be recognized as that classic, plus its localized
 * authored name / tagline / steps and ABV.
 *
 * `enName` values MUST exactly match the `en` entry of a seeded ingredient
 * (case-insensitive). seed.ts uses these to derive example recipes; the
 * StubTextProvider uses these to recognize selected ingredient combos.
 *
 * Signatures are ordered most-specific-first so the recognizer picks the
 * tightest match (e.g. a Margarita before a generic Tequila drink).
 */
export interface CocktailSignature {
  require: { enName: string; amount: string; optional?: boolean }[];
  name: Record<Locale, string>;
  tagline: Record<Locale, string>;
  steps: Record<Locale, string[]>;
  abv: string;
}

export const COCKTAIL_SIGNATURES: CocktailSignature[] = [
  // --- Margarita (most-specific: Triple Sec + Tequila + Lime) ---
  {
    require: [
      { enName: 'Tequila', amount: '45 ml' },
      { enName: 'Triple Sec', amount: '20 ml' },
      { enName: 'Lime Juice', amount: '20 ml', optional: true },
    ],
    name: {
      en: 'Margarita',
      'zh-CN': '玛格丽特',
      'zh-TW': '瑪格麗特',
      ja: 'マルガリータ',
      ko: '마가리타',
    },
    tagline: {
      en: 'The world\'s most-loved tequila cocktail — bright lime, orange sweetness, a salted rim.',
      'zh-CN': '全球最受喜爱的龙舌兰鸡尾酒——明亮的青柠、橙味香甜、一抹盐边。',
      'zh-TW': '全球最受歡迎的龍舌蘭雞尾酒——明亮的萊姆、橙味香甜、一抹鹽邊。',
      ja: '世界で最も愛されるテキーラカクテル——鮮やかなライム、オレンジの甘み、塩縁。',
      ko: '세상에서 가장 사랑받는 데킬라 칵테일 — 산뜻한 라임, 오렌지 달콤함, 솔트 림.',
    },
    steps: {
      en: [
        'If you like, rub a lime wedge along the rim of a glass and dip it in salt to make a salted rim.',
        'Fill a shaker with ice; add the tequila, triple sec and lime juice.',
        'Shake well for about 10 seconds until chilled.',
        'Strain into the prepared glass over fresh ice.',
        'Garnish with a lime wedge and serve.',
      ],
      'zh-CN': [
        '如果喜欢，用青柠角沿杯口抹一圈，再倒扣蘸盐，做成盐边。',
        '在摇酒壶中加入冰块，倒入龙舌兰、橙味利口酒和青柠汁。',
        '充分摇晃约 10 秒至冰凉。',
        '滤入准备好的杯子，加新冰。',
        '用青柠角装饰，即可享用。',
      ],
      'zh-TW': [
        '如果喜歡，用萊姆角沿杯口抹一圈，再倒扣蘸鹽，做成鹽邊。',
        '在搖酒壺中加入冰塊，倒入龍舌蘭、橙酒和萊姆汁。',
        '充分搖盪約 10 秒至冰涼。',
        '濾入準備好的杯子，加新冰。',
        '用萊姆角裝飾，即可享用。',
      ],
      ja: [
        'お好みでライムを杯の縁にこすり、塩をつけてソルティッドリムを作ります。',
        'シェイカーに氷を入れ、テキーラ、トリプルセック、ライムジュースを加えます。',
        '約10秒しっかりシェイクして冷やします。',
        '用意したグラスに新しい氷とともに注ぎます。',
        'ライムを飾って完成。',
      ],
      ko: [
        '원하면 라임 조각으로 잔 가장자리를 문지르고 소금을 묻혀 솔트 림을 만드세요.',
        '셰이커에 얼음을 넣고 데킬라, 트리플 섹, 라임 주스를 넣으세요.',
        '약 10초간 잘 흔들어 차갑게 하세요.',
        '준비한 잔에 새 얼음과 함께 걸러 담으세요.',
        '라임으로 장식하여 제공하세요.',
      ],
    },
    abv: '22% ABV',
  },
  // --- Negroni ---
  {
    require: [
      { enName: 'Gin', amount: '30 ml' },
      { enName: 'Campari', amount: '30 ml' },
      { enName: 'Sweet Vermouth', amount: '30 ml' },
    ],
    name: {
      en: 'Negroni',
      'zh-CN': '尼格罗尼',
      'zh-TW': '尼格羅尼',
      ja: 'ネグローニ',
      ko: '네그로니',
    },
    tagline: {
      en: 'Equal parts, perfectly bittersweet — a Florentine icon.',
      'zh-CN': '等比例三味，苦甜平衡——佛罗伦萨的经典。',
      'zh-TW': '等比例三味，苦甜平衡——佛羅倫斯的經典。',
      ja: '1:1:1、完璧なほろ苦さ——フィレンツェ生まれの定番。',
      ko: '동일 비율, 완벽한 쌉싸름한 단맛 — 피렌체의 클래식.',
    },
    steps: {
      en: [
        'Fill a rocks glass with ice (or chill a glass and add ice after).',
        'Pour equal parts gin, Campari and sweet vermouth over the ice.',
        'Stir gently for about 20 seconds until well mixed and chilled.',
        'Express an orange peel over the drink and drop it in as garnish.',
      ],
      'zh-CN': [
        '在古典杯中加入冰块（或先冰杯再加冰）。',
        '将金酒、坎帕利和甜味美思等量倒在冰上。',
        '轻轻搅拌约 20 秒至混合均匀且冰凉。',
        '取橙皮在杯口扭一下，喷出精油后放入装饰。',
      ],
      'zh-TW': [
        '在古典杯中加入冰塊（或先冰杯再加冰）。',
        '將琴酒、坎帕利和甜苦艾等量倒在冰上。',
        '輕輕攪拌約 20 秒至混合均勻且冰涼。',
        '取橙皮在杯口扭一下，噴出精油後放入裝飾。',
      ],
      ja: [
        'ロックグラスに氷を入れます。',
        'ジン、カンパリ、スイートベルモットを同量ずつ氷に注ぎます。',
        '約20秒軽くステアして混ぜ合わせ冷やします。',
        'オレンジピールを絞り、香りをつけて飾ります。',
      ],
      ko: [
        '록스 글라스에 얼음을 채우세요.',
        '진, 캄파리, 스위트 버무스를 같은 비율로 얼음 위에 따르세요.',
        '약 20초간 가볍게 저어 섞고 차갑게 하세요.',
        '오렌지 필을 짜 향을 내고 장식으로 넣으세요.',
      ],
    },
    abv: '24% ABV',
  },
  // --- Manhattan ---
  {
    require: [
      { enName: 'Bourbon', amount: '60 ml' },
      { enName: 'Sweet Vermouth', amount: '30 ml' },
    ],
    name: {
      en: 'Manhattan',
      'zh-CN': '曼哈顿',
      'zh-TW': '曼哈頓',
      ja: 'マンハッタン',
      ko: '맨해튼',
    },
    tagline: {
      en: 'Whiskey, sweet vermouth, bitters — the original stirred classic.',
      'zh-CN': '威士忌、甜味美思、苦精——搅和经典的鼻祖。',
      'zh-TW': '威士忌、甜苦艾、苦精——攪和經典的鼻祖。',
      ja: 'ウイスキー、スイートベルモス、ビターズ——ステアの王様。',
      ko: '위스키, 스위트 버무스, 비터즈 — 스터 클래식의 원조.',
    },
    steps: {
      en: [
        'Fill a mixing glass with ice.',
        'Add the bourbon and sweet vermouth, plus a dash of bitters if you have any.',
        'Stir well for about 20 seconds until very cold.',
        'Strain into a chilled cocktail (martini) glass.',
        'Garnish with a cherry.',
      ],
      'zh-CN': [
        '在调酒杯中加入冰块。',
        '倒入波本和甜味美思，如有苦精可加几滴。',
        '充分搅和约 20 秒至非常冰凉。',
        '滤入冰镇的鸡尾酒（马天尼）杯。',
        '用樱桃装饰。',
      ],
      'zh-TW': [
        '在調酒杯中加入冰塊。',
        '倒入波本和甜苦艾，如有苦精可加幾滴。',
        '充分攪和約 20 秒至非常冰涼。',
        '濾入冰鎮的雞尾酒（馬丁尼）杯。',
        '用櫻桃裝飾。',
      ],
      ja: [
        'ミキシンググラスに氷を入れます。',
        'バーボンとスイートベルモスを入れ、ビターズがあれば少し加えます。',
        '約20秒しっかりステアして冷やします。',
        '冷やしたカクテルグラスに濾して注ぎます。',
        'チェリーを飾ります。',
      ],
      ko: [
        '믹싱 글라스에 얼음을 채우세요.',
        '버번과 스위트 버무스를 넣고, 비터즈가 있으면 약간 넣으세요.',
        '약 20초간 잘 저어 아주 차갑게 하세요.',
        '차갑게 한 칵테일 글라스에 걸러 담으세요.',
        '체리로 장식하세요.',
      ],
    },
    abv: '26% ABV',
  },
  // --- Old Fashioned ---
  {
    require: [
      { enName: 'Bourbon', amount: '60 ml' },
      { enName: 'Simple Syrup', amount: '1 tsp', optional: true },
    ],
    name: {
      en: 'Old Fashioned',
      'zh-CN': '古典鸡尾酒',
      'zh-TW': '老式古典雞尾酒',
      ja: 'オールドファッションド',
      ko: '올드 패션드',
    },
    tagline: {
      en: 'Sugar, bitters, whiskey — the cocktail that started it all.',
      'zh-CN': '糖、苦精、威士忌——一切鸡尾酒的起点。',
      'zh-TW': '糖、苦精、威士忌——一切雞尾酒的起點。',
      ja: '砂糖、ビターズ、ウイスキー——すべてのカクテルの原点。',
      ko: '설탕, 비터즈, 위스키 — 모든 칵테일의 시작.',
    },
    steps: {
      en: [
        'In a rocks glass, muddle a sugar cube (or simple syrup) with a dash of bitters and a splash of water.',
        'Add the bourbon.',
        'Fill the glass with a large ice cube and stir for about 20 seconds.',
        'Express an orange peel over the glass and drop it in.',
      ],
      'zh-CN': [
        '在古典杯中，将方糖（或糖浆）与几滴苦精和少量水捣融。',
        '加入波本。',
        '放入大冰块，搅和约 20 秒。',
        '取橙皮在杯口扭一下喷出精油后放入。',
      ],
      'zh-TW': [
        '在古典杯中，將方糖（或糖漿）與幾滴苦精和少量水搗融。',
        '加入波本。',
        '放入大冰塊，攪和約 20 秒。',
        '取橙皮在杯口扭一下噴出精油後放入。',
      ],
      ja: [
        'ロックグラスで角砂糖（またはシロップ）をビターズと少量の水でマドラーします。',
        'バーボンを加えます。',
        '大きな氷を加え、約20秒ステアします。',
        'オレンジピールを絞って香りをつけ、加えます。',
      ],
      ko: [
        '록스 글라스에서 각설탕(또는 시럽)을 비터즈와 약간의 물로 머들링하세요.',
        '버번을 넣으세요.',
        '큰 얼음을 채우고 약 20초간 저으세요.',
        '오렌지 필을 짜 향을 내고 넣으세요.',
      ],
    },
    abv: '32% ABV',
  },
  // --- Whiskey Sour ---
  {
    require: [
      { enName: 'Bourbon', amount: '60 ml' },
      { enName: 'Lemon', amount: '20 ml', optional: true },
      { enName: 'Simple Syrup', amount: '15 ml', optional: true },
    ],
    name: {
      en: 'Whiskey Sour',
      'zh-CN': '威士忌酸',
      'zh-TW': '威士忌酸',
      ja: 'ウイスキーサワー',
      ko: '위스키 사워',
    },
    tagline: {
      en: 'Bourbon, lemon, a touch of sweet — the perfect sweet-sour balance.',
      'zh-CN': '波本、柠檬、一点甜——酸甜的完美平衡。',
      'zh-TW': '波本、檸檬、一點甜——酸甜的完美平衡。',
      ja: 'バーボン、レモン、ほんのり甘み——甘酸っぱさの完璧なバランス。',
      ko: '버번, 레몬, 약간의 단맛 — 새콤달콤의 완벽한 균형.',
    },
    steps: {
      en: [
        'Juice the lemon to get fresh lemon juice.',
        'Fill a shaker with ice; add bourbon, lemon juice and simple syrup.',
        'Shake hard for about 12 seconds.',
        'Strain into a rocks glass over fresh ice.',
        'Optional: float a dash of bitters or an egg-white foam on top.',
      ],
      'zh-CN': [
        '挤出柠檬汁。',
        '在摇酒壶中加入冰块，倒入波本、柠檬汁和糖浆。',
        '用力摇晃约 12 秒。',
        '滤入古典杯，加新冰。',
        '可选：顶部淋几滴苦精或加蛋白泡沫。',
      ],
      'zh-TW': [
        '擠出檸檬汁。',
        '在搖酒壺中加入冰塊，倒入波本、檸檬汁和糖漿。',
        '用力搖盪約 12 秒。',
        '濾入古典杯，加新冰。',
        '可選：頂部淋幾滴苦精或加蛋白泡沫。',
      ],
      ja: [
        'レモンを絞ってフレッシュなレモンジュースを用意します。',
        'シェイカーに氷を入れ、バーボン、レモンジュース、シロップを加えます。',
        '約12秒強くシェイクします。',
        'ロックグラスに新しい氷とともに濾して注ぎます。',
        'お好みでビターズや卵白の泡を浮かべて。',
      ],
      ko: [
        '레몬을 짜서 신선한 레몬 주스를 준비하세요.',
        '셰이커에 얼음을 넣고 버번, 레몬 주스, 시럽을 넣으세요.',
        '약 12초간 강하게 흔드세요.',
        '록스 글라스에 새 얼음과 함께 걸러 담으세요.',
        '선택: 위에 비터즈나 달걀흰자 거품을 띄우세요.',
      ],
    },
    abv: '20% ABV',
  },
  // --- Cosmopolitan ---
  {
    require: [
      { enName: 'Vodka', amount: '40 ml' },
      { enName: 'Triple Sec', amount: '15 ml' },
      { enName: 'Cranberry Juice', amount: '30 ml' },
      { enName: 'Lime', amount: '15 ml', optional: true },
    ],
    name: {
      en: 'Cosmopolitan',
      'zh-CN': '柯梦波丹',
      'zh-TW': '柯夢波丹',
      ja: 'コスモポリタン',
      ko: '코스모폴리탄',
    },
    tagline: {
      en: 'Vodka, cranberry, a wink of citrus — pink and chic.',
      'zh-CN': '伏特加、蔓越莓、一抹柑橘——粉红而 chic。',
      'zh-TW': '伏特加、蔓越莓、一抹柑橘——粉紅而 chic。',
      ja: 'ウォッカ、クランベリー、ほのかなシトラス——ピンクでシック。',
      ko: '보드카, 크랜베리, 은은한 시트러스 — 분홍빛 시크함.',
    },
    steps: {
      en: [
        'Squeeze the lime wedge for fresh lime juice.',
        'Fill a shaker with ice; add vodka, triple sec, cranberry juice and lime juice.',
        'Shake hard for about 12 seconds.',
        'Double-strain into a chilled martini glass.',
        'Garnish with a lime wheel or orange twist.',
      ],
      'zh-CN': [
        '挤青柠汁。',
        '在摇酒壶中加入冰块，倒入伏特加、橙味利口酒、蔓越莓汁和青柠汁。',
        '用力摇晃约 12 秒。',
        '二次过滤入冰镇马天尼杯。',
        '用青柠片或橙皮装饰。',
      ],
      'zh-TW': [
        '擠萊姆汁。',
        '在搖酒壺中加入冰塊，倒入伏特加、橙酒、蔓越莓汁和萊姆汁。',
        '用力搖盪約 12 秒。',
        '二次過濾入冰鎮馬丁尼杯。',
        '用萊姆片或橙皮裝飾。',
      ],
      ja: [
        'ライムを絞ってフレッシュなライムジュースを用意します。',
        'シェイカーに氷を入れ、ウォッカ、トリプルセック、クランベリージュース、ライムジュースを加えます。',
        '約12秒強くシェイクします。',
        '冷やしたマティーニグラスにダブルストレインで注ぎます。',
        'ライムホイールかオレンジツイストを飾ります。',
      ],
      ko: [
        '라임을 짜서 신선한 라임 주스를 준비하세요.',
        '셰이커에 얼음을 넣고 보드카, 트리플 섹, 크랜베리 주스, 라임 주스를 넣으세요.',
        '약 12초간 강하게 흔드세요.',
        '차갑게 한 마티니 글라스에 이중 여과하여 담으세요.',
        '라임 휠이나 오렌지 트위스트로 장식하세요.',
      ],
    },
    abv: '18% ABV',
  },
  // --- Daiquiri ---
  {
    require: [
      { enName: 'White Rum', amount: '60 ml' },
      { enName: 'Lime Juice', amount: '25 ml' },
      { enName: 'Simple Syrup', amount: '15 ml', optional: true },
    ],
    name: {
      en: 'Daiquiri',
      'zh-CN': '黛绮丽',
      'zh-TW': '黛綺麗',
      ja: 'ダイキリ',
      ko: '다이키리',
    },
    tagline: {
      en: 'Rum, lime, sugar — the original sour, pure and clean.',
      'zh-CN': '朗姆、青柠、糖——原始的酸酒，纯净而清爽。',
      'zh-TW': '蘭姆、萊姆、糖——原始的酸酒，純淨而清爽。',
      ja: 'ラム、ライム、砂糖——原点のサワー、純粋でクリーン。',
      ko: '럼, 라임, 설탕 — 원조 사워, 순수하고 깔끔하게.',
    },
    steps: {
      en: [
        'Fill a shaker with ice.',
        'Add white rum, lime juice and simple syrup.',
        'Shake hard for about 12 seconds until very cold.',
        'Strain into a chilled coupe or cocktail glass.',
        'No garnish needed — serve immediately.',
      ],
      'zh-CN': [
        '在摇酒壶中加入冰块。',
        '倒入白朗姆、青柠汁和糖浆。',
        '用力摇晃约 12 秒至非常冰凉。',
        '滤入冰镇的浅碟杯或鸡尾酒杯。',
        '无需装饰，立即享用。',
      ],
      'zh-TW': [
        '在搖酒壺中加入冰塊。',
        '倒入白蘭姆、萊姆汁和糖漿。',
        '用力搖盪約 12 秒至非常冰涼。',
        '濾入冰鎮的淺碟杯或雞尾酒杯。',
        '無需裝飾，立即享用。',
      ],
      ja: [
        'シェイカーに氷を入れます。',
        'ホワイトラム、ライムジュース、シロップを加えます。',
        '約12秒強くシェイクして冷やします。',
        '冷やしたカップかカクテルグラスに濾して注ぎます。',
        '飾りは不要、すぐに提供。',
      ],
      ko: [
        '셰이커에 얼음을 채우세요.',
        '화이트 럼, 라임 주스, 시럽을 넣으세요.',
        '약 12초간 강하게 흔들어 아주 차갑게 하세요.',
        '차갑게 한 쿠프나 칵테일 글라스에 걸러 담으세요.',
        '장식 불필요, 바로 제공하세요.',
      ],
    },
    abv: '20% ABV',
  },
  // --- Gimlet (Gin + Lime) ---
  {
    require: [
      { enName: 'Gin', amount: '60 ml' },
      { enName: 'Lime Juice', amount: '20 ml' },
    ],
    name: {
      en: 'Gimlet',
      'zh-CN': '吉姆雷特',
      'zh-TW': '吉姆雷特',
      ja: 'ギムレット',
      ko: '짐렛',
    },
    tagline: {
      en: 'Gin and lime — crisp, floral, irresistibly refreshing.',
      'zh-CN': '金酒与青柠——清爽花香，令人无法抗拒。',
      'zh-TW': '琴酒與萊姆——清爽花香，令人無法抗拒。',
      ja: 'ジンとライム——爽やかで花のように、たまらない一杯。',
      ko: '진과 라임 — 산뜻하고 꽃향기, 거부할 수 없는 상쾌함.',
    },
    steps: {
      en: [
        'Fill a shaker with ice.',
        'Add the gin and lime juice (and a dash of simple syrup if you like it sweeter).',
        'Shake well for about 12 seconds.',
        'Strain into a chilled coupe or cocktail glass.',
        'Garnish with a thin lime wheel.',
      ],
      'zh-CN': [
        '在摇酒壶中加入冰块。',
        '倒入金酒和青柠汁（喜欢甜可加少许糖浆）。',
        '充分摇晃约 12 秒。',
        '滤入冰镇的浅碟杯或鸡尾酒杯。',
        '用薄片青柠装饰。',
      ],
      'zh-TW': [
        '在搖酒壺中加入冰塊。',
        '倒入琴酒和萊姆汁（喜歡甜可加少許糖漿）。',
        '充分搖盪約 12 秒。',
        '濾入冰鎮的淺碟杯或雞尾酒杯。',
        '用薄片萊姆裝飾。',
      ],
      ja: [
        'シェイカーに氷を入れます。',
        'ジンとライムジュース（甘めが好みならシロップを少し）を加えます。',
        '約12秒しっかりシェイクします。',
        '冷やしたカップかカクテルグラスに濾して注ぎます。',
        '薄いライムホイールを飾ります。',
      ],
      ko: [
        '셰이커에 얼음을 채우세요.',
        '진과 라임 주스(달게 하려면 시럽 약간)를 넣으세요.',
        '약 12초간 잘 흔드세요.',
        '차갑게 한 쿠프나 칵테일 글라스에 걸러 담으세요.',
        '얇은 라임 휠로 장식하세요.',
      ],
    },
    abv: '24% ABV',
  },
  // --- Mojito (White Rum + Mint + Lime) ---
  {
    require: [
      { enName: 'White Rum', amount: '45 ml' },
      { enName: 'Mint', amount: '10 leaves', optional: true },
      { enName: 'Lime', amount: '1 pc', optional: true },
    ],
    name: {
      en: 'Mojito',
      'zh-CN': '莫吉托',
      'zh-TW': '莫希托',
      ja: 'モヒート',
      ko: '모히토',
    },
    tagline: {
      en: 'Cuba\'s national drink — rum, mint, lime, soda, endlessly refreshing.',
      'zh-CN': '古巴国饮——朗姆、薄荷、青柠、苏打，无限清爽。',
      'zh-TW': '古巴國飲——蘭姆、薄荷、萊姆、蘇打，無限清爽。',
      ja: 'キューバの国民的ドリンク——ラム、ミント、ライム、ソーダ、果てしなく爽やか。',
      ko: '쿠바의 국민 음료 — 럼, 민트, 라임, 소다, 끝없이 상쾌.',
    },
    steps: {
      en: [
        'In a highball glass, gently muddle the mint leaves with the lime wedge and a little sugar.',
        'Add the white rum and stir briefly.',
        'Fill the glass with crushed ice.',
        'Top with soda water and stir from the bottom up to mix.',
        'Garnish with a sprig of mint.',
      ],
      'zh-CN': [
        '在直身杯中，将薄荷叶、青柠角和少许糖轻轻捣压。',
        '加入白朗姆，稍作搅拌。',
        '加入碎冰至满。',
        '倒入苏打水，从底部向上搅拌混合。',
        '用一束薄荷装饰。',
      ],
      'zh-TW': [
        '在直身杯中，將薄荷葉、萊姆角和少許糖輕輕搗壓。',
        '加入白蘭姆，稍作攪拌。',
        '加入碎冰至滿。',
        '倒入蘇打水，從底部向上攪拌混合。',
        '用一束薄荷裝飾。',
      ],
      ja: [
        'ハイボールグラスでミントの葉、ライム、少量の砂糖を軽くマドラーします。',
        'ホワイトラムを加え、軽く混ぜます。',
        'クラッシュドアイスを一杯まで加えます。',
        'ソーダ水を注ぎ、下から上へ混ぜ合わせます。',
        'ミントを飾ります。',
      ],
      ko: [
        '하이볼 글라스에서 민트 잎, 라임 조각, 약간의 설탕을 가볍게 머들링하세요.',
        '화이트 럼을 넣고 가볍게 저으세요.',
        '크러시드 아이스를 가득 채우세요.',
        '소다수를 채우고 아래에서 위로 저어 섞으세요.',
        '민트 한 가지로 장식하세요.',
      ],
    },
    abv: '12% ABV',
  },
  // --- Piña Colada ---
  {
    require: [
      { enName: 'White Rum', amount: '60 ml' },
      { enName: 'Coconut Cream', amount: '60 ml' },
      { enName: 'Pineapple Juice', amount: '90 ml' },
    ],
    name: {
      en: 'Piña Colada',
      'zh-CN': '椰林飘香',
      'zh-TW': '椰林飄香',
      ja: 'ピニャ・コラーダ',
      ko: '피냐 콜라다',
    },
    tagline: {
      en: 'Puerto Rico in a glass — rum, coconut and pineapple blended to a tropical dream.',
      'zh-CN': '杯中的波多黎各——朗姆、椰奶与菠萝，搅出热带之梦。',
      'zh-TW': '杯中的波多黎各——蘭姆、椰奶與鳳梨，攪出熱帶之夢。',
      ja: 'グラスの中のプエルトリコ——ラム、ココナッツ、パイナップルが描く南国の夢。',
      ko: '잔 속의 푸에르토리코 — 럼, 코코넛, 파인애플이 빚어낸 열대의 꿈.',
    },
    steps: {
      en: [
        'Add white rum, coconut cream, pineapple juice and a cup of ice to a blender.',
        'Blend until smooth and creamy.',
        'Pour into a chilled hurricane or tall glass.',
        'Garnish with a pineapple wedge and a cocktail cherry.',
      ],
      'zh-CN': [
        '将白朗姆、椰奶、菠萝汁和一杯冰放入搅拌机。',
        '搅打至顺滑细腻。',
        '倒入冰镇的风暴杯或高杯。',
        '用菠萝角和鸡尾酒樱桃装饰。',
      ],
      'zh-TW': [
        '將白蘭姆、椰奶、鳳梨汁和一杯冰放入攪拌機。',
        '攪打至順滑細膩。',
        '倒入冰鎮的風暴杯或高杯。',
        '用鳳梨角和雞尾酒櫻桃裝飾。',
      ],
      ja: [
        'ホワイトラム、ココナッツクリーム、パイナップルジュース、氷をミキサーに入れます。',
        '滑らかになるまで撹拌します。',
        '冷やしたハリケーングラスに注ぎます。',
        'パイナップルとカクテルチェリーを飾ります。',
      ],
      ko: [
        '화이트 럼, 코코넛 크림, 파인애플 주스, 얼음을 블렌더에 넣으세요.',
        '부드럽게 될 때까지 갈으세요.',
        '차갑게 한 허리케인 또는 톨 글라스에 따르세요.',
        '파인애플 조각과 칵테일 체리로 장식하세요.',
      ],
    },
    abv: '14% ABV',
  },
  // --- Mai Tai ---
  {
    require: [
      { enName: 'Dark Rum', amount: '45 ml' },
      { enName: 'Triple Sec', amount: '15 ml' },
      { enName: 'Lime Juice', amount: '20 ml', optional: true },
    ],
    name: {
      en: 'Mai Tai',
      'zh-CN': '迈泰',
      'zh-TW': '邁泰',
      ja: 'マイタイ',
      ko: '마이 타이',
    },
    tagline: {
      en: 'Polynesian tiki royalty — aged rum, orange and almond over lime.',
      'zh-CN': '波利尼西亚提基之王——陈年朗姆、橙香杏仁，落在青柠之上。',
      'zh-TW': '玻里尼西亞提基之王——陳年蘭姆、橙香杏仁，落在萊姆之上。',
      ja: 'ポリネシアン・ティキの王——熟成ラム、オレンジとアーモンドがライムの上に。',
      ko: '폴리네시아 티키의 왕 — 숙성 럼, 오렌지와 아몬드가 라임 위에.',
    },
    steps: {
      en: [
        'Fill a shaker with ice.',
        'Add dark rum, triple sec, lime juice and a touch of orgeat/almond syrup if available.',
        'Shake well for about 12 seconds.',
        'Pour (unstrained) into a rocks glass over crushed ice.',
        'Garnish with a spent lime shell and a mint sprig.',
      ],
      'zh-CN': [
        '在摇酒壶中加入冰块。',
        '倒入黑朗姆、橙味利口酒、青柠汁，如有杏仁糖浆可加少许。',
        '充分摇晃约 12 秒。',
        '不滤冰，倒入古典杯中加碎冰。',
        '用青柠壳和一束薄荷装饰。',
      ],
      'zh-TW': [
        '在搖酒壺中加入冰塊。',
        '倒入黑蘭姆、橙酒、萊姆汁，如有杏仁糖漿可加少許。',
        '充分搖盪約 12 秒。',
        '不濾冰，倒入古典杯中加碎冰。',
        '用萊姆殼和一束薄荷裝飾。',
      ],
      ja: [
        'シェイカーに氷を入れます。',
        'ダークラム、トリプルセック、ライムジュース、あればオルゼート（アーモンドシロップ）を少し加えます。',
        '約12秒しっかりシェイクします。',
        '濾さず、クラッシュドアイスを入れたロックグラスに注ぎます。',
        '絞ったライムの殻とミントを飾ります。',
      ],
      ko: [
        '셰이커에 얼음을 채우세요.',
        '다크 럼, 트리플 섹, 라임 주스, 있으면 오르제(아몬드 시럽)를 약간 넣으세요.',
        '약 12초간 잘 흔드세요.',
        '걸르지 않고 크러시드 아이스를 넣은 록스 글라스에 따르세요.',
        '짠 라임 껍질과 민트로 장식하세요.',
      ],
    },
    abv: '20% ABV',
  },
  // --- Espresso Martini ---
  {
    require: [
      { enName: 'Vodka', amount: '50 ml' },
      { enName: 'Espresso', amount: '30 ml' },
      { enName: 'Coffee Liqueur', amount: '20 ml' },
    ],
    name: {
      en: 'Espresso Martini',
      'zh-CN': '浓缩马天尼',
      'zh-TW': '濃縮馬丁尼',
      ja: 'エスプレッソ・マティーニ',
      ko: '에스프레소 마티니',
    },
    tagline: {
      en: 'Wake up, then dress up — vodka, espresso, coffee liqueur, velvet foam.',
      'zh-CN': '先醒来，再华丽——伏特加、浓缩、咖啡利口酒，丝绒泡沫。',
      'zh-TW': '先醒來，再華麗——伏特加、濃縮、咖啡利口酒，絲絨泡沫。',
      ja: '目を覚まし、着飾る——ウォッカ、エスプレッソ、コーヒーリキュール、ベルベットの泡。',
      ko: '깨어나고, 멋을 내다 — 보드카, 에스프레소, 커피 리큐어, 벨벳 거품.',
    },
    steps: {
      en: [
        'Brew a fresh shot of espresso and let it cool slightly.',
        'Fill a shaker with ice; add vodka, espresso and coffee liqueur plus a little simple syrup to taste.',
        'Shake very hard for 15+ seconds to build a thick crema.',
        'Double-strain into a chilled martini glass.',
        'Float 3 coffee beans as garnish.',
      ],
      'zh-CN': [
        '新鲜萃取一份浓缩，稍微放凉。',
        '在摇酒壶中加入冰块，倒入伏特加、浓缩和咖啡利口酒，按口味加少许糖浆。',
        '用力摇晃 15 秒以上，打出厚厚的克丽玛。',
        '二次过滤入冰镇马天尼杯。',
        '漂浮 3 颗咖啡豆装饰。',
      ],
      'zh-TW': [
        '新鮮萃取一份濃縮，稍微放涼。',
        '在搖酒壺中加入冰塊，倒入伏特加、濃縮和咖啡利口酒，按口味加少許糖漿。',
        '用力搖盪 15 秒以上，打出厚厚的克麗瑪。',
        '二次過濾入冰鎮馬丁尼杯。',
        '漂浮 3 顆咖啡豆裝飾。',
      ],
      ja: [
        '新鮮なエスプレッソを抽出し、少し冷まします。',
        'シェイカーに氷を入れ、ウォッカ、エスプレッソ、コーヒーリキュール、お好みでシロップを少し加えます。',
        '15秒以上強くシェイクして濃厚なクレマを作ります。',
        '冷やしたマティーニグラスにダブルストレインで注ぎます。',
        'コーヒー豆3粒を浮かべて飾ります。',
      ],
      ko: [
        '신선한 에스프레소를 추출하고 살짝 식히세요.',
        '셰이커에 얼음을 넣고 보드카, 에스프레소, 커피 리큐어, 입맛에 맞게 시럽을 약간 넣으세요.',
        '15초 이상 강하게 흔들어 진한 크레마를 만드세요.',
        '차갑게 한 마티니 글라스에 이중 여과하여 담으세요.',
        '커피콩 3알을 띄워 장식하세요.',
      ],
    },
    abv: '20% ABV',
  },
  // --- Moscow Mule ---
  {
    require: [
      { enName: 'Vodka', amount: '45 ml' },
      { enName: 'Ginger Beer', amount: '120 ml' },
      { enName: 'Lime', amount: '1 wedge', optional: true },
    ],
    name: {
      en: 'Moscow Mule',
      'zh-CN': '莫斯科骡子',
      'zh-TW': '莫斯科騾子',
      ja: 'モスクワ・ミュール',
      ko: '모스코 뮬',
    },
    tagline: {
      en: 'Vodka, spicy ginger beer, lime — served ice-cold in a copper mug.',
      'zh-CN': '伏特加、辣味姜啤、青柠——铜杯冰镇奉上。',
      'zh-TW': '伏特加、辣味薑啤酒、萊姆——銅杯冰鎮奉上。',
      ja: 'ウォッカ、辛口ジンジャービール、ライム——銅製マグでキンキンに。',
      ko: '보드카, 매콤한 진저 비어, 라임 — 구리 잔에 얼음장처럼 차갑게.',
    },
    steps: {
      en: [
        'Squeeze the lime wedge into a copper mug (or rocks glass) and drop it in.',
        'Add the vodka.',
        'Fill the mug with crushed ice.',
        'Top with cold ginger beer and stir gently once.',
        'Garnish with a lime wheel and a mint sprig if you like.',
      ],
      'zh-CN': [
        '将青柠角挤入铜杯（或古典杯）后丢入。',
        '加入伏特加。',
        '加入碎冰至满。',
        '倒入冰姜啤，轻轻搅一下。',
        '可用青柠片和一束薄荷装饰。',
      ],
      'zh-TW': [
        '將萊姆角擠入銅杯（或古典杯）後丟入。',
        '加入伏特加。',
        '加入碎冰至滿。',
        '倒入冰薑啤酒，輕輕攪一下。',
        '可用萊姆片和一束薄荷裝飾。',
      ],
      ja: [
        'ライムを銅マグ（またはロックグラス）に絞り、そのまま入れます。',
        'ウォッカを加えます。',
        'クラッシュドアイスを一杯まで加えます。',
        '冷やしたジンジャービールを注ぎ、一度軽く混ぜます。',
        'お好みでライムホイールとミントを飾ります。',
      ],
      ko: [
        '라임 조각을 구리 잔(또는 록스 글라스)에 짜 넣고 그대로 넣으세요.',
        '보드카를 넣으세요.',
        '크러시드 아이스를 가득 채우세요.',
        '차가운 진저 비어를 채우고 한 번 가볍게 저으세요.',
        '원하면 라임 휠과 민트로 장식하세요.',
      ],
    },
    abv: '10% ABV',
  },
  // --- Aperol Spritz ---
  {
    require: [
      { enName: 'Aperol', amount: '90 ml' },
      { enName: 'Prosecco', amount: '90 ml' },
      { enName: 'Soda Water', amount: '30 ml', optional: true },
    ],
    name: {
      en: 'Aperol Spritz',
      'zh-CN': '阿佩罗喷雾',
      'zh-TW': '阿佩羅斯普利茲',
      ja: 'アペロール・スプリッツ',
      ko: '아페롤 스프리츠',
    },
    tagline: {
      en: 'Venetian sunset in a glass — the 3-2-1 aperitivo everyone loves.',
      'zh-CN': '杯中的威尼斯日落——人人都爱的 3-2-1 开胃酒。',
      'zh-TW': '杯中的威尼斯日落——人人都愛的 3-2-1 開胃酒。',
      ja: 'グラスの中のヴェネツィアの夕焼け——みんなが愛する3-2-1アペリティーボ。',
      ko: '잔 속의 베네치아 일몰 — 모두가 사랑하는 3-2-1 아페리티보.',
    },
    steps: {
      en: [
        'Fill a large wine glass with ice.',
        'Add the Aperol, then the Prosecco (about a 1:1 ratio, or 3:2 Prosecco:Aperol to taste).',
        'Top with a splash of soda water.',
        'Stir very gently once.',
        'Garnish with a slice of fresh orange.',
      ],
      'zh-CN': [
        '在大红酒杯中加入冰块。',
        '先加阿佩罗，再加普罗赛克（约 1:1，或按口味普罗赛克:阿佩罗=3:2）。',
        '顶部倒入少许苏打水。',
        '轻轻搅一下。',
        '用一片鲜橙装饰。',
      ],
      'zh-TW': [
        '大紅酒杯中加入冰塊。',
        '先加阿佩羅，再加普羅賽克（約 1:1，或按口味普羅賽克:阿佩羅=3:2）。',
        '頂部倒入少許蘇打水。',
        '輕輕攪一下。',
        '用一片鮮橙裝飾。',
      ],
      ja: [
        '大きめのワイングラスに氷を入れます。',
        'アペロール、次にプロセッコを加えます（ほぼ1:1、または好みでプロセッコ:アペロール=3:2）。',
        'ソーダ水を少し加えます。',
        '一度だけ軽く混ぜます。',
        '新鮮なオレンジのスライスを飾ります。',
      ],
      ko: [
        '큰 와인 글라스에 얼음을 채우세요.',
        '아페롤, 다음 프로세코를 넣으세요(약 1:1, 또는 입맛에 맞게 프로세코:아페롤=3:2).',
        '소다수를 약간 채우세요.',
        '한 번만 아주 가볍게 저으세요.',
        '신선한 오렌지 슬라이스로 장식하세요.',
      ],
    },
    abv: '11% ABV',
  },
  // --- Tequila Sunrise ---
  {
    require: [
      { enName: 'Tequila', amount: '45 ml' },
      { enName: 'Orange Juice', amount: '90 ml' },
      { enName: 'Grenadine', amount: '15 ml' },
    ],
    name: {
      en: 'Tequila Sunrise',
      'zh-CN': '龙舌兰日出',
      'zh-TW': '龍舌蘭日出',
      ja: 'テキーラ・サンライズ',
      ko: '데킬라 선라이즈',
    },
    tagline: {
      en: 'Layered sunrise in a glass — tequila, orange juice, a grenadine gradient.',
      'zh-CN': '杯中的日出渐变——龙舌兰、橙汁、红石榴糖浆的层次。',
      'zh-TW': '杯中的日出漸層——龍舌蘭、柳橙汁、紅石榴糖漿的層次。',
      ja: 'グラスの中の日の出——テキーラ、オレンジジュース、グレナデンのグラデーション。',
      ko: '잔 속의 일출 그라데이션 — 데킬라, 오렌지 주스, 그레나딘의 층.',
    },
    steps: {
      en: [
        'Fill a highball glass with ice.',
        'Pour in the tequila and orange juice; stir to mix.',
        'Slowly pour the grenadine down the inside of the glass so it sinks to the bottom.',
        'Let it rise naturally for the sunrise gradient — do not stir.',
        'Garnish with an orange slice and a cherry.',
      ],
      'zh-CN': [
        '在直身杯中加入冰块。',
        '倒入龙舌兰和橙汁，搅拌均匀。',
        '将红石榴糖浆沿杯壁缓慢倒入，使其沉底。',
        '让其自然上升形成日出渐变——不要搅拌。',
        '用橙片和樱桃装饰。',
      ],
      'zh-TW': [
        '在直身杯中加入冰塊。',
        '倒入龍舌蘭和柳橙汁，攪拌均勻。',
        '將紅石榴糖漿沿杯壁緩慢倒入，使其沉底。',
        '讓其自然上升形成日出漸層——不要攪拌。',
        '用柳橙片和櫻桃裝飾。',
      ],
      ja: [
        'ハイボールグラスに氷を入れます。',
        'テキーラとオレンジジュースを注ぎ、混ぜ合わせます。',
        'グレナデンをグラスの内側に沿ってゆっくり注ぎ、底に沈めます。',
        '自然に上昇させて日の出グラデーションを作ります——混ぜないでください。',
        'オレンジスライスとチェリーを飾ります。',
      ],
      ko: [
        '하이볼 글라스에 얼음을 채우세요.',
        '데킬라와 오렌지 주스를 따르고 섞으세요.',
        '그레나딘을 잔 안쪽을 따라 천천히 부어 바닥에 가라앉히세요.',
        '자연스럽게 올라와 일출 그라데이션을 만들게 하세요 — 저으세요 안 됩니다.',
        '오렌지 슬라이스와 체리로 장식하세요.',
      ],
    },
    abv: '12% ABV',
  },
  // --- Gin & Tonic (last — the broadest match; placed after Gimlet/Mojito) ---
  {
    require: [
      { enName: 'Gin', amount: '45 ml' },
      { enName: 'Tonic Water', amount: '120 ml' },
    ],
    name: {
      en: 'Gin & Tonic',
      'zh-CN': '金汤力',
      'zh-TW': '琴湯尼',
      ja: 'ジン・トニック',
      ko: '진 토닉',
    },
    tagline: {
      en: 'Crisp, botanical, effervescent — the simplest great cocktail on earth.',
      'zh-CN': '清爽、花香、气泡翻腾——世上最简单的伟大鸡尾酒。',
      'zh-TW': '清爽、花香、氣泡翻騰——世上最簡單的偉大雞尾酒。',
      ja: '爽やか、ボタニカル、弾ける泡——世界で最もシンプルな偉大なカクテル。',
      ko: '산뜻하고, 보태니컬하고, 탄산이 톡 쏘는 — 세상에서 가장 간단하면서 위대한 칵테일.',
    },
    steps: {
      en: [
        'Fill a large balloon (Copa) or highball glass with plenty of ice.',
        'Pour the gin over the ice.',
        'Top with cold tonic water poured down the side to keep the fizz.',
        'Stir once very gently with a bar spoon.',
        'Garnish with a lime wedge or, for botanical gins, a sprig of rosemary.',
      ],
      'zh-CN': [
        '在大气球杯（Copa）或直身杯中加入充足冰块。',
        '将金酒倒在冰上。',
        '沿杯壁倒入冰汤力水以保留气泡。',
        '用吧勺轻轻搅一下。',
        '用青柠角装饰；若是花香金酒可用一束迷迭香。',
      ],
      'zh-TW': [
        '在大氣球杯（Copa）或直身杯中加入充足冰塊。',
        '將琴酒倒在冰上。',
        '沿杯壁倒入冰通寧水以保留氣泡。',
        '用吧勺輕輕攪一下。',
        '用萊姆角裝飾；若是花香琴酒可用一束迷迭香。',
      ],
      ja: [
        '大きめのバルーン（コパ）グラスかハイボールグラスにたっぷりの氷を入れます。',
        'ジンを氷に注ぎます。',
        '冷やしたトニックウォーターをグラスの側面に沿って注ぎ、炭酸を保ちます。',
        'バースプーンで一度だけ軽く混ぜます。',
        'ライムを飾ります。ボタニカルなジンならローズマリーを一枝。',
      ],
      ko: [
        '큰 풍선(코파) 또는 하이볼 글라스에 얼음을 듬뿍 채우세요.',
        '진을 얼음 위에 따르세요.',
        '차가운 토닉워터를 잔 옆면을 따라 부어 탄산을 지키세요.',
        '바 스푼으로 한 번만 아주 가볍게 저으세요.',
        '라임 조각으로 장식하세요. 보태니컬 진이면 로즈마리 한 가지.',
      ],
    },
    abv: '10% ABV',
  },
];
