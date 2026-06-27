import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/data/models/models.dart';
import 'package:home_bartender/ui/screens/recipe/recipe_result_screen.dart';

import '../support/test_harness.dart';

Recipe _sampleRecipe() => Recipe(
      id: 'r1',
      name: 'Midnight Fridge Fizz',
      tagline: 'A spark from whatever you had on hand.',
      locale: 'en',
      items: const [
        RecipeItem(
            ingredientId: 'ing-vodka',
            name: 'Vodka',
            amount: '45 ml',
            optional: false),
        RecipeItem(
            ingredientId: 'ing-soda',
            name: 'Soda water',
            amount: '90 ml',
            optional: false),
        RecipeItem(
            ingredientId: 'ing-lemon',
            name: 'Lemon',
            amount: '1 wedge',
            optional: true),
      ],
      steps: const [
        'Fill a glass with ice.',
        'Pour the base spirit over the ice.',
        'Top up with the mixers and stir gently.',
      ],
      toolSubstitutions: const [
        ToolSubstitution(tool: 'Jigger', homeAlternative: '1 jigger ≈ 1.5 tbsp'),
      ],
      alcoholRange: '8-12% ABV',
      safetyNotes: const ['Avoid mixing with energy drinks in excess.'],
      isExample: false,
    );

void main() {
  group('RecipeResultScreen', () {
    testWidgets('renders name, tagline, alcohol range and sections',
        (tester) async {
      // Use a tall surface so the whole ListView lays out without scrolling.
      tester.view.physicalSize = const Size(1200, 3000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(wrapWithApp(RecipeResultScreen(recipe: _sampleRecipe())));
      await tester.pumpAndSettle();

      expect(find.byKey(const Key('recipe_name')), findsOneWidget);
      expect(find.text('Midnight Fridge Fizz'), findsOneWidget);
      expect(find.textContaining('8-12% ABV'), findsOneWidget);

      // Guide sections.
      expect(find.text('Ingredients'), findsOneWidget);
      expect(find.text('Step-by-step guide'), findsOneWidget);
      expect(find.text('Safety notes'), findsOneWidget);
    });

    testWidgets('shows amounts and an optional marker', (tester) async {
      tester.view.physicalSize = const Size(1200, 3000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(wrapWithApp(RecipeResultScreen(recipe: _sampleRecipe())));
      await tester.pumpAndSettle();

      expect(find.text('45 ml'), findsOneWidget);
      expect(find.textContaining('optional'), findsOneWidget);
    });

    testWidgets('always shows the responsible-drinking safety hint',
        (tester) async {
      tester.view.physicalSize = const Size(1200, 3000);
      tester.view.devicePixelRatio = 1.0;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);

      await tester.pumpWidget(wrapWithApp(RecipeResultScreen(recipe: _sampleRecipe())));
      await tester.pumpAndSettle();

      expect(
        find.textContaining('Please drink responsibly'),
        findsOneWidget,
      );
    });

    testWidgets('make-posters CTA is present', (tester) async {
      await tester.pumpWidget(wrapWithApp(RecipeResultScreen(recipe: _sampleRecipe())));
      await tester.pumpAndSettle();
      expect(find.byKey(const Key('btn_make_poster')), findsOneWidget);
    });
  });
}
