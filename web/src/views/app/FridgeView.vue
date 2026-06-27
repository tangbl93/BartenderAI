<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api, HttpError } from '@/api'
import type { IngredientCategory, Recipe } from '@/api/types'
import { useFridgeStore } from '@/stores/fridge'
import { useLocaleStore } from '@/stores/locale'
import ExampleCard from '@/components/ExampleCard.vue'

const { t } = useI18n()
const router = useRouter()
const fridge = useFridgeStore()
const localeStore = useLocaleStore()

const examples = ref<Recipe[]>([])
const loading = ref(true)
const generating = ref(false)
const error = ref('')

const CATEGORIES: { key: IngredientCategory; label: string }[] = [
  { key: 'base_spirit', label: 'fridge.category.baseSpirit' },
  { key: 'drink', label: 'fridge.category.drink' },
  { key: 'fruit', label: 'fridge.category.fruit' },
  { key: 'snack', label: 'fridge.category.snack' },
]

async function load() {
  loading.value = true
  try {
    const [ings, ex] = await Promise.all([
      api.getIngredients(localeStore.current),
      api.getExamples(localeStore.current),
    ])
    fridge.setIngredients(ings)
    examples.value = ex
  } finally {
    loading.value = false
  }
}

onMounted(load)
// Reload localized names + examples when language changes.
watch(() => localeStore.current, load)

const grouped = computed(() => fridge.byCategory)

async function generate() {
  if (!fridge.canGenerate) return
  error.value = ''
  generating.value = true
  try {
    const recipe = await api.generateRecipe({
      ingredientIds: [...fridge.selectedIds],
      locale: localeStore.current,
    })
    router.push({ name: 'recipe', params: { id: recipe.id } })
  } catch (e) {
    error.value = e instanceof HttpError ? e.message : t('common.error')
  } finally {
    generating.value = false
  }
}

function openExample(id: string) {
  router.push({ name: 'recipe', params: { id } })
}
</script>

<template>
  <section>
    <h1>{{ t('fridge.title') }}</h1>
    <p class="muted">
      {{ t('fridge.subtitle') }}
    </p>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <template v-else>
      <div class="categories grid">
        <div
          v-for="cat in CATEGORIES"
          :key="cat.key"
          class="card"
        >
          <h2>{{ t(cat.label) }}</h2>
          <div class="tags">
            <button
              v-for="ing in grouped[cat.key]"
              :key="ing.id"
              :class="['tag', { selected: fridge.isSelected(ing.id) }]"
              :data-test="`ing-${ing.id}`"
              @click="fridge.toggle(ing.id)"
            >
              <span v-if="fridge.isSelected(ing.id)">✓</span>
              {{ ing.name }}
            </button>
          </div>
        </div>
      </div>

      <!-- Selected list + generate -->
      <div class="card selected-bar">
        <div class="row spread">
          <strong>{{ t('fridge.selected', { count: fridge.selectedCount }) }}</strong>
          <button
            class="btn btn-sm btn-ghost"
            :disabled="!fridge.selectedCount"
            @click="fridge.clear()"
          >
            {{ t('common.action.cancel') }}
          </button>
        </div>
        <div
          v-if="fridge.selectedCount"
          class="tags"
        >
          <button
            v-for="ing in fridge.selectedIngredients"
            :key="ing.id"
            class="tag selected"
            @click="fridge.deselect(ing.id)"
          >
            {{ ing.name }} ✕
          </button>
        </div>
        <p
          v-else
          class="muted"
        >
          {{ t('fridge.selectedEmpty') }}
        </p>

        <p
          v-if="!fridge.canGenerate"
          class="muted hint"
        >
          {{ t('fridge.needMore') }}
        </p>
        <p
          v-if="error"
          class="notice error"
        >
          {{ error }}
        </p>

        <button
          class="btn btn-primary generate"
          data-test="generate"
          :disabled="!fridge.canGenerate || generating"
          @click="generate"
        >
          {{ generating ? t('common.loading') : t('fridge.generate') }}
        </button>
      </div>

      <!-- Example cards -->
      <h2 class="ex-title">
        {{ t('example.card.title') }}
      </h2>
      <div class="examples grid">
        <ExampleCard
          v-for="ex in examples"
          :key="ex.id"
          :recipe="ex"
          @open="openExample"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.categories {
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  margin-top: 18px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.tag {
  color: var(--text);
}
.selected-bar {
  margin-top: 18px;
  position: sticky;
  bottom: 16px;
}
.generate {
  margin-top: 14px;
  width: 100%;
  justify-content: center;
}
.hint {
  margin: 8px 0 0;
  font-size: 13px;
}
.ex-title {
  margin-top: 30px;
}
.examples {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
</style>
