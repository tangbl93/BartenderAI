import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'data/config/app_config.dart';
import 'data/repositories/repositories.dart';
import 'data/repositories/repository_factory.dart';
import 'data/services/gaid_service.dart';
import 'data/services/image_save_service.dart';
import 'l10n/app_localizations.dart';
import 'logic/auth_controller.dart';
import 'logic/locale_controller.dart';
import 'logic/onboarding_controller.dart';
import 'ui/screens/home/home_screen.dart';
import 'ui/screens/onboarding/onboarding_screen.dart';
import 'ui/screens/splash_screen.dart';
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
    this.gaidService = const GaidService(),
  });

  final AppConfig config;
  final Repositories repositories;
  final LocaleController localeController;
  final OnboardingController onboardingController;
  final ImageSaveService imageSaveService;
  final GaidService gaidService;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<AppConfig>.value(value: config),
        Provider<Repositories>.value(value: repositories),
        Provider<ImageSaveService>.value(value: imageSaveService),
        Provider<GaidService>.value(value: gaidService),
        ChangeNotifierProvider<LocaleController>.value(value: localeController),
        ChangeNotifierProvider<OnboardingController>.value(
            value: onboardingController),
        ChangeNotifierProvider<AuthController>(
          create: (_) => AuthController(repositories.auth, gaidService),
        ),
      ],
      child: Consumer<LocaleController>(
        builder: (context, locale, _) {
          return MaterialApp(
            title: 'Bartender AI',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.light(),
            darkTheme: AppTheme.dark(),
            themeMode: ThemeMode.dark,
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
/// splash (device auto-register) → home. No login screen.
class _RootGate extends StatefulWidget {
  const _RootGate();

  @override
  State<_RootGate> createState() => _RootGateState();
}

class _RootGateState extends State<_RootGate> {
  bool _deviceReady = false;

  Future<void> _ensureAccount(BuildContext context) async {
    final auth = context.read<AuthController>();
    final localeCtrl = context.read<LocaleController>();
    final resolved = LocaleController.resolve(
        localeCtrl.locale, WidgetsBinding.instance.platformDispatcher.locales);
    await auth.ensureDeviceAccount(
        locale: LocaleController.toContentLocale(resolved));
    if (mounted) setState(() => _deviceReady = true);
  }

  @override
  Widget build(BuildContext context) {
    final onboarding = context.watch<OnboardingController>();

    if (!onboarding.done) {
      return const OnboardingScreen();
    }
    if (!_deviceReady) {
      // Resolve a device id and silently register/login once, then proceed.
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!_deviceReady) _ensureAccount(context);
      });
      return const SplashScreen();
    }
    return const HomeScreen();
  }
}
