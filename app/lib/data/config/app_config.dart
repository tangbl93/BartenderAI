/// Application-wide configuration.
///
/// [useMock] decides whether the app runs against a real backend or the
/// in-memory mock repository. It defaults to `true` so the app compiles and
/// runs without a backend, and can be overridden at build time with:
///
///   flutter run --dart-define=USE_MOCK=false --dart-define=API_BASE_URL=...
class AppConfig {
  const AppConfig({
    required this.useMock,
    required this.apiBaseUrl,
    this.contactEmail = 'support@homebartender.example',
    this.webAdminBaseUrl = _defaultWebAdmin,
  });

  final bool useMock;
  final String apiBaseUrl;

  /// Profile-screen contact (mailto).
  final String contactEmail;

  /// Web admin site base URL — privacy/terms pages are hosted here.
  /// Override at build time: --dart-define=WEB_ADMIN_BASE_URL=https://admin...
  final String webAdminBaseUrl;

  /// ponytail: protocols served by the web admin site; promote to a backend
  /// config endpoint if these paths ever diverge per-deployment.
  String get privacyPolicyUrl => '$webAdminBaseUrl/privacy';
  String get termsOfServiceUrl => '$webAdminBaseUrl/terms';

  static const String _defaultBaseUrl = 'http://localhost:3000/api/v1';
  static const String _defaultWebAdmin = 'https://homebartender.example';

  factory AppConfig.fromEnvironment() {
    const useMock = bool.fromEnvironment('USE_MOCK', defaultValue: true);
    const baseUrl = String.fromEnvironment(
      'API_BASE_URL',
      defaultValue: _defaultBaseUrl,
    );
    const webAdmin = String.fromEnvironment(
      'WEB_ADMIN_BASE_URL',
      defaultValue: _defaultWebAdmin,
    );
    return const AppConfig(
      useMock: useMock,
      apiBaseUrl: baseUrl,
      webAdminBaseUrl: webAdmin,
    );
  }
}
