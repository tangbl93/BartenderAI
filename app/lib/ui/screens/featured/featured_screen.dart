import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/locale_controller.dart';
import '../../theme/app_theme.dart';
import '../detail/recipe_detail_screen.dart';

/// Secondary page: all featured system presets in a 2-per-row grid. Tapping a
/// card opens the recipe detail page.
class FeaturedScreen extends StatefulWidget {
  const FeaturedScreen({super.key});

  @override
  State<FeaturedScreen> createState() => _FeaturedScreenState();
}

class _FeaturedScreenState extends State<FeaturedScreen> {
  late Future<List<Recipe>> _future;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final repos = context.read<Repositories>();
    final locale = LocaleController.toContentLocale(
        Localizations.localeOf(context));
    _future = repos.recipes.examples(locale);
  }

  void _open(Recipe recipe) {
    Navigator.of(context).push<bool>(
      MaterialPageRoute(builder: (_) => RecipeDetailScreen(recipe: recipe)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.homeFeatured)),
      body: FutureBuilder<List<Recipe>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) return Center(child: Text(t.commonError));
          final list = snapshot.data ?? const <Recipe>[];
          if (list.isEmpty) {
            return Center(
              child: Text(t.homeEmpty,
                  style: Theme.of(context)
                      .textTheme
                      .bodyMedium
                      ?.copyWith(color: AppTheme.textDim)),
            );
          }
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.72,
            ),
            itemBuilder: (context, i) => _FeaturedTile(
              recipe: list[i],
              onTap: () => _open(list[i]),
            ),
          );
        },
      ),
    );
  }
}

class _FeaturedTile extends StatelessWidget {
  const _FeaturedTile({required this.recipe, required this.onTap});
  final Recipe recipe;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final hasCover = recipe.imageUrl != null && recipe.imageUrl!.isNotEmpty;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        key: Key('featured_${recipe.id}'),
        onTap: onTap,
        child: Stack(
          fit: StackFit.expand,
          children: [
            if (hasCover)
              CachedNetworkImage(
                imageUrl: recipe.imageUrl!,
                fit: BoxFit.cover,
                placeholder: (_, _) => const ColoredBox(
                    color: Color(0xFF1E1F26),
                    child: Center(child: CircularProgressIndicator())),
                errorWidget: (_, _, _) => const _TileFallback(),
              )
            else
              const _TileFallback(),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(10),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [Colors.transparent, Colors.black87],
                  ),
                ),
                child: Text(
                  recipe.name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context)
                      .textTheme
                      .titleSmall
                      ?.copyWith(color: Colors.white),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TileFallback extends StatelessWidget {
  const _TileFallback();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: const Center(child: Icon(Icons.local_bar, size: 36)),
    );
  }
}
