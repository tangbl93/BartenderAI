import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';

import '../../../l10n/app_localizations.dart';
import '../../../logic/onboarding_controller.dart';
import '../../theme/app_theme.dart';

/// First-run, skippable tutorial. Plain #07070d background (no glow/gradient
/// per the Stitch designs). Each step is distinguished by its own effect:
///  1. Scan Your Fridge — a scan line sweeping the art.
///  2. AI Mixology — four nodes orbiting the glass + concentric rings.
///  3. Cyber Posters — a floating glass poster card.
///  4. Community Wall — a poster-wall grid composition.
class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final _pageController = PageController();
  int _page = 0;
  late final AnimationController _scan;
  late final AnimationController _orbit;
  late final AnimationController _float;

  @override
  void initState() {
    super.initState();
    _scan = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
    _orbit = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 10),
    )..repeat();
    _float = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pageController.dispose();
    _scan.dispose();
    _orbit.dispose();
    _float.dispose();
    super.dispose();
  }

  void _finish() => context.read<OnboardingController>().complete();

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final steps = <_Step>[
      _Step(_ScanArt(scan: _scan, child: Image.asset('assets/onboarding/art1.png', fit: BoxFit.contain)),
          t.onboardingStep1Title, t.onboardingStep1Desc),
      _Step(_OrbitArt(spin: _orbit, child: Image.asset('assets/onboarding/art2.png', fit: BoxFit.contain)),
          t.onboardingStep2Title, t.onboardingStep2Desc),
      _Step(_PosterCardArt(float: _float, child: Image.asset('assets/onboarding/art3.png', fit: BoxFit.cover)),
          t.onboardingStep3Title, t.onboardingStep3Desc),
    ];
    final isLast = _page == steps.length - 1;

    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              child: Row(
                children: [
                  const Spacer(),
                  if (!isLast)
                    TextButton(
                      key: const Key('onboarding_skip'),
                      onPressed: _finish,
                      child: Text(t.commonActionSkip),
                    ),
                ],
              ),
            ),
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                itemCount: steps.length,
                onPageChanged: (i) => setState(() => _page = i),
                itemBuilder: (context, index) {
                  final s = steps[index];
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 28),
                    child: Column(
                      children: [
                        const Spacer(),
                        Expanded(
                          flex: 5,
                          child: Center(child: s.illustration),
                        ),
                        const SizedBox(height: 32),
                        Text(
                          s.title.toUpperCase(),
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .headlineLarge
                              ?.copyWith(color: AppTheme.neonCyan),
                        ),
                        const SizedBox(height: 14),
                        Text(
                          s.desc,
                          textAlign: TextAlign.center,
                          style: Theme.of(context)
                              .textTheme
                              .bodyMedium
                              ?.copyWith(color: AppTheme.textDim),
                        ),
                        const Spacer(),
                      ],
                    ),
                  );
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 22),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(steps.length, (i) {
                  final active = i == _page;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    margin: const EdgeInsets.symmetric(horizontal: 5),
                    width: active ? 28 : 6,
                    height: 6,
                    decoration: BoxDecoration(
                      color: active ? AppTheme.neonCyan : AppTheme.border,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  );
                }),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: SizedBox(
                width: double.infinity,
                height: 48,
                child: isLast
                    ? _GradientButton(
                        key: const Key('onboarding_done'),
                        onPressed: _finish,
                        label: t.onboardingStartButton,
                      )
                    : FilledButton(
                        key: const Key('onboarding_next'),
                        onPressed: () => _pageController.nextPage(
                              duration: const Duration(milliseconds: 250),
                              curve: Curves.easeOut,
                            ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(t.commonActionNext),
                            const SizedBox(width: 8),
                            const Icon(Icons.arrow_forward_rounded),
                          ],
                        ),
                      ),
              ),
            ),
            Text(
              'Powered by Bartender AI Engine v1.0',
              style: GoogleFonts.jetBrainsMono(
                fontSize: 10,
                letterSpacing: 2.5,
                color: AppTheme.textDim.withValues(alpha: 0.4),
              ),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}

class _Step {
  const _Step(this.illustration, this.title, this.desc);
  final Widget illustration;
  final String title;
  final String desc;
}

// ---- Step 1: Scan Your Fridge — scan line sweeping the art ----

class _ScanArt extends StatelessWidget {
  const _ScanArt({required this.child, required this.scan});
  final Widget child;
  final Animation<double> scan;

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 280, maxHeight: 280),
      child: Stack(
        fit: StackFit.passthrough,
        children: [
          Center(child: child),
          Positioned.fill(
            child: AnimatedBuilder(
              animation: scan,
              builder: (context, _) => LayoutBuilder(
                builder: (context, c) {
                  final top = c.maxHeight * (0.12 + scan.value * 0.7);
                  return Stack(
                    children: [
                      Positioned(
                        left: 12,
                        right: 12,
                        top: top,
                        child: Container(height: 2, color: AppTheme.neonCyan),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ---- Step 2: AI Mixology — orbiting nodes + concentric rings ----

class _OrbitArt extends StatelessWidget {
  const _OrbitArt({required this.child, required this.spin});
  final Widget child;
  final Animation<double> spin;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300,
      height: 300,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 264,
            height: 264,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.neonCyan.withValues(alpha: 0.12)),
            ),
          ),
          Container(
            width: 200,
            height: 200,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.neonCyan.withValues(alpha: 0.22)),
            ),
          ),
          AnimatedBuilder(
            animation: spin,
            builder: (context, _) => Transform.rotate(
              angle: spin.value * 2 * math.pi,
              child: const _OrbitNodes(),
            ),
          ),
          SizedBox(width: 200, height: 200, child: Center(child: child)),
        ],
      ),
    );
  }
}

class _OrbitNodes extends StatelessWidget {
  const _OrbitNodes();

  Widget _node() => Container(
        width: 8,
        height: 8,
        decoration: BoxDecoration(
          color: AppTheme.neonCyan,
          shape: BoxShape.circle,
        ),
      );

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 284,
      height: 284,
      child: Stack(
        children: [
          Align(alignment: Alignment.topCenter, child: _node()),
          Align(alignment: Alignment.bottomCenter, child: _node()),
          Align(alignment: Alignment.centerLeft, child: _node()),
          Align(alignment: Alignment.centerRight, child: _node()),
        ],
      ),
    );
  }
}

// ---- Step 3: Cyber Posters — floating glass poster card ----

class _PosterCardArt extends StatelessWidget {
  const _PosterCardArt({required this.child, required this.float});
  final Widget child;
  final Animation<double> float;

  Widget _corner(Alignment a, Color c) => Align(
        alignment: a,
        child: Container(
          width: 18,
          height: 18,
          decoration: BoxDecoration(
            border: Border(
              top: a.y < 0 ? BorderSide(color: c, width: 2) : BorderSide.none,
              bottom: a.y > 0 ? BorderSide(color: c, width: 2) : BorderSide.none,
              left: a.x < 0 ? BorderSide(color: c, width: 2) : BorderSide.none,
              right: a.x > 0 ? BorderSide(color: c, width: 2) : BorderSide.none,
            ),
          ),
        ),
      );

  Widget _chip(String text, Color c, Alignment a) => Align(
        alignment: a,
        child: Transform.translate(
          offset: Offset(a.x < 0 ? -28 : 28, a.y < 0 ? -10 : 10),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: c.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: c.withValues(alpha: 0.5)),
            ),
            child: Text(
              text,
              style: GoogleFonts.jetBrainsMono(
                fontSize: 8,
                letterSpacing: 1.5,
                color: c,
              ),
            ),
          ),
        ),
      );

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 300,
      height: 320,
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            width: 284,
            height: 284,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: AppTheme.neonCyan.withValues(alpha: 0.12)),
            ),
          ),
          AnimatedBuilder(
            animation: float,
            builder: (context, _) => Transform.translate(
              offset: Offset(0, -12 * float.value),
              child: _card(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _card() {
    return Container(
      width: 196,
      height: 256,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.neonCyan.withValues(alpha: 0.3)),
      ),
      child: Stack(
        children: [
          _corner(const Alignment(-1, -1), AppTheme.neonCyan),
          _corner(const Alignment(1, -1), AppTheme.neonMagenta),
          _corner(const Alignment(-1, 1), AppTheme.neonMagenta),
          _corner(const Alignment(1, 1), AppTheme.neonCyan),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  flex: 3,
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: SizedBox(width: double.infinity, child: child),
                  ),
                ),
                const SizedBox(height: 8),
                Container(width: 80, height: 6, color: AppTheme.neonCyan.withValues(alpha: 0.4)),
                const SizedBox(height: 4),
                Container(width: double.infinity, height: 3, color: Colors.white.withValues(alpha: 0.05)),
                const SizedBox(height: 3),
                Container(width: 110, height: 3, color: Colors.white.withValues(alpha: 0.05)),
              ],
            ),
          ),
          _chip('AI POSTER', AppTheme.neonMagenta, const Alignment(1, -1)),
          _chip('RENDERED', AppTheme.neonCyan, const Alignment(-1, 1)),
        ],
      ),
    );
  }
}

/// Final-step call-to-action with a cyan→magenta gradient (no glow).
class _GradientButton extends StatelessWidget {
  const _GradientButton({super.key, required this.onPressed, required this.label});

  final VoidCallback onPressed;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: Ink(
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [AppTheme.neonCyan, AppTheme.neonMagenta],
            ),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Container(
            alignment: Alignment.center,
            child: Text(
              label,
              style: const TextStyle(
                color: AppTheme.bg,
                fontWeight: FontWeight.w600,
                fontSize: 16,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

