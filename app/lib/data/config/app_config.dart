/// Application-wide configuration.
///
/// The backend API base URL is hardcoded below — edit this one constant when
/// repointing the app at a different backend.
class AppConfig {
  const AppConfig({
    this.contactEmail = 'support@homebartender.example',
    this.webAdminBaseUrl = _defaultWebAdmin,
  });

  /// Hardcoded backend API base URL.
  /// Android 模拟器通过 10.0.2.2 访问宿主机 localhost；真机改后端 LAN IP。
  final String apiBaseUrl = 'http://10.0.2.2:3000/api/v1';

  /// Profile-screen contact (mailto).
  final String contactEmail;

  /// Web admin site base URL — privacy/terms pages are hosted here.
  /// Override at build time: --dart-define=WEB_ADMIN_BASE_URL=https://admin...
  final String webAdminBaseUrl;

  /// ponytail: protocols served by the web admin site; promote to a backend
  /// config endpoint if these paths ever diverge per-deployment.
  String get privacyPolicyUrl => '$webAdminBaseUrl/privacy';
  String get termsOfServiceUrl => '$webAdminBaseUrl/terms';

  static const String _defaultWebAdmin = 'https://homebartender.example';

  factory AppConfig.fromEnvironment() {
    const webAdmin = String.fromEnvironment(
      'WEB_ADMIN_BASE_URL',
      defaultValue: _defaultWebAdmin,
    );
    return AppConfig(webAdminBaseUrl: webAdmin);
  }
}
