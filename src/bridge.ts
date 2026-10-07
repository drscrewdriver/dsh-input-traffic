/**
 * settings bridge — T20-b port from dsh-perm-gate (5260fe6 generalized form).
 *
 * The plugin is a pure client takeover on every host line, but its durable
 * data plane (the `ui-conversation` busy-Enter pin) rides the client settings
 * handles that are generation-exclusive: `configForms` (0.1.7+) works,
 * `settingsScope` (≤0.1.5) resolves to nothing (the A2 dead end), so on old
 * lines both the family card and the pin itself silently no-op. This bridge
 * gives the browser half a same-origin HTTP data plane backed by the HOST's
 * settings service — reads = svc.describe of our ns, writes = svc.mutate ops.
 * No second copy of state: the service stays the single source of truth.
 * Guards: POST-only, ns fixed at registration, optimistic concurrency via
 * expectedRevision. The 0.1.0 host settings service carries the full
 * describe/mutate/redactSecrets surface (lib/index.js verified), so the
 * oldest line needs no fallback path.
 *
 * Data consumer = client BridgeDocHandle (src/client/bridge-scope.ts) — the
 * T13b dual-track: native handle first (0.1.7+), this bridge underneath.
 * Routes derive from the ns (bridgeRoutesFor) so the URL contract cannot
 * drift between the two halves; the parity test pins both derivations
 * character-for-character.
 */
interface SettingsServiceLike {
  update?(ns: string, patch: object): Promise<void>
  describe?(o?: { redactSecrets?: boolean }): Array<{ ns: unknown; [k: string]: unknown }>
  mutate?(ns: string, ops: Array<{ op: string; path: string[]; value?: unknown }>, expectedRevision?: number): Promise<unknown>
  writable?: boolean
}

/** Route pair for one settings ns — client and server must derive identically. */
export function bridgeRoutesFor(ns: string): { describe: string; mutate: string } {
  return { describe: `/api/${ns}/settings/describe`, mutate: `/api/${ns}/settings/mutate` }
}

interface RouteReq { method?: string; url?: string; on?(event: string, cb: (chunk?: unknown) => void): unknown; resume?(): unknown }
type RouteReqExact = RouteReq & { on(event: string, cb: (chunk?: unknown) => void): unknown; resume(): unknown }
interface RouteRes { writeHead(code: number, headers?: Record<string, string>): unknown; end(body?: string): unknown }
interface RouteServer { register(route: { kind: string; path: string; handler: (req: unknown, res: unknown) => void }): () => void }

interface MutateOp { op: 'set' | 'unset'; path: string[]; value?: unknown }
interface MutateBody { ops?: unknown; expectedRevision?: unknown }

function readJsonBody(reqRaw: RouteReq, limit = 256 * 1024): Promise<MutateBody> {
  const req = reqRaw as RouteReqExact
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on('data', (chunk: unknown) => {
      const buf = chunk as Buffer
      size += buf.length
      if (size > limit) { reject(new Error('bridge body too large')); req.resume?.(); return }
      chunks.push(buf)
    })
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (raw === '') { resolve({}); return }
      try { resolve(JSON.parse(raw) as MutateBody) } catch (e) { reject(e instanceof Error ? e : new Error(String(e))) }
    })
    req.on('error', reject)
  })
}

function sendJson(res: RouteRes, code: number, body: unknown): void {
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-cache' })
  res.end(JSON.stringify(body))
}

function isConflict(e: unknown): boolean {
  return e instanceof Error && /conflict|revision/i.test(e.message)
}

export function registerSettingsBridgeRoutes(
  server: unknown,
  getSettingsSvc: () => SettingsServiceLike | undefined,
  ns: string,
): Array<() => void> {
  if (typeof server !== 'object' || server === null) return []
  const ws = typeof (server as { register?: unknown }).register === 'function' ? (server as RouteServer) : undefined
  if (ws === undefined) return []
  const offs: Array<() => void> = []
  const routes = bridgeRoutesFor(ns)

  offs.push(ws.register({
    kind: 'exact',
    path: routes.describe,
    handler: (rawReq, rawRes) => {
      const req = rawReq as RouteReq
      const res = rawRes as RouteRes
      if (req.method !== 'POST') { sendJson(res, 405, { ok: false, code: 'method-not-allowed' }); return }
      const svc = getSettingsSvc()
      if (svc === undefined || typeof (svc as { describe?: unknown }).describe !== 'function') {
        sendJson(res, 200, { ok: false, code: 'settings-unavailable', message: 'settings service not resolved yet' })
        return
      }
      try {
        const descriptor = (svc as unknown as { describe: (o: { redactSecrets: boolean }) => Array<Record<string, unknown>> })
          .describe({ redactSecrets: true })
          .find((d) => d.ns === ns)
        if (descriptor === undefined) {
          sendJson(res, 200, { ok: false, code: 'ns-not-registered', message: `settings namespace "${ns}" is not registered` })
          return
        }
        sendJson(res, 200, { ok: true, value: { descriptor, writable: (svc as { writable?: unknown }).writable !== false } })
      } catch (e) {
        sendJson(res, 200, { ok: false, code: 'internal', message: e instanceof Error ? e.message : String(e) })
      }
    },
  }))

  offs.push(ws.register({
    kind: 'exact',
    path: routes.mutate,
    handler: (rawReq, rawRes) => {
      const req = rawReq as RouteReq
      const res = rawRes as RouteRes
      if (req.method !== 'POST') { sendJson(res, 405, { ok: false, code: 'method-not-allowed' }); return }
      const svc = getSettingsSvc()
      const mutate = svc === undefined ? undefined : (svc as { mutate?: unknown }).mutate
      if (typeof mutate !== 'function') {
        sendJson(res, 200, { ok: false, code: 'settings-unavailable', message: 'settings service mutate not available' })
        return
      }
      readJsonBody(req).then((body) => {
        const ops = body.ops
        if (!Array.isArray(ops) || ops.some((op) => !op || typeof op !== 'object' || !((op as MutateOp).op in { set: 1, unset: 1 }))) {
          sendJson(res, 200, { ok: false, code: 'settings-rejected', message: 'malformed bridge mutate ops' })
          return
        }
        const expectedRevision = typeof body.expectedRevision === 'number' ? body.expectedRevision : undefined
        ;(mutate as (n: string, o: MutateOp[], r?: number) => Promise<unknown>)
          .call(svc, ns, ops as MutateOp[], expectedRevision)
          .then(() => {
            // Successful mutate re-describes: writes stay funneled through the
            // host service, no shadow state anywhere.
            const descriptor = (svc as unknown as { describe: (o: { redactSecrets: boolean }) => Array<Record<string, unknown>> })
              .describe({ redactSecrets: true })
              .find((d) => d.ns === ns)
            if (descriptor === undefined) { sendJson(res, 200, { ok: false, code: 'internal', message: `namespace "${ns}" disposed after mutate` }); return }
            sendJson(res, 200, { ok: true, value: { descriptor } })
          })
          .catch((e: unknown) => {
            sendJson(res, 200, isConflict(e)
              ? { ok: false, code: 'settings-conflict', message: e instanceof Error ? e.message : String(e) }
              : { ok: false, code: 'internal', message: e instanceof Error ? e.message : String(e) })
          })
      }).catch((e: unknown) => {
        sendJson(res, 200, { ok: false, code: 'bad-request', message: e instanceof Error ? e.message : String(e) })
      })
    },
  }))

  return offs
}
