import 'dart:async';

import '../models/models.dart';
import 'repositories.dart';

/// In-memory implementation of every repository — a test double used by widget/unit tests, not the running app.
///
/// Ingredient display names, recipe text, examples and tagline are localized
/// per the requested locale (en / zh-CN / zh-TW / ja / ko) with English
/// fallback, mirroring the contract's locale-driven generation.
class MockRepository
    implements
        AuthRepository,
        IngredientRepository,
        RecipeRepository,
        PosterRepository,
        LabRepository,
        FridgeInventoryRepository {
  MockRepository();

  final List<LabEntry> _labEntries = [];
  final List<ScanInventory> _scans = [];
  int _idSeq = 0;

  String _nextId(String prefix) => '$prefix-${++_idSeq}';

  // Simulated latency so loading states are exercised.
  Future<void> _delay([int ms = 350]) =>
      Future<void>.delayed(Duration(milliseconds: ms));

  String _norm(String locale) {
    // Map a Flutter locale string (e.g. zh_CN, zh-Hant) to our keys.
    final l = locale.replaceAll('-', '_');
    if (l.startsWith('zh_TW') || l.startsWith('zh_Hant')) return 'zh-TW';
    if (l.startsWith('zh')) return 'zh-CN';
    if (l.startsWith('ja')) return 'ja';
    if (l.startsWith('ko')) return 'ko';
    return 'en';
  }

  T _pick<T>(Map<String, T> byLocale, String locale) {
    final key = _norm(locale);
    return byLocale[key] ?? byLocale['en'] as T;
  }

  // ---------------- AUTH ----------------
  @override
  Future<AuthResult> register(
      String account, String password, String? name) async {
    await _delay();
    if (account.trim().toLowerCase() == 'exists@demo.com') {
      throw ApiException(409, 'Account already exists', 'ACCOUNT_EXISTS');
    }
    return _fakeAuth(account, name ?? account.split('@').first);
  }

  @override
  Future<AuthResult> login(String account, String password) async {
    await _delay();
    // Any non-empty password of length >= 1 logs in for the mock, EXCEPT the
    // reserved string 'wrong' which simulates invalid credentials.
    if (password == 'wrong') {
      throw ApiException(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    return _fakeAuth(account, account.split('@').first);
  }

  @override
  Future<void> logout() async => _delay(120);

  @override
  Future<AuthResult> deviceLogin(String deviceId,
      {String platform = 'android', String locale = 'en'}) async {
    await _delay();
    // Deterministic per-GAID so a returning device resolves to the same user.
    final userNum = deviceId.hashCode.abs() % 90000 + 1000;
    return AuthResult(
      accessToken: 'mock-device-${deviceId.hashCode}',
      refreshToken: 'mock-refresh-device-${deviceId.hashCode}',
      user: User(
        id: 'device-$userNum',
        account: 'gaid:$deviceId',
        displayName: 'Guest $userNum',
        role: UserRole.user,
      ),
    );
  }

  AuthResult _fakeAuth(String account, String displayName) {
    return AuthResult(
      accessToken: 'mock-access-${_nextId('tok')}',
      refreshToken: 'mock-refresh-${_nextId('tok')}',
      user: User(
        id: _nextId('user'),
        account: account,
        displayName: displayName,
        role: UserRole.user,
      ),
    );
  }

  // ---------------- INGREDIENTS ----------------
  /// User-contributed ingredients added at runtime (mock has no persistence).
  final List<Ingredient> _customIngredients = [];

  @override
  Future<List<Ingredient>> list(String locale,
      {IngredientCategory? category}) async {
    await _delay();
    final all = [..._seedIngredients(locale), ..._customIngredients];
    if (category == null) return all;
    return all.where((i) => i.category == category).toList();
  }

  @override
  Future<Ingredient> add(
      IngredientCategory category, String name, String locale) async {
    await _delay();
    final trimmed = name.trim();
    if (trimmed.isEmpty) {
      throw ApiException(400, 'Name is required', 'MISSING_FIELD');
    }
    final ingredient = Ingredient(
      id: _nextId('ing-custom'),
      category: category,
      name: trimmed,
      enabled: true,
      // Mock has no image provider; leave null so the placeholder renders.
    );
    _customIngredients.add(ingredient);
    return ingredient;
  }

  List<Ingredient> _seedIngredients(String locale) {
    final defs = <(String, IngredientCategory, Map<String, String>)>[
      ('ing-vodka', IngredientCategory.baseSpirit, {
        'en': 'Vodka',
        'zh-CN': '伏特加',
        'zh-TW': '伏特加',
        'ja': 'ウォッカ',
        'ko': '보드카',
      }),
      ('ing-gin', IngredientCategory.baseSpirit, {
        'en': 'Gin',
        'zh-CN': '金酒',
        'zh-TW': '琴酒',
        'ja': 'ジン',
        'ko': '진',
      }),
      ('ing-rum', IngredientCategory.baseSpirit, {
        'en': 'Rum',
        'zh-CN': '朗姆酒',
        'zh-TW': '蘭姆酒',
        'ja': 'ラム',
        'ko': '럼',
      }),
      ('ing-whiskey', IngredientCategory.baseSpirit, {
        'en': 'Whiskey',
        'zh-CN': '威士忌',
        'zh-TW': '威士忌',
        'ja': 'ウイスキー',
        'ko': '위스키',
      }),
      ('ing-cola', IngredientCategory.drink, {
        'en': 'Cola',
        'zh-CN': '可乐',
        'zh-TW': '可樂',
        'ja': 'コーラ',
        'ko': '콜라',
      }),
      ('ing-soda', IngredientCategory.drink, {
        'en': 'Soda water',
        'zh-CN': '苏打水',
        'zh-TW': '蘇打水',
        'ja': 'ソーダ',
        'ko': '탄산수',
      }),
      ('ing-tonic', IngredientCategory.drink, {
        'en': 'Tonic water',
        'zh-CN': '汤力水',
        'zh-TW': '通寧水',
        'ja': 'トニックウォーター',
        'ko': '토닉워터',
      }),
      ('ing-orange-juice', IngredientCategory.drink, {
        'en': 'Orange juice',
        'zh-CN': '橙汁',
        'zh-TW': '柳橙汁',
        'ja': 'オレンジジュース',
        'ko': '오렌지주스',
      }),
      ('ing-lemon', IngredientCategory.fruit, {
        'en': 'Lemon',
        'zh-CN': '柠檬',
        'zh-TW': '檸檬',
        'ja': 'レモン',
        'ko': '레몬',
      }),
      ('ing-lime', IngredientCategory.fruit, {
        'en': 'Lime',
        'zh-CN': '青柠',
        'zh-TW': '萊姆',
        'ja': 'ライム',
        'ko': '라임',
      }),
      ('ing-orange', IngredientCategory.fruit, {
        'en': 'Orange',
        'zh-CN': '橙子',
        'zh-TW': '柳橙',
        'ja': 'オレンジ',
        'ko': '오렌지',
      }),
      ('ing-mint', IngredientCategory.fruit, {
        'en': 'Mint',
        'zh-CN': '薄荷',
        'zh-TW': '薄荷',
        'ja': 'ミント',
        'ko': '민트',
      }),
      ('ing-chips', IngredientCategory.snack, {
        'en': 'Potato chips',
        'zh-CN': '薯片',
        'zh-TW': '洋芋片',
        'ja': 'ポテトチップス',
        'ko': '감자칩',
      }),
      ('ing-nuts', IngredientCategory.snack, {
        'en': 'Mixed nuts',
        'zh-CN': '混合坚果',
        'zh-TW': '綜合堅果',
        'ja': 'ミックスナッツ',
        'ko': '믹스넛',
      }),
    ];
    return defs
        .map((d) => Ingredient(
              id: d.$1,
              category: d.$2,
              name: _pick(d.$3, locale),
              enabled: true,
              // ponytail: placeholder illustration mirrors the backend's
              // async-generated artwork so chips render an image, not a glyph.
              imageUrl: 'https://picsum.photos/seed/${d.$1}/100/100',
            ))
        .toList();
  }

  // ---------------- RECIPES ----------------
  @override
  Future<Recipe> generate(List<String> ingredientIds, String locale) async {
    await _delay(700);
    if (ingredientIds.length < 2) {
      throw ApiException(
        422,
        'Pick at least 2 ingredients',
        'INSUFFICIENT_INGREDIENTS',
      );
    }
    final ingredients = _seedIngredients(locale);
    final byId = {for (final i in ingredients) i.id: i};
    final chosen = ingredientIds
        .where(byId.containsKey)
        .map((id) => byId[id]!)
        .toList();

    final name = _pick(const {
      'en': 'Midnight Fridge Fizz',
      'zh-CN': '深夜冰箱气泡',
      'zh-TW': '深夜冰箱氣泡',
      'ja': 'ミッドナイト冷蔵庫フィズ',
      'ko': '미드나잇 냉장고 피즈',
    }, locale);
    final tagline = _pick(const {
      'en': 'A spark from whatever you had on hand.',
      'zh-CN': '用手边的材料，点亮微醺的夜。',
      'zh-TW': '用手邊的材料，點亮微醺的夜。',
      'ja': '手元の材料から生まれる、ほろよいのひととき。',
      'ko': '손에 잡히는 재료로 만든 한 잔의 설렘.',
    }, locale);

    final items = <RecipeItem>[];
    final amounts = ['45 ml', '90 ml', '2 dashes', '1 wedge', 'to taste'];
    for (var idx = 0; idx < chosen.length; idx++) {
      items.add(RecipeItem(
        ingredientId: chosen[idx].id,
        name: chosen[idx].name,
        amount: amounts[idx % amounts.length],
        optional: idx >= 3,
      ));
    }

    final steps = _pick(const {
      'en': [
        'Fill a glass with ice.',
        'Pour the base spirit over the ice.',
        'Top up with the mixers and stir gently.',
        'Garnish with fruit and serve immediately.',
      ],
      'zh-CN': [
        '杯中加满冰块。',
        '倒入基酒。',
        '加入饮料，轻轻搅拌。',
        '用水果点缀，立即享用。',
      ],
      'zh-TW': [
        '杯中加滿冰塊。',
        '倒入基酒。',
        '加入飲料，輕輕攪拌。',
        '用水果點綴，立即享用。',
      ],
      'ja': [
        'グラスに氷を入れる。',
        'ベーススピリッツを注ぐ。',
        'ミキサーを加えてやさしく混ぜる。',
        'フルーツを飾ってすぐにどうぞ。',
      ],
      'ko': [
        '잔에 얼음을 가득 채웁니다.',
        '베이스 스피릿을 따릅니다.',
        '음료를 넣고 가볍게 저어줍니다.',
        '과일로 장식하고 바로 즐기세요.',
      ],
    }, locale);

    final tools = _pick(const {
      'en': [
        ('Jigger', '1 jigger ≈ 1.5 tablespoons'),
        ('Bar spoon', 'Use a long teaspoon'),
      ],
      'zh-CN': [
        ('量酒器', '1 量酒器 ≈ 1.5 汤匙'),
        ('调酒勺', '用长柄茶匙代替'),
      ],
      'zh-TW': [
        ('量酒器', '1 量酒器 ≈ 1.5 湯匙'),
        ('調酒匙', '用長柄茶匙代替'),
      ],
      'ja': [
        ('ジガー', '1 ジガー ≈ 大さじ1.5'),
        ('バースプーン', '長いティースプーンで代用'),
      ],
      'ko': [
        ('지거', '지거 1 ≈ 큰술 1.5'),
        ('바 스푼', '긴 티스푼으로 대체'),
      ],
    }, locale)
        .map((t) => ToolSubstitution(tool: t.$1, homeAlternative: t.$2))
        .toList();

    final safety = _pick(const {
      'en': [
        'Please drink responsibly. No alcohol for minors.',
        'Avoid mixing with energy drinks in excess.',
      ],
      'zh-CN': [
        '请适量饮用，未成年人禁止饮酒。',
        '避免与功能性饮料过量混合。',
      ],
      'zh-TW': [
        '請適量飲用，未成年人禁止飲酒。',
        '避免與機能性飲料過量混合。',
      ],
      'ja': [
        '適量を飲みましょう。未成年の飲酒は禁止です。',
        'エナジードリンクとの過剰な混合は避けてください。',
      ],
      'ko': [
        '적당히 즐기세요. 미성년자 음주는 금지입니다.',
        '에너지 음료와 과도하게 섞지 마세요.',
      ],
    }, locale);

    return Recipe(
      id: _nextId('recipe'),
      name: name,
      tagline: tagline,
      locale: _norm(locale),
      items: items,
      steps: steps,
      toolSubstitutions: tools,
      alcoholRange: '8-12% ABV',
      safetyNotes: safety,
      isExample: false,
    );
  }

  @override
  Future<List<Recipe>> examples(String locale) async {
    await _delay();
    final base = await _exampleRecipe(locale, 'Sunset Spritz', {
      'zh-CN': '日落气泡',
      'zh-TW': '日落氣泡',
      'ja': 'サンセットスプリッツ',
      'ko': '선셋 스프리츠',
    });
    final base2 = await _exampleRecipe(locale, 'Minty Cooler', {
      'zh-CN': '清凉薄荷',
      'zh-TW': '清涼薄荷',
      'ja': 'ミンティクーラー',
      'ko': '민티 쿨러',
    });
    final base3 = await _exampleRecipe(locale, 'Citrus Highball', {
      'zh-CN': '柑橘高球',
      'zh-TW': '柑橘高球',
      'ja': 'シトラスハイボール',
      'ko': '시트러스 하이볼',
    });
    return [base, base2, base3];
  }

  Future<Recipe> _exampleRecipe(
      String locale, String enName, Map<String, String> names) async {
    final r = await generate(['ing-vodka', 'ing-soda', 'ing-lemon'], locale);
    final localizedName = _pick({'en': enName, ...names}, locale);
    return Recipe(
      id: _nextId('example'),
      name: localizedName,
      tagline: r.tagline,
      locale: r.locale,
      items: r.items,
      steps: r.steps,
      toolSubstitutions: r.toolSubstitutions,
      alcoholRange: r.alcoholRange,
      safetyNotes: r.safetyNotes,
      isExample: true,
    );
  }

  // ---------------- POSTERS ----------------
  final Map<String, PosterJob> _jobs = {};

  /// Backend-configured style templates. The dimension/textRenderMode fields
  /// are vestigial here (the backend drives image generation); the UI only
  /// needs id + name.
  @override
  Future<List<StyleTemplate>> templates() async {
    await _delay();
    return const [
      StyleTemplate(
        id: 'tpl-neon',
        name: 'Neon Pulse',
        dimension: PosterDimension.homeCloseup,
        prompt: '',
        layout: null,
        textRenderMode: 'model',
        enabled: true,
        version: 1,
      ),
      StyleTemplate(
        id: 'tpl-haze',
        name: 'Midnight Haze',
        dimension: PosterDimension.homeCloseup,
        prompt: '',
        layout: null,
        textRenderMode: 'model',
        enabled: true,
        version: 1,
      ),
      StyleTemplate(
        id: 'tpl-pop',
        name: 'Citrus Pop',
        dimension: PosterDimension.homeCloseup,
        prompt: '',
        layout: null,
        textRenderMode: 'model',
        enabled: true,
        version: 1,
      ),
    ];
  }

  @override
  Future<PosterJob> createJob(String recipeId, String locale,
      {List<String>? templateIds}) async {
    await _delay();
    final jobId = _nextId('job');
    final posters = [
      Poster(
        id: _nextId('poster'),
        dimension: PosterDimension.homeCloseup,
        templateId: 'tpl-home',
        status: PosterStatus.running,
        imageUrl: '',
        textSnapshot: const {},
      ),
      Poster(
        id: _nextId('poster'),
        dimension: PosterDimension.barCommercial,
        templateId: 'tpl-bar',
        status: PosterStatus.running,
        imageUrl: '',
        textSnapshot: const {},
      ),
      Poster(
        id: _nextId('poster'),
        dimension: PosterDimension.stepsLong,
        templateId: 'tpl-steps',
        status: PosterStatus.running,
        imageUrl: '',
        textSnapshot: const {},
      ),
    ];
    final job = PosterJob(
      id: jobId,
      recipeId: recipeId,
      status: PosterJobStatus.running,
      posters: posters,
    );
    _jobs[jobId] = job;
    _pollCount[jobId] = 0;
    return job;
  }

  final Map<String, int> _pollCount = {};

  @override
  Future<PosterJob> job(String id) async {
    await _delay(400);
    final job = _jobs[id];
    if (job == null) {
      throw ApiException(404, 'Job not found', 'NOT_FOUND');
    }
    final count = (_pollCount[id] ?? 0) + 1;
    _pollCount[id] = count;

    // Progressively complete posters across polls; the 2nd one "fails"
    // on the final poll to exercise the partial-success / retry path.
    final updated = <Poster>[];
    for (var idx = 0; idx < job.posters.length; idx++) {
      final p = job.posters[idx];
      if (count > idx + 1) {
        if (idx == 1 && p.status != PosterStatus.done) {
          updated.add(p.copyWith(status: PosterStatus.failed));
        } else {
          updated.add(p.copyWith(
            status: PosterStatus.done,
            imageUrl: 'https://picsum.photos/seed/${p.id}/600/800',
          ));
        }
      } else {
        updated.add(p);
      }
    }
    final anyRunning = updated.any((p) => p.status == PosterStatus.running);
    final anyFailed = updated.any((p) => p.status == PosterStatus.failed);
    final status = anyRunning
        ? PosterJobStatus.running
        : anyFailed
            ? PosterJobStatus.partial
            : PosterJobStatus.done;
    final next = job.copyWith(posters: updated, status: status);
    _jobs[id] = next;
    return next;
  }

  @override
  Future<void> retry(String posterId) async {
    await _delay();
    for (final entry in _jobs.entries) {
      final job = entry.value;
      final idx = job.posters.indexWhere((p) => p.id == posterId);
      if (idx >= 0) {
        final fixed = job.posters[idx].copyWith(
          status: PosterStatus.done,
          imageUrl: 'https://picsum.photos/seed/$posterId/600/800',
        );
        final posters = [...job.posters]..[idx] = fixed;
        final anyFailed = posters.any((p) => p.status == PosterStatus.failed);
        _jobs[entry.key] = job.copyWith(
          posters: posters,
          status: anyFailed ? PosterJobStatus.partial : PosterJobStatus.done,
        );
        return;
      }
    }
  }

  // ---------------- LAB ----------------
  @override
  Future<List<LabEntry>> entries() async {
    await _delay();
    final list = [..._labEntries]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  @override
  Future<LabEntry> create(String recipeId, String posterImageUrl,
      {List<String>? photos, String? note}) async {
    await _delay();
    if (posterImageUrl.isEmpty && (photos == null || photos.isEmpty)) {
      throw ApiException(400, 'Image is required', 'MISSING_FIELD');
    }
    final entry = LabEntry(
      id: _nextId('lab'),
      recipeId: recipeId,
      posterImageUrl: posterImageUrl,
      photos: List<String>.unmodifiable(photos ?? const []),
      result: LabResult.success,
      note: note ?? '',
      isPublic: false,
      moderationStatus: ModerationStatus.private,
      createdAt: DateTime.now(),
    );
    _labEntries.add(entry);
    return entry;
  }

  // ---------------- FRIDGE ----------------
  @override
  Future<ScanInventory> save(List<String> ingredientIds,
      {required String summary, String? imageUrl}) async {
    await _delay();
    if (ingredientIds.isEmpty) {
      throw ApiException(400, 'Ingredients required', 'MISSING_FIELD');
    }
    final scan = ScanInventory(
      id: _nextId('scan'),
      ingredientIds: List<String>.unmodifiable(ingredientIds),
      summary: summary.isNotEmpty ? summary : ingredientIds.join(', '),
      imageUrl: imageUrl,
      createdAt: DateTime.now(),
    );
    _scans.add(scan);
    return scan;
  }

  @override
  Future<List<ScanInventory>> recent() async {
    await _delay();
    final list = [..._scans]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list.take(10).toList();
  }

  @override
  Future<ScanInventory?> latest() async {
    await _delay();
    if (_scans.isEmpty) return null;
    final sorted = [..._scans]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return sorted.first;
  }
}
