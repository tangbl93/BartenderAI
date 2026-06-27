import 'dart:async';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../data/services/image_save_service.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/fridge_selection.dart';
import '../../../logic/locale_controller.dart';
import '../../l10n_helpers.dart';

/// The "craft" flow as a single-page state machine:
/// ① select ingredients → ② generate recipe steps → ③ check-in:
/// optionally add up to 3 of your own finished photos, tap Share to have the
/// system generate a share image, then save the creation.
class CraftScreen extends StatefulWidget {
  const CraftScreen({super.key});

  @override
  State<CraftScreen> createState() => _CraftScreenState();
}

enum _Step { select, recipe, checkin }

class _CraftScreenState extends State<CraftScreen> {
  final FridgeSelection _selection = FridgeSelection();
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _note = TextEditingController();

  _Step _step = _Step.select;
  Recipe? _recipe;
  PosterJob? _job;
  Timer? _poll;
  int _polls = 0;
  String? _error;
  bool _busy = false;
  bool _generating = false;
  bool _saving = false;
  List<String> _photos = []; // user finished-product photos (≤3)
  late Future<List<Ingredient>> _ingredients;

  static const int _maxPolls = 12;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _ingredients =
        context.read<Repositories>().ingredients.list(_localeString());
  }

  @override
  void dispose() {
    _poll?.cancel();
    _note.dispose();
    super.dispose();
  }

  String _localeString() =>
      LocaleController.toContentLocale(Localizations.localeOf(context));

  /// First completed poster = the system share image.
  Poster? get _sharePoster {
    for (final p in _job?.posters ?? const <Poster>[]) {
      if (p.status == PosterStatus.done && p.imageUrl.isNotEmpty) return p;
    }
    return null;
  }

  void _snack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  // ---------------- transitions ----------------
  Future<void> _generate() async {
    final t = AppLocalizations.of(context);
    if (!_selection.canGenerate) {
      _snack(t.fridgeNeedMore);
      return;
    }
    setState(() => _busy = true);
    final repos = context.read<Repositories>();
    try {
      final recipe = await repos.recipes
          .generate(_selection.selectedIds.toList(), _localeString());
      if (!mounted) return;
      setState(() {
        _recipe = recipe;
        _step = _Step.recipe;
      });
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Share = the system generates a share image (poster job), then it's
  /// available to save / re-share. Idempotent: re-tap regenerates.
  Future<void> _share() async {
    final recipe = _recipe;
    if (recipe == null || _generating) return;
    _poll?.cancel();
    setState(() {
      _generating = true;
      _error = null;
      _job = null;
      _polls = 0;
    });
    final repos = context.read<Repositories>();
    try {
      final job = await repos.posters.createJob(recipe.id, _localeString());
      if (!mounted) return;
      setState(() => _job = job);
      _poll = Timer.periodic(
          const Duration(milliseconds: 800), (_) => _tick());
    } on ApiException catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _generating = false);
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

  Future<void> _saveImage() async {
    final t = AppLocalizations.of(context);
    final url = _sharePoster?.imageUrl;
    if (url == null) return;
    final ok = await context.read<ImageSaveService>().saveNetworkImage(url);
    if (mounted && ok) _snack(t.posterSaved);
  }

  Future<void> _pickPhotos() async {
    try {
      final files = await _picker.pickMultiImage(imageQuality: 80);
      if (files.isEmpty) return;
      setState(() =>
          _photos = [..._photos, ...files.map((f) => f.path)].take(3).toList());
    } catch (_) {
      // Gallery unavailable — ignore.
    }
  }

  Future<void> _saveCheckIn() async {
    final t = AppLocalizations.of(context);
    final recipe = _recipe;
    final poster = _sharePoster;
    if (recipe == null) return;
    if (poster == null && _photos.isEmpty) {
      _snack(t.labImageRequired);
      return;
    }
    setState(() => _saving = true);
    final repos = context.read<Repositories>();
    try {
      await repos.lab.create(
        recipe.id,
        poster?.imageUrl ?? '',
        photos: _photos.isEmpty ? null : _photos,
        note: _note.text.trim().isEmpty ? null : _note.text.trim(),
      );
      if (!mounted) return;
      _snack(t.craftSaved);
      Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  // ---------------- build ----------------
  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(_title(t))),
      body: switch (_step) {
        _Step.select => _buildSelect(t),
        _Step.recipe => _buildRecipe(context, t),
        _Step.checkin => _buildCheckIn(context, t),
      },
    );
  }

  String _title(AppLocalizations t) => switch (_step) {
        _Step.select => t.craftMake,
        _Step.recipe => t.recipeResultTitle,
        _Step.checkin => t.labCheckIn,
      };

  // ---- ① select ----
  Widget _buildSelect(AppLocalizations t) {
    return Column(
      children: [
        Expanded(
          child: FutureBuilder<List<Ingredient>>(
            future: _ingredients,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) {
                return Center(child: Text(t.commonError));
              }
              final grouped =
                  FridgeSelection.groupByCategory(snapshot.data ?? []);
              return ListView(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                children: [
                  Text(t.fridgeSubtitle,
                      style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 12),
                  for (final entry in grouped.entries)
                    _CategorySection(
                      category: entry.key,
                      ingredients: entry.value,
                      selection: _selection,
                      onChanged: () => setState(() {}),
                    ),
                ],
              );
            },
          ),
        ),
        _GenerateBar(
          count: _selection.count,
          canGenerate: _selection.canGenerate,
          busy: _busy,
          onClear: () => setState(_selection.clear),
          onGenerate: _generate,
        ),
      ],
    );
  }

  // ---- ② recipe ----
  Widget _buildRecipe(BuildContext context, AppLocalizations t) {
    final recipe = _recipe!;
    final theme = Theme.of(context);
    return Stack(
      children: [
        ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
          children: [
            Text(recipe.name, style: theme.textTheme.headlineMedium),
            const SizedBox(height: 8),
            Text(recipe.tagline,
                style: theme.textTheme.bodyLarge
                    ?.copyWith(fontStyle: FontStyle.italic)),
            if (recipe.alcoholRange.isNotEmpty) ...[
              const SizedBox(height: 8),
              Chip(
                avatar: const Icon(Icons.local_bar, size: 18),
                label: Text(t.recipeAlcoholRange(recipe.alcoholRange)),
              ),
            ],
            const Divider(height: 32),
            _SectionTitle(t.recipeIngredients),
            ...recipe.items.map((item) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.fiber_manual_record, size: 12),
                  title: Text(item.name +
                      (item.optional ? ' (${t.recipeOptional})' : '')),
                  trailing:
                      Text(item.amount, style: theme.textTheme.titleMedium),
                )),
            const SizedBox(height: 8),
            _SectionTitle(t.recipeGuideTitle),
            ...recipe.steps.asMap().entries.map((e) => ListTile(
                  leading:
                      CircleAvatar(radius: 14, child: Text('${e.key + 1}')),
                  title: Text(e.value),
                )),
            if (recipe.toolSubstitutions.isNotEmpty) ...[
              _SectionTitle(t.recipeToolSubstitutions),
              ...recipe.toolSubstitutions.map((sub) => ListTile(
                    dense: true,
                    leading: const Icon(Icons.swap_horiz),
                    title: Text(sub.tool),
                    subtitle: Text(sub.homeAlternative),
                  )),
            ],
            const SizedBox(height: 8),
            Card(
              color: theme.colorScheme.errorContainer,
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Icon(Icons.warning_amber),
                      const SizedBox(width: 8),
                      Expanded(child: Text(t.recipeResultAlcoholHint)),
                    ]),
                    ...recipe.safetyNotes
                        .map((n) => Padding(
                              padding: const EdgeInsets.only(top: 6),
                              child: Text('• $n'),
                            )),
                  ],
                ),
              ),
            ),
          ],
        ),
        Positioned(
          left: 16,
          right: 16,
          bottom: 16,
          child: FilledButton.icon(
            key: const Key('btn_to_checkin'),
            onPressed: () => setState(() => _step = _Step.checkin),
            icon: const Icon(Icons.check_circle_outline),
            label: Text(t.labCheckIn),
          ),
        ),
      ],
    );
  }

  // ---- ③ check-in (share-image generation + photos + save) ----
  Widget _buildCheckIn(BuildContext context, AppLocalizations t) {
    final poster = _sharePoster;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      children: [
        // System share image area
        if (_error != null)
          _ErrorState(message: _error!, onRetry: _share)
        else if (poster != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Image.network(poster.imageUrl,
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => const SizedBox(height: 180)),
          )
        else
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: _generating
                  ? const CircularProgressIndicator()
                  : Text(t.posterGenerating),
            ),
          ),
        if (poster != null) ...[
          const SizedBox(height: 8),
          Row(children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _saveImage,
                icon: const Icon(Icons.save_alt),
                label: Text(t.posterSaveToGallery),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _share,
                icon: const Icon(Icons.refresh),
                label: Text(t.commonActionRetry),
              ),
            ),
          ]),
        ],
        const SizedBox(height: 16),

        // Finished photos
        Row(children: [
          Expanded(
            child: OutlinedButton.icon(
              onPressed: _pickPhotos,
              icon: const Icon(Icons.add_a_photo),
              label: Text(t.craftAddPhotos),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: OutlinedButton.icon(
              onPressed: _generating ? null : _share,
              icon: const Icon(Icons.share),
              label: Text(t.commonActionShare),
            ),
          ),
        ]),
        const SizedBox(height: 4),
        Text(t.craftPhotosOptional, style: Theme.of(context).textTheme.bodySmall),
        if (_photos.isNotEmpty) ...[
          const SizedBox(height: 8),
          SizedBox(
            height: 72,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: _photos.length,
              separatorBuilder: (_, _) => const SizedBox(width: 8),
              itemBuilder: (context, i) => Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.asset(_photos[i],
                        width: 72, height: 72, fit: BoxFit.cover),
                  ),
                  Positioned(
                    top: 0,
                    right: 0,
                    child: IconButton(
                      iconSize: 18,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      icon: const Icon(Icons.cancel),
                      onPressed: () => setState(() => _photos.removeAt(i)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 12),
        TextField(
          controller: _note,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: t.labNoteLabel,
            border: const OutlineInputBorder(),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          key: const Key('btn_save_checkin'),
          onPressed: _saving ? null : _saveCheckIn,
          icon: _saving
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.check),
          label: Text(t.craftSave),
        ),
      ],
    );
  }
}

class _CategorySection extends StatelessWidget {
  const _CategorySection({
    required this.category,
    required this.ingredients,
    required this.selection,
    required this.onChanged,
  });

  final IngredientCategory category;
  final List<Ingredient> ingredients;
  final FridgeSelection selection;
  final VoidCallback onChanged;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text(t.categoryLabel(category),
              style: Theme.of(context).textTheme.titleMedium),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ingredients.map((ing) {
            final selected = selection.isSelected(ing.id);
            return FilterChip(
              label: Text(ing.name),
              selected: selected,
              onSelected: (_) {
                selection.toggle(ing.id);
                onChanged();
              },
            );
          }).toList(),
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

class _GenerateBar extends StatelessWidget {
  const _GenerateBar({
    required this.count,
    required this.canGenerate,
    required this.busy,
    required this.onClear,
    required this.onGenerate,
  });

  final int count;
  final bool canGenerate;
  final bool busy;
  final VoidCallback onClear;
  final VoidCallback onGenerate;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Material(
      elevation: 8,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
        child: Row(
          children: [
            Expanded(child: Text(t.fridgeSelectedCount(count))),
            if (count > 0)
              TextButton(onPressed: onClear, child: Text(t.fridgeClear)),
            const SizedBox(width: 8),
            FilledButton.icon(
              key: const Key('btn_generate'),
              onPressed: (canGenerate && !busy) ? onGenerate : null,
              icon: busy
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2))
                  : const Icon(Icons.auto_awesome),
              label: Text(t.fridgeGenerate),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Text(text, style: Theme.of(context).textTheme.titleLarge),
      );
}

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});
  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 24),
      child: Center(
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
      ),
    );
  }
}
