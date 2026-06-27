<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { LabEntry, WallSort } from '@/api/types'

const { t } = useI18n()
const entries = ref<LabEntry[]>([])
const loading = ref(true)
const sort = ref<WallSort>('time')

async function load() {
  loading.value = true
  try {
    entries.value = await api.getWall(sort.value)
  } finally {
    loading.value = false
  }
}
onMounted(load)
watch(sort, load)
</script>

<template>
  <section>
    <div class="row spread">
      <h1>{{ t('wall.title') }}</h1>
      <div class="row sorts">
        <button
          :class="['btn', 'btn-sm', { 'btn-primary': sort === 'hot' }]"
          data-test="sort-hot"
          @click="sort = 'hot'"
        >
          {{ t('wall.sort.hot') }}
        </button>
        <button
          :class="['btn', 'btn-sm', { 'btn-primary': sort === 'time' }]"
          data-test="sort-time"
          @click="sort = 'time'"
        >
          {{ t('wall.sort.time') }}
        </button>
      </div>
    </div>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>
    <p
      v-else-if="!entries.length"
      class="muted"
      data-test="wall-empty"
    >
      {{ t('wall.empty') }}
    </p>

    <div
      v-else
      class="wall grid"
    >
      <div
        v-for="e in entries"
        :key="e.id"
        class="card item"
      >
        <img
          :src="e.imageUrl"
          alt=""
          class="thumb"
        >
        <div class="row spread">
          <strong>{{ e.recipeName || e.recipeId }}</strong>
          <span class="muted">♥ {{ e.likes || 0 }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.wall {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 18px;
}
.thumb {
  width: 100%;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-soft);
  margin-bottom: 8px;
}
</style>
