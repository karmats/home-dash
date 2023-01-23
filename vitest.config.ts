import { mergeConfig } from 'vite';
import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: '.',
    test: {
      setupFiles: 'vitest.setup.ts',
      environment: 'happy-dom',
      globals: true,
    },
  })
);
