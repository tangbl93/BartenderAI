import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/ui/screens/fridge/fridge_screen.dart';

import '../support/test_harness.dart';

void main() {
  group('FridgeScreen', () {
    testWidgets('loads ingredients grouped by category with example card',
        (tester) async {
      await tester.pumpWidget(wrapWithApp(const FridgeScreen()));
      await tester.pumpAndSettle();

      // Title + subtitle + example entry render.
      expect(find.text('Open the fridge'), findsOneWidget);
      expect(find.byKey(const Key('example_card')), findsOneWidget);

      // Category labels appear (seeded mock has all four).
      expect(find.text('Base spirits'), findsOneWidget);
      expect(find.text('Drinks'), findsOneWidget);

      // A seeded ingredient chip is present.
      expect(find.byKey(const Key('ingredient_ing-vodka')), findsOneWidget);
    });

    testWidgets('generate disabled until 2 ingredients selected',
        (tester) async {
      await tester.pumpWidget(wrapWithApp(const FridgeScreen()));
      await tester.pumpAndSettle();

      final generateBtn = find.byKey(const Key('btn_generate'));
      FilledButton button() => tester.widget<FilledButton>(generateBtn);

      // Initially disabled.
      expect(button().onPressed, isNull);
      expect(find.text('0 selected'), findsOneWidget);

      // Select one -> still disabled.
      await tester.tap(find.byKey(const Key('ingredient_ing-vodka')));
      await tester.pump();
      expect(button().onPressed, isNull);
      expect(find.text('1 selected'), findsOneWidget);

      // Select a second -> enabled.
      await tester.tap(find.byKey(const Key('ingredient_ing-cola')));
      await tester.pump();
      expect(button().onPressed, isNotNull);
      expect(find.text('2 selected'), findsOneWidget);
    });

    testWidgets('clear resets the selection', (tester) async {
      await tester.pumpWidget(wrapWithApp(const FridgeScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('ingredient_ing-vodka')));
      await tester.pump();
      expect(find.text('1 selected'), findsOneWidget);

      await tester.tap(find.text('Clear'));
      await tester.pump();
      expect(find.text('0 selected'), findsOneWidget);
    });

    testWidgets('generating navigates to the recipe result screen',
        (tester) async {
      await tester.pumpWidget(wrapWithApp(const FridgeScreen()));
      await tester.pumpAndSettle();

      await tester.tap(find.byKey(const Key('ingredient_ing-vodka')));
      await tester.pump();
      await tester.tap(find.byKey(const Key('ingredient_ing-cola')));
      await tester.pump();

      await tester.tap(find.byKey(const Key('btn_generate')));
      await tester.pumpAndSettle();

      // Recipe result screen shows the generated drink name.
      expect(find.byKey(const Key('recipe_name')), findsOneWidget);
    });
  });
}
