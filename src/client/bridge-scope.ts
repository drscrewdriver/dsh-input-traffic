/**
 * BridgeDocHandle — T20-b port from dsh-perm-gate (bridge-scope.ts, the
 * client half of the settings bridge).
 *
 * Shape-compatible with the native durable-settings handle (configForms.get /
 * settingsScope.bind subset): getSnapshot/subscribe/set. Reads POST
 * /api/<ns>/settings/describe, writes POST …/mutate (ops forwarded to the
 * host settings service); a successful write re-describes and refreshes the
 * snapshot (optimistic refresh, no local second copy of state — the service
 * stays authoritative). The initial describe fetch starts at construction;
 * the snapshot is `pending` until it lands, and the family card renders its
 * pinned default meanwhile.
 *
 * The route derivation must stay character-identical to the server side
 * (src/bridge.ts bridgeRoutesFor); the client tsconfig only includes
 * src/client, so this half holds its own copy and the parity test pins both.
 */
import type { SettingsDocHandle } from './compat.js'

/** Must match src/bridge.ts bridgeRoutesFor character for character. */
function bridgeRoutesFor(ns: string): { describe: string; mutate: string } {
  return { describe: `/api/${ns}/settings/describe`, mutate: `/api/${ns}/settings/mutate` }
}

/** The native handle's snapshot shape — the bridge payload cast at the boundary. */
type DocSnapshot = ReturnType<SettingsDocHandle['getSnapshot']>

interface Snapshot { status: string; value: unknown; writable: boolean }
interface Descriptor { value?: unknown; revision?: number }
interface BridgeBody { ok?: boolean; code?: string; message?: string; value?: { descriptor?: Descriptor; writable?: boolean } }

export class BridgeDocHandle implements SettingsDocHandle {
  private snapshot: Snapshot = { status: 'pending', value: undefined, writable: true }
  private listeners = new Set<() => void>()
  private revision: number | undefined
  private inflight: Promise<void> | undefined
  private readonly routes: { describe: string; mutate: string }

  constructor(ns: string) {
    this.routes = bridgeRoutesFor(ns)
    void this.refresh()
  }

  /** The bridge transport is shape-agnostic; the ns payload narrows at this boundary. */
  getSnapshot(): DocSnapshot {
    return this.snapshot as DocSnapshot
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  async set(field: string, value: unknown): Promise<void> {
    await this.mutate([{ op: 'set', path: [field], value }])
  }

  private notify(): void {
    for (const l of [...this.listeners]) l()
  }

  private async request(path: string, body?: unknown): Promise<BridgeBody> {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body ?? {}),
    })
    if (!response.ok) throw new Error(`bridge ${path} HTTP ${response.status}`)
    return await response.json() as BridgeBody
  }

  private async refresh(): Promise<void> {
    if (this.inflight !== undefined) return this.inflight
    this.inflight = (async () => {
      try {
        const body = await this.request(this.routes.describe)
        if (body.ok && body.value?.descriptor !== undefined) {
          const d = body.value.descriptor
          this.revision = typeof d.revision === 'number' ? d.revision : undefined
          this.snapshot = { status: 'ready', value: d.value, writable: body.value.writable !== false }
        } else {
          this.snapshot = { status: 'error', value: undefined, writable: false }
        }
      } catch {
        this.snapshot = { status: 'error', value: undefined, writable: false }
      } finally {
        this.inflight = undefined
      }
      this.notify()
    })()
    return this.inflight
  }

  private async mutate(ops: Array<{ op: string; path: string[]; value?: unknown }>): Promise<void> {
    const body = await this.request(this.routes.mutate, { ops, expectedRevision: this.revision })
    if (body.ok && body.value?.descriptor !== undefined) {
      const d = body.value.descriptor
      this.revision = typeof d.revision === 'number' ? d.revision : undefined
      this.snapshot = { status: 'ready', value: d.value, writable: this.snapshot.writable }
    } else if (body.code === 'settings-conflict') {
      await this.refresh() // optimistic concurrency lost: pull the authoritative value so the next write carries a fresh revision
    } else {
      throw new Error(`bridge mutate failed: ${body.code ?? 'unknown'} ${body.message ?? ''}`)
    }
    this.notify()
  }
}
