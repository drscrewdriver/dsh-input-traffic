/**
 * settings bridge — T20-b port tests.
 *
 * Three assertion blocks:
 * 1. Server route derivation: bridgeRoutesFor('ui-conversation') yields the
 *    exact pair the client half derives (parity pinned both ways).
 * 2. Server handler semantics: POST-only, settings-unavailable,
 *    ns-not-registered, malformed ops, optimistic-concurrency conflict — the
 *    perm-gate T12 semantics survive the port; the node apply() wires the
 *    pair onto webServer and unregisters on dispose.
 * 3. Client BridgeDocHandle: pending→ready snapshot transition, set() hits
 *    the derived mutate route carrying expectedRevision, conflict triggers an
 *    authoritative re-pull without throwing.
 */
import { describe, expect, it, vi } from 'vitest'
import { bridgeRoutesFor, registerSettingsBridgeRoutes } from '../src/bridge.js'
import { apply as applyNode } from '../src/index.ts'
import { BridgeDocHandle } from '../src/client/bridge-scope.js'

const NS = 'ui-conversation'
const DESCRIBE = `/api/${NS}/settings/describe`
const MUTATE = `/api/${NS}/settings/mutate`

/** Record-all-routes webServer stub that can drive requests. */
function makeServer() {
  const routes = new Map<string, { handler: (req: unknown, res: unknown) => unknown }>()
  return {
    register(route: { path: string; handler: (req: unknown, res: unknown) => unknown }): () => void {
      routes.set(route.path, route)
      return () => { routes.delete(route.path) }
    },
    paths(): string[] {
      return [...routes.keys()].sort()
    },
    async call(path: string, method: string, raw?: string): Promise<{ code: number; body: unknown }> {
      const route = routes.get(path)
      if (route === undefined) throw new Error(`route not registered: ${path}`)
      const out = { code: 0, body: undefined as unknown }
      const listeners = new Map<string, (chunk?: unknown) => void>()
      const req = {
        method,
        url: path,
        on(event: string, cb: (chunk?: unknown) => void) { listeners.set(event, cb); return req },
      }
      const res = {
        writeHead(code: number) { out.code = code },
        end(payload?: string) { out.body = payload === undefined ? undefined : JSON.parse(payload) },
      }
      const done = Promise.resolve(route.handler(req, res))
      if (raw !== undefined) listeners.get('data')?.(Buffer.from(raw))
      listeners.get('end')?.()
      await done
      await new Promise((resolve) => setTimeout(resolve, 0))
      return out
    },
  }
}

/** describe/mutate settings service stub with injectable failure modes. */
function makeSvc(options: { nsList?: string[]; conflict?: boolean } = {}) {
  const calls: Array<{ kind: string; ns: string; ops?: unknown }> = []
  return {
    calls,
    describe(o?: { redactSecrets?: boolean }) {
      void o
      return (options.nsList ?? [NS]).map((ns) => ({ ns, value: { busyEnter: 'queue' }, revision: 3 }))
    },
    async mutate(ns: string, ops: unknown) {
      calls.push({ kind: 'mutate', ns, ops })
      if (options.conflict) throw new Error('settings revision conflict: expected 3 got 2')
    },
  }
}

describe('bridgeRoutesFor（路由派生）', () => {
  it('ui-conversation 派生出 describe/mutate 精确路径对', () => {
    expect(bridgeRoutesFor(NS)).toEqual({ describe: DESCRIBE, mutate: MUTATE })
  })
})

describe('registerSettingsBridgeRoutes（服务端语义）', () => {
  it('注册一对路由；describe 各回各 ns；卸载表清干净', async () => {
    const server = makeServer()
    const offs = registerSettingsBridgeRoutes(server, () => makeSvc(), NS)
    expect(offs).toHaveLength(2)
    expect(server.paths()).toEqual([DESCRIBE, MUTATE])
    const d = await server.call(DESCRIBE, 'POST')
    expect(d.body).toMatchObject({ ok: true, value: { descriptor: { ns: NS, value: { busyEnter: 'queue' } } } })
    for (const off of offs) off()
    expect(server.paths()).toEqual([])
  })

  it('GET 一律 405', async () => {
    const server = makeServer()
    registerSettingsBridgeRoutes(server, () => makeSvc(), NS)
    expect((await server.call(DESCRIBE, 'GET')).code).toBe(405)
    expect((await server.call(MUTATE, 'GET')).code).toBe(405)
  })

  it('settings 缺席 → settings-unavailable；ns 未注册 → ns-not-registered', async () => {
    const server = makeServer()
    registerSettingsBridgeRoutes(server, () => undefined, NS)
    expect(await server.call(DESCRIBE, 'POST')).toMatchObject({ body: { ok: false, code: 'settings-unavailable' } })

    const server2 = makeServer()
    registerSettingsBridgeRoutes(server2, () => makeSvc({ nsList: ['other-ns'] }), NS)
    expect(await server2.call(DESCRIBE, 'POST')).toMatchObject({ body: { ok: false, code: 'ns-not-registered' } })
  })

  it('mutate 成功即 describe 回填；冲突映射 settings-conflict；坏 ops 映射 settings-rejected', async () => {
    const svc = makeSvc()
    const server = makeServer()
    registerSettingsBridgeRoutes(server, () => svc, NS)
    const ok = await server.call(MUTATE, 'POST', JSON.stringify({ ops: [{ op: 'set', path: ['busyEnter'], value: 'queue' }], expectedRevision: 3 }))
    expect(ok.body).toMatchObject({ ok: true, value: { descriptor: { revision: 3 } } })
    expect(svc.calls[0]).toMatchObject({ kind: 'mutate', ns: NS, ops: [{ op: 'set', path: ['busyEnter'], value: 'queue' }] })

    const conflicted = makeSvc({ conflict: true })
    const server2 = makeServer()
    registerSettingsBridgeRoutes(server2, () => conflicted, NS)
    expect(await server2.call(MUTATE, 'POST', JSON.stringify({ ops: [{ op: 'set', path: ['x'], value: 1 }] })))
      .toMatchObject({ body: { ok: false, code: 'settings-conflict' } })

    const server3 = makeServer()
    registerSettingsBridgeRoutes(server3, () => makeSvc(), NS)
    expect(await server3.call(MUTATE, 'POST', JSON.stringify({ ops: [{ op: 'nope' }] })))
      .toMatchObject({ body: { ok: false, code: 'settings-rejected' } })
  })

  it('无 webServer（或形状不符）时静默返回空卸载表', () => {
    expect(registerSettingsBridgeRoutes(undefined, () => undefined, NS)).toEqual([])
    expect(registerSettingsBridgeRoutes({}, () => undefined, NS)).toEqual([])
  })
})

describe('node apply（桥接线）', () => {
  /** Minimal host ctx stub: loader inject carried, child inject + effect. */
  function makeNodeCtx(webServer: unknown, settings: unknown) {
    const disposals: Array<() => void> = []
    const ctx = {
      webServer,
      inject(deps: string[], cb: (scope: Record<string, unknown>) => void) {
        if (deps.includes('settings')) cb({ settings })
      },
      effect(fn: () => () => void, _name?: string) {
        disposals.push(fn())
      },
    }
    return { ctx, disposals }
  }

  it('把 describe/mutate 对挂上 webServer；settings 经子注入供数；dispose 卸载', async () => {
    const server = makeServer()
    const svc = makeSvc()
    const { ctx, disposals } = makeNodeCtx(server, svc)
    applyNode(ctx as never)
    expect(server.paths()).toEqual([DESCRIBE, MUTATE])
    const d = await server.call(DESCRIBE, 'POST')
    expect(d.body).toMatchObject({ ok: true, value: { descriptor: { ns: NS } } })
    for (const off of disposals) off()
    expect(server.paths()).toEqual([])
  })

  it('settings 服务缺席时桥降级 settings-unavailable，entry 不炸', async () => {
    const server = makeServer()
    const { ctx, disposals } = makeNodeCtx(server, undefined)
    applyNode(ctx as never)
    expect(await server.call(DESCRIBE, 'POST')).toMatchObject({ body: { ok: false, code: 'settings-unavailable' } })
    for (const off of disposals) off()
  })
})

describe('BridgeDocHandle（client 半）', () => {
  function stubFetch(respond: (path: string, body: unknown) => unknown) {
    const seen: Array<{ path: string; body: unknown }> = []
    const fetchMock = vi.fn(async (path: string, init?: { method?: string; body?: string }) => {
      seen.push({ path, body: init?.body === undefined ? undefined : JSON.parse(init.body) })
      return respond(path, seen[seen.length - 1]?.body) as Response
    })
    vi.stubGlobal('fetch', fetchMock)
    return { seen, fetchMock }
  }

  const descriptorBody = () => ({
    ok: true,
    value: { descriptor: { ns: NS, value: { busyEnter: 'queue' }, revision: 7 }, writable: true },
  })

  it('client 派生式与 server bridgeRoutesFor 逐字符一致（两半漂移钉）', async () => {
    const { seen } = stubFetch(() => ({ ok: true, json: async () => descriptorBody() }))
    const handle = new BridgeDocHandle(NS)
    await vi.waitFor(() => expect(handle.getSnapshot().status).toBe('ready'))
    expect(seen[0]?.path).toBe(bridgeRoutesFor(NS).describe)
    vi.unstubAllGlobals()
  })

  it('构造即拉 describe；pending→ready；set() 落 mutate 并携带 expectedRevision', async () => {
    const { seen } = stubFetch((path) => {
      if (path === DESCRIBE) return { ok: true, json: async () => descriptorBody() }
      if (path === MUTATE) return { ok: true, json: async () => descriptorBody() }
      return { ok: false, json: async () => ({}) }
    })
    const handle = new BridgeDocHandle(NS)
    expect(handle.getSnapshot().status).toBe('pending')
    await vi.waitFor(() => expect(handle.getSnapshot().status).toBe('ready'))
    expect(handle.getSnapshot().value).toEqual({ busyEnter: 'queue' })

    await handle.set('busyEnter', 'steer')
    expect(seen.at(-1)?.path).toBe(MUTATE)
    expect(seen.at(-1)?.body).toMatchObject({
      ops: [{ op: 'set', path: ['busyEnter'], value: 'steer' }],
      expectedRevision: 7,
    })
    vi.unstubAllGlobals()
  })

  it('冲突应答触发权威值回拉，不抛错', async () => {
    const { seen } = stubFetch((path) => {
      if (path.endsWith('/mutate')) return { ok: true, json: async () => ({ ok: false, code: 'settings-conflict' }) }
      return { ok: true, json: async () => descriptorBody() }
    })
    const handle = new BridgeDocHandle(NS)
    await vi.waitFor(() => expect(handle.getSnapshot().status).toBe('ready'))
    const pulls = seen.filter((s) => s.path === DESCRIBE).length
    await handle.set('busyEnter', 'queue')
    expect(seen.filter((s) => s.path === DESCRIBE).length).toBeGreaterThan(pulls)
    expect(handle.getSnapshot().status).toBe('ready')
    vi.unstubAllGlobals()
  })

  it('describe 失败 → error 快照（卡按钉死默认值降级，不崩）', async () => {
    stubFetch(() => ({ ok: false, json: async () => ({}) }))
    const handle = new BridgeDocHandle(NS)
    await vi.waitFor(() => expect(handle.getSnapshot().status).toBe('error'))
    expect(handle.getSnapshot().writable).toBe(false)
    vi.unstubAllGlobals()
  })
})
