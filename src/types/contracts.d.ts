/**
 * Local contract declarations for the @deepseek-ai/* platform surfaces the
 * plugin consumes. The npm publication chain for the harness client packages
 * is incomplete (rc.1 placeholders miss several transitive packages), and the
 * plugin never value-imports them anyway — the browser half talks to cordis
 * services and slot registration only, and the loader module table supplies
 * the real modules at runtime.
 *
 * These declarations mirror the harness sources at the anchors listed in
 * README.md (verified 2026-08-17); drift against a future harness release
 * shows up as a slot-registration or type error at build time.
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

  /** The conversation snapshot consumed by the session standard kit. */
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
  import type { ConversationSnapshot, QueueRow, SessionId, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-runtime/client'

  /** Owner share of the input-region slots (session + input snapshots). */
  export interface InputZone {
    session: ConversationSnapshot
    input: { queue: readonly QueueRow[]; phase: string; draft: string }
  }

  /** Slot map entries consumed by this plugin (subset of the harness table). */
  export interface SlotMap {
    'conversation.input.dock': { kind: 'list'; scope: 'session'; owner: InputZone }
    'conversation.input.right': { kind: 'list'; scope: 'session'; owner: InputZone }
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
