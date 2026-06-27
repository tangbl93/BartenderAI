import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/data/models/models.dart';
import 'package:home_bartender/data/repositories/mock_repository.dart';
import 'package:home_bartender/logic/fridge_selection.dart';

void main() {
  group('FridgeInventory mock repository', () {
    test('latest is null before anything is saved', () async {
      final repo = MockRepository();
      expect(await repo.latest(), isNull);
      expect(await repo.recent(), isEmpty);
    });

    test('save persists ids + summary and shows up in recent/latest', () async {
      final repo = MockRepository();
      final saved = await repo.save(['gin', 'lime'], summary: 'Gin, Lime');
      expect(saved.ingredientIds, ['gin', 'lime']);
      expect(saved.summary, 'Gin, Lime');

      final latest = await repo.latest();
      expect(latest, isNotNull);
      expect(latest!.ingredientIds, ['gin', 'lime']);

      final recent = await repo.recent();
      expect(recent.length, 1);
    });

    test('summary falls back to joined ids when empty', () async {
      final repo = MockRepository();
      final saved = await repo.save(['gin', 'tonic'], summary: '');
      expect(saved.summary, 'gin, tonic');
    });

    test('recent is newest-first', () async {
      final repo = MockRepository();
      await repo.save(['a'], summary: 'first');
      await repo.save(['b'], summary: 'second');
      final recent = await repo.recent();
      expect(recent.first.summary, 'second');
      expect(recent.last.summary, 'first');
    });

    test('save rejects an empty selection', () async {
      final repo = MockRepository();
      expect(() => repo.save(const [], summary: ''),
          throwsA(isA<ApiException>()));
    });

    test('a restored inventory pre-selects enough to generate', () async {
      final repo = MockRepository();
      await repo.save(['gin', 'lime'], summary: 'Gin, Lime');
      final inv = await repo.latest();

      // Bridge: scan/restore feeds ids into the selection used by the recipe
      // generator, which requires the spec minimum of 2.
      final selection = FridgeSelection();
      for (final id in inv!.ingredientIds) {
        selection.select(id);
      }
      expect(selection.count, 2);
      expect(selection.canGenerate, isTrue);
    });
  });

  group('ScanInventory', () {
    test('summarize joins names with commas', () {
      expect(ScanInventory.summarize(['Gin', 'Lime', 'Tonic']), 'Gin, Lime, Tonic');
    });

    test('round-trips through json', () {
      final inv = ScanInventory(
        id: 's1',
        ingredientIds: const ['gin', 'lime'],
        summary: 'Gin, Lime',
        createdAt: DateTime.utc(2026, 6, 27, 10),
      );
      final restored = ScanInventory.fromJson(inv.toJson());
      expect(restored.id, 's1');
      expect(restored.ingredientIds, ['gin', 'lime']);
      expect(restored.summary, 'Gin, Lime');
      expect(restored.createdAt, DateTime.utc(2026, 6, 27, 10));
    });
  });
}
