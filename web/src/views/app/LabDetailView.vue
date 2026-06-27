<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api, HttpError } from '@/api'
import type { LabEntry, LabResult } from '@/api/types'

const props = defineProps<{ id: string }>()
const { t } = useI18n()
const router = useRouter()

const entry = ref<LabEntry | null>(null)
const loading = ref(true)
const editing = ref(false)
const error = ref('')
const notice = ref('')

// edit fields
const imageUrl = ref('')
const result = ref<LabResult>('success')
const note = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    entry.value = await api.getLabEntry(props.id)
    imageUrl.value = entry.value.imageUrl
    result.value = entry.value.result
    note.value = entry.value.note || ''
  } catch (e) {
    error.value = e instanceof HttpError ? e.message : t('common.error')
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function save() {
  if (!entry.value) return
  try {
    await api.updateLabEntry(entry.value.id, {
      recipeId: entry.value.recipeId,
      imageUrl: imageUrl.value,
      result: result.value,
      note: note.value || undefined,
    })
    editing.value = false
    await load()
  } catch (e) {
    error.value = e instanceof HttpError ? e.message : t('common.error')
  }
}

async function remove() {
  if (!entry.value) return
  if (!confirm(t('lab.confirmDelete'))) return
  await api.deleteLabEntry(entry.value.id)
  router.push({ name: 'lab' })
}

async function submitToWall() {
  if (!entry.value) return
  await api.submitLabEntry(entry.value.id)
  notice.value = t('lab.submitted')
  await load()
}
</script>

<template>
  <section>
    <RouterLink
      to="/app/lab"
      class="muted"
    >
      ← {{ t('lab.title') }}
    </RouterLink>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>
    <p
      v-else-if="error"
      class="notice error"
    >
      {{ error }}
    </p>

    <template v-else-if="entry">
      <div class="card detail">
        <img
          :src="entry.imageUrl"
          alt=""
          class="hero"
        >
        <div class="row spread">
          <h1>{{ entry.recipeName || entry.recipeId }}</h1>
          <span
            class="badge"
            :class="entry.result === 'success' ? 'ok' : 'err'"
          >
            {{ t(`lab.result.${entry.result}`) }}
          </span>
        </div>
        <p>{{ entry.note }}</p>
        <span class="badge">{{ t(`lab.status.${entry.moderationStatus || 'private'}`) }}</span>

        <div
          v-if="editing"
          class="edit"
        >
          <label>{{ t('lab.form.image') }}</label>
          <input
            v-model="imageUrl"
            class="input"
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
          <div class="row">
            <button
              class="btn btn-primary"
              @click="save"
            >
              {{ t('common.action.save') }}
            </button>
            <button
              class="btn btn-ghost"
              @click="editing = false"
            >
              {{ t('common.action.cancel') }}
            </button>
          </div>
        </div>

        <div
          v-else
          class="row actions"
        >
          <button
            class="btn"
            @click="editing = true"
          >
            {{ t('common.action.edit') }}
          </button>
          <button
            class="btn btn-danger"
            @click="remove"
          >
            {{ t('common.action.delete') }}
          </button>
          <button
            v-if="entry.moderationStatus === 'private' || entry.moderationStatus === 'rejected'"
            class="btn btn-primary"
            data-test="submit-wall"
            @click="submitToWall"
          >
            {{ t('lab.submitWall') }}
          </button>
        </div>

        <p
          v-if="notice"
          class="notice success"
        >
          {{ notice }}
        </p>
      </div>
    </template>
  </section>
</template>

<style scoped>
.detail {
  margin-top: 14px;
}
.hero {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  border-radius: 10px;
  background: var(--bg-soft);
}
.actions,
.edit {
  margin-top: 14px;
}
</style>
