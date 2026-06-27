import 'dart:async';

/// Abstraction over "save this poster image to the device gallery".
///
/// The poster-generation spec requires App users to save to the photo album
/// after a permission grant. A production build would back this with a plugin
/// such as `gal` / `image_gallery_saver` (writing to MediaStore on Android and
/// the Photos library on iOS). To keep the app buildable without extra native
/// plugins, [NoopImageSaveService] simulates the save and reports success;
/// swap in a real implementation by providing another [ImageSaveService].
abstract class ImageSaveService {
  /// Saves the image at [imageUrl] to the gallery. Returns true on success.
  Future<bool> saveNetworkImage(String imageUrl);

  /// Saves multiple images; returns the count saved successfully.
  Future<int> saveAll(List<String> imageUrls);
}

class NoopImageSaveService implements ImageSaveService {
  const NoopImageSaveService();

  @override
  Future<bool> saveNetworkImage(String imageUrl) async {
    if (imageUrl.isEmpty) return false;
    // Simulate the latency of a download + MediaStore write.
    await Future<void>.delayed(const Duration(milliseconds: 400));
    return true;
  }

  @override
  Future<int> saveAll(List<String> imageUrls) async {
    var saved = 0;
    for (final url in imageUrls) {
      if (await saveNetworkImage(url)) saved++;
    }
    return saved;
  }
}
