<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push({ name: 'admin-login' })
}
</script>

<template>
  <div class="admin-shell">
    <aside class="sidebar">
      <div class="brand">
        ⚙️ {{ t('admin.title') }}
      </div>
      <nav>
        <RouterLink to="/admin/dashboard">
          {{ t('admin.nav.dashboard') }}
        </RouterLink>
        <RouterLink to="/admin/ingredients">
          {{ t('admin.nav.ingredients') }}
        </RouterLink>
        <RouterLink to="/admin/templates">
          {{ t('admin.nav.templates') }}
        </RouterLink>
        <RouterLink to="/admin/moderation">
          {{ t('admin.nav.moderation') }}
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <LanguageSwitcher />
        <div class="muted role">
          {{ auth.user?.displayName }} · {{ auth.role }}
        </div>
        <button
          class="btn btn-sm"
          @click="logout"
        >
          {{ t('common.nav.logout') }}
        </button>
      </div>
    </aside>
    <main class="admin-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  display: grid;
  grid-template-columns: 230px 1fr;
  min-height: 100vh;
}
.sidebar {
  background: var(--bg-soft);
  border-right: 1px solid var(--border);
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.brand {
  font-weight: 800;
  color: var(--primary-soft);
  margin-bottom: 14px;
}
.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.sidebar nav a {
  color: var(--text-dim);
  padding: 9px 12px;
  border-radius: 8px;
}
.sidebar nav a.router-link-active {
  background: var(--surface-2);
  color: var(--text);
}
.sidebar-foot {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.role {
  font-size: 12px;
}
.admin-main {
  padding: 26px 30px;
  overflow: auto;
}
</style>
