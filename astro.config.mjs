import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const rawBase = process.env.ASTRO_BASE || '/';
const base = rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  site: base === '/' ? 'https://jeevanpalm.com' : 'https://ericinthewind.github.io',
  base,
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
