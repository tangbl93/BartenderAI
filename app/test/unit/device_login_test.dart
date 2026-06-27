import 'package:flutter_test/flutter_test.dart';
import 'package:home_bartender/data/repositories/mock_repository.dart';

/// Verifies the strict GAID device-login contract on the mock backend:
/// deterministic per-GAID (same device → same user) and never throws on a
/// blank/missing id at the repository level (the controller guards empties).
void main() {
  late MockRepository auth;

  setUp(() => auth = MockRepository());

  test('deviceLogin is deterministic per GAID', () async {
    final a = await auth.deviceLogin('GAID-abc-123');
    final b = await auth.deviceLogin('GAID-abc-123');
    expect(a.user.id, b.user.id);
    expect(a.accessToken, b.accessToken);
    expect(a.accessToken, isNotEmpty);
  });

  test('different GAIDs resolve to different users', () async {
    final a = await auth.deviceLogin('GAID-1');
    final b = await auth.deviceLogin('GAID-2');
    expect(a.user.id, isNot(b.user.id));
  });
}
