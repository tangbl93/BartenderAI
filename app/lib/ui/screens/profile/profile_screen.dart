import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../l10n/app_localizations.dart';
import '../../../logic/auth_controller.dart';
import '../../../logic/onboarding_controller.dart';
import '../../widgets/language_switcher.dart';

/// Profile / settings: shows the user, language switcher, replay tutorial,
/// and sign-out.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final auth = context.watch<AuthController>();
    return Scaffold(
      appBar: AppBar(
        title: Text(t.navProfile),
        actions: const [LanguageSwitcher()],
      ),
      body: ListView(
        children: [
          ListTile(
            leading: const CircleAvatar(child: Icon(Icons.person)),
            title: Text(auth.user?.displayName ?? ''),
            subtitle: Text(auth.user?.account ?? ''),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: Text(t.onboardingReplay),
            onTap: () => context.read<OnboardingController>().replay(),
          ),
          ListTile(
            key: const Key('btn_logout'),
            leading: const Icon(Icons.logout),
            title: Text(t.authLogout),
            onTap: () => context.read<AuthController>().logout(),
          ),
        ],
      ),
    );
  }
}
