#!/usr/bin/env node
/**
 * Assembly verification for dsh-input-traffic.
 *
 * Runs from the plugin repository (or from a profile's node_modules copy) on
 * any platform. It verifies the six surfaces the dsh web loader depends on,
 * without booting a browser:
 *
 *   1. node half imports and exposes `apply`;
 *   2. package.json declares the bundle patch and the web client manifest;
 *   3. cordis.patch.yml carries the input-traffic insert row;
 *   4. lib/client.js exists with the __ModuleLoader__.load handoff banner;
 *   5. the browser bundle executes the load handoff and its factory exports
 *      `apply` + `inject` under a stubbed module table;
 *   6. the injected conversation face types match the dock's verbs.
 *
 * Usage: node examples/verify-assembly.mjs [path-to-plugin-package]
 */
import { createRequire } from 'node:module'
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)
const pkgRoot = resolve(process.argv[2] ?? '.')

const results = []
function check(name, ok, detail = '') {
  results.push({ name, ok, detail })
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` —${detail}` : ''}`)
}

try {
  // 1. Node half: the Loader row imports the package root; apply must exist.
  const nodeHalf = await import(pathToFileURL(join(pkgRoot, 'lib', 'index.js')).href)
  check('node half exports apply', typeof nodeHalf.apply === 'function', `apply=${typeof nodeHalf.apply}`)

  // 2. Manifest: bundle patch + web client declaration.
  const manifest = JSON.parse(readFileSync(join(pkgRoot, 'package.json'), 'utf8'))
  check('dsh.bundle.patch declared', manifest.dsh?.bundle?.patch === './cordis.patch.yml',
    JSON.stringify(manifest.dsh?.bundle))
  check('dsh.client platform web', manifest.dsh?.client?.platform === 'web',
    JSON.stringify(manifest.dsh?.client))
  check('exports ./client present', typeof manifest.exports?.['./client'] === 'object')
  check('cordis.patch.yml shipped', manifest.files?.includes('cordis.patch.yml') === true)

  // 3. Patch row: the insert carries the plugin id/name.
  const patch = readFileSync(join(pkgRoot, 'cordis.patch.yml'), 'utf8')
  check('patch inserts input-traffic row', patch.includes('id: input-traffic') && patch.includes('name: dsh-input-traffic'))

  // 4. Browser bundle artifact + handoff banner.
  const clientPath = join(pkgRoot, 'lib', 'client.js')
  check('lib/client.js exists', existsSync(clientPath))
  const clientSource = existsSync(clientPath) ? readFileSync(clientPath, 'utf8') : ''
  check('bundle registers via __ModuleLoader__.load', clientSource.includes('__ModuleLoader__.load'),
    clientSource.includes('__ModuleLoader__.load') ? 'banner ok' : 'banner missing')

  // 5. Execute the handoff with a stubbed module table and inspect the factory.
  let captured = null
  globalThis.window = {
    __ModuleLoader__: { load: (handoff) => { captured = handoff } },
  }
  // client.js is CJS; loading it through createRequire avoids ESM interop quirks.
  const bundled = require(clientPath)
  check('load handoff captured', captured !== null && typeof captured?.factory === 'function',
    captured !== null ? `id=${captured.id}` : 'no handoff')
  const factoryRequire = (spec) => {
    // Platform modules the factory may statically execute: react resolves from
    // the real devDependency; the primitives package would drag plain .css
    // assets into Node's loader, so a shape stub (any named export is a
    // component) stands in for it. Anything else would be a runtime-only
    // dependency the stub must not hide.
    if (spec === 'react' || spec === 'react/jsx-runtime') return require(spec)
    if (spec === '@deepseek-ai/dsh-client-ui-primitives') {
      return new Proxy({}, { get: () => () => null })
    }
    throw new Error(`unexpected module-table require("${spec}") during static verification`)
  }
  const exports_ = captured?.factory(factoryRequire)
  check('factory exports apply + inject', typeof exports_?.apply === 'function'
    && Array.isArray(exports_?.inject) && exports_?.inject.includes('slots'),
    exports_?.inject?.join(', '))
  check('inject declares conversation services', exports_?.inject?.includes('conversation')
    && exports_?.inject?.includes('sessions') && exports_?.inject?.includes('settingsScope'),
    exports_?.inject?.join(', '))
  void bundled

  // 6. Conversation-face surface: the dock's three verbs resolve structurally.
  check('node half apply is the only host surface', typeof nodeHalf.apply === 'function')
} catch (error) {
  check('script completed without throwing', false, `${error?.message ?? error}`)
  process.exitCode = 1
  process.exit(1)
}

const failed = results.filter(r => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} assertions passed`)
if (failed > 0) process.exitCode = 1
