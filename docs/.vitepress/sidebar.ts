import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { isAbsolute, join, relative } from 'node:path'
import matter from 'gray-matter'
import type { DefaultTheme, Plugin, SiteConfig } from 'vitepress'

const MAX_DEPTH = 6
const SERVICE_DIRECTORIES = new Set(['public', 'node_modules'])

function metadata(file: string, fallback: string) {
  if (!existsSync(file)) return { text: fallback, order: Infinity }

  const { data, content } = matter(readFileSync(file, 'utf8'))
  const heading = content.match(/^#\s+(.+?)(?:\s+#+)?\s*$/m)?.[1]
  const text = [data.sidebarLabel, data.title, heading]
    .find((value): value is string => typeof value === 'string' && value.trim().length > 0)

  return {
    text: text?.trim() ?? fallback,
    order: typeof data.sidebarOrder === 'number' && Number.isFinite(data.sidebarOrder)
      ? data.sidebarOrder
      : Infinity
  }
}

/** The root section counts as level 1, matching VitePress's default theme. */
export function generateSidebar(docsDir: string, locale: 'root' | 'en' = 'root'): DefaultTheme.SidebarItem[] {
  const localeDir = locale === 'en' ? join(docsDir, 'en') : docsDir
  if (locale === 'en' && !existsSync(localeDir)) return []
  const prefix = locale === 'en' ? ['en'] : []
  const collator = new Intl.Collator(locale === 'en' ? 'en' : 'ru', { numeric: true })
  const url = (segments: string[]) => '/' + [...prefix, ...segments].map(encodeURIComponent).join('/')
  const label = (name: string) => name.replace(/[-_]+/g, ' ')

  function scan(directory: string, segments: string[], depth: number): DefaultTheme.SidebarItem[] {
    if (depth > MAX_DEPTH) return []

    const entries: { item: DefaultTheme.SidebarItem; name: string; order: number }[] = []

    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue
      if (SERVICE_DIRECTORIES.has(entry.name) || (depth === 1 && entry.name === 'en')) continue

      const path = join(directory, entry.name)
      const parts = [...segments, entry.name]

      if (entry.isDirectory()) {
        const index = join(path, 'index.md')
        const children = scan(path, parts, depth + 1)
        if (!existsSync(index) && children.length === 0) continue

        const { text, order } = metadata(index, label(entry.name))
        const item: DefaultTheme.SidebarItem = { text }
        if (existsSync(index)) item.link = url(parts) + '/'
        if (children.length > 0) {
          item.items = children
          item.collapsed = true
        }
        entries.push({ item, name: entry.name, order })
      } else if (entry.isFile() && entry.name.endsWith('.md') && !['index.md', '404.md'].includes(entry.name)) {
        const stem = entry.name.slice(0, -3)
        const { text, order } = metadata(path, label(stem))
        entries.push({
          item: { text, link: url([...segments, stem]) },
          name: entry.name,
          order
        })
      }
    }

    return entries
      .sort((a, b) => (a.order === b.order ? 0 : a.order - b.order) || collator.compare(a.name, b.name))
      .map(entry => entry.item)
  }

  return scan(localeDir, [], 1)
}

/** Refresh sidebar data when the Markdown tree or its labels change in dev. */
export function automaticSidebar(docsDir: string): Plugin {
  return {
    name: 'stackbook:automatic-sidebar',
    configureServer(server) {
      const config = (server.config as typeof server.config & { vitepress: SiteConfig }).vitepress
      let previous = JSON.stringify(['root', 'en'].map(locale => config.site.locales[locale].themeConfig?.sidebar))
      let timer: ReturnType<typeof setTimeout> | undefined

      function refresh() {
        try {
          const sidebars = { root: generateSidebar(docsDir), en: generateSidebar(docsDir, 'en') }
          const next = JSON.stringify([sidebars.root, sidebars.en])
          if (next === previous) return

          for (const locale of ['root', 'en'] as const) {
            config.site.locales[locale].themeConfig!.sidebar = sidebars[locale]
          }
          previous = next
          // VitePress's virtual site-data module must be regenerated as well.
          for (const environment of Object.values(server.environments)) {
            environment.moduleGraph.invalidateAll()
          }
          server.ws.send({ type: 'full-reload' })
        } catch (error) {
          server.config.logger.error(`Failed to update sidebar: ${String(error)}`)
        }
      }

      function onMarkdown(file: string) {
        const path = relative(docsDir, file)
        if (isAbsolute(path) || path.startsWith('..') || !path.endsWith('.md')) return
        if (path.split(/[\\/]/).some(part => part.startsWith('.') || part.startsWith('_') || SERVICE_DIRECTORIES.has(part))) return

        clearTimeout(timer)
        timer = setTimeout(refresh, 100)
      }

      server.watcher.on('add', onMarkdown).on('unlink', onMarkdown).on('change', onMarkdown)
      server.httpServer?.once('close', () => {
        clearTimeout(timer)
        server.watcher.off('add', onMarkdown).off('unlink', onMarkdown).off('change', onMarkdown)
      })
    }
  }
}
