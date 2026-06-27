import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../data/services/image_save_service.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/locale_controller.dart';
import '../../l10n_helpers.dart';

/// Creates a poster job for the recipe, polls until done, shows a grid preview,
/// and offers per-poster retry + save-to-gallery + share. Mirrors the
/// poster-generation spec (parallel matrix, partial success, retry, timeout).
class PosterMatrixScreen extends StatefulWidget {
  const PosterMatrixScreen({super.key, required this.recipe});

  final Recipe recipe;

  @override
  State<PosterMatrixScreen> createState() => _PosterMatrixScreenState();
}

class _PosterMatrixScreenState extends State<PosterMatrixScreen> {
  PosterJob? _job;
  Timer? _poll;
  String? _error;
  int _polls = 0;
  static const int _maxPolls = 12; // timeout guard

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  String _localeString() =>
      LocaleController.toContentLocale(Localizations.localeOf(context));

  Future<void> _start() async {
    final repos = context.read<Repositories>();
    try {
      final job =
          await repos.posters.createJob(widget.recipe.id, _localeString());
      if (!mounted) return;
      setState(() => _job = job);
      _poll = Timer.periodic(const Duration(milliseconds: 800), (_) => _tick());
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    }
  }

  Future<void> _tick() async {
    final job = _job;
    if (job == null) return;
    _polls++;
    final repos = context.read<Repositories>();
    try {
      final updated = await repos.posters.job(job.id);
      if (!mounted) return;
      setState(() => _job = updated);
      final settled = updated.status == PosterJobStatus.done ||
          updated.status == PosterJobStatus.partial ||
          updated.status == PosterJobStatus.failed;
      if (settled || _polls >= _maxPolls) {
        _poll?.cancel();
        if (_polls >= _maxPolls && !settled) {
          setState(() => _error = AppLocalizations.of(context).posterTimeout);
        }
      }
    } on ApiException catch (e) {
      _poll?.cancel();
      if (mounted) setState(() => _error = e.message);
    }
  }

  Future<void> _retry(Poster poster) async {
    final repos = context.read<Repositories>();
    await repos.posters.retry(poster.id);
    final updated = await repos.posters.job(_job!.id);
    if (mounted) setState(() => _job = updated);
  }

  Future<void> _saveOne(Poster poster) async {
    final t = AppLocalizations.of(context);
    final saver = context.read<ImageSaveService>();
    final ok = await saver.saveNetworkImage(poster.imageUrl);
    if (mounted && ok) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(t.posterSaved)));
    }
  }

  Future<void> _saveAll() async {
    final t = AppLocalizations.of(context);
    final saver = context.read<ImageSaveService>();
    final urls = (_job?.posters ?? [])
        .where((p) => p.status == PosterStatus.done && p.imageUrl.isNotEmpty)
        .map((p) => p.imageUrl)
        .toList();
    final count = await saver.saveAll(urls);
    if (mounted && count > 0) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(t.posterSaved)));
    }
  }

  void _share(Poster poster) {
    final t = AppLocalizations.of(context);
    // A production build would invoke the `share_plus` plugin here. We surface
    // a confirmation so the action is observable in tests and demos.
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('${t.commonActionShare}: ${widget.recipe.name}')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final job = _job;
    final posters = job?.posters ?? [];
    final hasDone = posters.any((p) => p.status == PosterStatus.done);

    return Scaffold(
      appBar: AppBar(
        title: Text(t.posterTitle),
        actions: [
          if (hasDone)
            IconButton(
              key: const Key('btn_save_all'),
              tooltip: t.posterSaveAll,
              icon: const Icon(Icons.download),
              onPressed: _saveAll,
            ),
        ],
      ),
      body: _error != null
          ? _ErrorState(message: _error!, onRetry: () {
              setState(() {
                _error = null;
                _polls = 0;
                _job = null;
              });
              _start();
            })
          : job == null
              ? Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(),
                      const SizedBox(height: 16),
                      Text(t.posterGenerating),
                    ],
                  ),
                )
              : GridView.count(
                  padding: const EdgeInsets.all(12),
                  crossAxisCount: 2,
                  childAspectRatio: 0.62,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  children: posters
                      .map((p) => _PosterCard(
                            poster: p,
                            onRetry: () => _retry(p),
                            onSave: () => _saveOne(p),
                            onShare: () => _share(p),
                          ))
                      .toList(),
                ),
    );
  }
}

class _PosterCard extends StatelessWidget {
  const _PosterCard({
    required this.poster,
    required this.onRetry,
    required this.onSave,
    required this.onShare,
  });

  final Poster poster;
  final VoidCallback onRetry;
  final VoidCallback onSave;
  final VoidCallback onShare;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Card(
      key: Key('poster_${poster.id}'),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(child: _preview(context)),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            child: Text(
              t.posterDimensionLabel(poster.dimension),
              style: Theme.of(context).textTheme.labelMedium,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          if (poster.status == PosterStatus.done)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                IconButton(
                  icon: const Icon(Icons.save_alt),
                  tooltip: t.posterSaveToGallery,
                  onPressed: onSave,
                ),
                IconButton(
                  icon: const Icon(Icons.share),
                  tooltip: t.commonActionShare,
                  onPressed: onShare,
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _preview(BuildContext context) {
    final t = AppLocalizations.of(context);
    switch (poster.status) {
      case PosterStatus.done:
        return poster.imageUrl.isEmpty
            ? const ColoredBox(color: Colors.black12)
            : Image.network(
                poster.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stack) =>
                    const ColoredBox(color: Colors.black12),
              );
      case PosterStatus.failed:
        return Container(
          color: Theme.of(context).colorScheme.errorContainer,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline),
                const SizedBox(height: 8),
                Text(t.posterStatusFailed),
                TextButton.icon(
                  key: Key('retry_${poster.id}'),
                  onPressed: onRetry,
                  icon: const Icon(Icons.refresh),
                  label: Text(t.commonActionRetry),
                ),
              ],
            ),
          ),
        );
      case PosterStatus.pending:
      case PosterStatus.running:
        return Container(
          color: Colors.black12,
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const CircularProgressIndicator(),
                const SizedBox(height: 8),
                Text(t.posterStatusLabel(poster.status)),
              ],
            ),
          ),
        );
    }
  }
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off, size: 48),
          const SizedBox(height: 12),
          Text(message),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: Text(t.commonActionRetry),
          ),
        ],
      ),
    );
  }
}
