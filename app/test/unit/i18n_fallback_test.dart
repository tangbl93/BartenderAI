import 'package:flutter/widgets.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/l10n/app_localizations.dart';
import 'package:home_bartender/l10n/app_localizations_en.dart';
import 'package:home_bartender/l10n/app_localizations_zh.dart';
import 'package:home_bartender/logic/locale_controller.dart';

void main() {
  group('i18n fallback', () {
    test('missing zh_TW key falls back to English template value', () {
      // `wallSortHot` is intentionally absent from app_zh_TW.arb, so the
      // generated zh_TW class inherits the English value ("Hot").
      final en = AppLocalizationsEn();
      final zhTw = AppLocalizationsZhTw();
      expect(zhTw.wallSortHot, en.wallSortHot);
      expect(zhTw.wallSortHot, 'Hot');
    });

    test('translated keys differ from English', () {
      final en = AppLocalizationsEn();
      final zhTw = AppLocalizationsZhTw();
      // A key that IS translated must not equal the English fallback.
      expect(zhTw.wallSortTime, isNot(en.wallSortTime));
    });

    test('zh-CN (simplified) and zh-TW (traditional) are distinct', () {
      final zhCn = AppLocalizationsZhCn();
      final zhTw = AppLocalizationsZhTw();
      // Same concept, different script (生成 vs 產生 etc.).
      expect(zhCn.fridgeGenerate, isNot(zhTw.fridgeGenerate));
      expect(zhCn.commonActionSave, '保存');
      expect(zhTw.commonActionSave, '儲存');
    });

    test('all five locales are supported', () {
      final codes = AppLocalizations.supportedLocales
          .map((l) => l.countryCode == null
              ? l.languageCode
              : '${l.languageCode}_${l.countryCode}')
          .toSet();
      expect(codes, containsAll(['en', 'zh_CN', 'zh_TW', 'ja', 'ko']));
    });
  });

  group('LocaleController.resolve fallback', () {
    test('unsupported device language falls back to en', () {
      final resolved =
          LocaleController.resolve(null, const [Locale('fr'), Locale('de')]);
      expect(resolved, const Locale('en'));
    });

    test('Japanese device picks ja', () {
      final resolved = LocaleController.resolve(null, const [Locale('ja')]);
      expect(resolved.languageCode, 'ja');
    });

    test('zh-Hant / zh-TW resolves to traditional, zh-CN to simplified', () {
      final tw = LocaleController.resolve(
          null, const [Locale.fromSubtags(languageCode: 'zh', countryCode: 'TW')]);
      expect(tw, const Locale('zh', 'TW'));

      final cn = LocaleController.resolve(
          null, const [Locale.fromSubtags(languageCode: 'zh', countryCode: 'CN')]);
      expect(cn, const Locale('zh', 'CN'));

      final hant = LocaleController.resolve(null,
          const [Locale.fromSubtags(languageCode: 'zh', scriptCode: 'Hant')]);
      expect(hant, const Locale('zh', 'TW'));
    });

    test('explicit selection wins over device locale', () {
      final resolved = LocaleController.resolve(
          const Locale('ko'), const [Locale('ja')]);
      expect(resolved.languageCode, 'ko');
    });

    test('toContentLocale maps Flutter locale to API locale string', () {
      expect(LocaleController.toContentLocale(const Locale('en')), 'en');
      expect(
          LocaleController.toContentLocale(const Locale('zh', 'CN')), 'zh-CN');
      expect(
          LocaleController.toContentLocale(const Locale('zh', 'TW')), 'zh-TW');
      expect(LocaleController.toContentLocale(const Locale('ja')), 'ja');
    });
  });
}
