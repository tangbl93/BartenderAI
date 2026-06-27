import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../../data/models/models.dart';
import '../../../data/repositories/repositories.dart';
import '../../../l10n/app_localizations.dart';

/// Create a check-in: pick/take a photo, mark success/flop, add a note.
class LabCheckInScreen extends StatefulWidget {
  const LabCheckInScreen({super.key, this.recipeId = 'recipe-manual'});

  final String recipeId;

  @override
  State<LabCheckInScreen> createState() => _LabCheckInScreenState();
}

class _LabCheckInScreenState extends State<LabCheckInScreen> {
  final _picker = ImagePicker();
  final _note = TextEditingController();
  String? _imagePath;
  LabResult? _result;
  bool _busy = false;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  Future<void> _pick(ImageSource source) async {
    try {
      final file = await _picker.pickImage(source: source, imageQuality: 80);
      if (file != null) setState(() => _imagePath = file.path);
    } catch (_) {
      // Camera/gallery unavailable (e.g. on a headless test device) — ignore.
    }
  }

  Future<void> _submit() async {
    final t = AppLocalizations.of(context);
    if (_imagePath == null || _imagePath!.isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(t.labImageRequired)));
      return;
    }
    if (_result == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(SnackBar(content: Text(t.labResultRequired)));
      return;
    }
    setState(() => _busy = true);
    final repos = context.read<Repositories>();
    try {
      await repos.lab.create(
        widget.recipeId,
        // In a real build this path is uploaded to media storage and the
        // returned URL is persisted; the mock accepts the local path directly.
        _imagePath!,
        _result!,
        _note.text.trim().isEmpty ? null : _note.text.trim(),
      );
      if (mounted) Navigator.of(context).pop(true);
    } on ApiException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final t = AppLocalizations.of(context);
    return Scaffold(
      appBar: AppBar(title: Text(t.labCheckIn)),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          AspectRatio(
            aspectRatio: 1,
            child: Container(
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: _imagePath == null
                  ? const Center(child: Icon(Icons.image, size: 64))
                  : Center(
                      key: const Key('image_selected'),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.check_circle, size: 48),
                          const SizedBox(height: 8),
                          Text(_imagePath!.split('/').last),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  key: const Key('btn_pick_gallery'),
                  onPressed: () => _pick(ImageSource.gallery),
                  icon: const Icon(Icons.photo_library),
                  label: Text(t.labPickImage),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  key: const Key('btn_take_photo'),
                  onPressed: () => _pick(ImageSource.camera),
                  icon: const Icon(Icons.photo_camera),
                  label: Text(t.labTakePhoto),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SegmentedButton<LabResult>(
            segments: [
              ButtonSegment(
                value: LabResult.success,
                label: Text(t.labResultSuccess),
                icon: const Icon(Icons.thumb_up),
              ),
              ButtonSegment(
                value: LabResult.fail,
                label: Text(t.labResultFail),
                icon: const Icon(Icons.thumb_down),
              ),
            ],
            selected: _result == null ? {} : {_result!},
            emptySelectionAllowed: true,
            onSelectionChanged: (s) =>
                setState(() => _result = s.isEmpty ? null : s.first),
          ),
          const SizedBox(height: 16),
          TextField(
            key: const Key('field_note'),
            controller: _note,
            maxLines: 3,
            decoration: InputDecoration(
              labelText: t.labNoteLabel,
              border: const OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 24),
          FilledButton(
            key: const Key('btn_submit_checkin'),
            onPressed: _busy ? null : _submit,
            child: _busy
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : Text(t.commonActionSave),
          ),
        ],
      ),
    );
  }
}
