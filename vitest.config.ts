import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// dsh-client-ui-primitives 0.2.0 declares zero dependencies: its barrel pulls
// the markdown/shiki/diff stack as bare imports that only resolve inside the
// host bundler. None of those paths execute in this repo's specs (Tooltip +
// icons only), so stub them; clsx is real and runs, hence a devDependency.
const stub = fileURLToPath(new URL('./tests/stubs/empty.cjs', import.meta.url))
// Full-match regexes: Vite aliases are substring replacements, so the pattern
// must consume the whole specifier or the result is `stub + suffix`.
// The micromark/mdast stack executes real structure-walking at import time and
// is therefore installed as real devDeps instead of stubbed.
const hostOnlyStubs = [
  /^anser$/, /^diff$/, /^katex.*$/, /^simple-icons$/, /^zustand.*$/, /^immer.*$/,
  /^shiki.*$/, /^@shikijs.*$/,
].map((find) => ({ find, replacement: stub }))

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['tests/**/*.client.spec.tsx'],
    // dsh-client-* packages ship ESM importing plain .css assets (katex) and
    // undeclared host-only bare deps; inline them all so Vite's transform
    // pipeline (not Node's loader) owns resolution.
    server: {
      deps: {
        inline: [/@deepseek-ai\//],
      },
    },
  },
  resolve: {
    alias: hostOnlyStubs,
  },
})
