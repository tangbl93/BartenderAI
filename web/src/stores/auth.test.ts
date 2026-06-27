import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

const { login, adminLogin, logout } = vi.hoisted(() => ({
  login: vi.fn(),
  adminLogin: vi.fn(),
  logout: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/api', async () => {
  const actual = await vi.importActual<typeof import('@/api')>('@/api')
  return { ...actual, api: { login, adminLogin, logout } }
})

import { useAuthStore } from './auth'

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('stores token + user and persists on login', async () => {
    login.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 'u1', account: 'a@b.c', role: 'user' },
    })
    const s = useAuthStore()
    await s.login({ account: 'a@b.c', password: 'x' })

    expect(s.isAuthenticated).toBe(true)
    expect(s.isUser).toBe(true)
    expect(s.isAdminUser).toBe(false)
    expect(localStorage.getItem('hba.accessToken')).toBe('tok')
  })

  it('recognises operator/admin roles as admin users', async () => {
    adminLogin.mockResolvedValue({
      accessToken: 'tok2',
      user: { id: 'a1', account: 'op@b.c', role: 'operator' },
    })
    const s = useAuthStore()
    await s.adminLogin({ account: 'op@b.c', password: 'x' })
    expect(s.isAdminUser).toBe(true)
    expect(s.isUser).toBe(false)
  })

  it('clears state and storage on logout', async () => {
    login.mockResolvedValue({
      accessToken: 'tok',
      user: { id: 'u1', account: 'a@b.c', role: 'user' },
    })
    const s = useAuthStore()
    await s.login({ account: 'a@b.c', password: 'x' })
    await s.logout()
    expect(s.isAuthenticated).toBe(false)
    expect(localStorage.getItem('hba.accessToken')).toBeNull()
  })
})
