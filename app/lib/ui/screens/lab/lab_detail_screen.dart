import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../../l10n_helpers.dart';

/// Detail of a single check-in with a "submit to wall" action (sets pending).
class LabDetailScreen extends StatefulWidget {
  const LabDetailScreen({super.key, required this.entry});

  final LabEntry entry;

  @override
  State<LabDetailScreen> createState() => _LabDetailScreenState();
}

class _LabDetailScreenState extends State<LabDetailScreen> {
  late ModerationStatus _status = widget.entry.moderationStatus;
  bool _busy = false;

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    setState(() => _busy = true);
    await context.read<Repositories>().lab.submitToWall(widget.entry.id);
    if (!mounted) return;
    setState(() {
      _status = ModerationStatus.pending;
      _busy = false;
    });
    ScaffoldMessenger.of(context)
        .showSnackBar(SnackBar(content: Text(t.labSubmittedPending)));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final e = widget.entry;
    final canSubmit = _status == ModerationStatus.private;
    return Scaffold(
      appBar: AppBar(title: Text(t.labDetailTitle)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (e.imageUrl.startsWith('http'))
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.network(e.imageUrl,
                  height: 280, fit: BoxFit.cover),
            )
          else
            Container(
              height: 200,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.local_bar, size: 64),
            ),
          const SizedBox(height: 16),
          Chip(label: Text(t.labResultLabel(e.result))),
          const SizedBox(height: 8),
          if (e.note.isNotEmpty)
            Text(e.note, style: Theme.of(context).textTheme.bodyLarge),
          const SizedBox(height: 8),
          Text(
            t.labCreatedAt(DateFormat.yMMMd().add_Hm().format(e.createdAt)),
            style: Theme.of(context).textTheme.bodySmall,
          ),
          const SizedBox(height: 24),
          FilledButton.icon(
            key: const Key('btn_submit_wall'),
            onPressed: (canSubmit && !_busy) ? _submit : null,
            icon: const Icon(Icons.send),
            label: Text(canSubmit ? t.labSubmitToWall : t.moderationPending),
          ),
        ],
      ),
    );
  }
}
