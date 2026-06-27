import 'package:flutter/material.dart';

/// Centralized theming for the app — a warm "speakeasy" palette.
class AppTheme {
  static ThemeData light() {
    final scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFB8860B),
      brightness: Brightness.light,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      appBarTheme: const AppBarTheme(centerTitle: true),
    );
  }

  static ThemeData dark() {
    final scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFFD4AF37),
      brightness: Brightness.dark,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      appBarTheme: const AppBarTheme(centerTitle: true),
    );
  }
}
