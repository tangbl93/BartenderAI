import '../models/models.dart';

/// Repository contracts consumed by the logic/UI layers. Production uses [ApiRepository] (HTTP backend); [MockRepository] is an in-memory test double.
abstract class AuthRepository {
  Future<AuthResult> register(String account, String password, String? name);
  Future<AuthResult> login(String account, String password);
  Future<AuthResult> deviceLogin(String deviceId,
      {String platform = 'android', String locale = 'en'});
  Future<void> logout();
}

abstract class IngredientRepository {
  Future<List<Ingredient>> list(String locale, {IngredientCategory? category});

  /// User-contributed ingredient: takes effect immediately and is public.
  /// The backend generates its illustration asynchronously.
  Future<Ingredient> add(
    IngredientCategory category,
    String name,
    String locale,
  );
}

abstract class RecipeRepository {
  /// Throws [ApiException] with code `INSUFFICIENT_INGREDIENTS` when fewer
  /// than two ingredients are supplied (matches the contract's 422).
  Future<Recipe> generate(List<String> ingredientIds, String locale);
  Future<List<Recipe>> examples(String locale);
}

abstract class PosterRepository {
  /// Backend-configured style templates the user picks from when sharing.
  /// Different templates yield different generated share images.
  Future<List<StyleTemplate>> templates();
  Future<PosterJob> createJob(String recipeId, String locale,
      {List<String>? templateIds});
  Future<PosterJob> job(String id);
  Future<void> retry(String posterId);
}

abstract class LabRepository {
  Future<List<LabEntry>> entries();
  Future<LabEntry> create(String recipeId, String posterImageUrl,
      {List<String>? photos, String? note});
}

abstract class FridgeInventoryRepository {
  /// Persists the current inventory (scan/manual pick). [summary] is the
  /// localized, comma-joined ingredient names for display in history.
  Future<ScanInventory> save(List<String> ingredientIds,
      {required String summary, String? imageUrl});

  /// Recent scans, newest first (backend caps the count).
  Future<List<ScanInventory>> recent();

  /// The most recently saved inventory, or null when the user has none.
  Future<ScanInventory?> latest();
}

/// Aggregate handle passed around the app.
class Repositories {
  const Repositories({
    required this.auth,
    required this.ingredients,
    required this.recipes,
    required this.posters,
    required this.lab,
    required this.fridge,
  });

  final AuthRepository auth;
  final IngredientRepository ingredients;
  final RecipeRepository recipes;
  final PosterRepository posters;
  final LabRepository lab;
  final FridgeInventoryRepository fridge;
}
