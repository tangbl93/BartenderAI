import { defineStore } from 'pinia'
import { api } from '@/api'
import { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '@/api/config'
import type { AuthResult, LoginDto, RegisterDto, Role, User } from '@/api/types'

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: loadToken() as string | null,
    user: loadUser() as User | null,
  }),
  getters: {
    isAuthenticated: (s): boolean => !!s.token && !!s.user,
    role: (s): Role | null => s.user?.role ?? null,
    isAdminUser: (s): boolean => s.user?.role === 'admin' || s.user?.role === 'operator',
    isUser: (s): boolean => s.user?.role === 'user',
  },
  actions: {
    persist() {
      try {
        if (this.token) localStorage.setItem(TOKEN_STORAGE_KEY, this.token)
        else localStorage.removeItem(TOKEN_STORAGE_KEY)
        if (this.user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.user))
        else localStorage.removeItem(USER_STORAGE_KEY)
      } catch {
        /* ignore storage errors */
      }
    },
    apply(result: AuthResult) {
      this.token = result.accessToken
      this.user = result.user
      this.persist()
    },
    async login(dto: LoginDto) {
      this.apply(await api.login(dto))
    },
    async register(dto: RegisterDto) {
      this.apply(await api.register(dto))
    },
    async adminLogin(dto: LoginDto) {
      this.apply(await api.adminLogin(dto))
    },
    async logout() {
      try {
        await api.logout()
      } catch {
        /* ignore network errors on logout */
      }
      this.token = null
      this.user = null
      this.persist()
    },
  },
})
