/**
 * dsh-input-traffic — node half.
 *
 * Historically a deliberate no-op (pure client takeover shape). T20-b gave it
 * one real job: host the settings bridge. The browser half's durable data
 * plane (the `ui-conversation` busy-Enter pin) rides generation-exclusive
 * client settings handles that are a dead end ≤0.1.5 (the A2 posture), so the
 * node half exposes the host settings service over the plugin's webServer as
 * a describe/mutate route pair (src/bridge.ts, perm-gate 5260fe6 generalized
 * form) — see src/client/bridge-scope.ts for the consumer.
 *
 * Inject posture: `webServer` is loader-level (present on every kept line —
 * the web profile serves the UI through it); `settings` resolves via a child
 * effect so a host without it leaves the ref unset and the bridge degrades to
 * `settings-unavailable` responses instead of failing the entry.
 */
import type { Context } from '@deepseek-ai/cordis'
import { registerSettingsBridgeRoutes } from './bridge.js'

/** The settings namespace the browser half pins (`ui-conversation.busyEnter`). */
const BRIDGE_NS = 'ui-conversation'

/** webServer hosts the bridge route pair. */
export const inject = ['webServer']

/** Minimal shape of the host settings service the bridge needs (0.1.0+ verified). */
interface SettingsServiceLike {
  describe?(o?: { redactSecrets?: boolean }): Array<{ ns: unknown; [k: string]: unknown }>
  mutate?(ns: string, ops: Array<{ op: string; path: string[]; value?: unknown }>, expectedRevision?: number): Promise<unknown>
  writable?: boolean
}

/** @param ctx - host-side context; registers the bridge route pair. */
export function apply(ctx: Context): void {
  // Live settings ref: the child effect keeps entry activation independent of
  // the service (a host without settings just gets settings-unavailable).
  const settingsRef: { svc?: SettingsServiceLike } = {}
  ctx.inject(['settings'], (child) => {
    // cordis inject callbacks receive (ctx, config) — read services off the
    // scope object by name (the waist-wide convention; bare-service calls are
    // a TypeError on every generation).
    settingsRef.svc = (child as unknown as { settings?: SettingsServiceLike }).settings
  })
  // Register + unregister the route pair with the entry's life cycle. The
  // webServer comes from the loader inject, with a ctx.get fallback for hosts
  // that resolve services lazily (same posture as dsh-perm-gate).
  ctx.effect(() => {
    const injected = ctx as unknown as { webServer?: unknown; get?(name: string): unknown }
    const webServer = injected.webServer ?? injected.get?.('webServer')
    const offs = registerSettingsBridgeRoutes(webServer, () => settingsRef.svc, BRIDGE_NS)
    return () => { for (const off of offs) off() }
  }, 'dsh-input-traffic: settings bridge routes')
}
