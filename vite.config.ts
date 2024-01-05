import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig(({ mode }) => {
  if (mode === 'client') {
    return {
      build: {
        rollupOptions: {
          input: ['./src/client.ts'],
          output: {
            entryFileNames: 'static/client.js'
          }
        },
        emptyOutDir: false,
        copyPublicDir: false
      }
    }
  } else {
    return {
      ssr: {
        noExternal: true
      },
      build: {
        minify: true,
        ssr: './_worker.ts'
      },
      plugins: [
        devServer({
          entry: './src/server.tsx'
        })
      ]
    }
  }
})
