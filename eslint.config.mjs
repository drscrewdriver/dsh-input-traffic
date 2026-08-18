/**
 * ESLint flat config for dsh-input-traffic.
 *
 * Scope: `src/` and `tests/` (TypeScript + React). Build output and the
 * module graph are ignored. `npm run lint` gates the `verify` pipeline.
 */
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import react from 'eslint-plugin-react'

export default tseslint.config(
  { ignores: ['lib/', 'node_modules/', 'dist/', '*.tgz'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // React 18 auto-jsx: the runtime import is unnecessary.
      'react/react-in-jsx-scope': 'off',
      // Prefix-only suppression; the project is strict about unused locals.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
)
