import { USE_MOCK } from './config'
import type { BartenderApi } from './contract'
import { httpApi } from './http'
import { mockApi } from './mock'

/**
 * The app imports `api` from here. It is the mock adapter by default (so the UI
 * runs with no backend) and the real HTTP client when VITE_USE_MOCK=false.
 */
export const api: BartenderApi = USE_MOCK ? mockApi : httpApi

export { USE_MOCK }
export * from './types'
export { HttpError } from './client'
