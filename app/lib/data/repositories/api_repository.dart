import '../models/models.dart';
import '../services/api_service.dart';
import 'repositories.dart';

/// HTTP-backed repositories used in production (the app always runs against the real backend).
/// Each delegates to [ApiService] and shares its bearer token.
class ApiRepository
    implements
        AuthRepository,
        IngredientRepository,
        RecipeRepository,
        PosterRepository,
        LabRepository,
        FridgeInventoryRepository {
  ApiRepository(this._api);

  final ApiService _api;

  @override
  Future<AuthResult> register(String account, String password, String? name) {
    return _api.register(account, password, name);
  }

  @override
  Future<AuthResult> login(String account, String password) {
    return _api.login(account, password);
  }

  @override
  Future<AuthResult> deviceLogin(String deviceId,
      {String platform = 'android', String locale = 'en'}) {
    return _api.deviceLogin(deviceId, platform: platform, locale: locale);
  }

  @override
  Future<void> logout() => _api.logout();

  @override
  Future<List<Ingredient>> list(String locale, {IngredientCategory? category}) {
    return _api.ingredients(locale, category: category);
  }

  @override
  Future<Ingredient> add(
      IngredientCategory category, String name, String locale) {
    return _api.createIngredient(category, name, locale);
  }

  @override
  Future<Recipe> generate(List<String> ingredientIds, String locale) {
    return _api.generateRecipe(ingredientIds, locale);
  }

  @override
  Future<List<Recipe>> examples(String locale) => _api.recipeExamples(locale);

  @override
  Future<List<StyleTemplate>> templates() => _api.templates();

  @override
  Future<PosterJob> createJob(String recipeId, String locale,
      {List<String>? templateIds}) {
    return _api.createPosterJob(recipeId, locale, templateIds: templateIds);
  }

  @override
  Future<PosterJob> job(String id) => _api.posterJob(id);

  @override
  Future<void> retry(String posterId) => _api.retryPoster(posterId);

  @override
  Future<List<LabEntry>> entries() => _api.labEntries();

  @override
  Future<LabEntry> create(String recipeId, String posterImageUrl,
      {List<String>? photos, String? note}) {
    return _api.createLabEntry(recipeId, posterImageUrl,
        photos: photos, note: note);
  }

  @override
  Future<ScanInventory> save(List<String> ingredientIds,
      {required String summary, String? imageUrl}) {
    return _api.saveFridgeScan(ingredientIds,
        summary: summary, imageUrl: imageUrl);
  }

  @override
  Future<List<ScanInventory>> recent() => _api.fridgeScans();

  @override
  Future<ScanInventory?> latest() => _api.latestFridgeScan();
}
