import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../logic/locale_controller.dart';

/// A popup menu that lets the user pick one of the five supported languages.
/// The choice is persisted by [LocaleController].
class LanguageSwitcher extends StatelessWidget {
  const LanguageSwitcher({super.key});

  static const Map<String, String> _labels = {
    'en': 'English',
    'zh_CN': '简体中文',
    'zh_TW': '繁體中文',
    'ja': '日本語',
    'ko': '한국어',
  };

  String _key(Locale l) =>
      l.countryCode == null ? l.languageCode : '${l.languageCode}_${l.countryCode}';

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<LocaleController>();
    return PopupMenuButton<Locale>(
      icon: const Icon(Icons.language),
      tooltip: 'Language',
      onSelected: controller.setLocale,
      itemBuilder: (context) => LocaleController.supported.map((locale) {
        final key = _key(locale);
        final selected = controller.locale != null &&
            _key(controller.locale!) == key;
        return PopupMenuItem<Locale>(
          value: locale,
          child: Row(
            children: [
              if (selected)
                const Icon(Icons.check, size: 18)
              else
                const SizedBox(width: 18),
              const SizedBox(width: 8),
              Text(_labels[key] ?? key),
            ],
          ),
        );
      }).toList(),
    );
  }
}
