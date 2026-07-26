import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';

const rawBase = process.env.ASTRO_BASE || '/';
const base = rawBase === '/' ? '/' : rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

export default defineConfig({
  site: base === '/' ? 'https://jeevanpalm.com' : 'https://ericinthewind.github.io',
  base,
  integrations: [sitemap()],
  devToolbar: { enabled: false },
  adapter: cloudflare(),
});