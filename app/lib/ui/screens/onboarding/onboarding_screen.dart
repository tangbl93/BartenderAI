import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../l10n/app_localizations.dart';
import '../../../logic/onboarding_controller.dart';
import '../../widgets/language_switcher.dart';

/// First-run, skippable tutorial covering the core flow:
/// select ingredients → generate recipe → generate posters → check in.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageController = PageController();
  int _page = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _finish() => context.read<OnboardingController>().complete();

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final steps = <(IconData, String)>[
      (Icons.kitchen, t.onboardingStepSelectIngredients),
      (Icons.auto_awesome, t.onboardingStepGenerateRecipe),
      (Icons.grid_view, t.onboardingStepGeneratePoster),
      (Icons.photo_camera, t.onboardingStepCheckIn),
    ];
    final isLast = _page == steps.length - 1;

    return Scaffold(
      appBar: AppBar(
        title: Text(t.onboardingTitle),
        actions: const [LanguageSwitcher()],
      ),
      body: Column(
        children: [
          Expanded(
            child: PageView.builder(
              controller: _pageController,
              itemCount: steps.length,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (context, index) {
                final (icon, label) = steps[index];
                return Padding(
                  padding: const EdgeInsets.all(32),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(icon, size: 96,
                          color: Theme.of(context).colorScheme.primary),
                      const SizedBox(height: 32),
                      Text(
                        '${index + 1} / ${steps.length}',
                        style: Theme.of(context).textTheme.labelLarge,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        label,
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                TextButton(
                  key: const Key('onboarding_skip'),
                  onPressed: _finish,
                  child: Text(t.commonActionSkip),
                ),
                FilledButton(
                  key: const Key('onboarding_next'),
                  onPressed: () {
                    if (isLast) {
                      _finish();
                    } else {
                      _pageController.nextPage(
                        duration: const Duration(milliseconds: 250),
                        curve: Curves.easeOut,
                      );
                    }
                  },
                  child: Text(isLast ? t.commonActionDone : t.commonActionNext),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
