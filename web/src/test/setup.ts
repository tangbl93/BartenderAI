import { config } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach } from 'vitest'
import { i18n } from '@/i18n'

// jsdom's localStorage can be incomplete across versions; install a complete
// in-memory implementation so .clear()/.getItem()/.setItem() always work.
function installLocalStorage() {
  const store = new Map<string, string>()
  const ls: Storage = {
    get length() {
      return store.size
    },
    clear: () => store.clear(),
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    removeItem: (k: string) => void store.delete(k),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
  }
  Object.defineProperty(globalThis, 'localStorage', { value: ls, configurable: true, writable: true })
}
installLocalStorage()

// Provide i18n globally to every mounted component.
config.global.plugins = [i18n]

// Stub <RouterLink>/<RouterView> so components that use them render in isolation.
config.global.stubs = {
  RouterLink: {
    props: ['to'],
    template: '<a :href="typeof to === \'string\' ? to : \'#\'"><slot /></a>',
  },
  RouterView: { template: '<div><slot /></div>' },
}

beforeEach(() => {
  setActivePinia(createPinia())
})
