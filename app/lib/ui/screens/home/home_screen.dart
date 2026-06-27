import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/locale_controller.dart';
import '../../backend_image.dart';
import '../../theme/app_theme.dart';
import '../craft/craft_screen.dart';
import '../detail/detail_screen.dart';
import '../detail/recipe_detail_screen.dart';
import '../featured/featured_screen.dart';
import '../profile/profile_screen.dart';

/// Single-page home: featured system presets (tap to craft) plus the user's
/// own creations gallery, a "craft" entry point and a profile button.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late Future<List<LabEntry>> _future;
  late Future<List<Recipe>> _featured;

  /// Whether the creations gallery is empty — drives the FAB vs in-place
  /// Craft button swap (FAB only when there's data to scroll past).
  bool _isEmpty = true;

  /// Last fetched featured presets — shown immediately on reload (cache-first),
  /// then refreshed in the background. Null until the first backend read lands.
  List<Recipe>? _featuredCache;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _reload();
  }

  String _localeString() =>
      LocaleController.toContentLocale(Localizations.localeOf(context));

  void _reload() {
    final repos = context.read<Repositories>();
    final entries = repos.lab.entries();
    entries.then((list) {
      if (mounted) setState(() => _isEmpty = list.isEmpty);
    });
    _future = entries;
    // Cache-first: serve the last results instantly while we refetch.
    final cache = _featuredCache;
    _featured = cache != null
        ? Future.value(cache)
        : repos.recipes.examples(_localeString());
    // ponytail: background refresh swaps in the latest; no spinner churn.
    repos.recipes.examples(_localeString()).then((list) {
      if (mounted) {
        setState(() {
          _featuredCache = list;
          _featured = Future.value(list);
        });
      }
    });
  }

  /// Open the craft flow from scratch (scan-first).
  Future<void> _craft() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const CraftScreen()),
    );
    if (created == true && mounted) setState(_reload);
  }

  /// Tap a featured preset → open its detail page (cover + ingredients +
  /// steps); crafting is launched from there.
  Future<void> _openFeatured(Recipe recipe) async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => RecipeDetailScreen(recipe: recipe)),
    );
    if (created == true && mounted) setState(_reload);
  }

  /// "View all" → the full featured grid (2-per-row) page.
  Future<void> _openFeaturedGrid() async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => const FeaturedScreen()),
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
      // FAB only when there's data to scroll past; the empty state carries its
      // own Craft button instead.
      floatingActionButton: _isEmpty
          ? null
          : FloatingActionButton.extended(
              key: const Key('btn_craft'),
              onPressed: _craft,
              icon: const Icon(Icons.add),
              label: Text(t.craftMake),
            ),
      body: _body(context, t),
    );
  }

  Widget _body(BuildContext context, AppLocalizations t) {
    return RefreshIndicator(
      onRefresh: () async => setState(_reload),
      child: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          _Hero(onTap: _craft),
          const SizedBox(height: 20),
          _FeaturedPosters(
            future: _featured,
            onTap: _openFeatured,
            onViewAll: _openFeaturedGrid,
          ),
          _SectionHeader(t.homeTitle),
          const SizedBox(height: 12),
          _gallery(context, t),
        ],
      ),
    );
  }

  Widget _gallery(BuildContext context, AppLocalizations t) {
    return FutureBuilder<List<LabEntry>>(
      future: _future,
      builder: (context, snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const Padding(
            padding: EdgeInsets.symmetric(vertical: 48),
            child: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.hasError) {
          return Center(child: Text(t.commonError));
        }
        final entries = snapshot.data ?? [];
        if (entries.isEmpty) {
          return _EmptyState(t.homeEmpty, onCraft: _craft);
        }
        return GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 0.82,
          children: entries
              .map((e) => _CreationCard(entry: e, dateLabel: _formatDate(e.createdAt)))
              .toList(),
        );
      },
    );
  }

  // ponytail: naive ISO date; switch to intl DateFormat if localized dates are needed.
  String _formatDate(DateTime d) =>
      '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
}

/// Top-of-page hero banner: a dark, neon cocktail photo with a call-to-action
/// gradient. Tapping it opens the craft flow.
class _Hero extends StatelessWidget {
  const _Hero({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: AspectRatio(
          aspectRatio: 16 / 9,
          child: Stack(
            fit: StackFit.expand,
            children: [
              Image.asset(
                'assets/hero_cocktail.png',
                fit: BoxFit.cover,
                errorBuilder: (_, _, _) => ColoredBox(
                  color: Theme.of(context).colorScheme.surfaceContainerHighest,
                  child: const Center(child: Icon(Icons.local_bar, size: 48)),
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.fromLTRB(16, 28, 16, 14),
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.transparent, Colors.black87],
                    ),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          t.homeHeroCta,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: Theme.of(context)
                              .textTheme
                              .titleMedium
                              ?.copyWith(color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Horizontal carousel of system preset cocktails. Tapping a card opens the
/// craft flow directly on that recipe. Renders nothing when empty.
class _FeaturedPosters extends StatelessWidget {
  const _FeaturedPosters({
    required this.future,
    required this.onTap,
    required this.onViewAll,
  });
  final Future<List<Recipe>> future;
  final void Function(Recipe) onTap;
  final VoidCallback onViewAll;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return FutureBuilder<List<Recipe>>(
      future: future,
      builder: (context, snapshot) {
        final list = snapshot.data ?? const <Recipe>[];
        if (list.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(child: _SectionHeader(t.homeFeatured)),
                TextButton(
                  key: const Key('btn_featured_all'),
                  onPressed: onViewAll,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(t.featuredViewAll),
                      const Icon(Icons.chevron_right, size: 18),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            SizedBox(
              height: 150,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (context, i) =>
                    _FeaturedCard(recipe: list[i], onTap: () => onTap(list[i])),
              ),
            ),
            const SizedBox(height: 20),
          ],
        );
      },
    );
  }
}

class _FeaturedCard extends StatelessWidget {
  const _FeaturedCard({required this.recipe, required this.onTap});
  final Recipe recipe;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          key: Key('featured_${recipe.id}'),
          onTap: onTap,
          child: Stack(
            fit: StackFit.expand,
            children: [
              BackendImage(url: recipe.imageUrl),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Container(
                  padding: const EdgeInsets.all(10),
                  color: Colors.black54,
                  child: Text(
                    recipe.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// A creation tile: the final merged image, with the date and an optional
/// title overlaid. No body text per the gallery design.
class _CreationCard extends StatelessWidget {
  const _CreationCard({required this.entry, required this.dateLabel});
  final LabEntry entry;
  final String dateLabel;

  @override
  Widget build(BuildContext context) {
    final hasTitle = entry.note.trim().isNotEmpty;
    return GestureDetector(
      key: Key('entry_${entry.id}'),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute(builder: (_) => DetailScreen(entry: entry)),
      ),
      child: Card(
        clipBehavior: Clip.antiAlias,
        child: Stack(
          fit: StackFit.expand,
          children: [
            _image(),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(10, 18, 10, 8),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black87],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (hasTitle)
                    Text(
                      entry.note.trim(),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: Theme.of(context)
                          .textTheme
                          .titleSmall
                          ?.copyWith(color: Colors.white),
                    ),
                  Text(
                    dateLabel,
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color: AppTheme.neonCyan,
                          letterSpacing: 1,
                        ),
                  ),
                ],
              ),
            ),
          ),
          ],
        ), // Stack
      ), // Card
    ); // GestureDetector
  }

  Widget _image() {
    // Still generating on the backend — show a live placeholder.
    if (entry.isGenerating) {
      return const ColoredBox(
        color: AppTheme.surface2,
        child: Center(child: CircularProgressIndicator()),
      );
    }
    // Prefer the AI-composited poster (the "merged image"); fall back to any
    // user-uploaded photo.
    final url = entry.posterImageUrl.isNotEmpty
        ? entry.posterImageUrl
        : entry.imageUrl;
    if (url.startsWith('http')) {
      return Image.network(
        url,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => const _ImageFallback(),
      );
    }
    if (url.isNotEmpty) {
      return Image.file(
        File(url),
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => const _ImageFallback(),
      );
    }
    return const _ImageFallback();
  }
}

class _ImageFallback extends StatelessWidget {
  const _ImageFallback();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: const Center(child: Icon(Icons.local_bar, size: 32)),
    );
  }
}

/// Uppercase section title with a leading neon bar (per the Stitch design).
class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
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
    );
  }
}

class _EmptyState extends StatelessWidget {
  const _EmptyState(this.message, {this.onCraft});
  final String message;
  final VoidCallback? onCraft;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 72),
      child: Column(
        children: [
          Icon(Icons.liquor, size: 64, color: AppTheme.textDim),
          const SizedBox(height: 16),
          Text(
            message,
            textAlign: TextAlign.center,
            style: Theme.of(context)
                .textTheme
                .bodyMedium
                ?.copyWith(color: AppTheme.textDim),
          ),
          if (onCraft != null) ...[
            const SizedBox(height: 24),
            FilledButton.icon(
              key: const Key('btn_craft_empty'),
              onPressed: onCraft,
              icon: const Icon(Icons.auto_awesome),
              label: Text(t.craftMake),
            ),
          ],
        ],
      ),
    );
  }
}
