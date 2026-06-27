<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { HttpError } from '@/api'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { t } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const account = ref('')
const password = ref('')
const displayName = ref('')
const error = ref('')
const busy = ref(false)

async function submit() {
  error.value = ''
  busy.value = true
  try {
    await auth.register({
      account: account.value,
      password: password.value,
      displayName: displayName.value || undefined,
    })
    router.push('/app/fridge')
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 409) error.value = t('auth.register.exists')
    else error.value = t('common.error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="card auth-card">
      <div class="row spread">
        <h1>{{ t('auth.register.title') }}</h1>
        <LanguageSwitcher />
      </div>

      <form @submit.prevent="submit">
        <label>{{ t('auth.login.account') }}</label>
        <input
          v-model="account"
          class="input"
          type="text"
          autocomplete="username"
        >
        <label>{{ t('auth.register.displayName') }}</label>
        <input
          v-model="displayName"
          class="input"
          type="text"
        >
        <label>{{ t('auth.login.password') }}</label>
        <input
          v-model="password"
          class="input"
          type="password"
          autocomplete="new-password"
          minlength="8"
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
        >
          {{ t('auth.register.submit') }}
        </button>
      </form>

      <div class="foot">
        <RouterLink to="/login">
          {{ t('auth.register.toLogin') }}
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
