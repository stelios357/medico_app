import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.PORT || '5173'),
    strictPort: false,
    proxy: {
      // wsearch.nlm.nih.gov does not emit CORS headers — proxy it server-side in dev.
      // Production deployments must add a reverse-proxy rule for this path.
      '/api/medlineplus-wsearch': {
        target: 'https://wsearch.nlm.nih.gov',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api\/medlineplus-wsearch/, '/ws/query'),
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
