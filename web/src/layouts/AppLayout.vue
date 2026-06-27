<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import OnboardingTour from '@/components/OnboardingTour.vue'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingStore } from '@/stores/onboarding'

const { t } = useI18n()
const auth = useAuthStore()
const onboarding = useOnboardingStore()
const router = useRouter()

onMounted(() => onboarding.maybeAutoOpen())

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <div class="bar-inner">
        <RouterLink
          to="/app/fridge"
          class="brand"
        >
          🍸 {{ t('common.appName') }}
        </RouterLink>
        <nav class="nav">
          <RouterLink to="/app/fridge">
            {{ t('common.nav.fridge') }}
          </RouterLink>
          <RouterLink to="/app/lab">
            {{ t('common.nav.lab') }}
          </RouterLink>
          <RouterLink to="/app/wall">
            {{ t('common.nav.wall') }}
          </RouterLink>
        </nav>
        <div class="row">
          <button
            class="btn btn-ghost btn-sm"
            data-test="reopen-tour"
            @click="onboarding.reopen()"
          >
            {{ t('onboarding.reopen') }}
          </button>
          <LanguageSwitcher />
          <template v-if="auth.isAuthenticated">
            <span class="muted user">{{ auth.user?.displayName }}</span>
            <button
              class="btn btn-sm"
              @click="logout"
            >
              {{ t('common.nav.logout') }}
            </button>
          </template>
          <RouterLink
            v-else
            to="/login"
            class="btn btn-sm btn-primary"
          >
            {{ t('common.nav.login') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="container">
      <RouterView />
    </main>

    <OnboardingTour />
  </div>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: rgba(15, 15, 23, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
}
.bar-inner {
  max-width: var(--maxw);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 20px;
}
.brand {
  font-weight: 800;
  color: var(--primary-soft);
}
.nav {
  display: flex;
  gap: 16px;
  flex: 1;
}
.nav a {
  color: var(--text-dim);
  padding: 4px 0;
}
.nav a.router-link-active {
  color: var(--text);
  border-bottom: 2px solid var(--primary);
}
.user {
  font-size: 13px;
}
</style>
