import '../data/models/models.dart';

/// Pure, dependency-free selection logic for the "open the fridge" screen.
/// Kept separate from any widget so it can be unit-tested directly.
class FridgeSelection {
  FridgeSelection([Set<String>? initial])
      : _selected = {...?initial};

  final Set<String> _selected;

  /// Minimum ingredients required to generate a drinkable recipe
  /// (per recipe-generation spec: at least two).
  static const int minRequired = 2;

  Set<String> get selectedIds => Set.unmodifiable(_selected);
  int get count => _selected.length;
  bool get canGenerate => _selected.length >= minRequired;

  bool isSelected(String id) => _selected.contains(id);

  /// Toggles an id; returns the new selection state for that id.
  bool toggle(String id) {
    if (_selected.contains(id)) {
      _selected.remove(id);
      return false;
    }
    _selected.add(id);
    return true;
  }

  void select(String id) => _selected.add(id);
  void deselect(String id) => _selected.remove(id);
  void clear() => _selected.clear();

  /// Groups ingredients by category, preserving the canonical category order.
  static Map<IngredientCategory, List<Ingredient>> groupByCategory(
      List<Ingredient> ingredients) {
    final map = <IngredientCategory, List<Ingredient>>{
      for (final c in IngredientCategory.values) c: <Ingredient>[],
    };
    for (final ing in ingredients) {
      if (!ing.enabled) continue; // only enabled show in the fridge
      map[ing.category]!.add(ing);
    }
    // Drop empty categories for display.
    map.removeWhere((_, v) => v.isEmpty);
    return map;
  }
}
