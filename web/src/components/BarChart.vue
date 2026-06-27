<script setup lang="ts">
import { computed } from 'vue'
import type { RankItem } from '@/api/types'

const props = defineProps<{ items: RankItem[] }>()

const max = computed(() => Math.max(1, ...props.items.map((i) => i.count)))
</script>

<template>
  <div class="chart">
    <div
      v-for="item in items"
      :key="item.name"
      class="bar-row"
    >
      <span class="name">{{ item.name }}</span>
      <div class="track">
        <div
          class="fill"
          :style="{ width: (item.count / max) * 100 + '%' }"
        />
      </div>
      <span class="count">{{ item.count }}</span>
    </div>
  </div>
</template>

<style scoped>
.chart {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bar-row {
  display: grid;
  grid-template-columns: 140px 1fr 44px;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.name {
  color: var(--text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.track {
  background: var(--bg-soft);
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
}
.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent), var(--primary));
  border-radius: 999px;
}
.count {
  text-align: right;
  font-weight: 700;
}
</style>
