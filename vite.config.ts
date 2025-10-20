import { defineConfig } from 'vite';
import { execSync } from 'node:child_process';
import packageJson from './package.json' assert { type: 'json' };

const commitHash = execSync('git rev-parse --short HEAD').toString().trim();

// Generic Vite config. We rely on CLI usage:
//   vite <sampleDir> --base ./ --outDir <out>
// so this file can stay minimal and reusable.
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __APP_COMMIT_HASH__: JSON.stringify(commitHash),
  },
  server: {
    open: true,
  },
  build: {
    emptyOutDir: true,
  }
});
