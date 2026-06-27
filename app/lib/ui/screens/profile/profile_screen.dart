import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:material_symbols_icons/symbols.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../data/config/app_config.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/auth_controller.dart';
import '../../../logic/locale_controller.dart';
import '../../../logic/onboarding_controller.dart';
import '../../theme/app_theme.dart';
import '../legal/legal_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _launch(BuildContext context, String url) async {
    final uri = Uri.parse(url);
    final isWeb = uri.scheme == 'http' || uri.scheme == 'https';
    await launchUrl(
      uri,
      mode: isWeb ? LaunchMode.inAppBrowserView : LaunchMode.platformDefault,
    );
  }

  void _showLanguagePicker(BuildContext context) {
    final ctrl = context.read<LocaleController>();
    final current = Localizations.localeOf(context);
    showModalBottomSheet<void>(
      context: context,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (ctx) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 8),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  AppLocalizations.of(ctx).commonLanguage,
                  style: Theme.of(ctx)
                      .textTheme
                      .titleMedium
                      ?.copyWith(color: AppTheme.text),
                ),
              ),
            ),
            for (final locale in LocaleController.supported)
              ListTile(
                onTap: () {
                  ctrl.setLocale(locale);
                  Navigator.pop(ctx);
                },
                title: Text(
                  _nativeName(locale),
                  style: const TextStyle(color: AppTheme.text),
                ),
                trailing: locale == current
                    ? const Icon(Symbols.check, color: AppTheme.neonCyan)
                    : null,
              ),
          ],
        ),
      ),
    );
  }

  static String _nativeName(Locale l) {
    if (l.languageCode == 'zh') {
      return l.countryCode == 'TW' ? '繁體中文' : '简体中文';
    }
    return switch (l.languageCode) {
      'en' => 'English',
      'ja' => '日本語',
      'ko' => '한국어',
      _ => l.languageCode,
    };
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final auth = context.watch<AuthController>();
    final config = context.read<AppConfig>();
    final userId = auth.deviceId ?? '';

    return Scaffold(
      backgroundColor: AppTheme.bg,
      body: Stack(
        children: [
          // Background accent blurs
          Positioned(
            top: -MediaQuery.sizeOf(context).height * 0.1,
            right: -MediaQuery.sizeOf(context).width * 0.1,
            child: Container(
              width: MediaQuery.sizeOf(context).width * 0.5,
              height: MediaQuery.sizeOf(context).height * 0.5,
              decoration: BoxDecoration(
                color: AppTheme.neonCyan.withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
            ),
          ),
          Positioned(
            bottom: -MediaQuery.sizeOf(context).height * 0.05,
            left: -MediaQuery.sizeOf(context).width * 0.05,
            child: Container(
              width: MediaQuery.sizeOf(context).width * 0.4,
              height: MediaQuery.sizeOf(context).height * 0.4,
              decoration: BoxDecoration(
                color: AppTheme.neonMagenta.withValues(alpha: 0.05),
                shape: BoxShape.circle,
              ),
            ),
          ),
          // Page content
          SafeArea(
            child: Column(
              children: [
                _AppHeader(title: t.commonSettings),
                Expanded(
                  child: ListView(
                    padding: const EdgeInsets.fromLTRB(20, 32, 20, 32),
                    children: [
                      _GlassPanel(
                        children: [
                          _SettingsRow(
                            icon: Symbols.fingerprint,
                            label: t.profileUserId,
                            monoValue: userId,
                            trailing: _CopyButton(value: userId),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _GlassPanel(
                        children: [
                          _SettingsRow(
                            icon: Symbols.language,
                            label: t.commonLanguage,
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  _nativeName(Localizations.localeOf(context)),
                                  style: const TextStyle(
                                    color: AppTheme.onSurfaceVariant,
                                    fontSize: 14,
                                  ),
                                ),
                                const Icon(
                                  Symbols.chevron_right,
                                  color: AppTheme.onSurfaceVariant,
                                  size: 20,
                                ),
                              ],
                            ),
                            onTap: () => _showLanguagePicker(context),
                          ),
                          _SettingsRow(
                            icon: Symbols.mail,
                            label: t.profileContactUs,
                            onTap: () => _launch(
                              context,
                              'mailto:${config.contactEmail}',
                            ),
                          ),
                          _SettingsRow(
                            icon: Symbols.help,
                            label: t.onboardingReplay,
                            onTap: () {
                              context.read<OnboardingController>().replay();
                              Navigator.of(context).pop();
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      _GlassPanel(
                        children: [
                          _SettingsRow(
                            icon: Symbols.policy,
                            label: t.profilePrivacy,
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => LegalScreen(
                                  title: t.profilePrivacy,
                                  assetPath: 'assets/legal/privacy.txt',
                                ),
                              ),
                            ),
                          ),
                          _SettingsRow(
                            icon: Symbols.description,
                            label: t.profileTerms,
                            onTap: () => Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (_) => LegalScreen(
                                  title: t.profileTerms,
                                  assetPath: 'assets/legal/terms.txt',
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── App Header ────────────────────────────────────────────────

class _AppHeader extends StatelessWidget {
  const _AppHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return ClipRect(
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 24, sigmaY: 24),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          height: 64,
          decoration: BoxDecoration(
            color: AppTheme.bg.withValues(alpha: 0.85),
            border: Border(
              bottom: BorderSide(
                color: Colors.white.withValues(alpha: 0.1),
              ),
            ),
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => Navigator.of(context).pop(),
                child: const Icon(
                  Symbols.arrow_back,
                  color: AppTheme.onSurfaceVariant,
                ),
              ),
              const SizedBox(width: 16),
              Text(
                title,
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(letterSpacing: 0, color: AppTheme.text),
              ),
              const Spacer(),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Glass panel ───────────────────────────────────────────────

class _GlassPanel extends StatelessWidget {
  const _GlassPanel({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(12),
      child: BackdropFilter(
        filter: ui.ImageFilter.blur(sigmaX: 20, sigmaY: 20),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.03),
            border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(children: children),
        ),
      ),
    );
  }
}

// ── Settings row ──────────────────────────────────────────────

class _SettingsRow extends StatefulWidget {
  const _SettingsRow({
    required this.icon,
    required this.label,
    this.monoValue,
    this.trailing,
    this.onTap,
  });

  final IconData icon;
  final String label;
  final String? monoValue;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  State<_SettingsRow> createState() => _SettingsRowState();
}

class _SettingsRowState extends State<_SettingsRow> {
  bool _flash = false;

  void _handleTap() {
    setState(() => _flash = true);
    Future.delayed(const Duration(milliseconds: 150), () {
      if (mounted) setState(() => _flash = false);
    });
    widget.onTap?.call();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.onTap != null ? _handleTap : null,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: _flash
              ? Colors.white.withValues(alpha: 0.05)
              : Colors.transparent,
        ),
        child: Row(
          children: [
            Icon(widget.icon, size: 24, color: AppTheme.onSurfaceVariant),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    widget.label,
                    style: TextStyle(
                      color: widget.monoValue != null
                          ? AppTheme.text
                          : AppTheme.onSurfaceVariant,
                      fontSize: 16,
                    ),
                  ),
                  if (widget.monoValue != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 2),
                      child: Text(
                        widget.monoValue!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.jetBrainsMono(
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                          height: 1.4,
                          letterSpacing: 0.7,
                          color: AppTheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                ],
              ),
            ),
            if (widget.trailing != null) widget.trailing!,
          ],
        ),
      ),
    );
  }
}

// ── Copy button with check animation ──────────────────────────

class _CopyButton extends StatefulWidget {
  const _CopyButton({required this.value});
  final String value;

  @override
  State<_CopyButton> createState() => _CopyButtonState();
}

class _CopyButtonState extends State<_CopyButton> {
  bool _copied = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.value.isEmpty ? null : _onCopy,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, anim) => ScaleTransition(
          scale: anim,
          child: child,
        ),
        child: Icon(
          _copied ? Symbols.check : Symbols.content_copy,
          key: ValueKey<bool>(_copied),
          size: 24,
          color: AppTheme.neonCyan,
        ),
      ),
    );
  }

  void _onCopy() {
    Clipboard.setData(ClipboardData(text: widget.value));
    setState(() => _copied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _copied = false);
    });
  }
}
