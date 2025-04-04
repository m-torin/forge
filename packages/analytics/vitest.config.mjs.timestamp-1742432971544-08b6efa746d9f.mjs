// vitest.config.mjs
import { defineConfig } from 'file:///Users/torin/repos/next-forge/node_modules/.pnpm/vitest@1.6.1_@types+node@22.13.10_@vitest+ui@3.0.9_vitest@3.0.9__happy-dom@17.4.4_jsdom_42bebe3875cf841abf8a4b9a37b2577b/node_modules/vitest/dist/config.js';
import react from 'file:///Users/torin/repos/next-forge/node_modules/.pnpm/@vitejs+plugin-react@4.3.4_vite@6.2.2_@types+node@22.13.10_jiti@2.4.2_lightningcss@1.29_135286b5024d48da8e5e3b3fb19211b0/node_modules/@vitejs/plugin-react/dist/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
var __vite_injected_original_import_meta_url =
  'file:///Users/torin/repos/next-forge/packages/analytics/vitest.config.mjs';
var __dirname = path.dirname(
  fileURLToPath(__vite_injected_original_import_meta_url),
);
var vitest_config_default = defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./__tests__/setup.ts'],
    // Customize this path if needed
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/node_modules/**'],
    testTimeout: 1e4,
    hookTimeout: 1e4,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        'test/**',
        'tests/**',
        '**/__tests__/**',
        '**/*.test.{ts,tsx}',
        '**/vitest.config.*',
      ],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
});
export { vitest_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZXN0LmNvbmZpZy5tanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvdG9yaW4vcmVwb3MvbmV4dC1mb3JnZS9wYWNrYWdlcy9hbmFseXRpY3NcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy90b3Jpbi9yZXBvcy9uZXh0LWZvcmdlL3BhY2thZ2VzL2FuYWx5dGljcy92aXRlc3QuY29uZmlnLm1qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vVXNlcnMvdG9yaW4vcmVwb3MvbmV4dC1mb3JnZS9wYWNrYWdlcy9hbmFseXRpY3Mvdml0ZXN0LmNvbmZpZy5tanNcIjsvLyBUaGlzIGlzIGEgdml0ZXN0LmNvbmZpZy5tanMgdGVtcGxhdGUgZm9yIE5leHQtRm9yZ2UgcGFja2FnZXNcbi8vIFRoaXMgZmlsZSB1c2VzIC5tanMgdG8gYXZvaWQgVHlwZVNjcmlwdCBFU00gaXNzdWVzXG5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnO1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0JztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5cbi8vIEdldCBjdXJyZW50IGRpcmVjdG9yeVxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XG5cbi8vIENvbW1vbiBjb25maWd1cmF0aW9uIGZvciBSZWFjdCBwYWNrYWdlc1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCldLFxuICB0ZXN0OiB7XG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBzZXR1cEZpbGVzOiBbJy4vX190ZXN0c19fL3NldHVwLnRzJ10sIC8vIEN1c3RvbWl6ZSB0aGlzIHBhdGggaWYgbmVlZGVkXG4gICAgaW5jbHVkZTogWycqKi8qLnRlc3Que3RzLHRzeH0nXSxcbiAgICBleGNsdWRlOiBbJyoqL25vZGVfbW9kdWxlcy8qKiddLFxuICAgIHRlc3RUaW1lb3V0OiAxMDAwMCxcbiAgICBob29rVGltZW91dDogMTAwMDAsXG4gICAgY292ZXJhZ2U6IHtcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxuICAgICAgcmVwb3J0ZXI6IFsndGV4dCcsICdqc29uJywgJ2h0bWwnXSxcbiAgICAgIGV4Y2x1ZGU6IFtcbiAgICAgICAgJ2NvdmVyYWdlLyoqJyxcbiAgICAgICAgJ2Rpc3QvKionLFxuICAgICAgICAnKiovbm9kZV9tb2R1bGVzLyoqJyxcbiAgICAgICAgJyoqLyouZC50cycsXG4gICAgICAgICd0ZXN0LyoqJyxcbiAgICAgICAgJ3Rlc3RzLyoqJyxcbiAgICAgICAgJyoqL19fdGVzdHNfXy8qKicsXG4gICAgICAgICcqKi8qLnRlc3Que3RzLHRzeH0nLFxuICAgICAgICAnKiovdml0ZXN0LmNvbmZpZy4qJyxcbiAgICAgIF0sXG4gICAgICB0aHJlc2hvbGRzOiB7XG4gICAgICAgIHN0YXRlbWVudHM6IDkwLFxuICAgICAgICBicmFuY2hlczogOTAsXG4gICAgICAgIGZ1bmN0aW9uczogOTAsXG4gICAgICAgIGxpbmVzOiA5MCxcbiAgICAgIH0sXG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSksXG4gICAgfSxcbiAgICBleHRlbnNpb25zOiBbJy50cycsICcudHN4JywgJy5qcycsICcuanN4JywgJy5qc29uJ10sXG4gIH0sXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBR0EsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHFCQUFxQjtBQU42SyxJQUFNLDJDQUEyQztBQVM1UCxJQUFNLFlBQVksS0FBSyxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUc3RCxJQUFPLHdCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsRUFDakIsTUFBTTtBQUFBLElBQ0osYUFBYTtBQUFBLElBQ2IsU0FBUztBQUFBLElBQ1QsWUFBWSxDQUFDLHNCQUFzQjtBQUFBO0FBQUEsSUFDbkMsU0FBUyxDQUFDLG9CQUFvQjtBQUFBLElBQzlCLFNBQVMsQ0FBQyxvQkFBb0I7QUFBQSxJQUM5QixhQUFhO0FBQUEsSUFDYixhQUFhO0FBQUEsSUFDYixVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLE1BQU07QUFBQSxNQUNqQyxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsWUFBWTtBQUFBLFFBQ1osVUFBVTtBQUFBLFFBQ1YsV0FBVztBQUFBLFFBQ1gsT0FBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsU0FBUztBQUFBLElBQzdCO0FBQUEsSUFDQSxZQUFZLENBQUMsT0FBTyxRQUFRLE9BQU8sUUFBUSxPQUFPO0FBQUEsRUFDcEQ7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
