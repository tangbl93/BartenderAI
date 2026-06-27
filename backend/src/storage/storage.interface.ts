export interface StorageUpload {
  /** Original filename (used for extension). */
  filename: string;
  /** File bytes. */
  data: Buffer;
  /** Detected MIME type, e.g. image/png. */
  mimetype: string;
}

export interface StorageResult {
  /** Public-facing URL of the stored object. */
  url: string;
  /** Storage key / path relative to the driver root. */
  key: string;
}

export interface StorageService {
  /**
   * Persist an upload and return a public URL. Implementations must NOT embed
   * secrets into the returned URL.
   */
  upload(upload: StorageUpload): Promise<StorageResult>;
}

export const STORAGE_SERVICE = Symbol('STORAGE_SERVICE');
