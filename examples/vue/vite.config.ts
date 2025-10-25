import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(),
    {
      name: 'inject-globals',
      transformIndexHtml: html => ({
        html,
        tags: [{
          tag: 'script',
          injectTo: 'head',
          children: `
            window.global = window;
            (async () => {
              if (!window.Buffer) {
                const m = await import('buffer');
                window.Buffer = m.Buffer;
              }
            })();
          `
        }]
      })
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
      // Ensure ethers is resolved from node_modules
      dedupe: ['ethers'],
  },
})
