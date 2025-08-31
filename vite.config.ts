import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/co2-data': {
        target: 'https://nyc3.digitaloceanspaces.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) =>
          path.replace(
            /^\/co2-data/,
            '/owid-public/data/co2/owid-co2-data.json'
          ),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.ts',
        'dist/',
        'src/constants/**',
        'keys.ts',
        'eslint.config.js',
        'src/features/**/**',
        'src/routes/**/**',
        'src/hooks/**/**',
        'src/test/**/**',
        'src/types/**',
      ],
      thresholds: {
        global: {
          branches: 50,
          functions: 50,
          lines: 50,
          statements: 80,
        },
      },
    },
  },
});
