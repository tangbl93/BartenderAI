import '../models/models.dart';

/// Repository contracts consumed by the logic/UI layers. Implementations are
/// either [MockRepository] (no backend) or [ApiRepository] (HTTP backend),
/// selected via [AppConfig.useMock].
abstract class AuthRepository {
  Future<AuthResult> register(String account, String password, String? name);
  Future<AuthResult> login(String account, String password);
  Future<AuthResult> deviceLogin(String deviceId,
      {String platform = 'android', String locale = 'en'});
  Future<void> logout();
}

abstract class IngredientRepository {
  Future<List<Ingredient>> list(String locale, {IngredientCategory? category});
}

abstract class RecipeRepository {
  /// Throws [ApiException] with code `INSUFFICIENT_INGREDIENTS` when fewer
  /// than two ingredients are supplied (matches the contract's 422).
  Future<Recipe> generate(List<String> ingredientIds, String locale);
  Future<List<Recipe>> examples(String locale);
}

abstract class PosterRepository {
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

/// Aggregate handle passed around the app.
class Repositories {
  const Repositories({
    required this.auth,
    required this.ingredients,
    required this.recipes,
    required this.posters,
    required this.lab,
  });

  final AuthRepository auth;
  final IngredientRepository ingredients;
  final RecipeRepository recipes;
  final PosterRepository posters;
  final LabRepository lab;
}
