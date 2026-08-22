import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.client.spec.{ts,tsx}'],
    // The primitives package ships ESM importing plain .css assets (katex);
    // inline it so Vite's transform pipeline (not Node's loader) owns them.
    server: {
      deps: {
        inline: [/@deepseek-ai\/dsh-client-ui-primitives/],
      },
    },
  },
})
