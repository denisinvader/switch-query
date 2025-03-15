import { resolve } from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: resolve(__dirname, 'tsconfig.app.json') }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/SwitchQuery.ts'),
      formats: ['es'],
      name: 'SwitchQuery',
      fileName: 'SwitchQuery',
    },
    rollupOptions: {
      external: ['react', '@tanstack/react-query'],
    },
  },
});
