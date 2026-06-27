# Home Bartender AI — Flutter App (前台)

The mobile front-end for Home Bartender AI. Core flow:
**翻冰箱选材 → AI 生成配方与保姆级指南 → 海报矩阵生成 → 作品打卡 / 海报墙**.

- Org / applicationId: `com.bartender.home_bartender`
- Flutter 3.41 · Dart 3.11
- State management: `provider`
- i18n: `flutter_localizations` + `intl` ARB (en / zh-CN / zh-TW / ja / ko, en fallback)
- The app **runs without a backend** via an in-memory mock repository (default).

## Architecture (layered)

```
lib/
  data/          # data layer
    config/      # AppConfig (useMock + apiBaseUrl, from --dart-define)
    models/      # Dart data classes mirroring docs/api/openapi.yaml
    services/    # ApiService (http), ImageSaveService
    repositories/# Repository contracts + Mock + Api implementations + factory
  logic/         # state (ChangeNotifier): Locale, Auth, Onboarding, FridgeSelection
  ui/            # widgets/screens
    screens/     # auth, onboarding, fridge, recipe, poster, lab, wall, profile
    theme/, widgets/, l10n_helpers.dart
  l10n/          # app_*.arb + generated AppLocalizations
```

UI depends on `logic`, `logic` depends on `data`. Screens read repositories
through `provider`; no screen talks to `http` directly.

## Running

```bash
flutter pub get
flutter gen-l10n          # regenerate localizations after editing ARB files
flutter run               # uses the mock repository by default (no backend)
```

### Pointing at a real backend

The data source is selected by `AppConfig` via `--dart-define`:

```bash
flutter run \
  --dart-define=USE_MOCK=false \
  --dart-define=API_BASE_URL=http://localhost:3000/api/v1
```

`USE_MOCK` defaults to `true`; `API_BASE_URL` defaults to
`http://localhost:3000/api/v1`. No secrets are compiled into the app — the
image-generation API key lives only in the backend.

## Quality gates

```bash
flutter analyze                       # must be clean
flutter test                          # unit + widget + golden, all green
flutter test --update-goldens test/golden   # refresh golden baselines
```

Tests:
- `test/unit/fridge_selection_test.dart` — selection logic (min-2 rule, grouping).
- `test/unit/i18n_fallback_test.dart` — en fallback for a missing zh-TW key,
  zh-CN vs zh-TW distinctness, locale resolution/persistence helpers.
- `test/widget/fridge_screen_test.dart` — categorized multi-select + generate gate.
- `test/widget/recipe_result_screen_test.dart` — recipe + nanny-level guide.
- `test/golden/recipe_result_golden_test.dart` — screenshot baseline skeleton.

## Android build

A **debug APK** builds out of the box (no signing required):

```bash
flutter build apk --debug
# -> build/app/outputs/flutter-apk/app-debug.apk
```

### Release: build an AAB and convert to APK with bundletool

Delivery is via Android App Bundle (AAB) converted to installable APKs with
[`bundletool`](https://github.com/google/bundletool) (see the repo's
`aab-to-apk` capability).

1. Build the release bundle (configure release signing in
   `android/app/build.gradle.kts` first):

   ```bash
   flutter build appbundle --release
   # -> build/app/outputs/bundle/release/app-release.aab
   ```

2. Generate a universal APK set from the AAB:

   ```bash
   bundletool build-apks \
     --bundle=build/app/outputs/bundle/release/app-release.aab \
     --output=build/app/outputs/app-release.apks \
     --mode=universal \
     --ks=<keystore.jks> --ks-key-alias=<alias> \
     --ks-pass=pass:<storePass> --key-pass=pass:<keyPass>
   ```

3. Extract the universal APK (`.apks` is a zip):

   ```bash
   unzip -o build/app/outputs/app-release.apks -d build/app/outputs/apks
   # -> build/app/outputs/apks/universal.apk
   ```

4. Install on a connected device:

   ```bash
   bundletool install-apks --apks=build/app/outputs/app-release.apks
   # or: adb install build/app/outputs/apks/universal.apk
   ```

For device-optimized splits instead of a universal APK, drop `--mode=universal`
and use `bundletool install-apks` (it picks the right split per device).

## Notes on what is real vs. mocked

- **Real:** all screens, navigation, i18n (5 locales + fallback + persistence),
  layered data/logic/UI, models matching the OpenAPI contract, an `http`
  `ApiService`, selection logic, poster job polling state machine, tests.
- **Mocked (no backend needed):** `MockRepository` seeds ingredients, recipes,
  examples, a poster job that progresses across polls (with one failure to
  exercise retry), lab entries, and an approved wall feed.
- **Stubbed for buildability:** `ImageSaveService` (gallery save) and poster
  "share" report success without a native plugin; swap in `gal` / `share_plus`
  for production. `image_picker` is wired for real on-device use.
