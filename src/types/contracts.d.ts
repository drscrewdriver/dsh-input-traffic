/**
 * Local contract declarations for the @deepseek-ai/* platform surfaces the
 * plugin consumes. The npm publication chain for the harness client packages
 * is incomplete (rc.1 placeholders miss several transitive packages), and the
 * plugin never value-imports them anyway — the browser half talks to cordis
 * services and slot registration only, and the loader module table supplies
 * the real modules at runtime.
 *
 * These declarations mirror the harness sources at the anchors below, and
 * deliberately declare only the INTERSECTION of the two supported releases
 * (0.1.1-rc.2 and 0.1.2-rc.1). A surface that exists in one release but not
 * the other is either omitted or narrowed to its shared members, so a
 * regression that reaches for a version-specific face fails `tsc` instead of
 * failing in a user's browser.
 *
 * Mirror anchors (verified 2026-09-09):
 * - `packages/client/runtime/src/client/sessions/conversation.ts:437` —
 *   0.1.1 `ConversationSnapshot` / `:317` `QueuedMessage`.
 * - `packages/api/session-controller/src/client/contract/snapshot.ts:65` —
 *   0.1.2 `SessionSnapshot` / `:10` `QueuedMessage`.
 * - `packages/client/ui-conversation/src/client/contract/slots.ts:231` (0.1.1)
 *   and `:135` (0.1.2) — the input-region slot map.
 * - `packages/client/ui-conversation/src/client/skeleton/InputBar.tsx:466` —
 *   0.1.2 renders `conversation.input.right` with an empty owner object.
 */

declare module '@deepseek-ai/dsh-client-runtime/client' {
  /** Branded session identity (mirrors the connection package's SessionId). */
  export type SessionId = string & { readonly __sessionId?: unique symbol }

  /** One row of the authoritative transient inbox projection. */
  export interface QueueRow {
    id: string
    messageId: string
    placement: 'queued' | 'steering' | 'context'
    preview: string
    text: string | null
    content: readonly unknown[]
  }

  /**
   * The conversation snapshot consumed by the session standard kit.
   *
   * DUAL-VERSION: 0.1.1 names this `ConversationSnapshot`; 0.1.2 names the
   * session-scoped equivalent `SessionSnapshot`. Only the shared members this
   * plugin consumes are declared — `queue` / `running` / `subagent` exist in
   * both, while `subagent.parentAvailable` is optional in 0.1.2.
   */
  export interface ConversationSnapshot {
    running: boolean
    subagent: { address: { mode: string }; parentAvailable: boolean } | null
    queue: readonly QueueRow[]
  }

  /** Session-store selector hook shape delivered to session-scope slots. */
  export type SnapshotSelectorHook<S> = <T>(selector: (snapshot: S) => T) => T

  /** Session registry: scope resolution for session-addressed services. */
  export interface ISessions {
    scope(sessionId: SessionId): ClientContext | undefined
  }

  /** The client root context merge the plugin's browser half receives. */
  export interface ClientContext {
    effect(cleanup: () => (() => void) | void, label?: string): void
    on(event: string, listener: (...args: never[]) => unknown, options?: unknown): () => void
    get<T>(key: string): T | undefined
    slots: import('@deepseek-ai/dsh-client-ui-slots').SlotsFace
    sessions: ISessions
    locale: import('@deepseek-ai/dsh-client-locale/client').LocaleFace
    settingsScope: import('@deepseek-ai/dsh-client-ui-settings/client').SettingsScopeFace
  }
}

declare module '@deepseek-ai/dsh-client-ui-slots' {
  import type { ConversationSnapshot, SessionId, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-runtime/client'

  /**
   * Owner share of the input-region slots.
   *
   * DUAL-VERSION: only the consumed member is declared. The real owner also
   * carries `session`, whose type differs per release (0.1.1
   * `ConversationSnapshot` vs 0.1.2 `SessionSnapshot`) — this plugin never
   * reads it, because session data comes from the session standard kit
   * (`useSession`), which both releases deliver.
   */
  export interface InputZone {
    input: { draft: string }
  }

  /** Slot map entries consumed by this plugin (subset of the harness table). */
  export interface SlotMap {
    'conversation.input.dock': { kind: 'list'; scope: 'session'; owner: InputZone }
    /**
     * DUAL-VERSION: 0.1.1 declares `owner: InputZone`; 0.1.2 declares no owner
     * and renders this slot with `{}` (`InputBar.tsx:466`). The intersection
     * is owner-less — do NOT read `session`/`input` here.
     */
    'conversation.input.right': { kind: 'list'; scope: 'session' }
    'settings.general.item': { kind: 'list'; scope: 'root'; owner: object }
  }

  /** Locale namespaces merged by client plugins. */
  export interface LocaleNamespaceMap {
    steer: string
  }

  /** Session-standard kit delivered to session-scope slot components. */
  export interface SessionStandardProps {
    useSession: SnapshotSelectorHook<ConversationSnapshot>
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
    register(namespace: string, dictionaries: Record<string, Record<string, string>>): void
    bind<N extends string>(namespace: N): (key: string, params?: Record<string, unknown>) => string
  }
}

declare module '@deepseek-ai/dsh-client-ui-settings/client' {
  /** Durable namespace scope owner used to pin the busy-Enter field. */
  export interface SettingsScope<T> {
    getSnapshot(): { status: 'loading' | 'ready' | 'unavailable'; value: T | undefined; writable: boolean; mode: 'host' | 'memory' }
    subscribe(listener: () => void): () => void
    set(field: string, value: unknown): Promise<void>
    unset(field: string): Promise<void>
  }

  /** Context merge providing namespace binding. */
  export interface SettingsScopeFace {
    bind<T>(spec: { namespace: string }): SettingsScope<T>
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
