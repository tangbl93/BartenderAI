import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:home_bartender/data/config/app_config.dart';
import 'package:home_bartender/data/repositories/repositories.dart';
import 'package:home_bartender/data/repositories/repository_factory.dart';
import 'package:home_bartender/data/services/gaid_service.dart';
import 'package:home_bartender/data/services/image_save_service.dart';
import 'package:home_bartender/l10n/app_localizations.dart';
import 'package:home_bartender/logic/auth_controller.dart';
import 'package:home_bartender/logic/locale_controller.dart';
import 'package:home_bartender/logic/onboarding_controller.dart';
import 'package:provider/provider.dart';

/// Wraps [child] in the providers + localization delegates a screen needs,
/// backed by the in-memory mock repositories. Used by widget/golden tests.
Widget wrapWithApp(
  Widget child, {
  Repositories? repositories,
  Locale locale = const Locale('en'),
}) {
  final repos = repositories ??
      buildRepositories(const AppConfig(useMock: true, apiBaseUrl: ''));
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
