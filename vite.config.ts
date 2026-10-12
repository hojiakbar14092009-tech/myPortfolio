import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

// Vercel exposes the production domain at build time; locally we fall back to preview.
const SITE = process.env.SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4173');

const ROUTES = ['/', '/work/grand-musee', '/work/barakali', '/work/mizo', '/work/ustago'];

function seo(): Plugin {
  return {
    name: 'hsh-seo',
    transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%SITE_URL%', SITE) },
    generateBundle() {
      const urls = ROUTES.map((r) => `  <url><loc>${SITE}${r}</loc></url>`).join('\n');
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), seo()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { motion: ['framer-motion'] },
      },
    },
  },
});
