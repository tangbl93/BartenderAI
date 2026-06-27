import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show rootBundle;

import '../../../l10n/app_localizations.dart';

/// In-app legal document viewer (privacy policy / terms of service).
/// Content is bundled under assets/legal/ as plain text — temporary copy
/// until the web admin versions are live, then switch ProfileScreen back to
/// the web URLs in AppConfig.
class LegalScreen extends StatelessWidget {
  const LegalScreen({super.key, required this.title, required this.assetPath});

  final String title;
  final String assetPath;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: SafeArea(
        child: FutureBuilder<String>(
          future: rootBundle.loadString(assetPath),
          builder: (context, snap) {
            if (snap.connectionState != ConnectionState.done) {
              return const Center(child: CircularProgressIndicator());
            }
            return SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
              child: Text(
                snap.data ?? AppLocalizations.of(context).commonError,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      height: 1.6,
                    ),
              ),
            );
          },
        ),
      ),
    );
  }
}
