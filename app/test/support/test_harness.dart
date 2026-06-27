import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:home_bartender/data/repositories/mock_repository.dart';
import 'package:home_bartender/data/repositories/repositories.dart';
import 'package:home_bartender/data/services/gaid_service.dart';
import 'package:home_bartender/data/services/image_save_service.dart';
import 'package:home_bartender/l10n/app_localizations.dart';
import 'package:home_bartender/logic/auth_controller.dart';
import 'package:home_bartender/logic/locale_controller.dart';
import 'package:home_bartender/logic/onboarding_controller.dart';
import 'package:provider/provider.dart';

/// Builds a [Repositories] bundle backed by the in-memory [MockRepository] for
/// widget/unit tests that don't hit the real backend.
Repositories buildMockRepositories() {
  final mock = MockRepository();
  return Repositories(
    auth: mock,
    ingredients: mock,
    recipes: mock,
    posters: mock,
    lab: mock,
    fridge: mock,
  );
}

/// Wraps [child] in the providers + localization delegates a screen needs,
/// backed by the in-memory mock repositories. Used by widget/golden tests.
Widget wrapWithApp(
  Widget child, {
  Repositories? repositories,
  Locale locale = const Locale('en'),
}) {
  final repos = repositories ?? buildMockRepositories();
  return MultiProvider(
    providers: [
      Provider<Repositories>.value(value: repos),
      Provider<ImageSaveService>.value(value: const NoopImageSaveService()),
      ChangeNotifierProvider<LocaleController>(create: (_) => LocaleController()),
      ChangeNotifierProvider<OnboardingController>(
          create: (_) => OnboardingController()),
      ChangeNotifierProvider<AuthController>(
          create: (_) => AuthController(repos.auth, GaidService())),
    ],
    child: MaterialApp(
      locale: locale,
      supportedLocales: AppLocalizations.supportedLocales,
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      home: child,
    ),
  );
}
