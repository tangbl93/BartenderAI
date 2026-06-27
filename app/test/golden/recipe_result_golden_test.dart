import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/data/models/models.dart';
import 'package:home_bartender/ui/screens/recipe/recipe_result_screen.dart';

import '../support/test_harness.dart';

/// Golden (screenshot-baseline) test skeleton for a key screen, fulfilling the
/// design.md "截图比对" strategy. The baseline lives at
/// test/golden/goldens/recipe_result.png.
///
///   Generate / refresh the baseline:
///     flutter test --update-goldens test/golden/recipe_result_golden_test.dart
///
/// Fonts render as boxes in the test environment (Ahem font) which is fine and
/// deterministic for golden comparison. Run on a fixed environment for CI.
void main() {
  testWidgets('RecipeResultScreen golden', (tester) async {
    tester.view.physicalSize = const Size(1080, 2160);
    tester.view.devicePixelRatio = 3.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    final recipe = Recipe(
      id: 'golden',
      name: 'Midnight Fridge Fizz',
      tagline: 'A spark from whatever you had on hand.',
      locale: 'en',
      items: const [
        RecipeItem(
            ingredientId: 'v',
            name: 'Vodka',
            amount: '45 ml',
            optional: false),
        RecipeItem(
            ingredientId: 's',
            name: 'Soda water',
            amount: '90 ml',
            optional: false),
      ],
      steps: const ['Fill a glass with ice.', 'Pour and stir.'],
      toolSubstitutions: const [],
      alcoholRange: '8-12% ABV',
      safetyNotes: const ['Drink responsibly.'],
      isExample: false,
    );

    await tester.pumpWidget(wrapWithApp(RecipeResultScreen(recipe: recipe)));
    await tester.pumpAndSettle();

    await expectLater(
      find.byType(RecipeResultScreen),
      matchesGoldenFile('goldens/recipe_result.png'),
    );
  });
}
