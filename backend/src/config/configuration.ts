export interface AppConfig {
  nodeEnv: string;
  port: number;
  databaseUrl?: string;
  jwt: {
    secret: string;
    expiresIn: string;
    refreshExpiresIn: string;
  };
  image: {
    provider: string;
    baseUrl?: string;
    apiKey?: string;
    model: string;
  };
  storage: {
    driver: 'local' | 's3-compatible';
    uploadDir?: string;
    publicBaseUrl: string;
    endpoint?: string;
    accessKey?: string;
    secretKey?: string;
    bucket?: string;
    region?: string;
  };
  posterTimeoutMs: number;
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.BACKEND_PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-development',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  image: {
    provider: process.env.IMAGE_PROVIDER || 'stub',
    baseUrl: process.env.IMAGE_API_BASE_URL,
    apiKey: process.env.IMAGE_API_KEY,
    model: process.env.IMAGE_MODEL || 'gpt-image-2',
  },
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3-compatible') || 'local',
    uploadDir: process.env.STORAGE_UPLOAD_DIR,
    publicBaseUrl:
      // For the local driver default to a relative /uploads path so the app is
      // fully usable without MinIO; S3 keeps the bucket-rooted default.
      process.env.STORAGE_DRIVER === 's3-compatible'
        ? process.env.STORAGE_PUBLIC_BASE_URL ||
          'http://localhost:9000/bartender'
        : process.env.STORAGE_PUBLIC_BASE_URL || '/uploads',
    endpoint: process.env.STORAGE_ENDPOINT,
    accessKey: process.env.STORAGE_ACCESS_KEY,
    secretKey: process.env.STORAGE_SECRET_KEY,
    bucket: process.env.STORAGE_BUCKET || 'bartender',
    region: process.env.STORAGE_REGION || 'us-east-1',
  },
  posterTimeoutMs: parseInt(process.env.POSTER_TIMEOUT_MS || '30000', 10),
});
