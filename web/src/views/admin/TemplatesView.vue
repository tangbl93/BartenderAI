<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type {
  StyleTemplate,
  StyleTemplateDto,
  TemplateDimension,
  TextAlign,
  TextRenderMode,
  WatermarkPosition,
} from '@/api/types'

const { t } = useI18n()
const items = ref<StyleTemplate[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)
const previewUrl = ref('')

const DIMENSIONS: TemplateDimension[] = ['home_closeup', 'bar_commercial', 'steps_long', 'custom']
const ALIGNS: TextAlign[] = ['left', 'center', 'right']
const WATERMARKS: WatermarkPosition[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']
const RENDER_MODES: TextRenderMode[] = ['model', 'backend']

const form = reactive<{
  name: string
  dimension: TemplateDimension
  prompt: string
  textAlign: TextAlign
  watermarkPosition: WatermarkPosition
  textRenderMode: TextRenderMode
  enabled: boolean
}>({
  name: '',
  dimension: 'custom',
  prompt: '',
  textAlign: 'center',
  watermarkPosition: 'bottom-right',
  textRenderMode: 'backend',
  enabled: true,
})

async function load() {
  loading.value = true
  try {
    items.value = await api.adminListTemplates()
  } finally {
    loading.value = false
  }
}
onMounted(load)

function resetForm() {
  Object.assign(form, {
    name: '',
    dimension: 'custom',
    prompt: '',
    textAlign: 'center',
    watermarkPosition: 'bottom-right',
    textRenderMode: 'backend',
    enabled: true,
  })
  editingId.value = null
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(tpl: StyleTemplate) {
  editingId.value = tpl.id
  form.name = tpl.name
  form.dimension = tpl.dimension
  form.prompt = tpl.prompt
  form.textAlign = tpl.layout?.textAlign || 'center'
  form.watermarkPosition = tpl.layout?.watermarkPosition || 'bottom-right'
  form.textRenderMode = tpl.textRenderMode || 'backend'
  form.enabled = tpl.enabled
  showForm.value = true
}

async function save() {
  const dto: StyleTemplateDto = {
    name: form.name,
    dimension: form.dimension,
    prompt: form.prompt,
    layout: { textAlign: form.textAlign, watermarkPosition: form.watermarkPosition },
    textRenderMode: form.textRenderMode,
    enabled: form.enabled,
  }
  if (editingId.value) await api.adminUpdateTemplate(editingId.value, dto)
  else await api.adminCreateTemplate(dto)
  showForm.value = false
  resetForm()
  await load()
}

async function remove(tpl: StyleTemplate) {
  await api.adminDeleteTemplate(tpl.id)
  await load()
}

async function preview(tpl: StyleTemplate) {
  const res = await api.adminPreviewTemplate(tpl.id)
  previewUrl.value = res.previewUrl
}
</script>

<template>
  <section>
    <div class="row spread">
      <h1>{{ t('admin.template.title') }}</h1>
      <button
        class="btn btn-primary"
        data-test="add-template"
        @click="openCreate"
      >
        {{ t('admin.template.add') }}
      </button>
    </div>

    <div
      v-if="showForm"
      class="card form"
    >
      <label>{{ t('admin.template.name') }}</label>
      <input
        v-model="form.name"
        class="input"
      >

      <label>{{ t('admin.template.dimension') }}</label>
      <select
        v-model="form.dimension"
        class="select"
      >
        <option
          v-for="d in DIMENSIONS"
          :key="d"
          :value="d"
        >
          {{ d }}
        </option>
      </select>

      <label>{{ t('admin.template.prompt') }}</label>
      <textarea
        v-model="form.prompt"
        class="textarea"
      />

      <div class="layout-grid">
        <div>
          <label>{{ t('admin.template.textAlign') }}</label>
          <select
            v-model="form.textAlign"
            class="select"
            data-test="text-align"
          >
            <option
              v-for="a in ALIGNS"
              :key="a"
              :value="a"
            >
              {{ t(`layout.align.${a}`) }}
            </option>
          </select>
        </div>
        <div>
          <label>{{ t('admin.template.watermark') }}</label>
          <select
            v-model="form.watermarkPosition"
            class="select"
            data-test="watermark"
          >
            <option
              v-for="w in WATERMARKS"
              :key="w"
              :value="w"
            >
              {{ t(`layout.watermark.${w}`) }}
            </option>
          </select>
        </div>
        <div>
          <label>{{ t('admin.template.renderMode') }}</label>
          <select
            v-model="form.textRenderMode"
            class="select"
          >
            <option
              v-for="m in RENDER_MODES"
              :key="m"
              :value="m"
            >
              {{ m === 'model' ? t('admin.template.renderModel') : t('admin.template.renderBackend') }}
            </option>
          </select>
        </div>
      </div>

      <label class="check">
        <input
          v-model="form.enabled"
          type="checkbox"
        > {{ t('admin.template.enabled') }}
      </label>

      <div class="row">
        <button
          class="btn btn-primary"
          data-test="save-template"
          @click="save"
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

    <div
      v-if="previewUrl"
      class="card preview-box"
    >
      <div class="row spread">
        <strong>{{ t('admin.template.preview') }}</strong>
        <button
          class="btn btn-sm btn-ghost"
          @click="previewUrl = ''"
        >
          {{ t('common.action.close') }}
        </button>
      </div>
      <img
        :src="previewUrl"
        alt="preview"
        class="preview-img"
      >
    </div>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>{{ t('admin.template.name') }}</th>
          <th>{{ t('admin.template.dimension') }}</th>
          <th>{{ t('admin.template.renderMode') }}</th>
          <th>{{ t('admin.template.version') }}</th>
          <th>{{ t('admin.template.enabled') }}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="tpl in items"
          :key="tpl.id"
        >
          <td>{{ tpl.name }}</td>
          <td>{{ tpl.dimension }}</td>
          <td>{{ tpl.textRenderMode }}</td>
          <td>v{{ tpl.version }}</td>
          <td>
            <span
              class="badge"
              :class="tpl.enabled ? 'ok' : 'err'"
            >{{ tpl.enabled ? '●' : '○' }}</span>
          </td>
          <td class="actions">
            <button
              class="btn btn-sm"
              @click="preview(tpl)"
            >
              {{ t('admin.template.preview') }}
            </button>
            <button
              class="btn btn-sm"
              @click="openEdit(tpl)"
            >
              {{ t('common.action.edit') }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="remove(tpl)"
            >
              {{ t('common.action.delete') }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.form {
  margin: 16px 0;
}
.layout-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.check {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 14px;
}
.actions {
  display: flex;
  gap: 6px;
  justify-content: flex-end;
}
.preview-box {
  margin: 14px 0;
}
.preview-img {
  max-width: 240px;
  border-radius: 8px;
  margin-top: 10px;
}
</style>
