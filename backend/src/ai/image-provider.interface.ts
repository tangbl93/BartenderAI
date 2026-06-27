export interface ImageGenerationRequest {
  prompt: string;
  /** e.g. "1024x1024" — chosen per template dimension. */
  size?: string;
  /** Used by the stub to produce a deterministic placeholder URL. */
  seed?: string;
}

export interface ImageGenerationResult {
  imageUrl: string;
}

export interface ImageProvider {
  generateImage(req: ImageGenerationRequest): Promise<ImageGenerationResult>;
}

export const IMAGE_PROVIDER = Symbol('IMAGE_PROVIDER');
