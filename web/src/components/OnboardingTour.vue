<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useOnboardingStore } from '@/stores/onboarding'

const onboarding = useOnboardingStore()
const { t } = useI18n()

const steps = computed(() => [
  { title: t('onboarding.step.selectIngredients'), body: t('onboarding.step.selectIngredientsBody'), icon: '🧊' },
  { title: t('onboarding.step.recipe'), body: t('onboarding.step.recipeBody'), icon: '🍹' },
  { title: t('onboarding.step.poster'), body: t('onboarding.step.posterBody'), icon: '🖼️' },
  { title: t('onboarding.step.checkin'), body: t('onboarding.step.checkinBody'), icon: '📸' },
])

const index = ref(0)

function next() {
  if (index.value < steps.value.length - 1) index.value += 1
  else finish()
}
function finish() {
  index.value = 0
  onboarding.finish()
}
function skip() {
  index.value = 0
  onboarding.skip()
}
</script>

<template>
  <div
    v-if="onboarding.open"
    class="overlay"
    role="dialog"
    aria-modal="true"
  >
    <div class="tour card">
      <h2>{{ t('onboarding.title') }}</h2>
      <div class="step">
        <div class="icon">
          {{ steps[index].icon }}
        </div>
        <h3>{{ index + 1 }}. {{ steps[index].title }}</h3>
        <p class="muted">
          {{ steps[index].body }}
        </p>
      </div>
      <div class="dots">
        <span
          v-for="(s, i) in steps"
          :key="i"
          :class="['dot', { active: i === index }]"
        />
      </div>
      <div class="row spread">
        <button
          class="btn btn-ghost"
          data-test="skip"
          @click="skip"
        >
          {{ t('common.skip') }}
        </button>
        <button
          class="btn btn-primary"
          data-test="next"
          @click="next"
        >
          {{ index < steps.length - 1 ? t('common.next') : t('common.done') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
}
.tour {
  width: 100%;
  max-width: 420px;
}
.step {
  text-align: center;
  padding: 18px 0;
}
.icon {
  font-size: 46px;
}
.dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin: 8px 0 18px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border);
}
.dot.active {
  background: var(--primary);
}
</style>
