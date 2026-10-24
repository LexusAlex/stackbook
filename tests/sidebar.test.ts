import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import test from 'node:test'
import type { TestContext } from 'node:test'
import { generateSidebar } from '../docs/.vitepress/sidebar.ts'
import { sidebar } from '../docs/.vitepress/navigation.ts'

function fixture(t: TestContext, files: Record<string, string>) {
  const fixtures = resolve('.plan/sidebar-fixtures')
  mkdirSync(fixtures, { recursive: true })
  const root = mkdtempSync(join(fixtures, 'test-'))
  t.after(() => {
    assert.equal(dirname(root), fixtures)
    rmSync(root, { recursive: true, force: true })
  })

  for (const [file, content] of Object.entries(files)) {
    const path = join(root, file)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  return root
}

test('a folder group starts collapsed and links its index without duplicating it among children', (t) => {
  const root = fixture(t, {
    'index.md': '# Stackbook',
    'backend/index.md': '---\ntitle: Backend (Сервер)\n---\n# Backend',
    'backend/queues.md': '# Очереди'
  })

  assert.deepEqual(generateSidebar(root), [{
    text: 'Backend (Сервер)',
    link: '/backend/',
    collapsed: true,
    items: [{ text: 'Очереди', link: '/backend/queues' }]
  }])
})

test('folders without index pages become collapsed groups without broken links', (t) => {
  const root = fixture(t, { 'backend/jobs/queues.md': '# Очереди' })

  assert.deepEqual(generateSidebar(root), [{
    text: 'backend',
    collapsed: true,
    items: [{
      text: 'jobs',
      collapsed: true,
      items: [{ text: 'Очереди', link: '/backend/jobs/queues' }]
    }]
  }])
})

test('level 6 is included and level 7 is excluded, counting root as level 1', (t) => {
  const root = fixture(t, {
    'one/index.md': '# One',
    'one/two/index.md': '# Two',
    'one/two/three/index.md': '# Three',
    'one/two/three/four/index.md': '# Four',
    'one/two/three/four/five/index.md': '# Five',
    'one/two/three/four/five/leaf.md': '# Level six article',
    'one/two/three/four/five/six/index.md': '# Six',
    'one/two/three/four/five/six/seven/index.md': '# Seven',
    'one/two/three/four/five/six/too-deep.md': '# Level seven article'
  })

  const five = generateSidebar(root)[0].items![0].items![0].items![0].items![0]
  assert.deepEqual(five.items, [
    { text: 'Level six article', link: '/one/two/three/four/five/leaf' },
    { text: 'Six', link: '/one/two/three/four/five/six/' }
  ])
})

test('Russian and English trees are generated independently with localized links', (t) => {
  const root = fixture(t, {
    'backend/index.md': '# Сервер',
    'backend/only-russian.md': '# Только на русском',
    'en/index.md': '# Home',
    'en/backend/index.md': '# Server',
    'en/backend/only-english.md': '# English only'
  })

  assert.equal(generateSidebar(root).length, 1)
  assert.deepEqual(generateSidebar(root)[0].items, [{ text: 'Только на русском', link: '/backend/only-russian' }])
  assert.deepEqual(generateSidebar(root, 'en')[0].items, [{ text: 'English only', link: '/en/backend/only-english' }])
})

test('labels use sidebarLabel, title, H1 and finally the filename', (t) => {
  const root = fixture(t, {
    'one.md': '---\nsidebarLabel: "Коротко: API"\ntitle: Длинное название\n---\n# Заголовок',
    'two.md': '---\ntitle: "Название: с двоеточием"\n---\n# Заголовок',
    'three.md': '# Заголовок\n\nТекст.',
    'file-name.md': 'Текст без заголовка.'
  })

  const items = generateSidebar(root)
  assert.equal(items.find(item => item.link === '/one')?.text, 'Коротко: API')
  assert.equal(items.find(item => item.link === '/two')?.text, 'Название: с двоеточием')
  assert.equal(items.find(item => item.link === '/three')?.text, 'Заголовок')
  assert.equal(items.find(item => item.link === '/file-name')?.text, 'file name')
})

test('explicit sidebarOrder takes priority and filenames use natural numeric order', (t) => {
  const root = fixture(t, {
    'z.md': '---\nsidebarOrder: -1\n---\n# First',
    'folder/index.md': '---\nsidebarOrder: 1\n---\n# Second',
    'page-10.md': '# Tenth',
    'page-2.md': '# Second page'
  })

  assert.deepEqual(generateSidebar(root).map(item => item.link), ['/z', '/folder/', '/page-2', '/page-10'])
})

test('service folders, partials, hidden files, assets and empty folders are omitted', (t) => {
  const root = fixture(t, {
    'backend/index.md': '# Backend',
    'public/example.md': '# Asset',
    '.vitepress/example.md': '# Config',
    '_includes/example.md': '# Partial',
    '.hidden.md': '# Hidden',
    '404.md': '# Missing',
    'empty/image.svg': '<svg/>',
    'backend/_partial.md': '# Partial'
  })

  assert.deepEqual(generateSidebar(root), [{ text: 'Backend', link: '/backend/' }])
})

test('file paths with spaces are encoded in links', (t) => {
  const root = fixture(t, { 'backend/http api.md': '# HTTP API' })
  assert.equal(generateSidebar(root)[0].items![0].link, '/backend/http%20api')
})

test('missing English translation does not fall back to Russian content', (t) => {
  const root = fixture(t, { 'backend/index.md': '# Сервер' })
  assert.deepEqual(generateSidebar(root, 'en'), [])
})

test('malformed frontmatter is reported instead of producing a misleading menu', (t) => {
  const root = fixture(t, { 'backend/index.md': '---\ntitle: [invalid\n---\n# Backend' })
  assert.throws(() => generateSidebar(root), { name: 'YAMLException' })
})

test('the actual site keeps three root sections per language', () => {
  const roots = (english = false) => sidebar(english).map(({ text, link }) => ({ text, link }))
  assert.deepEqual(roots(), [
    { text: 'Backend (Сервер)', link: '/backend/' },
    { text: 'Базы данных', link: '/databases/' },
    { text: 'Инфраструктура', link: '/infrastructure/' }
  ])
  assert.deepEqual(roots(true), [
    { text: 'Backend (Server)', link: '/en/backend/' },
    { text: 'Databases', link: '/en/databases/' },
    { text: 'Infrastructure', link: '/en/infrastructure/' }
  ])
})

test('Nginx guides appear in reading order under Infrastructure and Servers in both languages', () => {
  for (const { english, base, servers, versions, installation } of [
    { english: false, base: '', servers: 'Серверы', versions: 'Версии', installation: 'Установка Nginx' },
    { english: true, base: '/en', servers: 'Servers', versions: 'Versions', installation: 'Installing Nginx' }
  ]) {
    const infrastructure = sidebar(english).find(item => item.link === `${base}/infrastructure/`)
    assert.deepEqual(infrastructure?.items, [{
      text: servers,
      link: `${base}/infrastructure/servers/`,
      collapsed: true,
      items: [{
        text: 'Nginx',
        link: `${base}/infrastructure/servers/nginx/`,
        collapsed: true,
        items: [
          { text: versions, link: `${base}/infrastructure/servers/nginx/versions` },
          { text: installation, link: `${base}/infrastructure/servers/nginx/installation` }
        ]
      }]
    }])
  }
})
