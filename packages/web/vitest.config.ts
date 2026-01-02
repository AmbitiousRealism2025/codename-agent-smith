import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
      coverage: {
        provider: 'istanbul',
        reporter: ['text', 'json', 'html'],
        reportsDirectory: './coverage',
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/**/*.{test,spec}.{ts,tsx}',
          'src/test/**',
          'src/main.tsx',
          'src/vite-env.d.ts',
        ],
        thresholds: {
          // Global thresholds - set to 60% to prevent quality regression while incrementally adding tests
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
          // Per-directory thresholds for core business logic (90%+ required)
          'src/lib/interview/**/*.ts': {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
          'src/lib/classification/**/*.ts': {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
        },
      },
    },
  })
);
