import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../data/config/app_config.dart';

/// Rewrites a backend image URL so the app can actually load it.
///
/// Stored URLs may be rooted at the backend's own host (e.g.
/// `http://localhost:3000/uploads/...`) or be relative (`/uploads/...`). On a
/// device/emulator that host is unreachable, so we normalise to the origin the
/// app uses to reach the backend ([AppConfig.apiBaseUrl]). External
/// (non-loopback) URLs are passed through unchanged.
String resolveBackendImage(String? url, String apiBaseUrl) {
  if (url == null || url.isEmpty) return '';
  final parsed = Uri.tryParse(url);
  if (parsed != null && parsed.hasScheme && parsed.host.isNotEmpty) {
    if (parsed.host == 'localhost' || parsed.host == '127.0.0.1') {
      final origin = Uri.parse(apiBaseUrl).origin;
      final query = parsed.query.isEmpty ? '' : '?${parsed.query}';
      return '$origin${parsed.path}$query';
    }
    return url; // already absolute & reachable
  }
  if (url.startsWith('/')) return '${Uri.parse(apiBaseUrl).origin}$url';
  return url;
}

/// [CachedNetworkImage] that resolves the URL against the configured backend
/// origin. Use for any backend-served image (covers, posters, illustrations).
class BackendImage extends StatelessWidget {
  const BackendImage({
    super.key,
    required this.url,
    this.fit = BoxFit.cover,
    this.fallback,
    this.memCacheWidth,
    this.memCacheHeight,
  });

  final String? url;
  final BoxFit fit;
  final Widget? fallback;
  final int? memCacheWidth;
  final int? memCacheHeight;

  @override
  Widget build(BuildContext context) {
    final origin = context.read<AppConfig>().apiBaseUrl;
    final resolved = resolveBackendImage(url, origin);
    if (resolved.isEmpty) return fallback ?? const _Fallback();
    return CachedNetworkImage(
      imageUrl: resolved,
      fit: fit,
      memCacheWidth: memCacheWidth,
      memCacheHeight: memCacheHeight,
      placeholder: (_, _) => const _Fallback(),
      errorWidget: (_, _, _) => fallback ?? const _Fallback(),
    );
  }
}

class _Fallback extends StatelessWidget {
  const _Fallback();

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: Theme.of(context).colorScheme.surfaceContainerHighest,
      child: const Center(child: Icon(Icons.local_bar, size: 36)),
    );
  }
}
