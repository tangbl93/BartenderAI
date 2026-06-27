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
    const hash = createHash('sha1')
      .update(`${req.seed || ''}|${req.prompt}`)
      .digest('hex')
      .slice(0, 12);
    const size = req.size || '1024x1024';
    return {
      imageUrl: `https://stub.local/posters/${hash}-${size}.png`,
    };
  }
}
