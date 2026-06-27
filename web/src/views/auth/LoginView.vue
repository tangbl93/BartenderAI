<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const account = ref('demo@bar.ai')
const password = ref('password')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await auth.login({ account: account.value, password: password.value })
    const redirect = (route.query.redirect as string) || '/app/fridge'
    router.push(redirect)
  } catch (e) {
    error.value = e instanceof HttpError ? t('auth.login.failed') : t('common.error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card">
      <div class="row spread">
        <h1>{{ t('auth.login.title') }}</h1>
        <LanguageSwitcher />
      </div>
      <p class="muted">
        {{ t('common.tagline') }}
      </p>

      <form @submit.prevent="submit">
        <label>{{ t('auth.login.account') }}</label>
        <input
          v-model="account"
          class="input"
          type="text"
          autocomplete="username"
        >
        <label>{{ t('auth.login.password') }}</label>
        <input
          v-model="password"
          class="input"
          type="password"
          autocomplete="current-password"
        >

        <p
          v-if="error"
          class="notice error"
          data-test="error"
        >
          {{ error }}
        </p>

        <button
          class="btn btn-primary submit"
          type="submit"
          :disabled="busy"
          data-test="submit"
        >
          {{ t('auth.login.submit') }}
        </button>
      </form>

      <div class="row spread foot">
        <RouterLink to="/register">
          {{ t('auth.login.toRegister') }}
        </RouterLink>
        <RouterLink
          to="/admin/login"
          class="muted"
        >
          {{ t('common.nav.admin') }}
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
}
.submit {
  width: 100%;
  margin-top: 18px;
  justify-content: center;
}
.foot {
  margin-top: 16px;
  font-size: 14px;
}
</style>
