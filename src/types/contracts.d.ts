/**
 * Local contract declarations for the @deepseek-ai/* platform surfaces the
 * plugin consumes. The npm publication chain for the harness client packages
 * is incomplete (rc placeholders miss several transitive packages), and the
 * plugin never value-imports them anyway — the browser half talks to cordis
 * services and slot registration only, and the loader module table supplies
 * the real modules at runtime.
 *
 * These declarations mirror the harness sources at the anchors below for the
 * supported release segment `>=0.1.5-alpha.1 <0.2.0-0` — the DSH line with the
 * Session V3 surface nodes and the dockkit sidebar. Anchors were verified
 * against dsh-v0.1.5-rc.2 (2026-09-11). Every type the `dsh-client-runtime`
 * deletion orphaned is re-homed to the package that owns it today, so the
 * plugin consumes the same public API the harness itself consumes. Members
 * are declared only where this plugin reads them, so a regression that reaches
 * for a surface the segment does not carry fails `tsc` instead of failing in a
 * user's browser.
 *
 * Mirror anchors (verified 2026-09-11 against dsh-v0.1.5-rc.2):
 * - `packages/core/session/src/types.ts:19` — `SessionId`.
 * - `packages/api/session-controller/src/client/contract/snapshot.ts:83` —
 *   `SessionSnapshot` / `:11` `QueuedMessage`.
 * - `packages/api/session-controller/src/client/contract/sessions.ts:21` —
 *   `ISessions`.
 * - `packages/client/store/src/contract.ts:20` — `SnapshotSelectorHook`.
 * - `packages/client/ui-conversation/src/client/contract/slots.ts` — the
 *   input-region slot map.
 */

/** Branded session identity. */
declare module '@deepseek-ai/dsh-session/types' {
  export type SessionId = string & { readonly __sessionId?: unique symbol }
}

/** Session queue and lifecycle projections owned by the session controller. */
declare module '@deepseek-ai/dsh-api-session-controller/client' {
  import type { Context } from '@deepseek-ai/cordis'
  import type { SessionId } from '@deepseek-ai/dsh-session/types'

  /** One transient inbox occurrence from the authoritative queue snapshot. */
  export interface QueuedMessage {
    readonly id: string
    readonly messageId: string
    readonly placement: 'queued' | 'steering' | 'context'
    readonly rpcId?: string
    readonly content: readonly unknown[]
    readonly preview: string
    readonly text: string | null
  }

  /**
   * Immutable Session lifecycle and control snapshot, consumed by the session
   * standard kit. Only the members this plugin reads are declared.
   */
  export interface SessionSnapshot {
    readonly sessionId: SessionId
    readonly queue: readonly QueuedMessage[]
    readonly running: boolean
    readonly subagent: {
      readonly address: { readonly mode: string }
      readonly parentAvailable?: boolean
    } | null
  }

  /** Session registry: scope resolution for session-addressed services. */
  export interface ISessions {
    scope(sessionId: SessionId): Context | undefined
  }
}

/** Snapshot-store selector hooks. */
declare module '@deepseek-ai/dsh-client-store' {
  /** Selector hook bound to one observable snapshot store. */
  export type SnapshotSelectorHook<T> = <S>(sel: (s: T) => S, eq?: (a: S, b: S) => boolean) => S
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  import type { SessionId } from '@deepseek-ai/dsh-session/types'
  import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
  import type { SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'

  /**
   * Owner share of the input-region slots. Only the consumed member is
   * declared: the real owner also carries `session`, which this plugin never
   * reads — session data comes from the session standard kit (`useSession`).
   */
  export interface InputZone {
    input: { draft: string }
  }

  /** Slot map entries consumed by this plugin (subset of the harness table). */
  export interface SlotMap {
    'conversation.input.dock': { kind: 'list'; scope: 'session'; owner: InputZone }
    /** Rendered with an empty owner object; do NOT read `session`/`input` here. */
    'conversation.input.right': { kind: 'list'; scope: 'session' }
    'settings.general.item': { kind: 'list'; scope: 'root'; owner: object }
  }

  /** Locale namespaces merged by client plugins. */
  export interface LocaleNamespaceMap {
    steer: string
  }

  /** Session-standard kit delivered to session-scope slot components. */
  export interface SessionStandardProps {
    useSession: SnapshotSelectorHook<SessionSnapshot>
    sessionId: SessionId
  }

  /** Runtime props share for a slot key (owner + session kit + global seat). */
  export type PropsRuntime<K extends keyof SlotMap & string> =
    (SlotMap[K] extends { owner: infer O extends object } ? O : object)
    & SessionStandardProps
    & Record<string, unknown>

  /** Translate thunk bound to one dictionary namespace. */
  export type TranslateNS<_N extends keyof LocaleNamespaceMap & string> =
    (key: string, params?: Record<string, unknown>) => string

  /** Locale seat delivered to slot components. */
  export type PropsLocale<N extends keyof LocaleNamespaceMap & string> = { t: TranslateNS<N> }

  /** One registration's options (list-kind shape used by this plugin). */
  export interface SlotRegisterOptions<K extends keyof SlotMap & string> {
    name: K
    id?: string
    order?: number
    priority?: number
    locale?: string
    inject?: (...args: never[]) => unknown
  }

  /** The slot registry face available on the client context. */
  export interface SlotsFace {
    /** Wait for the slot declaration, register, and roll back with the caller fiber. */
    inject(name: keyof SlotMap & string, fn: () => unknown): () => void
    register<K extends keyof SlotMap & string>(options: SlotRegisterOptions<K>, component: unknown): () => void
  }
}

declare module '@deepseek-ai/dsh-client-locale/client' {
  /** Dictionary registration and bound-translate face. */
  export interface LocaleFace {
    register(namespace: string, dictionaries: Record<string, Record<string, string>>): () => void
  }
}

declare module '@deepseek-ai/dsh-client-ui-settings/client' {
  /** Snapshot of one durable namespace scope, as the settings card reads it. */
  export interface SettingsScopeSnapshot<T> {
    status: 'loading' | 'ready' | 'unavailable'
    value: T | undefined
    /** Composition base layer and raw user layer, exposed for override display. */
    base: unknown
    user: unknown
    /** Write fence: the revision this snapshot was folded at. */
    revision: number | undefined
    writable: boolean
    mode: 'host' | 'memory'
  }

  /** Durable namespace scope owner used to pin the busy-Enter field. */
  export interface SettingsScope<T> {
    getSnapshot(): SettingsScopeSnapshot<T>
    subscribe(listener: () => void): () => void
    set(field: string, value: unknown): Promise<void>
    unset(field: string): Promise<void>
  }

  /** Context merge providing namespace binding. */
  export interface SettingsScopeFace {
    bind<T>(spec: { namespace: string; decode?: (section: unknown) => T | undefined }): SettingsScope<T>
  }
}

declare module '@deepseek-ai/dsh-client-ui-conversation/client' {
  /** The outward conversation face (scope-addressed verbs). */
  export interface IConversation {
    send(text: string): Promise<void>
    updateQueue(itemId: string, action: unknown): Promise<void>
    cancel(): Promise<void>
    input: {
      for(actx: unknown): {
        notify(level: 'info' | 'error', text: string): void
        actions: { setDraft(text: string): void }
      }
    }
    /** Composer-block registry: raise/clear a per-session inert composer. */
    blocks: {
      set(sessionId: string, block: { reason: string } | undefined): void
    }
  }
}
