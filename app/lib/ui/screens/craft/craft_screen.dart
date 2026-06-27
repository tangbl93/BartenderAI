import 'dart:io';

import 'package:cached_network_image/cached_network_image.dart';
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
import '../../theme/app_theme.dart';

/// The "craft" flow as a single-page state machine:
/// ⓪ scan the fridge (or pick ingredients manually) → ① fine-tune the
/// selection → ② generate the recipe step image → ③ check in. Entry can also
/// jump straight to ② when launched from a featured preset.
class CraftScreen extends StatefulWidget {
  const CraftScreen({super.key, this.presetRecipe, this.directCheckIn = false});

  /// When provided (e.g. tapped from a home "Featured" card), the flow skips
  /// the scan/select steps and opens directly on the recipe step image.
  final Recipe? presetRecipe;

  /// When true (with a [presetRecipe]), skip the result display and land on the
  /// check-in / share page once the step image is ready.
  final bool directCheckIn;

  @override
  State<CraftScreen> createState() => _CraftScreenState();
}

enum _Step { scan, select, result, checkin }

/// Sub-state of the scan step's viewfinder.
enum _ScanPhase { empty, scanning, detected }

class _CraftScreenState extends State<CraftScreen>
    with SingleTickerProviderStateMixin {
  final FridgeSelection _selection = FridgeSelection();
  final ImagePicker _picker = ImagePicker();
  final TextEditingController _note = TextEditingController();
  late final AnimationController _scanCtl;

  _Step _step = _Step.scan;
  _ScanPhase _scanPhase = _ScanPhase.empty;
  List<_Detection> _detections = [];
  String? _scanImagePath;

  Recipe? _recipe;
  PosterJob? _stepJob; // result step: recipe step image
  PosterJob? _shareJob; // check-in step: share image (built with a template)
  StyleTemplate? _selectedTemplate; // chosen share template
  late Future<List<StyleTemplate>> _templates;
  // ponytail: client-side throttle — one new job per kind per 3 min; the
  // backend rate-limits generation, so reuse the in-flight/recent job inside
  // that window instead of firing a new createJob (which it would 429).
  DateTime? _lastStepCreate;
  DateTime? _lastShareCreate;
  bool _busy = false; // generating recipe
  bool _saving = false; // saving check-in
  bool _stepBusy = false; // generating the recipe step image
  bool _shareBusy = false; // generating the share image
  bool _savingInventory = false; // saving the scanned inventory
  List<String> _photos = []; // user finished-product photos (≤3)

  bool _initialized = false;
  List<Ingredient> _allIngredients = [];
  late Future<List<Ingredient>> _ingredients;
  late Future<List<ScanInventory>> _recent;

  // ponytail: poll indefinitely — generation can be slow; the loop bails out
  // when the widget is disposed (user leaves the page). No retry cap.
  static const Duration _pollInterval = Duration(milliseconds: 1500);
  static const Duration _cooldown = Duration(minutes: 3);
  // Cap on how many ingredients a simulated scan "detects".
  static const int _maxDetections = 5;

  @override
  void initState() {
    super.initState();
    _scanCtl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_initialized) return;
    _initialized = true;
    final repos = context.read<Repositories>();
    final locale = _localeString();
    // Cache-first: serve the last backend fetch instantly on re-entry, then
    // refresh silently so the list stays in sync with the backend.
    final cached = _IngredientCache.get(locale);
    _ingredients = cached != null
        ? Future.value(cached)
        : repos.ingredients.list(locale);
    _allIngredients = cached ?? const [];
    repos.ingredients.list(locale).then((list) {
      _IngredientCache.set(locale, list);
      if (mounted) setState(() => _allIngredients = list);
    });
    _recent = repos.fridge.recent();
    _templates = repos.posters.templates();
    if (widget.presetRecipe != null) {
      // Launched from a featured preset → jump straight to the step image
      // (or all the way to check-in when directCheckIn is set).
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          _gotoResult(widget.presetRecipe!, toCheckIn: widget.directCheckIn);
        }
      });
    }
    // ponytail: no auto-restore on entry — the scan page starts clean every
    // visit; users restore history explicitly via the recent-scans strip.
  }

  @override
  void dispose() {
    // Clear transient scan data so nothing leaks into a future session.
    _selection.clear();
    _detections = [];
    _scanImagePath = null;
    _scanCtl.dispose();
    _note.dispose();
    super.dispose();
  }

  String _localeString() =>
      LocaleController.toContentLocale(Localizations.localeOf(context));

  /// First done poster of the recipe step image (result step).
  Poster? get _stepPoster => _firstDone(_stepJob);

  /// First done poster of the share image (check-in step).
  Poster? get _sharePoster => _firstDone(_shareJob);

  Poster? _firstDone(PosterJob? job) {
    for (final p in job?.posters ?? const <Poster>[]) {
      if (p.status == PosterStatus.done && p.imageUrl.isNotEmpty) return p;
    }
    return null;
  }

  void _snack(String msg) =>
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));

  String _nameFor(String id) {
    for (final i in _allIngredients) {
      if (i.id == id) return i.name;
    }
    return '';
  }

  // ---------------- scan step ----------------
  Future<void> _ensureIngredients() async {
    if (_allIngredients.isNotEmpty) return;
    final list = await _ingredients;
    if (mounted) setState(() => _allIngredients = list);
  }

  /// Start a scan: optionally grab a reference photo, run the scan-line
  /// animation, then surface simulated detections.
  Future<void> _startScan() async {
    await _ensureIngredients();
    try {
      final file =
          await _picker.pickImage(source: ImageSource.gallery, imageQuality: 80);
      if (file != null) _scanImagePath = file.path;
    } catch (_) {
      // Gallery unavailable — scan without a reference image.
    }
    if (!mounted) return;
    setState(() => _scanPhase = _ScanPhase.scanning);
    await _scanCtl.forward(from: 0);
    if (!mounted) return;
    _finishScan();
  }

  /// Simulated recognition: deterministically pick a spread of ingredients
  /// across categories and assign pseudo-confidences, then pre-select them.
  void _finishScan() {
    final detected = _simulateDetections();
    for (final d in detected) {
      _selection.select(d.ingredient.id);
    }
    setState(() {
      _detections = detected;
      _scanPhase = _ScanPhase.detected;
    });
  }

  List<_Detection> _simulateDetections() {
    final grouped = FridgeSelection.groupByCategory(_allIngredients);
    final picked = <_Detection>[];
    // Take the first couple from each category for a believable spread.
    for (final entry in grouped.entries) {
      for (final ing in entry.value.take(2)) {
        if (picked.length >= _maxDetections) break;
        picked.add(_Detection(ing, _pseudoConfidence(ing.id)));
      }
      if (picked.length >= _maxDetections) break;
    }
    return picked;
  }

  /// Deterministic 85–99% confidence derived from the id (no randomness so the
  /// UI is stable across rebuilds and tests).
  int _pseudoConfidence(String id) => 85 + (id.hashCode.abs() % 15);

  /// Restore a saved scan / latest inventory into the detected state.
  void _applyInventory(List<String> ids) {
    final byId = {for (final i in _allIngredients) i.id: i};
    final detected = <_Detection>[];
    for (final id in ids) {
      _selection.select(id);
      final ing = byId[id];
      if (ing != null) detected.add(_Detection(ing, 100));
    }
    setState(() {
      _detections = detected;
      _scanPhase = _ScanPhase.detected;
    });
  }

  Future<void> _saveInventory() async {
    final t = AppLocalizations.of(context);
    final ids = _selection.selectedIds.toList();
    if (ids.isEmpty) return;
    setState(() => _savingInventory = true);
    final repos = context.read<Repositories>();
    try {
      final names =
          ids.map(_nameFor).where((n) => n.isNotEmpty).toList(growable: false);
      await repos.fridge.save(ids, summary: ScanInventory.summarize(names));
      if (!mounted) return;
      _snack(t.craftInventorySaved);
      setState(() => _recent = repos.fridge.recent());
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } finally {
      if (mounted) setState(() => _savingInventory = false);
    }
  }

  void _rescan() {
    _selection.clear();
    setState(() {
      _detections = [];
      _scanImagePath = null;
      _scanPhase = _ScanPhase.empty;
    });
  }

  /// Restore a recent scan and jump straight to the select step, skipping the
  /// scan viewfinder.
  void _restoreScan(ScanInventory inv) {
    _selection.clear();
    _applyInventory(inv.ingredientIds);
    _gotoSelect();
  }

  /// Skip scanning and go straight to manual multi-select (top-right action,
  /// also used as the forward step from the detected state).
  void _gotoSelect() => setState(() => _step = _Step.select);

  // ---------------- step transitions ----------------
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
      await _gotoResult(recipe);
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Move to the result step. Featured recipes ship a pre-rendered step image,
  /// so we display it instantly and skip the live poster job (省生产消耗).
  /// User-generated recipes fall back to live generation.
  Future<void> _gotoResult(Recipe r, {bool toCheckIn = false}) async {
    setState(() {
      _recipe = r;
      _step = _Step.result;
    });
    final featured = r.featuredImageUrl;
    if (featured != null && featured.isNotEmpty) {
      setState(() {
        _stepJob = PosterJob(
          id: 'featured-${r.id}',
          recipeId: r.id,
          status: PosterJobStatus.done,
          posters: [
            Poster(
              id: 'featured-${r.id}',
              dimension: PosterDimension.homeCloseup,
              templateId: '',
              status: PosterStatus.done,
              imageUrl: featured,
              textSnapshot: const {},
            ),
          ],
        );
      });
      if (toCheckIn && mounted) setState(() => _step = _Step.checkin);
      return;
    }
    await _ensureStepImage();
    if (toCheckIn && mounted) setState(() => _step = _Step.checkin);
  }

  /// Poll [job] until it settles (done/partial/failed) or the widget is
  /// disposed. Bails out when the user leaves the page (mounted == false).
  Future<PosterJob> _pollUntilSettled(PosterJob job, String kind) async {
    final repos = context.read<Repositories>();
    var poll = 0;
    while (mounted) {
      await Future.delayed(_pollInterval);
      if (!mounted) break;
      poll++;
      job = await repos.posters.job(job.id);
      debugPrint('[$kind] poll #$poll job=${job.id} status=${job.status} '
          'posters=${job.posters.map((p) => '${p.status}:${p.imageUrl.isEmpty ? "no-url" : "url"}')}');
      if (!mounted) break;
      final settled = job.status == PosterJobStatus.done ||
          job.status == PosterJobStatus.partial ||
          job.status == PosterJobStatus.failed;
      if (settled) break;
    }
    return job;
  }

  /// Generate the recipe STEP image (result step, no template).
  Future<Poster?> _ensureStepImage() => _ensureImage(
        kind: 'step',
        templateIds: null,
        existing: _stepJob,
        lastCreate: _lastStepCreate,
        posterOf: () => _stepPoster,
        applyJob: (j) => _stepJob = j,
        stamp: (t) => _lastStepCreate = t,
        busy: (b) => _stepBusy = b,
      );

  /// Generate the SHARE image (check-in step, using the selected template).
  Future<Poster?> _ensureShareImage() => _ensureImage(
        kind: 'share',
        templateIds:
            _selectedTemplate == null ? null : [_selectedTemplate!.id],
        existing: _shareJob,
        lastCreate: _lastShareCreate,
        posterOf: () => _sharePoster,
        applyJob: (j) => _shareJob = j,
        stamp: (t) => _lastShareCreate = t,
        busy: (b) => _shareBusy = b,
      );

  /// Shared createJob-or-reuse + poll. The write-back callbacks target the
  /// kind-specific fields (Dart has no ref params).
  Future<Poster?> _ensureImage({
    required String kind,
    required List<String>? templateIds,
    required PosterJob? existing,
    required DateTime? lastCreate,
    required Poster? Function() posterOf,
    required void Function(PosterJob) applyJob,
    required void Function(DateTime) stamp,
    required void Function(bool) busy,
  }) async {
    if (posterOf() != null) return posterOf();
    final recipe = _recipe;
    if (recipe == null) return null;
    setState(() => busy(true));
    final repos = context.read<Repositories>();
    try {
      PosterJob job;
      final now = DateTime.now();
      final recent = existing != null &&
          lastCreate != null &&
          now.difference(lastCreate) < _cooldown;
      if (recent) {
        job = existing;
        debugPrint('[$kind] reuse job=${job.id} (within ${_cooldown.inMinutes}min '
            'cooldown, ${now.difference(lastCreate).inSeconds}s elapsed)');
      } else {
        debugPrint('[$kind] createJob recipe=${recipe.id} locale=${_localeString()} '
            'templates=$templateIds');
        job = await repos.posters.createJob(recipe.id, _localeString(),
            templateIds: templateIds);
        stamp(now);
        debugPrint('[$kind] job created id=${job.id} status=${job.status}');
      }
      if (!mounted) return null;
      setState(() => applyJob(job));
      job = await _pollUntilSettled(job, kind);
      if (!mounted) return null;
      setState(() => applyJob(job));
      debugPrint('[$kind] settled status=${job.status} hasPoster=${posterOf() != null}');
      return posterOf();
    } on ApiException catch (e) {
      debugPrint('[$kind] api error: $e');
      if (mounted) _snack(e.message);
      return null;
    } finally {
      if (mounted) setState(() => busy(false));
    }
  }

  /// Image failed to load (or is stale) — re-poll the current job for a fresh
  /// URL rather than giving up on a broken-image icon.
  Future<void> _reloadStepImage() => _reloadImage(
        kind: 'step',
        job: _stepJob,
        applyJob: (j) => _stepJob = j,
        busy: (b) => _stepBusy = b,
        ensure: _ensureStepImage,
      );

  Future<void> _reloadShareImage() => _reloadImage(
        kind: 'share',
        job: _shareJob,
        applyJob: (j) => _shareJob = j,
        busy: (b) => _shareBusy = b,
        ensure: _ensureShareImage,
      );

  Future<void> _reloadImage({
    required String kind,
    required PosterJob? job,
    required void Function(PosterJob) applyJob,
    required void Function(bool) busy,
    required Future<Poster?> Function() ensure,
  }) async {
    if (job == null || _recipe == null) {
      await ensure();
      return;
    }
    setState(() => busy(true));
    final repos = context.read<Repositories>();
    try {
      final updated = await repos.posters.job(job.id);
      debugPrint('[$kind] reload job=${updated.id} status=${updated.status} '
          'posters=${updated.posters.map((p) => '${p.status}:${p.imageUrl.isEmpty ? "no-url" : "url"}')}');
      if (mounted) setState(() => applyJob(updated));
    } on ApiException catch (e) {
      debugPrint('[$kind] reload error: $e');
      if (mounted) _snack(e.message);
    } finally {
      if (mounted) setState(() => busy(false));
    }
  }

  void _share() {
    final t = AppLocalizations.of(context);
    if (_sharePoster == null) return;
    // ponytail: production wires share_plus here; SnackBar keeps it observable.
    _snack('${t.commonActionShare}: ${_recipe?.name ?? ''}');
  }

  /// Save the generated recipe image to the gallery (top-right Save button).
  /// Save the recipe STEP image to the gallery (result step, top-right Save).
  Future<void> _saveStepImage() => _savePoster(_stepPoster);

  /// Save the SHARE image to the gallery (check-in step, top-right Save).
  Future<void> _saveShareImage() => _savePoster(_sharePoster);

  Future<void> _savePoster(Poster? p) async {
    final url = p?.imageUrl;
    if (url == null || url.isEmpty) return;
    final t = AppLocalizations.of(context);
    final ok = await context.read<ImageSaveService>().saveNetworkImage(url);
    if (mounted) _snack(ok ? t.posterSaved : t.commonError);
  }

  /// Prompt for a new ingredient name and add it to the (public) library.
  /// The new item is auto-selected and the fridge list refreshes.
  Future<void> _addIngredient(IngredientCategory category) async {
    final t = AppLocalizations.of(context);
    final controller = TextEditingController();
    final name = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(t.craftAddIngredient),
        content: TextField(
          controller: controller,
          autofocus: true,
          textCapitalization: TextCapitalization.words,
          decoration: InputDecoration(hintText: t.craftAddIngredientHint),
          onSubmitted: (v) => Navigator.of(ctx).pop(v.trim()),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: Text(t.commonActionCancel),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(controller.text.trim()),
            child: Text(t.commonActionConfirm),
          ),
        ],
      ),
    );
    controller.dispose();
    if (name == null || name.isEmpty || !mounted) return;
    final repos = context.read<Repositories>();
    try {
      final created =
          await repos.ingredients.add(category, name, _localeString());
      if (!mounted) return;
      _selection.select(created.id);
      setState(() {
        _ingredients = repos.ingredients.list(_localeString());
        _ingredients.then((list) {
          if (mounted) setState(() => _allIngredients = list);
        });
      });
    } on ApiException catch (e) {
      if (mounted) _snack(e.message);
    }
  }

  Future<void> _pickPhotos() async {
    try {
      final files = await _picker.pickMultiImage(imageQuality: 80);
      if (files.isEmpty) return;
      final combined = [..._photos, ...files.map((f) => f.path)];
      setState(() => _photos = combined.take(3).toList());
    } catch (_) {
      // Gallery unavailable — ignore.
    }
  }

  Future<void> _saveCheckIn() async {
    final t = AppLocalizations.of(context);
    final recipe = _recipe;
    if (recipe == null) return;
    if (_photos.isEmpty && _sharePoster == null) {
      _snack(t.posterTimeout);
      return;
    }
    setState(() => _saving = true);
    final repos = context.read<Repositories>();
    try {
      await repos.lab.create(
        recipe.id,
        _sharePoster?.imageUrl ?? '',
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
      appBar: AppBar(
        title: Text(_title(t)),
        actions: switch (_step) {
          _Step.scan => [
              TextButton(
                key: const Key('btn_manual_select'),
                onPressed: _gotoSelect,
                child: Text(t.craftManualSelect),
              ),
              const SizedBox(width: 4),
            ],
          // Result page: save the recipe STEP image; Check-in: save the SHARE
          // image. Each shows only once its image has loaded.
          _Step.result => _stepPoster == null
              ? null
              : [
                  IconButton(
                    key: const Key('btn_save_step'),
                    tooltip: t.posterSaveToGallery,
                    icon: const Icon(Icons.download_outlined),
                    onPressed: _saveStepImage,
                  ),
                  const SizedBox(width: 4),
                ],
          _Step.checkin => _sharePoster == null
              ? null
              : [
                  IconButton(
                    key: const Key('btn_save_share'),
                    tooltip: t.posterSaveToGallery,
                    icon: const Icon(Icons.download_outlined),
                    onPressed: _saveShareImage,
                  ),
                  const SizedBox(width: 4),
                ],
          _Step.select => null,
        },
      ),
      body: switch (_step) {
        _Step.scan => _buildScan(t),
        _Step.select => _buildSelect(t),
        _Step.result => _buildResult(t),
        _Step.checkin => _buildCheckin(t),
      },
    );
  }

  String _title(AppLocalizations t) => switch (_step) {
        _Step.scan => t.craftScannerTitle,
        _Step.select => t.craftMake,
        _Step.result => t.recipeResultTitle,
        _Step.checkin => t.labCheckIn,
      };

  // ---- ⓪ scan ----
  Widget _buildScan(AppLocalizations t) {
    final detected = _scanPhase == _ScanPhase.detected;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
      children: [
        _Viewfinder(
          phase: _scanPhase,
          imagePath: _scanImagePath,
          detections: _detections,
          scan: _scanCtl,
          hint: t.craftScanHint,
          onTap: _scanPhase == _ScanPhase.empty ? _startScan : null,
        ),
        const SizedBox(height: 16),
        if (_scanPhase == _ScanPhase.empty)
          FilledButton.icon(
            key: const Key('btn_start_scan'),
            onPressed: _startScan,
            icon: const Icon(Icons.document_scanner_outlined),
            label: Text(t.craftScanCta),
          ),
        if (_scanPhase == _ScanPhase.scanning)
          Center(child: Text(t.craftScanning,
              style: Theme.of(context).textTheme.bodyMedium)),
        if (detected) ...[
          Text(
            t.craftScanDetected(_detections.length),
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(color: AppTheme.neonCyan),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  key: const Key('btn_save_inventory'),
                  onPressed: _savingInventory ? null : _saveInventory,
                  icon: _savingInventory
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(strokeWidth: 2))
                      : const Icon(Icons.save_outlined),
                  label: Text(t.craftSaveInventory),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  key: const Key('btn_rescan'),
                  onPressed: _rescan,
                  icon: const Icon(Icons.refresh),
                  label: Text(t.craftRescan),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              key: const Key('btn_scan_continue'),
              onPressed: _gotoSelect,
              icon: const Icon(Icons.arrow_forward),
              label: Text(t.craftScanContinue),
            ),
          ),
        ],
        const SizedBox(height: 24),
        _RecentScans(future: _recent, onTap: _restoreScan),
      ],
    );
  }

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
                  _SectionHeader(t.craftDiyTitle),
                  const SizedBox(height: 4),
                  Text(t.fridgeSubtitle,
                      style: Theme.of(context).textTheme.bodyLarge),
                  const SizedBox(height: 12),
                  for (final entry in grouped.entries)
                    _CategorySection(
                      category: entry.key,
                      ingredients: entry.value,
                      selection: _selection,
                      onChanged: () => setState(() {}),
                      onAdd: () => _addIngredient(entry.key),
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

  // ---- ② result: AI-generated recipe step image only (no text) ----
  Widget _buildResult(AppLocalizations t) {
    final poster = _stepPoster;
    return Column(
      children: [
        Expanded(
          child: Builder(
            builder: (context) {
              if (poster != null) {
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Center(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: CachedNetworkImage(
                        imageUrl: poster.imageUrl,
                        fit: BoxFit.contain,
                        // Cap the decoded resolution to prevent OOM on large
                        // share images (cacheWidth/cacheHeight = memCache*).
                        memCacheWidth: 1200,
                        memCacheHeight: 1600,
                        placeholder: (_, _) => const Center(
                          child: CircularProgressIndicator(),
                        ),
                        errorWidget: (context, _, _) => InkWell(
                          onTap: _reloadStepImage,
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.refresh, size: 48),
                              const SizedBox(height: 8),
                              Text(AppLocalizations.of(context)
                                  .commonActionRetry),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                );
              }
              if (_stepBusy) {
                // GPT step-image generation takes time → shimmer placeholder.
                return Padding(
                  padding: const EdgeInsets.all(16),
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const _ShimmerCard(),
                        const SizedBox(height: 16),
                        Text(t.posterGenerating),
                      ],
                    ),
                  ),
                );
              }
              // Generation failed / timed out — offer a retry.
              return Center(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.cloud_off, size: 48),
                    const SizedBox(height: 12),
                    Text(t.posterTimeout),
                    const SizedBox(height: 12),
                    FilledButton.icon(
                      onPressed: _ensureStepImage,
                      icon: const Icon(Icons.refresh),
                      label: Text(t.commonActionRetry),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
            child: SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                key: const Key('btn_to_checkin'),
                onPressed: poster == null
                    ? null
                    : () => setState(() => _step = _Step.checkin),
                icon: const Icon(Icons.check_circle_outline),
                label: Text(t.labCheckIn),
              ),
            ),
          ),
        ),
      ],
    );
  }

  // ---- ③ checkin ----
  Widget _buildCheckin(AppLocalizations t) {
    final poster = _sharePoster;
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 88),
      children: [
        // Pick a share template, then generate the share image with it.
        _SectionHeader(t.craftShareTemplate),
        const SizedBox(height: 8),
        SizedBox(
          height: 48,
          child: FutureBuilder<List<StyleTemplate>>(
            future: _templates,
            builder: (context, snap) {
              final list = snap.data ?? const <StyleTemplate>[];
              return ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final tpl = list[i];
                  final selected = _selectedTemplate?.id == tpl.id;
                  return ChoiceChip(
                    key: Key('tpl_${tpl.id}'),
                    label: Text(tpl.name),
                    selected: selected,
                    onSelected: (_) =>
                        setState(() => _selectedTemplate = tpl),
                  );
                },
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        if (_shareBusy)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 48),
            child: Center(child: CircularProgressIndicator()),
          )
        else if (poster != null)
          ClipRRect(
            borderRadius: BorderRadius.circular(12),
            child: Stack(
              children: [
                CachedNetworkImage(
                  imageUrl: poster.imageUrl,
                  fit: BoxFit.cover,
                  memCacheWidth: 1000,
                  memCacheHeight: 1000,
                  placeholder: (_, _) => const SizedBox(height: 200),
                  errorWidget: (_, _, _) => InkWell(
                    onTap: _reloadShareImage,
                    child: const SizedBox(
                        height: 200,
                        child: Center(child: Icon(Icons.refresh, size: 40))),
                  ),
                ),
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(14, 24, 14, 12),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Colors.transparent, Colors.black87],
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _recipe?.name ?? '',
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(color: Colors.white),
                        ),
                        Text(
                          t.craftAiGenerated,
                          style: Theme.of(context)
                              .textTheme
                              .labelSmall
                              ?.copyWith(
                                  color: AppTheme.neonCyan, letterSpacing: 2),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          )
        else
          FilledButton.icon(
            key: const Key('btn_generate_share'),
            onPressed:
                _selectedTemplate == null ? null : _ensureShareImage,
            icon: const Icon(Icons.auto_awesome),
            label: Text(t.craftGeneratePoster),
          ),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                key: const Key('btn_add_photos'),
                onPressed: _pickPhotos,
                icon: const Icon(Icons.add_a_photo),
                label: Text(t.craftAddPhotos),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _shareBusy ? null : _share,
                icon: _shareBusy
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.share),
                label: Text(t.commonActionShare),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(t.craftPhotosOptional,
            style: Theme.of(context).textTheme.bodySmall),
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
                    child: Image.file(File(_photos[i]),
                        width: 72,
                        height: 72,
                        fit: BoxFit.cover,
                        errorBuilder: (_, _, _) => const SizedBox(
                            width: 72, height: 72)),
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
        const SizedBox(height: 24),
        FilledButton.icon(
          key: const Key('btn_save_checkin'),
          onPressed: _saving ? null : _saveCheckIn,
          icon: _saving
              ? const SizedBox(
                  height: 18,
                  width: 18,
                  child: CircularProgressIndicator(strokeWidth: 2))
              : const Icon(Icons.check),
          label: Text(t.labCheckIn),
        ),
      ],
    );
  }
}

/// One simulated/restored ingredient recognition with a confidence score.
class _Detection {
  const _Detection(this.ingredient, this.confidence);
  final Ingredient ingredient;
  final int confidence;
}

/// Process-wide ingredient cache keyed by locale. Survives CraftScreen
/// recreation (each navigation pushes a fresh screen) so re-entry reads the
/// list instantly and refreshes silently in the background.
class _IngredientCache {
  static List<Ingredient>? _list;
  static String? _locale;

  static List<Ingredient>? get(String locale) =>
      _locale == locale ? _list : null;

  static void set(String locale, List<Ingredient> list) {
    _locale = locale;
    _list = list;
  }
}

/// A shimmering placeholder that fills the step-image area while GPT
/// generation is in flight. Self-contained (own ticker), no extra dependency.
class _ShimmerCard extends StatefulWidget {
  const _ShimmerCard();

  @override
  State<_ShimmerCard> createState() => _ShimmerCardState();
}

class _ShimmerCardState extends State<_ShimmerCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctl;

  @override
  void initState() {
    super.initState();
    _ctl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
  }

  @override
  void dispose() {
    _ctl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final base = Theme.of(context).colorScheme.surfaceContainerHighest;
    final hi = base.withValues(alpha: 0.45);
    return AspectRatio(
      aspectRatio: 3 / 4,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: AnimatedBuilder(
          animation: _ctl,
          builder: (context, _) {
            // Sweep a bright band left → right across the placeholder.
            final t = _ctl.value;
            return ShaderMask(
              blendMode: BlendMode.srcATop,
              shaderCallback: (rect) {
                return LinearGradient(
                  begin: Alignment(-1 + 2 * t, 0),
                  end: Alignment(-0.4 + 2 * t, 0),
                  colors: [base, hi, base],
                  stops: const [0, 0.5, 1],
                ).createShader(rect);
              },
              child: ColoredBox(
                color: base,
                child: const SizedBox.expand(),
              ),
            );
          },
        ),
      ),
    );
  }
}

/// The scanner viewfinder: neon-framed area that shows a scan line while
/// scanning and overlays detection chips once recognition completes.
class _Viewfinder extends StatelessWidget {
  const _Viewfinder({
    required this.phase,
    required this.imagePath,
    required this.detections,
    required this.scan,
    required this.hint,
    this.onTap,
  });

  final _ScanPhase phase;
  final String? imagePath;
  final List<_Detection> detections;
  final Animation<double> scan;
  final String hint;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AspectRatio(
        aspectRatio: 4 / 3,
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: Stack(
            fit: StackFit.expand,
            children: [
              _background(),
              if (phase == _ScanPhase.empty) _emptyOverlay(context),
              if (phase == _ScanPhase.scanning) _scanLine(),
              if (phase == _ScanPhase.detected) _detectionsOverlay(context),
              _corners(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _background() {
    final path = imagePath;
    if (path != null) {
      return Image.file(
        File(path),
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => const ColoredBox(color: Color(0xFF12131A)),
      );
    }
    return const DecoratedBox(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF12131A), Color(0xFF1E1F26)],
        ),
      ),
    );
  }

  Widget _emptyOverlay(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.kitchen_outlined, size: 48, color: AppTheme.neonCyan),
          const SizedBox(height: 12),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              hint,
              textAlign: TextAlign.center,
              style: Theme.of(context)
                  .textTheme
                  .bodyMedium
                  ?.copyWith(color: AppTheme.textDim),
            ),
          ),
        ],
      ),
    );
  }

  Widget _scanLine() {
    return AnimatedBuilder(
      animation: scan,
      builder: (context, _) => LayoutBuilder(
        builder: (context, c) {
          final top = c.maxHeight * (0.05 + scan.value * 0.9);
          return Stack(
            children: [
              Positioned(
                left: 8,
                right: 8,
                top: top,
                child: Container(
                  height: 2,
                  decoration: BoxDecoration(
                    color: AppTheme.neonCyan,
                    boxShadow: [
                      BoxShadow(
                        color: AppTheme.neonCyan.withValues(alpha: 0.8),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _detectionsOverlay(BuildContext context) {
    return Align(
      alignment: Alignment.bottomLeft,
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Wrap(
          spacing: 6,
          runSpacing: 6,
          children: detections
              .map((d) => Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppTheme.neonCyan,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      '${d.ingredient.name} ${d.confidence}%',
                      style: const TextStyle(
                        color: Color(0xFF00363E),
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ))
              .toList(),
        ),
      ),
    );
  }

  Widget _corners() {
    return const IgnorePointer(
      child: Padding(
        padding: EdgeInsets.all(10),
        child: Stack(
          children: [
            Align(alignment: Alignment.topLeft, child: _Corner(top: true, left: true)),
            Align(alignment: Alignment.topRight, child: _Corner(top: true, left: false)),
            Align(alignment: Alignment.bottomLeft, child: _Corner(top: false, left: true)),
            Align(alignment: Alignment.bottomRight, child: _Corner(top: false, left: false)),
          ],
        ),
      ),
    );
  }
}

class _Corner extends StatelessWidget {
  const _Corner({required this.top, required this.left});
  final bool top;
  final bool left;

  @override
  Widget build(BuildContext context) {
    const side = BorderSide(color: AppTheme.neonCyan, width: 3);
    return SizedBox(
      width: 22,
      height: 22,
      child: DecoratedBox(
        decoration: BoxDecoration(
          border: Border(
            top: top ? side : BorderSide.none,
            bottom: top ? BorderSide.none : side,
            left: left ? side : BorderSide.none,
            right: left ? BorderSide.none : side,
          ),
        ),
      ),
    );
  }
}

/// Horizontal strip of the user's recent saved scans. Renders nothing when
/// there is no history.
class _RecentScans extends StatelessWidget {
  const _RecentScans({required this.future, required this.onTap});
  final Future<List<ScanInventory>> future;
  final void Function(ScanInventory) onTap;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return FutureBuilder<List<ScanInventory>>(
      future: future,
      builder: (context, snapshot) {
        final list = snapshot.data ?? const <ScanInventory>[];
        if (list.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _SectionHeader(t.craftRecentScans),
            const SizedBox(height: 8),
            SizedBox(
              height: 110,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (context, i) {
                  final inv = list[i];
                  return InkWell(
                    key: Key('recent_${inv.id}'),
                    onTap: () => onTap(inv),
                    borderRadius: BorderRadius.circular(12),
                    child: Container(
                      width: 150,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppTheme.neonCyan.withValues(alpha: 0.3)),
                        color: const Color(0xFF1E1F26),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Icon(Icons.history, size: 18, color: AppTheme.neonCyan),
                          const Spacer(),
                          Text(
                            inv.summary,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: Theme.of(context).textTheme.bodyMedium,
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
          ],
        );
      },
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        children: [
          Container(width: 4, height: 18, color: AppTheme.neonCyan),
          const SizedBox(width: 10),
          Text(
            text.toUpperCase(),
            style: Theme.of(context)
                .textTheme
                .titleMedium
                ?.copyWith(letterSpacing: 2),
          ),
        ],
      ),
    );
  }
}

class _CategorySection extends StatelessWidget {
  const _CategorySection({
    required this.category,
    required this.ingredients,
    required this.selection,
    required this.onChanged,
    required this.onAdd,
  });

  final IngredientCategory category;
  final List<Ingredient> ingredients;
  final FridgeSelection selection;
  final VoidCallback onChanged;
  final VoidCallback onAdd;

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
          children: [
            ...ingredients.map((ing) {
              final selected = selection.isSelected(ing.id);
              return FilterChip(
                avatar: _IngredientAvatar(ing: ing),
                label: Text(ing.name),
                selected: selected,
                onSelected: (_) {
                  selection.toggle(ing.id);
                  onChanged();
                },
              );
            }),
            // Community contribution: add a missing ingredient to this category.
            ActionChip(
              avatar: const Icon(Icons.add, size: 18),
              label: Text(t.craftAddIngredient),
              onPressed: onAdd,
            ),
          ],
        ),
        const SizedBox(height: 12),
      ],
    );
  }
}

/// Small flat-illustration thumbnail for an ingredient chip; falls back to a
/// category glyph until the backend finishes generating the artwork.
class _IngredientAvatar extends StatelessWidget {
  const _IngredientAvatar({required this.ing});
  final Ingredient ing;

  @override
  Widget build(BuildContext context) {
    final url = ing.imageUrl;
    if (url == null || url.isEmpty) {
      return const Icon(Icons.local_bar, size: 18);
    }
    return ClipOval(
      child: Image.network(
        url,
        width: 24,
        height: 24,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => const Icon(Icons.local_bar, size: 18),
      ),
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
