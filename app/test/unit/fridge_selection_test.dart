import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/data/models/models.dart';
import 'package:home_bartender/logic/fridge_selection.dart';

void main() {
  group('FridgeSelection', () {
    test('starts empty and cannot generate', () {
      final s = FridgeSelection();
      expect(s.count, 0);
      expect(s.canGenerate, isFalse);
    });

    test('toggle adds then removes an id', () {
      final s = FridgeSelection();
      expect(s.toggle('a'), isTrue);
      expect(s.isSelected('a'), isTrue);
      expect(s.count, 1);
      expect(s.toggle('a'), isFalse);
      expect(s.isSelected('a'), isFalse);
      expect(s.count, 0);
    });

    test('requires at least 2 ingredients to generate (spec rule)', () {
      final s = FridgeSelection();
      s.select('vodka');
      expect(s.canGenerate, isFalse, reason: 'one ingredient is not enough');
      s.select('cola');
      expect(s.canGenerate, isTrue, reason: 'two ingredients is the minimum');
      expect(FridgeSelection.minRequired, 2);
    });

    test('clear removes everything', () {
      final s = FridgeSelection({'a', 'b', 'c'});
      expect(s.count, 3);
      s.clear();
      expect(s.count, 0);
    });

    test('selectedIds is unmodifiable defensive copy', () {
      final s = FridgeSelection({'a'});
      expect(() => s.selectedIds.add('b'), throwsUnsupportedError);
    });

    test('groupByCategory groups enabled ingredients and drops empty groups',
        () {
      final ingredients = [
        const Ingredient(
            id: 'v',
            category: IngredientCategory.baseSpirit,
            name: 'Vodka',
            enabled: true),
        const Ingredient(
            id: 'c',
            category: IngredientCategory.drink,
            name: 'Cola',
            enabled: true),
        const Ingredient(
            id: 'disabled',
            category: IngredientCategory.snack,
            name: 'Old',
            enabled: false),
      ];
      final grouped = FridgeSelection.groupByCategory(ingredients);
      expect(grouped.containsKey(IngredientCategory.baseSpirit), isTrue);
      expect(grouped.containsKey(IngredientCategory.drink), isTrue);
      // Snack group only had a disabled item -> dropped.
      expect(grouped.containsKey(IngredientCategory.snack), isFalse);
      // Fruit had no items at all -> dropped.
      expect(grouped.containsKey(IngredientCategory.fruit), isFalse);
    });
  });
}
