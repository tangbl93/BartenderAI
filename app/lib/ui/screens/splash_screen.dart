import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../l10n/app_localizations.dart';
import '../theme/app_theme.dart';

/// Cyber-neon splash shown during the silent device-login window.
/// Pixel-faithful port of the Google Stitch splash design: near-black bg with
/// a radial cyan glow and a stardust noise overlay, the brand logo mark
/// centered with the wordmark and tagline, and a spinning + pulsing neon
/// loader ring pinned to the bottom.
class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late final AnimationController _spin;
  late final AnimationController _pulse;

  @override
  void initState() {
    super.initState();
    _spin = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 1),
    )..repeat();
    _pulse = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
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
                Image.asset('assets/logo.jpg', width: 140, height: 140),
                const SizedBox(height: 28),
                Text(
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
                const SizedBox(height: 12),
                Text(
                  t.splashTagline,
                  style: GoogleFonts.sora(
                    fontSize: 14,
                    fontWeight: FontWeight.w300,
                    letterSpacing: 2.8,
                    color: AppTheme.textDim,
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
              child: ScaleTransition(
                scale: Tween(begin: 0.85, end: 1.0).animate(_pulse),
                child: RotationTransition(
                  turns: _spin,
                  child: const _LoaderRing(),
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
