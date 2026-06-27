<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { PosterJob, StyleTemplate } from '@/api/types'
import { useLocaleStore } from '@/stores/locale'

const props = defineProps<{ recipeId: string }>()
const { t } = useI18n()
const localeStore = useLocaleStore()

const templates = ref<StyleTemplate[]>([])
const selectedTemplateIds = ref<string[]>([])
const job = ref<PosterJob | null>(null)
const loading = ref(true)
const starting = ref(false)
const notice = ref('')
let pollTimer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  templates.value = await api.getTemplates()
  // Default selection = the three built-in dimensions.
  selectedTemplateIds.value = templates.value
    .filter((t2) => t2.dimension !== 'custom')
    .map((t2) => t2.id)
  loading.value = false
})

onBeforeUnmount(stopPolling)

function toggleTemplate(id: string) {
  const idx = selectedTemplateIds.value.indexOf(id)
  if (idx >= 0) selectedTemplateIds.value.splice(idx, 1)
  else selectedTemplateIds.value.push(id)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    if (!job.value) return
    job.value = await api.getPosterJob(job.value.id)
    if (job.value.status === 'done' || job.value.status === 'failed') stopPolling()
  }, 700)
}

async function generate() {
  starting.value = true
  try {
    job.value = await api.createPosterJob({
      recipeId: props.recipeId,
      templateIds: [...selectedTemplateIds.value],
      locale: localeStore.current,
    })
    startPolling()
  } finally {
    starting.value = false
  }
}

async function retry(posterId: string) {
  await api.retryPoster(posterId)
  startPolling()
}

const donePosters = computed(() => job.value?.posters.filter((p) => p.status === 'done') ?? [])

function saveOne(url?: string) {
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = 'poster.svg'
  a.click()
}

function saveAll() {
  donePosters.value.forEach((p) => saveOne(p.imageUrl))
}

async function share(url?: string) {
  if (!url) return
  try {
    await navigator.clipboard?.writeText(url)
  } catch {
    /* clipboard may be unavailable */
  }
  notice.value = t('poster.shareCopied')
  setTimeout(() => (notice.value = ''), 1800)
}
</script>

<template>
  <section>
    <h1>{{ t('poster.title') }}</h1>
    <p class="muted">
      {{ t('poster.subtitle') }}
    </p>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <template v-else>
      <!-- Style template selection -->
      <div class="card">
        <h2>{{ t('poster.selectStyles') }}</h2>
        <div class="tags">
          <button
            v-for="tpl in templates"
            :key="tpl.id"
            :class="['tag', { selected: selectedTemplateIds.includes(tpl.id) }]"
            :data-test="`tpl-${tpl.id}`"
            @click="toggleTemplate(tpl.id)"
          >
            {{ tpl.name }}
          </button>
        </div>
        <button
          class="btn btn-primary generate"
          data-test="generate-posters"
          :disabled="!selectedTemplateIds.length || starting"
          @click="generate"
        >
          {{ t('poster.generate') }}
        </button>
      </div>

      <p
        v-if="notice"
        class="notice success"
      >
        {{ notice }}
      </p>

      <!-- Job progress + preview grid -->
      <div
        v-if="job"
        class="job"
      >
        <div class="row spread">
          <span
            class="badge"
            :class="{ ok: job.status === 'done', warn: job.status === 'partial' || job.status === 'running', err: job.status === 'failed' }"
          >
            {{ t(`poster.status.${job.status}`) }}
          </span>
          <button
            class="btn btn-sm"
            :disabled="!donePosters.length"
            @click="saveAll"
          >
            {{ t('poster.saveAll') }}
          </button>
        </div>

        <div class="posters grid">
          <div
            v-for="poster in job.posters"
            :key="poster.id"
            class="card poster"
            :data-test="`poster-${poster.dimension}`"
          >
            <div class="row spread">
              <strong>{{ t(`poster.dimension.${poster.dimension}`) }}</strong>
              <span
                class="badge"
                :class="{ ok: poster.status === 'done', warn: poster.status === 'running' || poster.status === 'pending', err: poster.status === 'failed' }"
              >
                {{ t(`poster.status.${poster.status}`) }}
              </span>
            </div>

            <div class="preview">
              <img
                v-if="poster.status === 'done' && poster.imageUrl"
                :src="poster.imageUrl"
                :alt="poster.dimension"
              >
              <div
                v-else-if="poster.status === 'failed'"
                class="failed"
              >
                ⚠️
              </div>
              <div
                v-else
                class="spinner"
              >
                …
              </div>
            </div>

            <div class="row poster-actions">
              <template v-if="poster.status === 'done'">
                <button
                  class="btn btn-sm"
                  @click="saveOne(poster.imageUrl)"
                >
                  {{ t('poster.save') }}
                </button>
                <button
                  class="btn btn-sm"
                  @click="share(poster.imageUrl)"
                >
                  {{ t('poster.share') }}
                </button>
              </template>
              <button
                v-else-if="poster.status === 'failed'"
                class="btn btn-sm btn-primary"
                :data-test="`retry-${poster.id}`"
                @click="retry(poster.id)"
              >
                {{ t('poster.retry') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.tag {
  color: var(--text);
}
.generate {
  margin-top: 14px;
}
.job {
  margin-top: 20px;
}
.posters {
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  margin-top: 12px;
}
.preview {
  aspect-ratio: 4 / 5;
  background: var(--bg-soft);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
  overflow: hidden;
}
.preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.failed {
  font-size: 32px;
}
.spinner {
  font-size: 28px;
  color: var(--text-dim);
}
.poster-actions {
  min-height: 32px;
}
</style>
