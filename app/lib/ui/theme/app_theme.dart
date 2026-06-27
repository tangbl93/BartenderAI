import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Cyber-neon theme per docs/design-system.md.
///
/// Token values: bg #07070d, surface #12121f, cyan #22e3ff (primary),
/// magenta #ff2ea6 (secondary, sparse), text #eaeaf6, dim #8c8ca6.
/// Display/headlines use Chakra Petch; body uses Sora; numbers tabular.
class AppTheme {
  // ---- Color tokens ----
  static const Color bg = Color(0xFF07070d);
  static const Color bgSoft = Color(0xFF0d0d18);
  static const Color surface = Color(0xFF12121f);
  static const Color surface2 = Color(0xFF1a1a2b);
  static const Color border = Color(0xFF26263c);
  static const Color text = Color(0xFFeaeaf6);
  static const Color textDim = Color(0xFF8c8ca6);
  static const Color neonCyan = Color(0xFF22e3ff);
  static const Color neonCyanDeep = Color(0xFF0bb8d6);
  static const Color neonMagenta = Color(0xFFff2ea6);
  static const Color onSurfaceVariant = Color(0xFFbac9cd);
  static const Color primarySoft = Color(0xFFc2f4ff);
  static const Color success = Color(0xFF28e0a0);
  static const Color danger = Color(0xFFff4d6d);
  static const Color warn = Color(0xFFffcf4d);

  static ThemeData light() => dark();

  static ThemeData dark() {
    final scheme = const ColorScheme.dark(
      brightness: Brightness.dark,
      primary: neonCyan,
      onPrimary: Color(0xFF001016),
      secondary: neonMagenta,
      onSecondary: Color(0xFF1a0011),
      error: danger,
      onError: Color(0xFF400008),
      surface: surface,
      onSurface: text,
    );
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: bg,
      canvasColor: bg,
      dividerColor: border,
      dialogTheme: const DialogThemeData(backgroundColor: surface),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        backgroundColor: bg,
        foregroundColor: text,
        elevation: 0,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface2,
        hintStyle: const TextStyle(color: textDim),
        labelStyle: const TextStyle(color: textDim),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(8),
          borderSide: const BorderSide(color: neonCyan, width: 1.5),
        ),
      ),
      cardTheme: CardThemeData(
        color: surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: const BorderSide(color: border),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          backgroundColor: neonCyan,
          foregroundColor: const Color(0xFF001016),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: neonCyan,
          side: const BorderSide(color: neonCyan),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8),
          ),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: neonCyan),
      ),
      iconTheme: const IconThemeData(color: text),
      progressIndicatorTheme:
          const ProgressIndicatorThemeData(color: neonCyan),
      textTheme: _textTheme(),
    );
    return base.copyWith(
      textTheme: GoogleFonts.soraTextTheme(base.textTheme).apply(
        bodyColor: text,
        displayColor: text,
      ),
    );
  }

  /// Chakra Petch for display/headlines (600/700, tight), Sora for body,
  /// tabular figures for numbers.
  static TextTheme _textTheme() {
    const displayColor = text;
    final chakra = GoogleFonts.chakraPetch;
    return TextTheme(
      displayLarge: chakra(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        height: 1.05,
        color: displayColor,
      ),
      displayMedium: chakra(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        height: 1.05,
        color: displayColor,
      ),
      displaySmall: chakra(
        fontWeight: FontWeight.w600,
        letterSpacing: -0.5,
        height: 1.1,
        color: displayColor,
      ),
      headlineLarge: chakra(
        fontWeight: FontWeight.w700,
        letterSpacing: -0.5,
        height: 1.1,
        color: displayColor,
      ),
      headlineMedium: chakra(
        fontWeight: FontWeight.w600,
        letterSpacing: -0.4,
        color: displayColor,
      ),
      headlineSmall: chakra(
        fontWeight: FontWeight.w600,
        letterSpacing: -0.4,
        color: displayColor,
      ),
      titleLarge: chakra(fontWeight: FontWeight.w600, color: displayColor),
      titleMedium: chakra(fontWeight: FontWeight.w600, color: displayColor),
      titleSmall: chakra(fontWeight: FontWeight.w600, color: displayColor),
      bodyLarge: GoogleFonts.sora(color: displayColor),
      bodyMedium: GoogleFonts.sora(color: displayColor),
      bodySmall: GoogleFonts.sora(color: textDim),
      labelLarge: GoogleFonts.sora(
        fontWeight: FontWeight.w600,
        color: displayColor,
      ),
      labelMedium: GoogleFonts.sora(
        fontWeight: FontWeight.w600,
        color: textDim,
      ),
      labelSmall: GoogleFonts.sora(
        fontWeight: FontWeight.w600,
        color: textDim,
      ),
    ).apply(displayColor: displayColor, bodyColor: displayColor);
  }
}
