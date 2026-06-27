import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../../l10n_helpers.dart';
import 'lab_checkin_screen.dart';
import 'lab_detail_screen.dart';

/// "My Tasting Lab" — time-descending list of the user's check-ins.
class LabScreen extends StatefulWidget {
  const LabScreen({super.key});

  @override
  State<LabScreen> createState() => _LabScreenState();
}

class _LabScreenState extends State<LabScreen> {
  late Future<List<LabEntry>> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reload();
  }

  void _reload() {
    _future = context.read<Repositories>().lab.entries();
  }

  Future<void> _openCheckIn() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const LabCheckInScreen()),
    );
    if (created == true && mounted) setState(_reload);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.labTitle)),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('btn_checkin'),
        onPressed: _openCheckIn,
        icon: const Icon(Icons.add_a_photo),
        label: Text(t.labCheckIn),
      ),
      body: FutureBuilder<List<LabEntry>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          final entries = snapshot.data ?? [];
          if (entries.isEmpty) {
            return Center(child: Text(t.labEmpty));
          }
          return RefreshIndicator(
            onRefresh: () async => setState(_reload),
            child: ListView.builder(
              itemCount: entries.length,
              itemBuilder: (context, i) {
                final e = entries[i];
                return ListTile(
                  key: Key('lab_entry_${e.id}'),
                  leading: _thumb(e),
                  title: Text(e.note.isEmpty ? e.recipeId : e.note),
                  subtitle: Text(t.labResultLabel(e.result)),
                  trailing: _statusChip(context, e.moderationStatus),
                  onTap: () async {
                    await Navigator.of(context).push(MaterialPageRoute(
                      builder: (_) => LabDetailScreen(entry: e),
                    ));
                    if (mounted) setState(_reload);
                  },
                );
              },
            ),
          );
        },
      ),
    );
  }

  Widget _thumb(LabEntry e) {
    if (e.imageUrl.startsWith('http')) {
      return CircleAvatar(backgroundImage: NetworkImage(e.imageUrl));
    }
    return CircleAvatar(
      child: Icon(e.result == LabResult.success
          ? Icons.check
          : Icons.sentiment_dissatisfied),
    );
  }

  Widget _statusChip(BuildContext context, ModerationStatus status) {
    final t = AppLocalizations.of(context);
    final label = switch (status) {
      ModerationStatus.private => t.moderationPrivate,
      ModerationStatus.pending => t.moderationPending,
      ModerationStatus.approved => t.moderationApproved,
      ModerationStatus.rejected => t.moderationRejected,
    };
    return Chip(
      label: Text(label, style: const TextStyle(fontSize: 11)),
      visualDensity: VisualDensity.compact,
    );
  }
}
