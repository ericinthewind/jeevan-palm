import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const base = process.env.ASTRO_BASE || '/';

export default defineConfig({
  site: base === '/' ? 'https://jeevanpalm.com' : 'https://ericinthewind.github.io',
  base,
  integrations: [sitemap()],
  devToolbar: { enabled: false },
});
