<script setup lang="ts">
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/locale'
import { LOCALE_LABELS } from '@/i18n'
import type { LocaleCode } from '@/api/types'

const localeStore = useLocaleStore()

const model = computed({
  get: () => localeStore.current,
  set: (v: LocaleCode) => localeStore.change(v),
})
</script>

<template>
  <select
    v-model="model"
    class="select lang-switcher"
    aria-label="language"
  >
    <option
      v-for="loc in localeStore.available"
      :key="loc"
      :value="loc"
    >
      {{ LOCALE_LABELS[loc] }}
    </option>
  </select>
</template>

<style scoped>
.lang-switcher {
  width: auto;
  padding: 6px 10px;
  font-size: 13px;
}
</style>
