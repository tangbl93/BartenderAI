import 'package:flutter/widgets.dart';

import '../data/models/models.dart';
import '../data/repositories/repositories.dart';

/// Holds the authenticated [User] / token and exposes login/register/logout.
class AuthController extends ChangeNotifier {
  AuthController(this._auth);

  final AuthRepository _auth;

  User? _user;
  String? _token;
  bool _busy = false;
  String? _error;

  User? get user => _user;
  String? get token => _token;
  bool get isLoggedIn => _token != null;
  bool get busy => _busy;
  String? get error => _error;

  Future<bool> login(String account, String password) async {
    return _run(() => _auth.login(account, password));
  }

  Future<bool> register(String account, String password, String? name) async {
    return _run(() => _auth.register(account, password, name));
  }

  Future<void> logout() async {
    await _auth.logout();
    _user = null;
    _token = null;
    notifyListeners();
  }

  Future<bool> _run(Future<AuthResult> Function() op) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      final result = await op();
      _user = result.user;
      _token = result.accessToken;
      _busy = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.code ?? e.message;
      _busy = false;
      notifyListeners();
      return false;
    } catch (e) {
      _error = 'UNKNOWN';
      _busy = false;
      notifyListeners();
      return false;
    }
  }
}
