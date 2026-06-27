<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { Recipe } from '@/api/types'

defineProps<{ recipe: Recipe }>()
defineEmits<{ (e: 'open', id: string): void }>()
const { t } = useI18n()
</script>

<template>
  <button
    class="example card"
    data-test="example-card"
    @click="$emit('open', recipe.id)"
  >
    <div class="row spread">
      <span class="badge warn">{{ t('recipe.example') }}</span>
      <span class="muted">{{ recipe.alcoholRange }}</span>
    </div>
    <h3>{{ recipe.name }}</h3>
    <p class="muted tagline">
      {{ recipe.tagline }}
    </p>
    <div class="ings">
      <span
        v-for="item in recipe.items.slice(0, 4)"
        :key="item.ingredientId"
        class="tag"
      >
        {{ item.name }}
      </span>
    </div>
  </button>
</template>

<style scoped>
.example {
  text-align: left;
  color: var(--text);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.example:hover {
  border-color: var(--primary);
}
.tagline {
  font-size: 14px;
}
.ings {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
</style>
