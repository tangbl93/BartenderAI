import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Owns the active [Locale], persists the user's choice, and falls back to
/// `en` when the device language is unsupported. Matches the
/// internationalization spec (detect → persist → fallback).
class LocaleController extends ChangeNotifier {
  LocaleController({SharedPreferences? prefs}) : _prefs = prefs;

  static const String _prefKey = 'app_locale';

  /// The five supported app locales (en falls back for everything else).
  static const List<Locale> supported = [
    Locale('en'),
    Locale('zh', 'CN'),
    Locale('zh', 'TW'),
    Locale('ja'),
    Locale('ko'),
  ];

  SharedPreferences? _prefs;
  Locale? _locale;

  /// `null` means "follow the system locale" (resolved by [resolve]).
  Locale? get locale => _locale;

  /// Loads the persisted choice (if any). Call once at startup.
  Future<void> load() async {
    _prefs ??= await SharedPreferences.getInstance();
    final saved = _prefs?.getString(_prefKey);
    if (saved != null) {
      _locale = _parse(saved);
      notifyListeners();
    }
  }

  Future<void> setLocale(Locale locale) async {
    _locale = locale;
    notifyListeners();
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs?.setString(_prefKey, _serialize(locale));
  }

  /// Resolves the locale to use for content/API calls, applying fallback.
  /// [deviceLocales] mirrors `WidgetsBinding.platformDispatcher.locales`.
  static Locale resolve(Locale? selected, List<Locale> deviceLocales) {
    if (selected != null) return _nearest(selected) ?? const Locale('en');
    for (final device in deviceLocales) {
      final match = _nearest(device);
      if (match != null) return match;
    }
    return const Locale('en');
  }

  /// Returns the supported locale closest to [candidate], or null if none.
  /// Used by MaterialApp.localeResolutionCallback too.
  static Locale? _nearest(Locale candidate) {
    // Exact language+country match first.
    for (final s in supported) {
      if (s.languageCode == candidate.languageCode &&
          s.countryCode == candidate.countryCode) {
        return s;
      }
    }
    // For zh, distinguish simplified vs traditional by script/country.
    if (candidate.languageCode == 'zh') {
      final script = candidate.scriptCode;
      final country = candidate.countryCode;
      final isTraditional = script == 'Hant' ||
          country == 'TW' ||
          country == 'HK' ||
          country == 'MO';
      return isTraditional ? const Locale('zh', 'TW') : const Locale('zh', 'CN');
    }
    // Language-only match.
    for (final s in supported) {
      if (s.languageCode == candidate.languageCode && s.countryCode == null) {
        return s;
      }
    }
    return null;
  }

  /// Public wrapper for [_nearest] used by the MaterialApp resolution callback.
  static Locale localeResolution(Locale? device, Iterable<Locale> supported) {
    if (device == null) return const Locale('en');
    return _nearest(device) ?? const Locale('en');
  }

  /// The locale string passed to the API / content layer (en, zh-CN, …).
  static String toContentLocale(Locale locale) {
    if (locale.languageCode == 'zh') {
      return locale.countryCode == 'TW' ? 'zh-TW' : 'zh-CN';
    }
    return locale.languageCode;
  }

  static Locale _parse(String value) {
    final parts = value.split('_');
    if (parts.length == 2) return Locale(parts[0], parts[1]);
    return Locale(parts[0]);
  }

  static String _serialize(Locale locale) {
    return locale.countryCode == null
        ? locale.languageCode
        : '${locale.languageCode}_${locale.countryCode}';
  }
}
