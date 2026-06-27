import '../models/models.dart';
import '../services/api_service.dart';
import 'repositories.dart';

/// HTTP-backed repositories. Selected when `AppConfig.useMock == false`.
/// Each delegates to [ApiService] and shares its bearer token.
class ApiRepository
    implements
        AuthRepository,
        IngredientRepository,
        RecipeRepository,
        PosterRepository,
        LabRepository,
        WallRepository {
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
  Future<void> logout() => _api.logout();

  @override
  Future<List<Ingredient>> list(String locale, {IngredientCategory? category}) {
    return _api.ingredients(locale, category: category);
  }

  @override
  Future<Recipe> generate(List<String> ingredientIds, String locale) {
    return _api.generateRecipe(ingredientIds, locale);
  }

  @override
  Future<List<Recipe>> examples(String locale) => _api.recipeExamples(locale);

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
  Future<LabEntry> create(
      String recipeId, String imageUrl, LabResult result, String? note) {
    return _api.createLabEntry(recipeId, imageUrl, result, note);
  }

  @override
  Future<void> submitToWall(String entryId) => _api.submitToWall(entryId);

  @override
  Future<List<LabEntry>> feed({String sort = 'time', int page = 1}) {
    return _api.wall(sort: sort, page: page);
  }
}
