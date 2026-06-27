import { API_BASE_URL, TOKEN_STORAGE_KEY } from './config'
import type { ApiError } from './types'

export class HttpError extends Error {
  statusCode: number
  code?: string
  constructor(statusCode: number, message: string, code?: string) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.code = code
  }
}

function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export interface RequestOptions {
  method?: string
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
  auth?: boolean
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const url = new URL(API_BASE_URL + path)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

/** Thin typed fetch wrapper. Throws HttpError on non-2xx. */
export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token && opts.auth !== false) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method || 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined

  if (!res.ok) {
    const err = (data || {}) as ApiError
    throw new HttpError(err.statusCode || res.status, err.message || res.statusText, err.code)
  }
  return data as T
}
