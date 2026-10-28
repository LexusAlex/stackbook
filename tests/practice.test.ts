import assert from 'node:assert/strict'
import test from 'node:test'
import { matchesAnswer, namePractice } from '../docs/.vitepress/theme/practice.ts'

test('accepts a phrase despite capitalisation, repeated spaces and final punctuation', () => {
  assert.equal(matchesAnswer('  MY   NAME IS Anna!  ', ['My name is Anna.']), true)
})

test('accepts a typographic apostrophe in a contraction', () => {
  assert.equal(matchesAnswer('My name’s Anna.', ["My name's Anna."]), true)
})

test('accepts a comma instead of an exclamation mark after the greeting', () => {
  assert.equal(matchesAnswer("Hi, my name's Anna.", ["Hi! My name's Anna."]), true)
})

test('does not accept missing words or a different name', () => {
  assert.equal(matchesAnswer('My Anna', ["My name's Anna."]), false)
  assert.equal(matchesAnswer("My name's Alex.", ["My name's Anna."]), false)
})

test('does not count blank input or punctuation as an answer', () => {
  assert.equal(matchesAnswer('   ', ['']), false)
  assert.equal(matchesAnswer('!!!', ['']), false)
})

test('accepts a spaced alphabet answer', () => {
  assert.equal(matchesAnswer('a h j k', ['A — H — J — K', 'A H J K', 'AHJK']), true)
})

test('rejects an alphabet answer with a swapped letter', () => {
  assert.equal(matchesAnswer('A H G K', ['A — H — J — K', 'A H J K', 'AHJK']), false)
})

test('keeps repeated letters when spelling a name', () => {
  assert.deepEqual(namePractice('Anna'), { introduction: "Hi! My name's Anna.", letters: 'A — N — N — A' })
})

test('handles names separated by spaces, hyphens and apostrophes without spelling separators', () => {
  assert.deepEqual(namePractice("  Jo   O'Neil-Su  "), {
    introduction: "Hi! My name's Jo O'Neil-Su.", letters: 'J — O — O — N — E — I — L — S — U'
  })
})

test('rejects unsupported name input without silently removing characters', () => {
  for (const name of ['', ' ', 'Анна', 'Ann4', '<Anna>', '-Anna', 'Anna--Maria']) {
    assert.equal(namePractice(name), null, name)
  }
})
