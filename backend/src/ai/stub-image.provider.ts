import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import {
  ImageGenerationRequest,
  ImageGenerationResult,
  ImageProvider,
} from './image-provider.interface';

/**
 * Deterministic stub image provider. Returns a placeholder image URL derived
 * from a hash of the prompt/seed so the full poster pipeline runs offline.
 */
@Injectable()
export class StubImageProvider implements ImageProvider {
  async generateImage(
    req: ImageGenerationRequest,
  ): Promise<ImageGenerationResult> {
    // Fold the reference image marker into the hash so tests can assert it was
    // forwarded (i2i). The stub never inspects the actual pixels.
    const refMarker = req.referenceImage ? '|i2i' : '';
    const hash = createHash('sha1')
      .update(`${req.seed || ''}${refMarker}|${req.prompt}`)
      .digest('hex')
      .slice(0, 12);
    const size = req.size || '1024x1024';
    return {
      imageUrl: `https://stub.local/posters/${hash}-${size}.png`,
    };
  }
}
