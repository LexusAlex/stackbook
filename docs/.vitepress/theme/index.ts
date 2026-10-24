import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { watchEffect } from 'vue'
import { search } from '../search.ts'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ siteData }) {
    // Config functions are serialized without imported closures. Restore the
    // analyzer here so browser queries use the build-time stemmers. Site data
    // is deeply readonly: replace its shallow ref instead of mutating it.
    watchEffect(() => {
      const site = siteData.value
      const current = site.themeConfig.search
      if (current?.options?.miniSearch?.options?.processTerm === search.options.miniSearch.options.processTerm) return

      siteData.value = {
        ...site,
        themeConfig: { ...site.themeConfig, search }
      }
    })
  }
} satisfies Theme
