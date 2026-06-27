import 'package:flutter/material.dart';

import '../../../data/models/models.dart';
import '../../../l10n/app_localizations.dart';
import '../poster/poster_matrix_screen.dart';

/// Displays a generated (or example) recipe plus the nanny-level guide:
/// ingredients with amounts, ordered steps, home tool swaps, and safety notes.
class RecipeResultScreen extends StatelessWidget {
  const RecipeResultScreen({super.key, required this.recipe});

  final Recipe recipe;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.recipeResultTitle)),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('btn_make_poster'),
        onPressed: () => Navigator.of(context).push(MaterialPageRoute(
          builder: (_) => PosterMatrixScreen(recipe: recipe),
        )),
        icon: const Icon(Icons.image),
        label: Text(t.recipeMakePoster),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
        children: [
          Text(recipe.name,
              key: const Key('recipe_name'),
              style: theme.textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text(recipe.tagline,
              style: theme.textTheme.bodyLarge
                  ?.copyWith(fontStyle: FontStyle.italic)),
          const SizedBox(height: 8),
          if (recipe.alcoholRange.isNotEmpty)
            Chip(
              avatar: const Icon(Icons.local_bar, size: 18),
              label: Text(t.recipeAlcoholRange(recipe.alcoholRange)),
            ),
          const Divider(height: 32),

          _SectionTitle(t.recipeIngredients),
          ...recipe.items.map((item) => ListTile(
                dense: true,
                leading: const Icon(Icons.fiber_manual_record, size: 12),
                title: Text(item.name +
                    (item.optional ? ' (${t.recipeOptional})' : '')),
                trailing: Text(item.amount,
                    style: theme.textTheme.titleMedium),
              )),
          const SizedBox(height: 16),

          _SectionTitle(t.recipeGuideTitle),
          _SectionSubtitle(t.recipeSteps),
          ...recipe.steps.asMap().entries.map((e) => ListTile(
                leading: CircleAvatar(
                  radius: 14,
                  child: Text('${e.key + 1}'),
                ),
                title: Text(e.value),
              )),
          if (recipe.toolSubstitutions.isNotEmpty) ...[
            const SizedBox(height: 8),
            _SectionSubtitle(t.recipeToolSubstitutions),
            ...recipe.toolSubstitutions.map((sub) => ListTile(
                  dense: true,
                  leading: const Icon(Icons.swap_horiz),
                  title: Text(sub.tool),
                  subtitle: Text(sub.homeAlternative),
                )),
          ],
          const SizedBox(height: 16),

          _SectionTitle(t.recipeSafetyNotes),
          Card(
            color: theme.colorScheme.errorContainer,
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.warning_amber),
                      const SizedBox(width: 8),
                      Expanded(child: Text(t.recipeResultAlcoholHint)),
                    ],
                  ),
                  ...recipe.safetyNotes.map((note) => Padding(
                        padding: const EdgeInsets.only(top: 6),
                        child: Text('• $note'),
                      )),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Text(text, style: Theme.of(context).textTheme.titleLarge),
    );
  }
}

class _SectionSubtitle extends StatelessWidget {
  const _SectionSubtitle(this.text);
  final String text;
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 4, bottom: 4),
      child: Text(text, style: Theme.of(context).textTheme.titleMedium),
    );
  }
}
