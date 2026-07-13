import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is the public path the app is served from.
//   - Local dev / Vercel  → '/' (default)
//   - GitHub Pages project → '/<repo>/' (the deploy workflow sets VITE_BASE)
// All asset, manifest, and service-worker paths are derived from this, so the
// same build works at the root or under a subpath.
const base = process.env.VITE_BASE || '/';

// Static SPA build. No environment variables required for local use.
export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
