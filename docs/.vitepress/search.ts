import { stemmer as englishStemmer } from '@orama/stemmers/english'
import { stemmer as russianStemmer } from '@orama/stemmers/russian'
import type { DefaultTheme } from 'vitepress'

/** Use the same normalization during indexing and in the browser. */
export function processSearchTerm(term: string): string {
  const normalized = term.normalize('NFKC').toLowerCase().replace(/ё/g, 'е')

  if (/^[а-я]+$/u.test(normalized)) return russianStemmer(normalized)
  if (/^[a-z]+$/u.test(normalized)) return englishStemmer(normalized)
  return normalized
}

export const miniSearch = {
  options: {
    // Keep whole names such as PostgreSQL as well as camelCase word parts.
    tokenize: (text: string) => text
      .normalize('NFKC')
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean)
      .flatMap((token) => {
        const parts = token.replace(/([a-z\d])([A-Z])/g, '$1 $2').split(' ')
        return parts.length > 1 ? [token, ...parts] : [token]
      }),
    processTerm: processSearchTerm
  },
  searchOptions: {
    combineWith: 'AND' as const,
    prefix: true,
    // Avoid noisy fuzzy matches for short technical terms such as API or SQL.
    fuzzy: (term: string) => term.length > 4 ? 0.2 : false,
    boost: { title: 6, titles: 2, text: 1 }
  }
}

export const search = {
  provider: 'local',
  options: {
    detailedView: true,
    miniSearch,
    locales: {
      root: {
        translations: {
          button: {
            buttonText: 'Поиск',
            buttonAriaLabel: 'Поиск по документации'
          },
          modal: {
            displayDetails: 'Показать подробности',
            resetButtonTitle: 'Очистить поиск',
            backButtonTitle: 'Закрыть поиск',
            noResultsText: 'Ничего не найдено',
            footer: {
              selectText: 'открыть',
              selectKeyAriaLabel: 'Enter',
              navigateText: 'выбрать',
              navigateUpKeyAriaLabel: 'Стрелка вверх',
              navigateDownKeyAriaLabel: 'Стрелка вниз',
              closeText: 'закрыть',
              closeKeyAriaLabel: 'Escape'
            }
          }
        }
      },
      en: {
        translations: {
          button: {
            buttonText: 'Search',
            buttonAriaLabel: 'Search documentation'
          },
          modal: {
            displayDetails: 'Show details',
            resetButtonTitle: 'Clear search',
            backButtonTitle: 'Close search',
            noResultsText: 'No results found',
            footer: {
              selectText: 'to open',
              selectKeyAriaLabel: 'Enter',
              navigateText: 'to navigate',
              navigateUpKeyAriaLabel: 'Arrow up',
              navigateDownKeyAriaLabel: 'Arrow down',
              closeText: 'to close',
              closeKeyAriaLabel: 'Escape'
            }
          }
        }
      }
    }
  }
} satisfies DefaultTheme.Config['search']
