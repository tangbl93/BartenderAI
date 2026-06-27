import 'dart:io';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/services/image_save_service.dart';
import '../../../l10n/app_localizations.dart';
import '../../theme/app_theme.dart';

/// Full-screen view of a creation: pinch-zoom the merged image, or download it
/// to the gallery. Shows a "generating" state while the backend image job is
/// still running (entry created via "request succeeds → return home").
class DetailScreen extends StatefulWidget {
  const DetailScreen({super.key, required this.entry});

  final LabEntry entry;

  @override
  State<DetailScreen> createState() => _DetailScreenState();
}

class _DetailScreenState extends State<DetailScreen> {
  bool _saving = false;

  Future<void> _download() async {
    final url = widget.entry.imageUrl;
    if (!url.startsWith('http')) return;
    setState(() => _saving = true);
    final t = AppLocalizations.of(context);
    final ok = await context.read<ImageSaveService>().saveNetworkImage(url);
    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(ok ? t.posterSaved : t.commonError)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    final e = widget.entry;
    final url = e.imageUrl;
    final busy = e.isGenerating || url.isEmpty;

    return Scaffold(
      appBar: AppBar(title: Text(e.note.isEmpty ? e.recipeId : e.note)),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: busy
                  ? Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const CircularProgressIndicator(),
                          const SizedBox(height: 16),
                          Text(
                            t.posterGenerating.toUpperCase(),
                            style: const TextStyle(
                              color: AppTheme.neonCyan,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                    )
                  : InteractiveViewer(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Center(
                          child: url.startsWith('http')
                              ? Image.network(url, fit: BoxFit.contain)
                              : Image.file(File(url), fit: BoxFit.contain),
                        ),
                      ),
                    ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                child: SizedBox(
                  width: double.infinity,
                  child: FilledButton.icon(
                    onPressed: busy || _saving ? null : _download,
                    icon: const Icon(Icons.download),
                    label: Text(t.posterSaveToGallery),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
