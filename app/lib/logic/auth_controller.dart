import 'dart:math';

import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../data/models/models.dart';
import '../data/repositories/repositories.dart';
import '../data/services/api_service.dart';
import '../data/services/gaid_service.dart';

/// Holds the authenticated [User] / token. Account creation is implicit:
/// [ensureDeviceAccount] resolves a device id (GAID, or a locally-generated
/// fallback when GAID is unavailable) and silently registers/logs in — there
/// is no login UI.
class AuthController extends ChangeNotifier {
  AuthController(this._auth, this._gaid, {ApiService? apiService})
      : _api = apiService;

  final AuthRepository _auth;
  final GaidService _gaid;

  /// HTTP client the resolved token is pushed onto, so authenticated
  /// endpoints (fridge scans, lab entries) send the `Authorization` header.
  final ApiService? _api;

  User? _user;
  String? _token;
  String? _deviceId; // resolved device id (GAID or local fallback)
  String? _error;

  User? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => _token != null;
  String? get error => _error;

  /// Device id used to create the account (GAID or local fallback). Shown on
  /// the profile screen when the backend user id is unavailable.
  String? get deviceId => _deviceId ?? _user?.id;

  /// Resolve a device id and silently register/login. Retries once on failure.
  /// Never throws — on failure [isLoggedIn] stays false and the app retries
  /// next launch.
  Future<void> ensureDeviceAccount({String locale = 'en'}) async {
    if (isLoggedIn) return;
    final id = await _resolveDeviceId();
    if (id.isEmpty) return;
    final ok = await tryDeviceLogin(id, locale: locale);
    if (!ok) {
      await tryDeviceLogin(id, locale: locale);
    }
  }

  /// Silent device login. Returns true on success; swallows any failure.
  Future<bool> tryDeviceLogin(String deviceId,
      {String platform = _platform, String locale = 'en'}) async {
    if (deviceId.trim().isEmpty) return false;
    try {
      final result = await _auth.deviceLogin(deviceId,
          platform: platform, locale: locale);
      _user = result.user;
      _token = result.accessToken;
      _deviceId = deviceId;
      // Push the token onto the HTTP client so authenticated endpoints carry it.
      _api?.accessToken = result.accessToken;
      notifyListeners();
      return true;
    } catch (_) {
      return false;
    }
  }

  Future<String> _resolveDeviceId() async {
    final gaid = await _gaid.advertisingId;
    if (gaid != null && gaid.trim().isNotEmpty) return gaid;
    // ponytail: no-GAID fallback — a locally persisted random id; upgrade to a
    // platform vendor id (IDFV/ANDROID_ID) if cross-install account reuse matters.
    final prefs = await SharedPreferences.getInstance();
    var local = prefs.getString(_localIdKey);
    if (local == null || local.isEmpty) {
      local = _generateLocalId();
      await prefs.setString(_localIdKey, local);
    }
    return local;
  }

  String _generateLocalId() {
    final r = Random();
    final hex =
        List.generate(16, (_) => r.nextInt(16).toRadixString(16)).join();
    return 'local-$hex';
  }

  static const String _localIdKey = 'local_device_id';
  // ponytail: hardcoded platform; derive from Platform.isIOS if backend segments on it.
  static const String _platform = 'android';
}
