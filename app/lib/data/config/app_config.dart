/// Application-wide configuration.
///
/// [useMock] decides whether the app runs against a real backend or the
/// in-memory mock repository. It defaults to `true` so the app compiles and
/// runs without a backend, and can be overridden at build time with:
///
///   flutter run --dart-define=USE_MOCK=false --dart-define=API_BASE_URL=...
class AppConfig {
  const AppConfig({required this.useMock, required this.apiBaseUrl});

  final bool useMock;
  final String apiBaseUrl;

  static const String _defaultBaseUrl = 'http://localhost:3000/api/v1';

  factory AppConfig.fromEnvironment() {
    const useMock = bool.fromEnvironment('USE_MOCK', defaultValue: true);
    const baseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: _defaultBaseUrl,
    );
    return const AppConfig(useMock: useMock, apiBaseUrl: baseUrl);
  }
}
