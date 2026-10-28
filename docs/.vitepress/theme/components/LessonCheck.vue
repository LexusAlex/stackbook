<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { matchesAnswer } from '../practice.ts'

const props = withDefaults(defineProps<{
  question: string
  options?: string[]
  correct?: number
  answers?: string[]
  explanation: string
  placeholder?: string
  lang?: 'ru' | 'en'
}>(), { lang: 'ru' })

const id = useId()
const value = ref('')
const selected = ref<number | null>(null)
const result = ref<'correct' | 'wrong' | 'empty' | null>(null)
const english = computed(() => props.lang === 'en')
const feedback = computed(() => {
  if (result.value === 'empty') return english.value ? 'Type an answer first.' : 'Сначала введите ответ.'
  if (result.value === 'correct') return english.value ? 'Correct!' : 'Верно!'
  return english.value ? 'Not quite. Try again or open the hint.' : 'Пока не так. Попробуйте ещё раз или откройте подсказку.'
})

function choose(index: number) {
  selected.value = index
  result.value = index === props.correct ? 'correct' : 'wrong'
}

function check() {
  result.value = !value.value.trim() ? 'empty'
    : matchesAnswer(value.value, props.answers ?? []) ? 'correct' : 'wrong'
}
</script>

<template>
  <section class="lesson-check" :aria-labelledby="id">
    <p :id="id" class="question">{{ question }}</p>
    <div v-if="options" class="options" role="group" :aria-labelledby="id">
      <button v-for="(option, index) in options" :key="option" type="button"
        :aria-pressed="selected === index" @click="choose(index)">{{ option }}</button>
    </div>
    <form v-else @submit.prevent="check">
      <label class="answer-label" :for="`${id}-answer`">{{ english ? 'Your answer' : 'Ваш ответ' }}</label>
      <div class="answer-row">
        <input :id="`${id}-answer`" v-model="value" :placeholder="placeholder" :aria-describedby="id" type="text"
          autocomplete="off" spellcheck="false" @input="result = null">
        <button type="submit">{{ english ? 'Check' : 'Проверить' }}</button>
      </div>
    </form>
    <p class="feedback" :class="result" role="status" aria-live="polite">
      <template v-if="result">{{ feedback }} <span v-if="result === 'correct'">{{ explanation }}</span></template>
    </p>
    <details v-if="result === 'wrong'" class="hint">
      <summary>{{ english ? 'Show hint' : 'Показать подсказку' }}</summary>
      <p>{{ explanation }}</p>
    </details>
  </section>
</template>

<style scoped>
.lesson-check { margin: 20px 0; padding: 20px; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
.question { margin: 0 0 12px; font-weight: 600; }
.options, .answer-row { display: flex; flex-wrap: wrap; gap: 10px; }
button { padding: 9px 16px; border: 1px solid var(--vp-c-brand-1); border-radius: 8px; color: var(--vp-c-brand-1); background: var(--vp-c-bg); font: inherit; cursor: pointer; }
button:hover, button[aria-pressed="true"] { background: var(--vp-c-brand-soft); }
button:focus-visible, input:focus-visible, summary:focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 3px; }
.answer-label { display: block; margin-bottom: 6px; }
input { flex: 1; min-width: 0; width: 100%; padding: 10px 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px; color: var(--vp-c-text-1); background: var(--vp-c-bg); font: inherit; }
.feedback { margin: 12px 0 0; }
.feedback:empty { margin: 0; }
.correct { color: var(--vp-c-tip-1); }
.wrong, .empty { color: var(--vp-c-text-1); }
.hint { margin-top: 12px; }
.hint p { margin-bottom: 0; }
@media (max-width: 480px) { .lesson-check { padding: 16px; } .answer-row { flex-direction: column; } }
</style>
