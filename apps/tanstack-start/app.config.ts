import { defineConfig } from '@tanstack/start/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  server: {
    preset: 'node-server',
  },

  vite: {
    // @ts-expect-error - No types for vite-tsconfig-paths
    plugins: [tsconfigPaths()],
  },
});
