import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';

/// Public poster wall — browse approved community posters, sort by hot/time.
class WallScreen extends StatefulWidget {
  const WallScreen({super.key});

  @override
  State<WallScreen> createState() => _WallScreenState();
}

class _WallScreenState extends State<WallScreen> {
  String _sort = 'time';
  late Future<List<LabEntry>> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reload();
  }

  void _reload() {
    _future = context.read<Repositories>().wall.feed(sort: _sort);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(t.wallTitle),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'time', label: Text(t.wallSortTime)),
                ButtonSegment(value: 'hot', label: Text(t.wallSortHot)),
              ],
              selected: {_sort},
              onSelectionChanged: (s) => setState(() {
                _sort = s.first;
                _reload();
              }),
            ),
          ),
        ),
      ),
      body: FutureBuilder<List<LabEntry>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final entries = snapshot.data ?? [];
          if (entries.isEmpty) {
            return Center(child: Text(t.wallEmpty));
          }
          return GridView.count(
            padding: const EdgeInsets.all(12),
            crossAxisCount: 2,
            childAspectRatio: 0.7,
            mainAxisSpacing: 12,
            crossAxisSpacing: 12,
            children: entries
                .map((e) => Card(
                      key: Key('wall_${e.id}'),
                      clipBehavior: Clip.antiAlias,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: Image.network(
                              e.imageUrl,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stack) =>
                                  const ColoredBox(color: Colors.black12),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.all(8),
                            child: Text(
                              e.note,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: Theme.of(context).textTheme.labelMedium,
                            ),
                          ),
                        ],
                      ),
                    ))
                .toList(),
          );
        },
      ),
    );
  }
}
