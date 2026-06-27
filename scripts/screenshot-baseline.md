# Screenshot / Visual Regression Baselines

This is the QA contract for UI visual-regression testing across the two
rendering surfaces of Home Bartender AI:

- **Web** (`web/`, Vue 3 + Vite) → **Playwright** visual snapshots.
- **App** (`app/`, Flutter) → **Flutter golden tests**.

A runnable helper, [`screenshot-baseline.sh`](./screenshot-baseline.sh),
wraps both flows for local use (`update` / `check` / `web` / `app`).

The core problem with pixel comparison is environment noise (font
rendering, anti-aliasing, device pixel ratio, animations, dynamic content
like timestamps and AI-generated copy). The rules below pin the rendering
environment and mask the non-deterministic regions so a diff means a real
regression — see design.md 决策 7 and the "截图比对噪声" risk.

---

## 1. Web — Playwright visual snapshots

### Setup (`web/`)
- Use `@playwright/test`. Recommended config (`web/playwright.config.ts`):
  - **Fixed viewport**: `1280x800`, `deviceScaleFactor: 1`.
  - **Disable animations**: `toHaveScreenshot({ animations: 'disabled' })`.
  - **Pin browser**: snapshots are taken on **Chromium only** to match CI.
  - **Pin fonts**: do NOT rely on system fonts. Self-host the app fonts
    in `web/` and `await document.fonts.ready` before snapshotting, so
    local macOS and CI Linux render identically.
  - `snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}'`
  - Set a small `maxDiffPixelRatio` (e.g. `0.01`) to absorb sub-pixel noise.

### Masking dynamic regions
AI output, timestamps, avatars and remote poster images are
non-deterministic. Mask them:

```ts
await expect(page).toHaveScreenshot('recipe-detail.png', {
  animations: 'disabled',
  mask: [
    page.locator('[data-testid="poster-image"]'),
    page.locator('[data-testid="generated-copy"]'),
    page.locator('time'),
  ],
  maxDiffPixelRatio: 0.01,
});
```

Prefer stable test data: run the visual suite against the backend with
`TEXT_PROVIDER=stub` / `IMAGE_PROVIDER=stub` (deterministic fixtures) or
mock the API at the network layer with `page.route(...)`.

### Where baselines live
- Committed under `web/tests/visual/__screenshots__/...`.
- Filenames are suffixed by project/OS by Playwright. **Commit the Linux
  baselines** (CI is the source of truth) — see CI note below.

### Commands (`package.json` scripts the web team should expose)
```jsonc
{
  "test:visual": "playwright test tests/visual",
  "test:visual:update": "playwright test tests/visual --update-snapshots"
}
```
- Update baselines intentionally: `npm run test:visual:update`.
- Check (CI default): `npm run test:visual` → fails on diff, emits
  `playwright-report/` with side-by-side actual/expected/diff images.

---

## 2. App — Flutter golden tests

### Setup (`app/`)
- Use `flutter_test` `matchesGoldenFile`. To remove cross-machine font/AA
  noise, adopt **`golden_toolkit`** (or `alchemist`) and load real fonts
  in a `flutter_test_config.dart` at the test root:

```dart
// app/test/flutter_test_config.dart
import 'dart:async';
import 'package:golden_toolkit/golden_toolkit.dart';

Future<void> testExecutable(FutureOr<void> Function() testMain) async {
  return GoldenToolkit.runWithConfiguration(
    () async {
      await loadAppFonts(); // pin fonts so goldens are deterministic
      await testMain();
    },
    config: GoldenToolkitConfiguration(
      // CI (Linux) renders slightly differently from macOS; only the CI
      // platform's goldens are authoritative.
      skipGoldenAssertion: () => false,
    ),
  );
}
```

### Determinism rules
- **Pump deterministic widgets**: pass fixed fixture data (stub recipe /
  poster), never live AI output.
- Use a **fixed surface size** and `devicePixelRatio` per golden.
- Disable network images in goldens (use a fake `HttpClient` / asset
  placeholder) so remote posters don't break the pixels.
- Wrap text under test in pinned `MaterialApp` theme/locale; run goldens
  per supported locale where layout differs (en / zh-CN / zh-TW / ja / ko).

### Where baselines live
- Committed under `app/test/**/goldens/*.png`.
- Failures write actual/diff images under `test/**/failures/` (gitignored,
  uploaded as a CI artifact).

### Commands
- Update: `flutter test --update-goldens`
- Check (CI default): `flutter test` (golden assertions run inline).

---

## 3. Baseline storage & comparison strategy

- **Baselines are committed to git** next to their tests (`__screenshots__/`
  for web, `goldens/` for app). They are reviewable in PRs as image diffs.
- **CI is the source of truth.** Pixel rendering differs between a dev's
  macOS and CI's Ubuntu runner, so baselines must be generated/updated on
  the **same platform CI uses** (Ubuntu Linux). Two safe options:
  1. Update goldens/snapshots inside the CI container image (Playwright's
     official image / a Linux dev container), then commit.
  2. Let CI fail once, download the `playwright-report` /
     `flutter-golden-failures` artifact, and commit the corrected Linux
     baseline.
- **Thresholds, not exact match**: `maxDiffPixelRatio` (web) and the
  default golden tolerance absorb sub-pixel AA noise; real layout/visual
  regressions exceed it and fail.
- **Mask the non-deterministic**: AI copy, generated posters, timestamps,
  avatars are always masked (web) or replaced with fixtures (app).

## 4. How it plugs into CI

See [`.github/workflows/ci.yml`](../.github/workflows/ci.yml):

- **web** job: after build, if `web/playwright.config.*` exists it installs
  the Chromium browser (`--with-deps`, matching the committed Linux
  baselines) and runs `npm run test:visual`. On failure it uploads
  `web/playwright-report/` so reviewers see actual/expected/diff.
- **app** job: `flutter test` runs golden assertions inline; on failure the
  `test/**/failures/` images are uploaded as `flutter-golden-failures`.
- Baselines diverging from a real change → the dev updates them
  (`--update-snapshots` / `--update-goldens`) and commits; the PR diff
  shows the new images for review.
