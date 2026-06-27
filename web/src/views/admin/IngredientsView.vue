<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { Ingredient, IngredientCategory, IngredientDto, LocaleCode } from '@/api/types'
import { SUPPORTED_LOCALES } from '@/i18n'

const { t } = useI18n()
const items = ref<Ingredient[]>([])
const loading = ref(true)
const showForm = ref(false)
const editingId = ref<string | null>(null)

const CATEGORIES: IngredientCategory[] = ['base_spirit', 'drink', 'fruit', 'snack']
const CATEGORY_LABEL: Record<IngredientCategory, string> = {
  base_spirit: 'fridge.category.baseSpirit',
  drink: 'fridge.category.drink',
  fruit: 'fridge.category.fruit',
  snack: 'fridge.category.snack',
}

const form = reactive<{ category: IngredientCategory; enabled: boolean; names: Record<string, string> }>({
  category: 'base_spirit',
  enabled: true,
  names: { en: '', 'zh-CN': '', 'zh-TW': '', ja: '', ko: '' },
})

async function load() {
  loading.value = true
  try {
    items.value = await api.adminListIngredients()
  } finally {
    loading.value = false
  }
}
onMounted(load)

function resetForm() {
  form.category = 'base_spirit'
  form.enabled = true
  form.names = { en: '', 'zh-CN': '', 'zh-TW': '', ja: '', ko: '' }
  editingId.value = null
}

function openCreate() {
  resetForm()
  showForm.value = true
}

function openEdit(item: Ingredient) {
  // We only know the resolved (en) name on the admin list; seed en and let admin fill the rest.
  resetForm()
  editingId.value = item.id
  form.category = item.category
  form.enabled = item.enabled
  form.names.en = item.name
  showForm.value = true
}

async function save() {
  const dto: IngredientDto = { category: form.category, names: { ...form.names }, enabled: form.enabled }
  if (editingId.value) await api.adminUpdateIngredient(editingId.value, dto)
  else await api.adminCreateIngredient(dto)
  showForm.value = false
  resetForm()
  await load()
}

async function toggleEnabled(item: Ingredient) {
  await api.adminUpdateIngredient(item.id, {
    category: item.category,
    names: { en: item.name },
    enabled: !item.enabled,
  })
  await load()
}

async function remove(item: Ingredient) {
  await api.adminDeleteIngredient(item.id)
  await load()
}
</script>

<template>
  <section>
    <div class="row spread">
      <h1>{{ t('admin.ingredient.title') }}</h1>
      <button
        class="btn btn-primary"
        data-test="add-ingredient"
        @click="openCreate"
      >
        {{ t('admin.ingredient.add') }}
      </button>
    </div>

    <div
      v-if="showForm"
      class="card form"
    >
      <label>{{ t('admin.ingredient.category') }}</label>
      <select
        v-model="form.category"
        class="select"
      >
        <option
          v-for="c in CATEGORIES"
          :key="c"
          :value="c"
        >
          {{ t(CATEGORY_LABEL[c]) }}
        </option>
      </select>

      <label>{{ t('admin.ingredient.names') }}</label>
      <div class="names-grid">
        <div
          v-for="loc in SUPPORTED_LOCALES"
          :key="loc"
        >
          <span class="muted small">{{ loc }}</span>
          <input
            v-model="form.names[loc as LocaleCode]"
            class="input"
          >
        </div>
      </div>

      <label class="check">
        <input
          v-model="form.enabled"
          type="checkbox"
        > {{ t('admin.ingredient.enabled') }}
      </label>

      <div class="row">
        <button
          class="btn btn-primary"
          data-test="save-ingredient"
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

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <table
      v-else
      class="card-table"
    >
      <thead>
        <tr>
          <th>{{ t('admin.ingredient.name') }}</th>
          <th>{{ t('admin.ingredient.category') }}</th>
          <th>{{ t('admin.ingredient.enabled') }}</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="item in items"
          :key="item.id"
        >
          <td>{{ item.name }}</td>
          <td>{{ t(CATEGORY_LABEL[item.category]) }}</td>
          <td>
            <span
              class="badge"
              :class="item.enabled ? 'ok' : 'err'"
            >
              {{ item.enabled ? t('admin.ingredient.enabled') : t('admin.ingredient.disabled') }}
            </span>
          </td>
          <td class="actions">
            <button
              class="btn btn-sm"
              @click="openEdit(item)"
            >
              {{ t('common.action.edit') }}
            </button>
            <button
              class="btn btn-sm"
              @click="toggleEnabled(item)"
            >
              {{ item.enabled ? t('admin.ingredient.disabled') : t('admin.ingredient.enabled') }}
            </button>
            <button
              class="btn btn-sm btn-danger"
              @click="remove(item)"
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
.names-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}
.small {
  font-size: 12px;
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
</style>
