import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'data/config/app_config.dart';
import 'data/repositories/repositories.dart';
import 'data/repositories/repository_factory.dart';
import 'data/services/image_save_service.dart';
import 'l10n/app_localizations.dart';
import 'logic/auth_controller.dart';
import 'logic/locale_controller.dart';
import 'logic/onboarding_controller.dart';
import 'ui/screens/auth/login_screen.dart';
import 'ui/screens/home_shell.dart';
import 'ui/screens/onboarding/onboarding_screen.dart';
import 'ui/theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final config = AppConfig.fromEnvironment();
  final repos = buildRepositories(config);

  final localeController = LocaleController();
  final onboardingController = OnboardingController();
  await Future.wait([localeController.load(), onboardingController.load()]);

  runApp(HomeBartenderApp(
    config: config,
    repositories: repos,
    localeController: localeController,
    onboardingController: onboardingController,
  ));
}

class HomeBartenderApp extends StatelessWidget {
  const HomeBartenderApp({
    super.key,
    required this.config,
    required this.repositories,
    required this.localeController,
    required this.onboardingController,
    this.imageSaveService = const NoopImageSaveService(),
  });

  final AppConfig config;
  final Repositories repositories;
  final LocaleController localeController;
  final OnboardingController onboardingController;
  final ImageSaveService imageSaveService;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AppConfig>.value(value: config),
        Provider<Repositories>.value(value: repositories),
        Provider<ImageSaveService>.value(value: imageSaveService),
        ChangeNotifierProvider<LocaleController>.value(value: localeController),
        ChangeNotifierProvider<OnboardingController>.value(
            value: onboardingController),
        ChangeNotifierProvider<AuthController>(
          create: (_) => AuthController(repositories.auth),
        ),
      ],
      child: Consumer<LocaleController>(
        builder: (context, locale, _) {
          return MaterialApp(
            title: 'Home Bartender AI',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            locale: locale.locale,
            supportedLocales: AppLocalizations.supportedLocales,
            localizationsDelegates: const [
              AppLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            localeResolutionCallback: (device, supported) =>
                LocaleController.localeResolution(device, supported),
            home: const _RootGate(),
          );
        },
      ),
    );
  }
}

/// Decides which top-level screen to show: onboarding (first run) →
/// login (unauthenticated) → home shell.
class _RootGate extends StatelessWidget {
  const _RootGate();

  @override
  Widget build(BuildContext context) {
    final onboarding = context.watch<OnboardingController>();
    final auth = context.watch<AuthController>();

    if (!onboarding.done) {
      return const OnboardingScreen();
    }
    if (!auth.isLoggedIn) {
      return const LoginScreen();
    }
    return const HomeShell();
  }
}
