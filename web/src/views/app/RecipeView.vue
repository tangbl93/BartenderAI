<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { Recipe } from '@/api/types'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{ id: string }>()
const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    recipe.value = await api.getRecipe(props.id)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.id, load)

function makePoster() {
  if (!recipe.value) return
  if (!auth.isAuthenticated) {
    router.push({ name: 'login', query: { redirect: `/app/poster/${recipe.value.id}` } })
    return
  }
  router.push({ name: 'poster', params: { recipeId: recipe.value.id } })
}
</script>

<template>
  <section>
    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <template v-else-if="recipe">
      <div class="row spread head">
        <div>
          <span
            v-if="recipe.isExample"
            class="badge warn"
          >{{ t('recipe.example') }}</span>
          <h1 data-test="recipe-name">
            {{ recipe.name }}
          </h1>
          <p class="muted tagline">
            {{ recipe.tagline }}
          </p>
        </div>
        <button
          class="btn btn-primary"
          data-test="make-poster"
          @click="makePoster"
        >
          {{ t('recipe.makePoster') }}
        </button>
      </div>

      <div class="grid layout">
        <!-- Items & ratios -->
        <div class="card">
          <h2>{{ t('recipe.items') }}</h2>
          <table>
            <tbody>
              <tr
                v-for="item in recipe.items"
                :key="item.ingredientId"
              >
                <td>
                  {{ item.name }}
                  <span
                    v-if="item.optional"
                    class="muted"
                  >({{ t('common.no') }})</span>
                </td>
                <td class="amount">
                  {{ item.amount }}
                </td>
              </tr>
            </tbody>
          </table>
          <p class="muted alcohol">
            {{ t('recipe.alcohol') }}: {{ recipe.alcoholRange }}
          </p>
        </div>

        <!-- Steps -->
        <div class="card">
          <h2>{{ t('recipe.steps') }}</h2>
          <ol>
            <li
              v-for="(step, i) in recipe.steps"
              :key="i"
            >
              {{ step }}
            </li>
          </ol>
        </div>
      </div>

      <!-- Nanny-level guide: tool substitutions -->
      <div
        v-if="recipe.toolSubstitutions.length"
        class="card"
      >
        <h2>{{ t('recipe.guide') }} · {{ t('recipe.tools') }}</h2>
        <table>
          <thead>
            <tr>
              <th>{{ t('recipe.toolHeader') }}</th>
              <th>{{ t('recipe.homeAlt') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(sub, i) in recipe.toolSubstitutions"
              :key="i"
            >
              <td>{{ sub.tool }}</td>
              <td>{{ sub.homeAlternative }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Safety -->
      <div class="card safety">
        <h2>{{ t('recipe.safety') }}</h2>
        <ul>
          <li
            v-for="(note, i) in recipe.safetyNotes"
            :key="i"
          >
            {{ note }}
          </li>
        </ul>
        <p class="notice success">
          {{ t('recipe.result.alcoholHint') }}
        </p>
      </div>
    </template>

    <p
      v-else
      class="muted"
    >
      {{ t('common.empty') }}
    </p>
  </section>
</template>

<style scoped>
.head {
  align-items: flex-start;
  margin-bottom: 18px;
}
.tagline {
  font-size: 15px;
}
.layout {
  grid-template-columns: 1fr 1fr;
  margin-bottom: 16px;
}
.amount {
  text-align: right;
  font-weight: 700;
  color: var(--primary-soft);
}
.alcohol {
  margin-top: 12px;
}
ol,
ul {
  margin: 0;
  padding-left: 20px;
  line-height: 1.7;
}
.safety {
  margin-top: 16px;
}
@media (max-width: 720px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
