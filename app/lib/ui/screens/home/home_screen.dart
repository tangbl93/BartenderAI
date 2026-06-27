import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../craft/craft_screen.dart';
import '../profile/profile_screen.dart';

/// Single-page home: app name header, a system template showcase strip,
/// then the user's check-in gallery, plus a "craft" entry point.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<LabEntry>> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reload();
  }

  void _reload() {
    _future = context.read<Repositories>().lab.entries();
  }

  Future<void> _craft() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const CraftScreen()),
    );
    if (created == true && mounted) setState(_reload);
  }

  void _openProfile() {
    Navigator.of(context)
        .push(MaterialPageRoute(builder: (_) => const ProfileScreen()));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(t.commonAppName),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_outline),
            tooltip: t.commonSettings,
            onPressed: _openProfile,
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('btn_craft'),
        onPressed: _craft,
        icon: const Icon(Icons.add),
        label: Text(t.craftMake),
      ),
      body: Column(
        children: [
          _systemCases(context),
          Expanded(child: _gallery(context, t)),
        ],
      ),
    );
  }

  // ponytail: system template showcase — placeholder cases; wire to a backend
  // templates/examples feed when one exists.
  Widget _systemCases(BuildContext context) {
    const cases = [
      ('https://picsum.photos/seed/case1/400/600', 'Midnight Fizz'),
      ('https://picsum.photos/seed/case2/400/600', 'Sunset Spritz'),
      ('https://picsum.photos/seed/case3/400/600', 'Minty Cooler'),
      ('https://picsum.photos/seed/case4/400/600', 'Citrus Highball'),
    ];
    final fallback = Theme.of(context).colorScheme.surfaceContainerHighest;
    return SizedBox(
      height: 150,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
        itemCount: cases.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, i) => ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.network(
            cases[i].$1,
            width: 110,
            height: 150,
            fit: BoxFit.cover,
            errorBuilder: (_, _, _) => Container(
              width: 110,
              height: 150,
              color: fallback,
              alignment: Alignment.center,
              child: const Icon(Icons.local_bar),
            ),
          ),
        ),
      ),
    );
  }

  Widget _gallery(BuildContext context, AppLocalizations t) {
    return FutureBuilder<List<LabEntry>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return Center(child: Text(t.commonError));
        }
        final entries = snapshot.data ?? [];
        if (entries.isEmpty) {
          return Center(child: Text(t.homeEmpty));
        }
        return RefreshIndicator(
          onRefresh: () async => setState(_reload),
          child: ListView.builder(
            itemCount: entries.length,
            itemBuilder: (context, i) {
              final e = entries[i];
              return ListTile(
                key: Key('entry_${e.id}'),
                leading: _thumb(e),
                title: Text(e.note.isEmpty ? e.recipeId : e.note),
                subtitle: Text(t.labCreatedAt(_formatDate(e.createdAt))),
              );
            },
          ),
        );
      },
    );
  }

  Widget _thumb(LabEntry e) {
    if (e.imageUrl.startsWith('http')) {
      return CircleAvatar(backgroundImage: NetworkImage(e.imageUrl));
    }
    return const CircleAvatar(child: Icon(Icons.local_bar));
  }

  // ponytail: naive ISO date; switch to intl DateFormat if localized dates are needed.
  String _formatDate(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}
