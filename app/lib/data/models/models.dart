// Dart data classes mirroring the Home Bartender AI OpenAPI contract
// (docs/api/openapi.yaml). All `fromJson` parsers are tolerant of missing
// fields so the app degrades gracefully against partial backend responses.

/// Ingredient categories — matches `IngredientCategory` enum.
enum IngredientCategory {
  baseSpirit('base_spirit'),
  drink('drink'),
  fruit('fruit'),
  snack('snack');

  const IngredientCategory(this.wire);

  /// Value as sent/received over the wire.
  final String wire;

  static IngredientCategory fromWire(String? value) {
    return IngredientCategory.values.firstWhere(
      (c) => c.wire == value,
      orElse: () => IngredientCategory.drink,
    );
  }
}

/// User roles — matches `Role` enum.
enum UserRole {
  user('user'),
  operator('operator'),
  admin('admin');

  const UserRole(this.wire);
  final String wire;

  static UserRole fromWire(String? value) {
    return UserRole.values.firstWhere(
      (r) => r.wire == value,
      orElse: () => UserRole.user,
    );
  }
}

/// Lab entry result — success or flop.
enum LabResult {
  success('success'),
  fail('fail');

  const LabResult(this.wire);
  final String wire;

  static LabResult fromWire(String? value) {
    return LabResult.values.firstWhere(
      (r) => r.wire == value,
      orElse: () => LabResult.success,
    );
  }
}

/// Moderation status for lab entries / wall submissions.
enum ModerationStatus {
  private('private'),
  pending('pending'),
  approved('approved'),
  rejected('rejected');

  const ModerationStatus(this.wire);
  final String wire;

  static ModerationStatus fromWire(String? value) {
    return ModerationStatus.values.firstWhere(
      (s) => s.wire == value,
      orElse: () => ModerationStatus.private,
    );
  }
}

/// Poster job overall status.
enum PosterJobStatus {
  pending('pending'),
  running('running'),
  partial('partial'),
  done('done'),
  failed('failed');

  const PosterJobStatus(this.wire);
  final String wire;

  static PosterJobStatus fromWire(String? value) {
    return PosterJobStatus.values.firstWhere(
      (s) => s.wire == value,
      orElse: () => PosterJobStatus.pending,
    );
  }
}

/// Status of an individual poster within a job.
enum PosterStatus {
  pending('pending'),
  running('running'),
  done('done'),
  failed('failed');

  const PosterStatus(this.wire);
  final String wire;

  static PosterStatus fromWire(String? value) {
    return PosterStatus.values.firstWhere(
      (s) => s.wire == value,
      orElse: () => PosterStatus.pending,
    );
  }
}

/// Poster dimension preset.
enum PosterDimension {
  homeCloseup('home_closeup'),
  barCommercial('bar_commercial'),
  stepsLong('steps_long'),
  custom('custom');

  const PosterDimension(this.wire);
  final String wire;

  static PosterDimension fromWire(String? value) {
    return PosterDimension.values.firstWhere(
      (d) => d.wire == value,
      orElse: () => PosterDimension.homeCloseup,
    );
  }
}

class User {
  const User({
    required this.id,
    required this.account,
    required this.displayName,
    required this.role,
  });

  final String id;
  final String account;
  final String displayName;
  final UserRole role;

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id']?.toString() ?? '',
      account: json['account']?.toString() ?? '',
      displayName: json['displayName']?.toString() ?? '',
      role: UserRole.fromWire(json['role']?.toString()),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'account': account,
        'displayName': displayName,
        'role': role.wire,
      };
}

class AuthResult {
  const AuthResult({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  final String accessToken;
  final String refreshToken;
  final User user;

  factory AuthResult.fromJson(Map<String, dynamic> json) {
    return AuthResult(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      user: User.fromJson(
        (json['user'] as Map?)?.cast<String, dynamic>() ?? const {},
      ),
    );
  }
}

class Ingredient {
  const Ingredient({
    required this.id,
    required this.category,
    required this.name,
    required this.enabled,
    this.imageUrl,
  });

  final String id;
  final IngredientCategory category;

  /// Display name already resolved by the backend for the requested locale.
  final String name;
  final bool enabled;

  /// Flat-illustration artwork URL. Null/empty until the backend finishes
  /// generating it asynchronously — render a placeholder in that case.
  final String? imageUrl;

  factory Ingredient.fromJson(Map<String, dynamic> json) {
    return Ingredient(
      id: json['id']?.toString() ?? '',
      category: IngredientCategory.fromWire(json['category']?.toString()),
      name: json['name']?.toString() ?? '',
      enabled: json['enabled'] as bool? ?? true,
      imageUrl: (json['imageUrl']?.toString().isNotEmpty ?? false)
          ? json['imageUrl'].toString()
          : null,
    );
  }
}

class RecipeItem {
  const RecipeItem({
    required this.ingredientId,
    required this.name,
    required this.amount,
    required this.optional,
  });

  final String ingredientId;
  final String name;
  final String amount;
  final bool optional;

  factory RecipeItem.fromJson(Map<String, dynamic> json) {
    return RecipeItem(
      ingredientId: json['ingredientId']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      amount: json['amount']?.toString() ?? '',
      optional: json['optional'] as bool? ?? false,
    );
  }
}

class ToolSubstitution {
  const ToolSubstitution({required this.tool, required this.homeAlternative});

  final String tool;
  final String homeAlternative;

  factory ToolSubstitution.fromJson(Map<String, dynamic> json) {
    return ToolSubstitution(
      tool: json['tool']?.toString() ?? '',
      homeAlternative: json['homeAlternative']?.toString() ?? '',
    );
  }
}

class Recipe {
  const Recipe({
    required this.id,
    required this.name,
    required this.tagline,
    required this.locale,
    required this.items,
    required this.steps,
    required this.toolSubstitutions,
    required this.alcoholRange,
    required this.safetyNotes,
    required this.isExample,
    this.imageUrl,
    this.featuredImageUrl,
  });

  final String id;
  final String name;
  final String tagline;
  final String locale;
  final List<RecipeItem> items;
  final List<String> steps;
  final List<ToolSubstitution> toolSubstitutions;
  final String alcoholRange;
  final List<String> safetyNotes;
  final bool isExample;

  /// Flat-illustration artwork URL. Null/empty until the backend finishes
  /// generating it asynchronously.
  final String? imageUrl;

  /// Pre-rendered step/result image for featured recipes. When present, opening
  /// the recipe shows this instantly instead of running a live poster job.
  final String? featuredImageUrl;

  factory Recipe.fromJson(Map<String, dynamic> json) {
    return Recipe(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      tagline: json['tagline']?.toString() ?? '',
      locale: json['locale']?.toString() ?? 'en',
      items: (json['items'] as List? ?? [])
          .whereType<Map>()
          .map((e) => RecipeItem.fromJson(e.cast<String, dynamic>()))
          .toList(),
      steps: (json['steps'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      toolSubstitutions: (json['toolSubstitutions'] as List? ?? [])
          .whereType<Map>()
          .map((e) => ToolSubstitution.fromJson(e.cast<String, dynamic>()))
          .toList(),
      alcoholRange: json['alcoholRange']?.toString() ?? '',
      safetyNotes: (json['safetyNotes'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      isExample: json['isExample'] as bool? ?? false,
      imageUrl: (json['imageUrl']?.toString().isNotEmpty ?? false)
          ? json['imageUrl'].toString()
          : null,
      featuredImageUrl: (json['featuredImageUrl']?.toString().isNotEmpty ??
              false)
          ? json['featuredImageUrl'].toString()
          : null,
    );
  }
}

class LayoutConfig {
  const LayoutConfig({
    required this.textAlign,
    required this.watermarkPosition,
  });

  final String textAlign;
  final String watermarkPosition;

  factory LayoutConfig.fromJson(Map<String, dynamic> json) {
    return LayoutConfig(
      textAlign: json['textAlign']?.toString() ?? 'center',
      watermarkPosition: json['watermarkPosition']?.toString() ?? 'bottom-right',
    );
  }
}

class StyleTemplate {
  const StyleTemplate({
    required this.id,
    required this.name,
    required this.dimension,
    required this.prompt,
    required this.layout,
    required this.textRenderMode,
    required this.enabled,
    required this.version,
  });

  final String id;
  final String name;
  final PosterDimension dimension;
  final String prompt;
  final LayoutConfig? layout;
  final String textRenderMode;
  final bool enabled;
  final int version;

  factory StyleTemplate.fromJson(Map<String, dynamic> json) {
    return StyleTemplate(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      dimension: PosterDimension.fromWire(json['dimension']?.toString()),
      prompt: json['prompt']?.toString() ?? '',
      layout: json['layout'] is Map
          ? LayoutConfig.fromJson(
              (json['layout'] as Map).cast<String, dynamic>())
          : null,
      textRenderMode: json['textRenderMode']?.toString() ?? 'backend',
      enabled: json['enabled'] as bool? ?? true,
      version: json['version'] as int? ?? 1,
    );
  }
}

class Poster {
  const Poster({
    required this.id,
    required this.dimension,
    required this.templateId,
    required this.status,
    required this.imageUrl,
    required this.textSnapshot,
  });

  final String id;
  final PosterDimension dimension;
  final String templateId;
  final PosterStatus status;
  final String imageUrl;
  final Map<String, dynamic> textSnapshot;

  factory Poster.fromJson(Map<String, dynamic> json) {
    return Poster(
      id: json['id']?.toString() ?? '',
      dimension: PosterDimension.fromWire(json['dimension']?.toString()),
      templateId: json['templateId']?.toString() ?? '',
      status: PosterStatus.fromWire(json['status']?.toString()),
      imageUrl: json['imageUrl']?.toString() ?? '',
      textSnapshot:
          (json['textSnapshot'] as Map?)?.cast<String, dynamic>() ?? const {},
    );
  }

  Poster copyWith({PosterStatus? status, String? imageUrl}) {
    return Poster(
      id: id,
      dimension: dimension,
      templateId: templateId,
      status: status ?? this.status,
      imageUrl: imageUrl ?? this.imageUrl,
      textSnapshot: textSnapshot,
    );
  }
}

class PosterJob {
  const PosterJob({
    required this.id,
    required this.recipeId,
    required this.status,
    required this.posters,
  });

  final String id;
  final String recipeId;
  final PosterJobStatus status;
  final List<Poster> posters;

  factory PosterJob.fromJson(Map<String, dynamic> json) {
    return PosterJob(
      id: json['id']?.toString() ?? '',
      recipeId: json['recipeId']?.toString() ?? '',
      status: PosterJobStatus.fromWire(json['status']?.toString()),
      posters: (json['posters'] as List? ?? [])
          .whereType<Map>()
          .map((e) => Poster.fromJson(e.cast<String, dynamic>()))
          .toList(),
    );
  }

  PosterJob copyWith({PosterJobStatus? status, List<Poster>? posters}) {
    return PosterJob(
      id: id,
      recipeId: recipeId,
      status: status ?? this.status,
      posters: posters ?? this.posters,
    );
  }
}

class LabEntry {
  const LabEntry({
    required this.id,
    required this.recipeId,
    required this.posterImageUrl,
    required this.photos,
    required this.result,
    required this.note,
    required this.isPublic,
    required this.moderationStatus,
    required this.createdAt,
    this.jobId,
    this.posterStatus,
  });

  final String id;
  final String recipeId;

  /// Poster image generated by the system from the share task (step ③).
  final String posterImageUrl;

  /// User-uploaded finished-product photos (0–3). Empty when skipped.
  final List<String> photos;
  final LabResult result;
  final String note;
  final bool isPublic;
  final ModerationStatus moderationStatus;
  final DateTime createdAt;

  /// The poster job that produces this entry's share image (async on the
  /// backend). Present when the entry was created via "request succeeds →
  /// return home"; null for legacy entries.
  final String? jobId;

  /// Status of the share-image job. Null/pending/running ⇒ still generating.
  final PosterStatus? posterStatus;

  /// True while the system share image is still being generated.
  bool get isGenerating =>
      posterStatus == null ||
      posterStatus == PosterStatus.pending ||
      posterStatus == PosterStatus.running;

  /// Card display image: prefer user photos, fall back to the system poster.
  String get imageUrl =>
      photos.isNotEmpty ? photos.first : posterImageUrl;

  factory LabEntry.fromJson(Map<String, dynamic> json) {
    return LabEntry(
      id: json['id']?.toString() ?? '',
      recipeId: json['recipeId']?.toString() ?? '',
      posterImageUrl: json['posterImageUrl']?.toString() ?? '',
      photos: (json['photos'] as List? ?? [])
          .map((e) => e.toString())
          .toList(),
      result: LabResult.fromWire(json['result']?.toString()),
      jobId: (json['jobId']?.toString().isNotEmpty ?? false)
          ? json['jobId'].toString()
          : null,
      posterStatus: json['posterStatus'] == null
          ? null
          : PosterStatus.fromWire(json['posterStatus']?.toString()),
      note: json['note']?.toString() ?? '',
      isPublic: json['isPublic'] as bool? ?? false,
      moderationStatus:
          ModerationStatus.fromWire(json['moderationStatus']?.toString()),
      createdAt:
          DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
              DateTime.now(),
    );
  }
}

/// A saved fridge scan / bar inventory snapshot — the set of ingredient ids
/// the user had on hand, with a display [summary] (localized ingredient names
/// joined) and an optional reference photo. Powers "recent scans" history and
/// restoring the current inventory. Mirrors the backend `FridgeScan`.
class ScanInventory {
  const ScanInventory({
    required this.id,
    required this.ingredientIds,
    required this.summary,
    required this.createdAt,
    this.imageUrl,
  });

  final String id;
  final List<String> ingredientIds;

  /// Human-readable label, e.g. "Gin, Lime, Tonic".
  final String summary;
  final String? imageUrl;
  final DateTime createdAt;

  factory ScanInventory.fromJson(Map<String, dynamic> json) {
    return ScanInventory(
      id: json['id']?.toString() ?? '',
      ingredientIds: (json['ingredientIds'] as List? ?? const [])
          .map((e) => e.toString())
          .toList(),
      summary: json['summary']?.toString() ?? '',
      imageUrl: (json['imageUrl']?.toString().isNotEmpty ?? false)
          ? json['imageUrl'].toString()
          : null,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'ingredientIds': ingredientIds,
        'summary': summary,
        if (imageUrl != null) 'imageUrl': imageUrl,
        'createdAt': createdAt.toIso8601String(),
      };

  /// Builds a comma-joined summary from a list of ingredient display names.
  static String summarize(Iterable<String> names) => names.join(', ');
}

/// Generic API error matching the `Error` schema.
class ApiException implements Exception {
  ApiException(this.statusCode, this.message, [this.code]);

  final int statusCode;
  final String message;
  final String? code;

  @override
  String toString() => 'ApiException($statusCode, $message)';
}
