<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from '@/api'
import type { Dashboard } from '@/api/types'
import BarChart from '@/components/BarChart.vue'

const { t } = useI18n()
const data = ref<Dashboard | null>(null)
const loading = ref(true)
const from = ref('')
const to = ref('')

async function load() {
  loading.value = true
  try {
    data.value = await api.dashboard(from.value || undefined, to.value || undefined)
  } finally {
    loading.value = false
  }
}
onMounted(load)
</script>

<template>
  <section>
    <div class="row spread">
      <h1>{{ t('admin.dashboard.title') }}</h1>
      <div class="row">
        <input
          v-model="from"
          class="input date"
          type="date"
        >
        <input
          v-model="to"
          class="input date"
          type="date"
        >
        <button
          class="btn btn-sm btn-primary"
          @click="load"
        >
          {{ t('common.action.confirm') }}
        </button>
      </div>
    </div>

    <p
      v-if="loading"
      class="muted"
    >
      {{ t('common.loading') }}
    </p>

    <template v-else-if="data">
      <div class="metrics grid">
        <div class="card metric">
          <span class="muted">{{ t('admin.dashboard.recipeCount') }}</span>
          <strong data-test="recipe-count">{{ data.recipeCount }}</strong>
        </div>
        <div class="card metric">
          <span class="muted">{{ t('admin.dashboard.posterCount') }}</span>
          <strong>{{ data.posterCount }}</strong>
        </div>
        <div class="card metric">
          <span class="muted">{{ t('admin.dashboard.submissionCount') }}</span>
          <strong>{{ data.submissionCount }}</strong>
        </div>
        <div class="card metric">
          <span class="muted">{{ t('admin.dashboard.approvalRate') }}</span>
          <strong>{{ Math.round(data.approvalRate * 100) }}%</strong>
        </div>
      </div>

      <div class="charts grid">
        <div class="card">
          <h2>{{ t('admin.dashboard.topIngredients') }}</h2>
          <BarChart :items="data.topIngredients" />
        </div>
        <div class="card">
          <h2>{{ t('admin.dashboard.topStyles') }}</h2>
          <BarChart :items="data.topStyles" />
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.date {
  width: auto;
  padding: 6px 10px;
}
.metrics {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  margin: 18px 0;
}
.metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.metric strong {
  font-size: 30px;
  color: var(--primary-soft);
}
.charts {
  grid-template-columns: 1fr 1fr;
}
@media (max-width: 800px) {
  .charts {
    grid-template-columns: 1fr;
  }
}
</style>
