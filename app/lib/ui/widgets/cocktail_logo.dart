import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Neon line-art cocktail-glass brand mark — a pixel-faithful port of the
/// Google Stitch logo SVG (cyan martini glass + a magenta straw/garnish accent
/// + a dashed magenta liquid line), each stroke backed by a soft outer glow.
///
/// [glow] (0..1) scales the glow intensity so callers can animate a gentle
/// breathing effect; the strokes themselves stay crisp.
class CocktailLogo extends StatelessWidget {
  const CocktailLogo({super.key, this.size = 120, this.glow = 1.0});

  final double size;
  final double glow;

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size.square(size),
      painter: _CocktailLogoPainter(glow: glow.clamp(0.0, 1.0)),
    );
  }
}

class _CocktailLogoPainter extends CustomPainter {
  _CocktailLogoPainter({required this.glow});

  final double glow;

  @override
  void paint(Canvas canvas, Size size) {
    // The source artwork is authored on a 100×100 viewBox.
    final s = size.width / 100.0;
    Offset p(double x, double y) => Offset(x * s, y * s);

    // Glass bowl (inverted triangle) + base/stem.
    final bowl = Path()
      ..moveTo(20 * s, 25 * s)
      ..lineTo(50 * s, 55 * s)
      ..lineTo(80 * s, 25 * s)
      ..close();
    final base = Path()
      ..moveTo(30 * s, 80 * s)
      ..lineTo(70 * s, 80 * s)
      ..moveTo(50 * s, 80 * s)
      ..lineTo(50 * s, 55 * s);
    final straw = Path()
      ..moveTo(55 * s, 45 * s)
      ..lineTo(75 * s, 15 * s);

    void stroke(Path path, Color color, double width,
        {bool round = true}) {
      // Soft outer glow, intensity driven by [glow].
      if (glow > 0) {
        canvas.drawPath(
          path,
          Paint()
            ..color = color.withValues(alpha: 0.7 * glow)
            ..style = PaintingStyle.stroke
            ..strokeWidth = width * s
            ..strokeCap = round ? StrokeCap.round : StrokeCap.butt
            ..strokeJoin = StrokeJoin.round
            ..maskFilter = MaskFilter.blur(BlurStyle.normal, (6 + 6 * glow) * s),
        );
      }
      // Crisp stroke.
      canvas.drawPath(
        path,
        Paint()
          ..color = color
          ..style = PaintingStyle.stroke
          ..strokeWidth = width * s
          ..strokeCap = round ? StrokeCap.round : StrokeCap.butt
          ..strokeJoin = StrokeJoin.round,
      );
    }

    // Cyan glass first, magenta accent on top.
    stroke(bowl, AppTheme.neonCyan, 3);
    stroke(base, AppTheme.neonCyan, 3);
    stroke(straw, AppTheme.neonMagenta, 4);

    // Dashed magenta liquid line (M30 35 H70, dash 2 2, opacity 0.6).
    _dashedLine(
      canvas,
      p(30, 35),
      p(70, 35),
      Paint()
        ..color = AppTheme.neonMagenta.withValues(alpha: 0.6)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2 * s,
      dash: 2 * s,
      gap: 2 * s,
    );
  }

  void _dashedLine(Canvas canvas, Offset a, Offset b, Paint paint,
      {required double dash, required double gap}) {
    final total = (b - a).distance;
    final dir = (b - a) / total;
    var drawn = 0.0;
    while (drawn < total) {
      final start = a + dir * drawn;
      final end = a + dir * (drawn + dash).clamp(0.0, total);
      canvas.drawLine(start, end, paint);
      drawn += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _CocktailLogoPainter old) => old.glow != glow;
}
