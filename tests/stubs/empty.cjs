/* eslint-disable no-undef -- intentional CJS stub for Vite interop */
// Stub for host-only bare imports of dsh-client-* packages (see vitest.config.ts).
// Named factories shiki consumers call at module top level must exist; the
// highlighter itself is a lazy singleton and never boots in this repo's specs.
const theme = { name: 'css-variables' }
const instance = {
  codeToTokens: () => ({ tokens: [] }),
  getLoadedLanguages: () => [],
  loadLanguageSync: () => {},
}
module.exports = {
  createCssVariablesTheme: () => theme,
  createHighlighterCoreSync: () => instance,
  createJavaScriptRegexEngine: () => ({}),
  defaultJavaScriptRegexConstructor: () => ({}),
}
