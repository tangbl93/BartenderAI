export interface ImageGenerationRequest {
  prompt: string;
  /** e.g. "1024x1024" — chosen per template dimension. */
  size?: string;
  /** Used by the stub to produce a deterministic placeholder URL. */
  seed?: string;
  /**
   * Optional i2i reference image as a base64 data URL forwarded from the App.
   * When present, providers SHOULD use it as an image-to-image reference.
   * The backend NEVER persists this — it is forwarded to the image API only.
   */
  referenceImage?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
}

export interface ImageProvider {
  generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult>;
}

export const IMAGE_PROVIDER = Symbol('IMAGE_PROVIDER');
