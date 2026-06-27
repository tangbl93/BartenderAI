import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Tracks whether the first-run onboarding has been completed/skipped and
/// persists that flag so it never re-prompts. Matches the recipe-generation
/// spec's "新手基础引导" (skippable, persisted, replayable from help).
class OnboardingController extends ChangeNotifier {
  OnboardingController({SharedPreferences? prefs}) : _prefs = prefs;

  static const String _prefKey = 'onboarding_done';

  SharedPreferences? _prefs;
  bool _done = false;

  bool get done => _done;

  Future<void> load() async {
    _prefs ??= await SharedPreferences.getInstance();
    _done = _prefs?.getBool(_prefKey) ?? false;
    notifyListeners();
  }

  Future<void> complete() async {
    _done = true;
    notifyListeners();
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs?.setBool(_prefKey, true);
  }

  /// Resets so the user can replay the tutorial from the help entry.
  Future<void> replay() async {
    _done = false;
    notifyListeners();
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs?.setBool(_prefKey, false);
  }
}
