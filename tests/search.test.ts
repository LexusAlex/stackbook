import assert from 'node:assert/strict'
import test from 'node:test'
import MiniSearch from 'minisearch'
import { miniSearch } from '../docs/.vitepress/search.ts'

function index() {
  const search = new MiniSearch({
    fields: ['title', 'titles', 'text'],
    storeFields: ['title'],
    ...miniSearch.options,
    searchOptions: miniSearch.searchOptions
  })

  search.addAll([
    { id: 'indexes', title: 'Индексы', titles: 'PostgreSQL', text: 'Ускорение запросов к базе данных.' },
    { id: 'deploy', title: 'Развёртывание', titles: 'Docker Compose', text: 'Запуск контейнеров и проверка окружения.' },
    { id: 'queues', title: 'Фоновые задачи', titles: 'Backend', text: 'Очереди и повторные попытки.' },
    { id: 'transactions', title: 'Transactions', titles: 'PostgreSQL', text: 'Database connections and backups.' },
    { id: 'configuration', title: 'Configuration', titles: 'Infrastructure', text: 'Set DATABASE_URL and healthCheck.' },
    { id: 'mention', title: 'Notes', titles: 'Knowledge base', text: 'Transactions are described in another article.' }
  ])

  return search
}

test('Russian singular finds a plural word without fuzzy or prefix matching', () => {
  const results = index().search('индекс', { fuzzy: false, prefix: false })
  assert.deepEqual(results.map(result => result.id), ['indexes'])
})

test('Russian word cases find the same queue article', () => {
  const results = index().search('очередями', { fuzzy: false, prefix: false })
  assert.deepEqual(results.map(result => result.id), ['queues'])
})

test('Russian е finds a heading spelled with ё', () => {
  const results = index().search('РАЗВЕРТЫВАНИЕ', { fuzzy: false, prefix: false })
  assert.deepEqual(results.map(result => result.id), ['deploy'])
})

test('English singular finds a plural heading', () => {
  assert.equal(index().search('transaction', { fuzzy: false, prefix: false })[0]?.id, 'transactions')
})

test('a partial technical name finds the relevant article', () => {
  assert.deepEqual(index().search('postgr').map(result => result.id), ['indexes', 'transactions'])
})

test('a technical name with one typo still finds results', () => {
  assert.ok(index().search('postgreql').some(result => result.id === 'indexes'))
})

test('mixed-case product names remain searchable as complete words', () => {
  for (const query of ['postgresql', 'PostgreSQL', 'POSTGRESQL']) {
    assert.deepEqual(
      index().search(query, { fuzzy: false, prefix: false }).map(result => result.id),
      ['indexes', 'transactions']
    )
  }
})

test('every term in a multi-word query must match', () => {
  assert.deepEqual(index().search('docker контейнер').map(result => result.id), ['deploy'])
  assert.deepEqual(index().search('docker transactions'), [])
})

test('a heading ranks above the same word in body text', () => {
  assert.equal(index().search('transactions')[0]?.id, 'transactions')
})

test('code identifiers can be searched as separate words', () => {
  assert.deepEqual(index().search('database url').map(result => result.id), ['configuration'])
  assert.deepEqual(index().search('health check').map(result => result.id), ['configuration'])
})

test('empty, punctuation-only and unknown queries return no results', () => {
  for (const query of ['', '?!', 'несуществующееслово']) {
    assert.deepEqual(index().search(query), [])
  }
})
