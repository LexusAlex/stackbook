import { defineConfig } from 'vitepress'
import { docsDir, navigation, sidebar } from './navigation.ts'
import { search } from './search.ts'
import { automaticSidebar } from './sidebar.ts'

const base = process.env.VITEPRESS_BASE || '/'

export default defineConfig({
  title: 'Stackbook',
  description: 'База знаний о серверной разработке, базах данных, инфраструктуре, изучении языков и инструментах разработки.',
  lang: 'ru-RU',
  lastUpdated: true,
  // Pages builds use explicit .html links; local development keeps clean URLs.
  cleanUrls: process.env.GITHUB_PAGES !== 'true',
  // configure-pages supplies the project path or '/' for a root/custom domain.
  base,
  vite: { plugins: [automaticSidebar(docsDir)] },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}logo.svg` }],
    ['meta', { name: 'theme-color', content: '#3451b2' }]
  ],
  markdown: {
    lineNumbers: true,
    container: {
      infoLabel: 'Информация',
      noteLabel: 'Примечание',
      tipLabel: 'Совет',
      importantLabel: 'Важно',
      warningLabel: 'Внимание',
      dangerLabel: 'Опасно',
      cautionLabel: 'Осторожно',
      detailsLabel: 'Подробнее'
    },
    codeCopyButton: {
      tooltipText: 'Скопировать код',
      copiedText: 'Скопировано'
    }
  },
  locales: {
    root: {
      label: 'Русский',
      lang: 'ru-RU',
      link: '/',
      themeConfig: {
        nav: navigation(),
        sidebar: sidebar(),
        lastUpdated: {
          text: 'Последнее обновление',
          formatOptions: { dateStyle: 'medium', timeStyle: 'short', forceLocale: true }
        },
        outline: { label: 'На этой странице', level: [2, 3] },
        docFooter: { prev: 'Предыдущая страница', next: 'Следующая страница' },
        sidebarMenuLabel: 'Меню',
        returnToTopLabel: 'Наверх',
        langMenuLabel: 'Выбрать язык',
        skipToContentLabel: 'Перейти к содержимому',
        darkModeSwitchLabel: 'Оформление',
        lightModeSwitchTitle: 'Включить светлую тему',
        darkModeSwitchTitle: 'Включить тёмную тему',
        notFound: {
          title: 'СТРАНИЦА НЕ НАЙДЕНА',
          quote: 'Возможно, страница переехала. Начните с базы знаний.',
          link: '/',
          linkText: 'На главную'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'A knowledge base for backend development, databases, infrastructure, language learning and development tools.',
      markdown: {
        container: {
          infoLabel: 'Info',
          noteLabel: 'Note',
          tipLabel: 'Tip',
          importantLabel: 'Important',
          warningLabel: 'Warning',
          dangerLabel: 'Danger',
          cautionLabel: 'Caution',
          detailsLabel: 'Details'
        },
        codeCopyButton: {
          tooltipText: 'Copy code',
          copiedText: 'Copied'
        }
      },
      themeConfig: {
        nav: navigation(true),
        sidebar: sidebar(true),
        lastUpdated: {
          text: 'Last updated',
          formatOptions: { dateStyle: 'medium', timeStyle: 'short', forceLocale: true }
        },
        outline: { label: 'On this page', level: [2, 3] },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        sidebarMenuLabel: 'Menu',
        returnToTopLabel: 'Back to top',
        langMenuLabel: 'Change language',
        skipToContentLabel: 'Skip to content',
        darkModeSwitchLabel: 'Appearance',
        lightModeSwitchTitle: 'Switch to light theme',
        darkModeSwitchTitle: 'Switch to dark theme',
        notFound: {
          title: 'PAGE NOT FOUND',
          quote: 'This page may have moved. Start with the knowledge base.',
          link: '/en/',
          linkText: 'Back to home'
        }
      }
    }
  },
  themeConfig: {
    logo: { src: '/logo.svg', alt: '' },
    search,
    externalLinkIcon: true
  }
})
