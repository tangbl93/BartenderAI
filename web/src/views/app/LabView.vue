<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api, HttpError } from '@/api'
import type { LabEntry, LabResult } from '@/api/types'

const { t } = useI18n()
const router = useRouter()

const entries = ref<LabEntry[]>([])
const loading = ref(true)
const showForm = ref(false)
const error = ref('')

// form
const recipeId = ref('')
const imageUrl = ref('')
const result = ref<LabResult>('success')
const note = ref('')

async function load() {
  loading.value = true
  try {
    entries.value = await api.listLabEntries()
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function submitForm() {
  error.value = ''
  if (!recipeId.value || !imageUrl.value || !result.value) {
    error.value = t('lab.form.missing')
    return
  }
  try {
    await api.createLabEntry({
      recipeId: recipeId.value,
      imageUrl: imageUrl.value,
      result: result.value,
      note: note.value || undefined,
    })
    recipeId.value = ''
    imageUrl.value = ''
    note.value = ''
    showForm.value = false
    await load()
  } catch (e) {
    error.value = e instanceof HttpError ? e.message : t('common.error')
  }
}

function open(id: string) {
  router.push({ name: 'lab-detail', params: { id } })
}
</script>

<template>
  <section>
    <div class="row spread">
      <h1>{{ t('lab.title') }}</h1>
      <button
        class="btn btn-primary"
        data-test="new-entry"
        @click="showForm = !showForm"
      >
        {{ t('lab.new') }}
      </button>
    </div>

    <!-- check-in form -->
    <div
      v-if="showForm"
      class="card form"
    >
      <label>{{ t('lab.form.recipe') }}</label>
      <input
        v-model="recipeId"
        class="input"
        placeholder="example-mojito"
      >
      <label>{{ t('lab.form.image') }}</label>
      <input
        v-model="imageUrl"
        class="input"
        :placeholder="t('lab.form.imageHint')"
      >
      <label>{{ t('lab.form.result') }}</label>
      <select
        v-model="result"
        class="select"
      >
        <option value="success">
          {{ t('lab.result.success') }}
        </option>
        <option value="fail">
          {{ t('lab.result.fail') }}
        </option>
      </select>
      <label>{{ t('lab.form.note') }}</label>
      <textarea
        v-model="note"
        class="textarea"
      />
      <p
        v-if="error"
        class="notice error"
      >
        {{ error }}
      </p>
      <div class="row">
        <button
          class="btn btn-primary"
          data-test="save-entry"
          @click="submitForm"
        >
          {{ t('common.action.save') }}
        </button>
        <button
          class="btn btn-ghost"
          @click="showForm = false"
        >
          {{ t('common.action.cancel') }}
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
    >
      {{ t('lab.empty') }}
    </p>

    <div
      v-else
      class="entries grid"
    >
      <button
        v-for="e in entries"
        :key="e.id"
        class="card entry"
        @click="open(e.id)"
      >
        <img
          :src="e.imageUrl"
          alt=""
          class="thumb"
        >
        <div class="row spread">
          <strong>{{ e.recipeName || e.recipeId }}</strong>
          <span
            class="badge"
            :class="e.result === 'success' ? 'ok' : 'err'"
          >
            {{ t(`lab.result.${e.result}`) }}
          </span>
        </div>
        <span class="badge status">{{ t(`lab.status.${e.moderationStatus || 'private'}`) }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.form {
  margin: 16px 0;
}
.entries {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 18px;
}
.entry {
  text-align: left;
  color: var(--text);
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
.status {
  align-self: flex-start;
}
</style>
