import { defineConfig } from 'vite';

// Generic Vite config. We rely on CLI usage:
//   vite <sampleDir> --base ./ --outDir <out>
// so this file can stay minimal and reusable.
export default defineConfig({
  server: {
    open: true,
  },
  build: {
    emptyOutDir: true,
  }
});
