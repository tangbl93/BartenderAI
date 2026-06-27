<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api, HttpError } from '@/api'
import type { LabEntry } from '@/api/types'

const { t } = useI18n()
const queue = ref<LabEntry[]>([])
const loading = ref(true)
const reasons = ref<Record<string, string>>({})
const errors = ref<Record<string, string>>({})

async function load() {
  loading.value = true
  try {
    queue.value = await api.moderationQueue()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function approve(entry: LabEntry) {
  await api.moderate(entry.id, { decision: 'approve' })
  await load()
}

async function reject(entry: LabEntry) {
  const reason = reasons.value[entry.id]?.trim()
  errors.value[entry.id] = ''
  if (!reason) {
    errors.value[entry.id] = t('admin.moderation.reasonRequired')
    return
  }
  try {
    await api.moderate(entry.id, { decision: 'reject', reason })
    await load()
  } catch (e) {
    errors.value[entry.id] = e instanceof HttpError ? e.message : t('common.error')
  }
}
</script>

<template>
  <section>
    <h1>{{ t('admin.moderation.title') }}</h1>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>
    <p
      v-else-if="!queue.length"
      class="muted"
      data-test="queue-empty"
    >
      {{ t('admin.moderation.empty') }}
    </p>

    <div
      v-else
      class="queue grid"
    >
      <div
        v-for="entry in queue"
        :key="entry.id"
        class="card item"
        :data-test="`mod-${entry.id}`"
      >
        <img
          :src="entry.imageUrl"
          alt=""
          class="thumb"
        >
        <div class="row spread">
          <strong>{{ entry.recipeName || entry.recipeId }}</strong>
          <span
            class="badge"
            :class="entry.result === 'success' ? 'ok' : 'err'"
          >
            {{ t(`lab.result.${entry.result}`) }}
          </span>
        </div>
        <p class="muted">
          {{ entry.note }}
        </p>

        <input
          v-model="reasons[entry.id]"
          class="input"
          :placeholder="t('admin.moderation.reason')"
        >
        <p
          v-if="errors[entry.id]"
          class="notice error"
        >
          {{ errors[entry.id] }}
        </p>

        <div class="row">
          <button
            class="btn btn-primary btn-sm"
            :data-test="`approve-${entry.id}`"
            @click="approve(entry)"
          >
            {{ t('admin.moderation.approve') }}
          </button>
          <button
            class="btn btn-danger btn-sm"
            :data-test="`reject-${entry.id}`"
            @click="reject(entry)"
          >
            {{ t('admin.moderation.reject') }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.queue {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  margin-top: 18px;
}
.item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.thumb {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  background: var(--bg-soft);
}
</style>
