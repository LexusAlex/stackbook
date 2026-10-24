import type { DefaultTheme } from 'vitepress'
import { fileURLToPath } from 'node:url'
import { generateSidebar } from './sidebar.ts'

export const docsDir = fileURLToPath(new URL('../', import.meta.url))

export function navigation(english = false): DefaultTheme.NavItem[] {
  const base = english ? '/en' : ''

  return [
    { text: english ? 'Backend' : 'Backend (Сервер)', link: `${base}/backend/` },
    { text: english ? 'Databases' : 'Базы данных', link: `${base}/databases/` },
    { text: english ? 'Infrastructure' : 'Инфраструктура', link: `${base}/infrastructure/` }
  ]
}

export function sidebar(english = false): DefaultTheme.SidebarItem[] {
  return generateSidebar(docsDir, english ? 'en' : 'root')
}
