export const base = import.meta.env.BASE_URL;

/** Site-relative path that respects Astro `base` (needed on GitHub Pages). */
export const asset = (path: string) => {
  const clean = path.replace(/^\//, '');
  const isFile = /\.[a-z0-9]+$/i.test(clean);
  const withSlash = isFile || clean.endsWith('/') ? clean : `${clean}/`;
  return `${base}${withSlash}`;
};

export const img = (file: string) => asset(`images/${file}`);
