import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_theme.dart';
import '../widgets/cocktail_logo.dart';

/// Cyber-neon splash shown during the silent device-login window.
/// Pixel-faithful port of the Google Stitch splash design: near-black bg with
/// a radial cyan glow and a stardust noise overlay, the neon cocktail-glass
/// brand mark centered with the wordmark and tagline, and a spinning + pulsing
/// neon loader ring pinned to the bottom.
///
/// Motion: the mark, wordmark and tagline stagger in on first frame; the mark
/// then breathes a soft glow, and the loader spins while pulsing both its scale
/// and opacity (matching the design's `pulse-ring` keyframes).
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _intro;
  late final AnimationController _spin;
  late final AnimationController _pulse;

  // Staggered entrance segments.
  late final Animation<double> _logoFade;
  late final Animation<double> _logoScale;
  late final Animation<double> _wordFade;
  late final Animation<double> _wordSlide;
  late final Animation<double> _taglineFade;

  @override
  void initState() {
    super.initState();
    _intro = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1100),
    );
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);

    _logoFade = _seg(0.0, 0.5, Curves.easeOut);
    _logoScale = Tween(begin: 0.86, end: 1.0).animate(_seg(0.0, 0.6, Curves.easeOutBack));
    _wordFade = _seg(0.35, 0.8, Curves.easeOut);
    _wordSlide = Tween(begin: 14.0, end: 0.0).animate(_seg(0.35, 0.8, Curves.easeOut));
    _taglineFade = _seg(0.55, 1.0, Curves.easeOut);

    _intro.forward();
  }

  CurvedAnimation _seg(double begin, double end, Curve curve) =>
      CurvedAnimation(parent: _intro, curve: Interval(begin, end, curve: curve));

  @override
  void dispose() {
    _intro.dispose();
    _spin.dispose();
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      body: Stack(
        children: [
          // Radial cyan glow over near-black.
          const Positioned.fill(
            child: DecoratedBox(
              decoration: BoxDecoration(
                color: AppTheme.bg,
                gradient: RadialGradient(
                  center: Alignment.center,
                  radius: 0.7,
                  colors: [Color(0x2622E3FF), AppTheme.bg],
                  stops: [0.0, 0.7],
                ),
              ),
            ),
          ),
          // Stardust micro-noise overlay.
          const Positioned.fill(
            child: Opacity(
              opacity: 0.5,
              child: Image(
                image: AssetImage('assets/stardust.png'),
                repeat: ImageRepeat.repeat,
              ),
            ),
          ),
          // Centered logo + wordmark + tagline.
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Neon cocktail-glass mark with a breathing glow.
                FadeTransition(
                  opacity: _logoFade,
                  child: ScaleTransition(
                    scale: _logoScale,
                    child: AnimatedBuilder(
                      animation: _pulse,
                      builder: (_, _) => CocktailLogo(
                        size: 128,
                        glow: 0.55 + 0.45 * _pulse.value,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 28),
                FadeTransition(
                  opacity: _wordFade,
                  child: AnimatedBuilder(
                    animation: _wordSlide,
                    builder: (_, child) =>
                        Transform.translate(offset: Offset(0, _wordSlide.value), child: child),
                    child: Text(
                      'Bartender AI',
                      style: GoogleFonts.chakraPetch(
                        fontSize: 30,
                        fontWeight: FontWeight.w700,
                        letterSpacing: -0.5,
                        height: 1.05,
                        color: AppTheme.text,
                        shadows: [
                          Shadow(
                            color: AppTheme.neonCyan.withValues(alpha: 0.8),
                            blurRadius: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                FadeTransition(
                  opacity: _taglineFade,
                  child: Text(
                    t.splashTagline,
                    style: GoogleFonts.sora(
                      fontSize: 14,
                      fontWeight: FontWeight.w300,
                      letterSpacing: 2.8,
                      color: AppTheme.textDim,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // Spinning + pulsing neon loader ring, pinned to the bottom.
          Positioned(
            bottom: 72,
            left: 0,
            right: 0,
            child: Center(
              // Pulse opacity 0.3→1 and scale 0.8→1 in lockstep, per the design.
              child: FadeTransition(
                opacity: Tween(begin: 0.3, end: 1.0).animate(_pulse),
                child: ScaleTransition(
                  scale: Tween(begin: 0.8, end: 1.0).animate(_pulse),
                  child: RotationTransition(
                    turns: _spin,
                    child: const _LoaderRing(),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LoaderRing extends StatelessWidget {
  const _LoaderRing();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(size: const Size(42, 42), painter: _RingPainter());
  }
}

class _RingPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final center = size.center(Offset.zero);
    final radius = size.width / 2 - 3;
    canvas.drawCircle(
      center,
      radius,
      Paint()
        ..color = AppTheme.neonCyan.withValues(alpha: 0.1)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3,
    );
    final rect = Rect.fromCircle(center: center, radius: radius);
    canvas.drawArc(
      rect,
      -math.pi / 2,
      math.pi * 0.7,
      false,
      Paint()
        ..color = AppTheme.neonCyan
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3
        ..strokeCap = StrokeCap.round
        ..maskFilter = const MaskFilter.blur(BlurStyle.outer, 3),
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
