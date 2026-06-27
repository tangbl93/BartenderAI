import 'package:flutter/material.dart';

import '../../../data/models/models.dart';
import '../../../l10n/app_localizations.dart';
import '../../backend_image.dart';
import '../../theme/app_theme.dart';
import '../craft/craft_screen.dart';

/// Secondary page for a featured system preset: shows the cover image, tagline,
/// ingredients and steps, then offers a "Craft" entry into the make flow.
class RecipeDetailScreen extends StatelessWidget {
  const RecipeDetailScreen({super.key, required this.recipe});

  final Recipe recipe;

  Future<void> _checkIn(BuildContext context) async {
    final created = await Navigator.of(context).push<bool>(
      MaterialPageRoute(
        builder: (_) =>
            CraftScreen(presetRecipe: recipe, directCheckIn: true),
      ),
    );
    if (created == true && context.mounted) Navigator.of(context).pop(true);
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            title: Text(recipe.name),
            flexibleSpace: FlexibleSpaceBar(
              background: BackendImage(url: recipe.imageUrl),
            ),
          ),
          SliverList(
            delegate: SliverChildListDelegate([
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (recipe.tagline.isNotEmpty)
                      Text(
                        recipe.tagline,
                        style: Theme.of(context).textTheme.titleMedium,
                      ),
                    if (recipe.alcoholRange.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        t.recipeAlcoholRange(recipe.alcoholRange),
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                              color: AppTheme.neonCyan,
                            ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    _SectionHeader(t.recipeIngredients),
                    ...recipe.items.map((i) => _IngredientRow(item: i)),
                    if (recipe.featuredImageUrl != null &&
                        recipe.featuredImageUrl!.isNotEmpty) ...[
                      const SizedBox(height: 16),
                      _SectionHeader(t.recipeSteps),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: BackendImage(
                          url: recipe.featuredImageUrl,
                          fit: BoxFit.contain,
                          // Cap decoded resolution (步骤图 can be tall).
                          memCacheWidth: 1200,
                          memCacheHeight: 1800,
                          fallback: const _CoverFallback(),
                        ),
                      ),
                    ],
                    const SizedBox(height: 20),
                    // ponytail: no text steps — just a subtle gray safety
                    // reminder at the very bottom (localized).
                    Center(
                      child: Text(
                        t.recipeResultAlcoholHint,
                        textAlign: TextAlign.center,
                        style: Theme.of(context)
                            .textTheme
                            .bodySmall
                            ?.copyWith(color: AppTheme.textDim),
                      ),
                    ),
                    const SizedBox(height: 96),
                  ],
                ),
              ),
            ]),
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              key: const Key('btn_checkin_recipe'),
              onPressed: () => _checkIn(context),
              icon: const Icon(Icons.check_circle_outline),
              label: Text(t.labCheckIn),
            ),
          ),
        ),
      ),
    );
  }
}

class _CoverFallback extends StatelessWidget {
  const _CoverFallback();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: const Center(child: Icon(Icons.local_bar, size: 48)),
    );
  }
}class _SectionHeader extends StatelessWidget {
  const _SectionHeader(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text.toUpperCase(),
        style: Theme.of(context)
            .textTheme
            .titleSmall
            ?.copyWith(letterSpacing: 1.5, color: AppTheme.neonCyan),
      ),
    );
  }
}

class _IngredientRow extends StatelessWidget {
  const _IngredientRow({required this.item});
  final RecipeItem item;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Padding(
      padding: const EdgeInsets.only(top: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text.rich(
              TextSpan(
                children: [
                  TextSpan(text: item.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  if (item.amount.isNotEmpty)
                    TextSpan(
                      text: '  —  ${item.amount}',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  if (item.optional)
                    TextSpan(
                      text: '  (${t.recipeOptional.toLowerCase()})',
                      style: Theme.of(context)
                          .textTheme
                          .labelSmall
                          ?.copyWith(color: AppTheme.textDim),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
