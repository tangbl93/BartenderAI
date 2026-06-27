import '../config/app_config.dart';
import '../services/api_service.dart';
import 'api_repository.dart';
import 'repositories.dart';

/// Builds the [Repositories] bundle backed by the real HTTP backend, plus the
/// [ApiService] so callers can push the auth token onto it.
///
/// `apiService` may be injected (e.g. for tests with a stubbed transport).
({Repositories repositories, ApiService api}) buildRepositories(
  AppConfig config, {
  ApiService? apiService,
}) {
  final api = apiService ?? ApiService(baseUrl: config.apiBaseUrl);
  final repo = ApiRepository(api);
  return (
    repositories: Repositories(
      auth: repo,
      ingredients: repo,
      recipes: repo,
      posters: repo,
      lab: repo,
      fridge: repo,
    ),
    api: api,
  );
}
