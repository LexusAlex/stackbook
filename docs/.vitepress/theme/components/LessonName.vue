<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { matchesAnswer, namePractice } from '../practice.ts'

const props = withDefaults(defineProps<{ mode?: 'introduction' | 'alphabet'; lang?: 'ru' | 'en' }>(), {
  mode: 'introduction', lang: 'ru'
})
const id = useId()
const name = ref('Alex')
const show = ref(true)
const answer = ref('')
const result = ref<'correct' | 'wrong' | 'empty' | null>(null)
const english = computed(() => props.lang === 'en')
const practice = computed(() => namePractice(name.value))
const model = computed(() => props.mode === 'alphabet' ? practice.value?.letters : practice.value?.introduction)
const feedback = computed(() => result.value === 'correct'
  ? (english.value ? 'Correct! You used your own name.' : 'Верно! Получилась фраза с вашим именем.')
  : result.value === 'empty' ? (english.value ? 'Type your phrase first.' : 'Сначала напишите фразу.')
    : (english.value ? 'Compare the words and their order with the model, then try again.' : 'Сравните слова и их порядок с образцом, затем попробуйте ещё раз.'))

watch(name, () => { answer.value = ''; result.value = null })

function check() {
  if (!practice.value) return
  const trimmed = name.value.trim().replace(/\s+/g, ' ')
  result.value = !answer.value.trim() ? 'empty' : matchesAnswer(answer.value, [
    practice.value.introduction, `Hi! My name is ${trimmed}.`, `My name's ${trimmed}.`, `My name is ${trimmed}.`
  ]) ? 'correct' : 'wrong'
}
</script>

<template>
  <section class="lesson-name" :aria-label="english ? 'Practise with your name' : 'Тренировка со своим именем'">
    <label :for="`${id}-name`">{{ english ? 'Your name in Latin letters (or keep Alex)' : 'Ваше имя латинскими буквами (или оставьте Alex)' }}</label>
    <input :id="`${id}-name`" v-model="name" type="text" maxlength="60" autocomplete="off" spellcheck="false" :aria-invalid="!practice">
    <p v-if="!practice" role="status">{{ english ? 'Use Latin letters, for example Anna or Anna-Maria.' : 'Введите имя латинскими буквами, например Anna или Anna-Maria.' }}</p>
    <template v-else>
      <button type="button" :aria-expanded="show" :aria-controls="`${id}-model`" @click="show = !show">{{ show ? (english ? 'Hide model' : 'Скрыть образец') : (english ? 'Show model' : 'Показать образец') }}</button>
      <p :id="`${id}-model`" class="model" :class="{ hidden: !show }">{{ show ? model : (english ? 'Say it without the model. Reveal it to check.' : 'Скажите без образца. Откройте его для проверки.') }}</p>
      <template v-if="mode === 'introduction'">
        <form @submit.prevent="check">
          <label :for="`${id}-phrase`">{{ english ? 'Hide the model and type the phrase with your name' : 'Скройте образец и напишите фразу со своим именем' }}</label>
          <textarea :id="`${id}-phrase`" v-model="answer" rows="2" autocomplete="off" spellcheck="false" @input="result = null"></textarea>
          <button type="submit">{{ english ? 'Check phrase' : 'Проверить фразу' }}</button>
        </form>
        <p role="status" aria-live="polite" class="feedback">{{ result ? feedback : '' }}</p>
      </template>
      <p v-else class="instruction">{{ english ? 'Say the English letter names aloud, including repeated letters. Reveal the sequence to check the order.' : 'Назовите буквы по-английски вслух, включая повторы. Откройте последовательность и проверьте порядок.' }}</p>
    </template>
  </section>
</template>

<style scoped>
.lesson-name { padding: 20px; margin: 20px 0; border: 1px solid var(--vp-c-divider); border-radius: 12px; background: var(--vp-c-bg-soft); }
label { display: block; font-weight: 600; margin-bottom: 8px; }
input, textarea { display: block; width: 100%; min-width: 0; padding: 10px 12px; margin: 0 0 12px; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font: inherit; }
textarea { resize: vertical; }
button { padding: 9px 16px; border: 1px solid var(--vp-c-brand-1); border-radius: 8px; color: var(--vp-c-brand-1); background: var(--vp-c-bg); font: inherit; cursor: pointer; }
button:hover { background: var(--vp-c-brand-soft); }
button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 3px; }
.model { margin: 14px 0; padding: 14px; border-radius: 8px; background: var(--vp-c-bg); overflow-wrap: anywhere; font-size: 1.15em; }
.hidden { color: var(--vp-c-text-2); font-size: 1em; }
.feedback:empty { margin: 0; }
.instruction { margin-bottom: 0; }
@media (max-width: 480px) { .lesson-name { padding: 16px; } }
</style>
