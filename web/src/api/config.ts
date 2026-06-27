export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000/api/v1'

/**
 * Use the in-browser mock adapter when:
 *  - VITE_USE_MOCK is explicitly "true", OR
 *  - it is unset (default to mock so the UI runs with no backend).
 * Set VITE_USE_MOCK=false to talk to a real backend.
 */
export const USE_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

export const TOKEN_STORAGE_KEY = 'hba.accessToken'
export const USER_STORAGE_KEY = 'hba.user'
