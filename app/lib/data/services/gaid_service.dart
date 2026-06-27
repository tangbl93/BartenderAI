import 'package:advertising_id/advertising_id.dart';

/// Fetches the device's Google Advertising ID (GAID) on Android / IDFA on iOS.
///
/// Used for strict GAID-only device auto-login. Returns `null` when the ID is
/// unavailable, empty (limit-ad-tracking enabled), or on platforms where the
/// plugin is a no-op (desktop/web in tests). Callers must fall back to the
/// login screen on `null`.
class GaidService {
  const GaidService();

  /// Returns the advertising id, or null if missing / blank / LAT.
  Future<String?> get advertisingId async {
    try {
      final raw = await AdvertisingId.id(false);
      if (raw == null || raw.trim().isEmpty) return null;
      // Some emulators / LAT states return all-zeros — treat as absent.
      if (RegExp(r'^0+$').hasMatch(raw)) return null;
      return raw;
    } catch (_) {
      return null;
    }
  }
}
