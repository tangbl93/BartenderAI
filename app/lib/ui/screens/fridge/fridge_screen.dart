import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';
import '../../../logic/fridge_selection.dart';
import '../../../logic/locale_controller.dart';
import '../../../logic/onboarding_controller.dart';
import '../../l10n_helpers.dart';
import '../../widgets/language_switcher.dart';
import '../recipe/recipe_result_screen.dart';

/// "Open the fridge" — categorized multi-select of ingredients, example cards,
/// and a generate-recipe CTA. The selection logic lives in [FridgeSelection].
class FridgeScreen extends StatefulWidget {
  const FridgeScreen({super.key});

  @override
  State<FridgeScreen> createState() => _FridgeScreenState();
}

class _FridgeScreenState extends State<FridgeScreen> {
  final FridgeSelection _selection = FridgeSelection();
  late Future<List<Ingredient>> _future;
  bool _generating = false;

  String _localeString() => LocaleController.toContentLocale(
        Localizations.localeOf(context),
      );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _future = context.read<Repositories>().ingredients.list(_localeString());
  }

  Future<void> _generate() async {
    final t = AppLocalizations.of(context);
    if (!_selection.canGenerate) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(t.fridgeNeedMore)));
      return;
    }
    setState(() => _generating = true);
    final repos = context.read<Repositories>();
    try {
      final recipe = await repos.recipes
          .generate(_selection.selectedIds.toList(), _localeString());
      if (!mounted) return;
      Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => RecipeResultScreen(recipe: recipe),
      ));
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(e.message)));
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  Future<void> _openExamples() async {
    final repos = context.read<Repositories>();
    final examples = await repos.recipes.examples(_localeString());
    if (!mounted || examples.isEmpty) return;
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => RecipeResultScreen(recipe: examples.first),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(t.fridgeTitle),
        actions: [
          IconButton(
            tooltip: t.onboardingReplay,
            icon: const Icon(Icons.help_outline),
            onPressed: () => context.read<OnboardingController>().replay(),
          ),
          const LanguageSwitcher(),
        ],
      ),
      body: FutureBuilder<List<Ingredient>>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text(t.commonError));
          }
          final grouped = FridgeSelection.groupByCategory(snapshot.data ?? []);
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
            children: [
              Text(t.fridgeSubtitle,
                  style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 12),
              _ExampleCard(onTap: _openExamples),
              const SizedBox(height: 16),
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
      bottomSheet: _GenerateBar(
        count: _selection.count,
        canGenerate: _selection.canGenerate,
        generating: _generating,
        onClear: () => setState(_selection.clear),
        onGenerate: _generate,
      ),
    );
  }
}

class _ExampleCard extends StatelessWidget {
  const _ExampleCard({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Card(
      key: const Key('example_card'),
      child: ListTile(
        leading: const Icon(Icons.lightbulb_outline),
        title: Text(t.exampleCardTitle),
        subtitle: Text(t.exampleCardSubtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
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
          child: Text(
            t.categoryLabel(category),
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: ingredients.map((ing) {
            final selected = selection.isSelected(ing.id);
            return FilterChip(
              key: Key('ingredient_${ing.id}'),
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
    required this.generating,
    required this.onClear,
    required this.onGenerate,
  });

  final int count;
  final bool canGenerate;
  final bool generating;
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
            Expanded(
              child: Text(
                t.fridgeSelectedCount(count),
                key: const Key('selected_count'),
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ),
            if (count > 0)
              TextButton(onPressed: onClear, child: Text(t.fridgeClear)),
            const SizedBox(width: 8),
            FilledButton.icon(
              key: const Key('btn_generate'),
              onPressed: (canGenerate && !generating) ? onGenerate : null,
              icon: generating
                  ? const SizedBox(
                      height: 18,
                      width: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.auto_awesome),
              label: Text(t.fridgeGenerate),
            ),
          ],
        ),
      ),
    );
  }
}
