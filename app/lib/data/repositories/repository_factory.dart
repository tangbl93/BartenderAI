import '../config/app_config.dart';
import '../services/api_service.dart';
import 'api_repository.dart';
import 'mock_repository.dart';
import 'repositories.dart';

/// Builds the [Repositories] bundle based on [AppConfig.useMock].
///
/// Both the mock and API implementations expose every repository interface,
/// so a single instance backs all six slots.
Repositories buildRepositories(AppConfig config, {ApiService? apiService}) {
  if (config.useMock) {
    final mock = MockRepository();
    return Repositories(
      auth: mock,
      ingredients: mock,
      recipes: mock,
      posters: mock,
      lab: mock,
    );
  }
  final api = ApiRepository(
    apiService ?? ApiService(baseUrl: config.apiBaseUrl),
  );
  return Repositories(
    auth: api,
    ingredients: api,
    recipes: api,
    posters: api,
    lab: api,
  );
}
