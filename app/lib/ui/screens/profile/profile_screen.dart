import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/config/app_config.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/auth_controller.dart';
import '../../../logic/onboarding_controller.dart';

/// Profile / about: user id (copyable), contact, privacy/terms (web admin),
/// and replay tutorial. No login, no in-app language switch.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _launch(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    // mailto must leave the app; http(s) opens in an in-app browser (web built-in).
    final isWeb = uri.scheme == 'http' || uri.scheme == 'https';
    await launchUrl(
      uri,
      mode: isWeb ? LaunchMode.inAppBrowserView : LaunchMode.platformDefault,
    );
  }

  void _copy(BuildContext context, String value) {
    Clipboard.setData(ClipboardData(text: value));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(AppLocalizations.of(context).profileCopied)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final auth = context.watch<AuthController>();
    final config = context.read<AppConfig>();
    final userId = auth.deviceId ?? '';

    return Scaffold(
      appBar: AppBar(title: Text(t.commonSettings)),
      body: ListView(
        children: [
          ListTile(
            leading: const Icon(Icons.person_outline),
            title: Text(t.profileUserId),
            subtitle: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Text(userId, maxLines: 1),
            ),
            trailing: IconButton(
              icon: const Icon(Icons.copy),
              tooltip: t.profileCopied,
              onPressed:
                  userId.isEmpty ? null : () => _copy(context, userId),
            ),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.mail_outline),
            title: Text(t.profileContactUs),
            onTap: () => _launch(context, 'mailto:${config.contactEmail}'),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip_outlined),
            title: Text(t.profilePrivacy),
            onTap: () => _launch(context, config.privacyPolicyUrl),
          ),
          ListTile(
            leading: const Icon(Icons.description_outlined),
            title: Text(t.profileTerms),
            onTap: () => _launch(context, config.termsOfServiceUrl),
          ),
          const Divider(),
          ListTile(
            leading: const Icon(Icons.help_outline),
            title: Text(t.onboardingReplay),
            onTap: () {
              context.read<OnboardingController>().replay();
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }
}
